// tutor.js — the AI tutor of the lessons (tutor.js in the site sends the questions here).
// The Worker reads the lesson from the site itself, so a visitor cannot send another text to the model, then asks
// an AI model to explain it like a teacher and streams the answer back as plain text.
// Models: Gemini first (secret GEMINI_API_KEY, free tier of Google AI Studio); if Gemini fails before writing anything
// (no key, daily quota reached, error), Claude Haiku answers instead (secret ANTHROPIC_API_KEY, prepaid credits).
// Limits: TUTOR_LIMIT (a rate-limit binding, wrangler.jsonc) allows a few questions per minute for each visitor; the
// total spend is capped by the prepaid API credits. If a KV namespace FEEDBACK is bound, TUTOR_PER_DAY and TUTOR_DAILY_CAP
// also cap the questions per visitor and per site and per day. The visitor is known by a hash of their IP address and
// the date: the address itself is never stored.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-5-5';            // the backup model; change this line for claude-sonnet-5-5 or claude-opus-5-5
// the main models, tried in this order until one answers (a model can have no free quota, or not exist any more);
// the variable GEMINI_MODEL (one name, or several separated by commas) replaces this list
const GEMINIS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];   // the light models answer fastest on the free tier
const geminiList = (env) => (env.GEMINI_MODEL ? env.GEMINI_MODEL.split(',').map((s) => s.trim()).filter(Boolean) : GEMINIS);
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta';
const text = (s, status = 200, extra = {}) => new Response(s, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', ...extra } });

// the lesson as plain text: the <article id="lN"> of the page, without scripts, styles, figures' drawing code and tags
async function getPage(env, url) {
  // the static files answer /learn-x.html with a redirect to /learn-x (and the other way round): follow up to 3 redirects
  for (let k = 0; k < 4; k++) {
    const r = env.ASSETS ? await env.ASSETS.fetch(new Request(url, { redirect: 'manual' })) : await fetch(url, { redirect: 'manual' });
    const to = r.status >= 300 && r.status < 400 && r.headers.get('location');
    if (!to) return r;
    url = new URL(to, url).href;
  }
  return new Response('too many redirects', { status: 508 });
}
// the text a student is reading: the <article id="lN"> of a course page, or the whole page (without the drawing code)
async function lessonText(env, origin, page, lesson, fallback) {
  let r = await getPage(env, `${origin}/${page}.html`);
  if (!r.ok && fallback) r = await getPage(env, `${origin}/${fallback}.html`);     // a page without a French twin
  if (!r.ok) return null;
  const h = await r.text();
  let part, title;
  if (lesson) {
    const a = h.search(new RegExp(`<article[^>]*\\bid="${lesson}"`));
    if (a < 0) return null;
    part = h.slice(a, h.indexOf('</article>', a));
    title = (/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(part) || [, ''])[1];
  } else {
    const b = h.search(/<body[^>]*>/i);
    part = b < 0 ? h : h.slice(b);
    title = (/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h) || /<title>([\s\S]*?)<\/title>/.exec(h) || [, ''])[1];
  }
  title = title.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const body = part
    .replace(/<(script|style|svg|canvas|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/li|\/h\d|\/tr|\/div|\/figcaption|\/pre|\/section|\/a)>/gi, '\n')
    .replace(/<(td|th)[^>]*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { title, body: body.slice(0, 60000), kind: lesson ? 'lesson' : 'page' };
}

const RULES = (lang) => `You are the tutor of Robotics Atlas, a free website that teaches robotics from the basics to a professional level.
A student is reading the lesson or the page of the site given below and asks you a question about it.

How to answer:
- Answer in ${lang === 'fr' ? 'French' : 'English'}, the language of the page, with the simple words of the lesson. The students are beginners to engineers; many are not native speakers.
- Rely on the lesson or page first: use its notation, its examples and its numbers. If the question goes beyond it, answer anyway, simply and correctly, and say that it goes beyond the page.
- On a page that is not a lesson (a robot, a tool, the home page), explain what the student sees there, and point to the course of the site that teaches it when it helps.
- Be short: usually 80 to 200 words. Explain step by step, with one small example or a calculation when it helps.
- For an exercise of the lesson, first give a hint or the next step and let the student try; give the full solution only if they ask for it.
- If the student gives a calculation, check it step by step and show exactly where it goes wrong.
- If you are not sure, say so. Never invent a value, a standard or a reference.
- Write plain text with light Markdown only: **bold**, lists, \`code\` and short code blocks. Write the maths with Unicode symbols (θ, ω, ², √, ≈, ·), never LaTeX.
- Stay on the topics of the site (robotics, the maths, physics, electronics and programming it needs). For anything else, say kindly that you can only help with the lesson.
- Never ask for, or repeat, personal information.`;

async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join(''); }

// GET /api/tutor/status: what works and what does not, without showing any secret (to set up and debug the tutor)
export async function tutorStatus(env, url) {
  const out = { model: MODEL, key: !!env.ANTHROPIC_API_KEY, rate_limit: !!env.TUTOR_LIMIT, assets: !!env.ASSETS };
  try { const l = await lessonText(env, url.origin, 'learn-fr', 'l1');
    const pg = await lessonText(env, url.origin, 'scara-fr', ''); out.page_text = pg ? `ok (${pg.body.length} characters)` : 'NOT FOUND'; out.lesson_text = l ? `ok (${l.body.length} characters)` : 'NOT FOUND'; } catch (e) { out.lesson_text = 'error: ' + e.message; }
  if (env.ANTHROPIC_API_KEY) {
    try { const m = await new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }).models.retrieve(MODEL); out.api = `ok: the key works and ${m.id} is available`; }
    catch (e) { out.api = `error ${e.status || ''}: ${(e.error && e.error.error && e.error.error.message) || e.message}`; }
  } else out.api = 'no key: add the secret ANTHROPIC_API_KEY in Cloudflare (Settings → Variables and Secrets)';
  // Gemini: a real (tiny) question to each model of the list, to see which one answers and what Google says otherwise
  if (env.GEMINI_API_KEY) {
    if (env.TUTOR_LIMIT && !(await env.TUTOR_LIMIT.limit({ key: 'status' })).success) out.gemini = 'checked too often: try again in a minute';
    else {
      // the same request as the robot: the rules and a real lesson, streamed; the time to the first words
      out.gemini = {};
      const l = await lessonText(env, url.origin, 'learn-fr', 'l1');
      const system = `${RULES('fr')}\n\nThe lesson: ${l ? l.title + '\n\n' + l.body : ''}`;
      for (const m of geminiList(env)) {
        const t0 = Date.now();
        try {
          let first = '';
          for await (const s of askGemini({ ...env, GEMINI_MODEL: m, GEMINI_WAIT_MS: 20000, GEMINI_TOTAL_MS: 20000 }, system, [], 'Explique-moi cette leçon en une phrase.')) { first += s; if (first.length > 20) break; }
          out.gemini[m] = `ok: first words after ${((Date.now() - t0) / 1000).toFixed(1)} s`;
        } catch (e) { out.gemini[m] = `${String(e.message).replace(/^gemini:? ?/, '').slice(0, 220)} (after ${((Date.now() - t0) / 1000).toFixed(1)} s)`; }
      }
    }
  } else out.gemini = 'no key: add the secret GEMINI_API_KEY in Cloudflare (Settings → Variables and Secrets)';
  out.order = 'Gemini first, then Claude if Gemini fails';
  out.note = 'The Claude credit balance is not checked here: see platform.claude.com → Settings → Billing.';
  return new Response(JSON.stringify(out, null, 1), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

// Gemini, streamed: yields the text pieces; throws (with .status) before the first piece when it cannot answer
// one Gemini model, streamed: yields the text pieces; throws (with a short reason) when it cannot answer
async function* geminiStream(env, model, system, contents, signal) {
  const call = (thinking) => fetch(`${env.GEMINI_BASE_URL || GEMINI_URL}/models/${model}:streamGenerateContent?alt=sse`, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 2000, ...(thinking ? { thinkingConfig: thinking } : {}) } })
  });
  let r = await call({ thinkingBudget: 0 });                              // older Flash models: no thinking
  if (r.status === 400) r = await call({ thinkingLevel: 'minimal' });     // newer Flash models: the least thinking
  if (r.status === 400) r = await call(null);                             // the model's own default
  if (!r.ok || !r.body) {
    const raw = await r.text().catch(() => ''); let msg = raw; try { msg = JSON.parse(raw).error.message || raw; } catch (x) { /* not JSON */ }
    const e = new Error(`${r.status} ${msg.slice(0, 80)}`); e.status = r.status; throw e;
  }
  const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', any = false, why = '';
  for (;;) {
    const { done, value } = await rd.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      let j; try { j = JSON.parse(line.slice(5)); } catch (e) { continue; }
      const c = j.candidates && j.candidates[0];
      if (c && c.finishReason) why = c.finishReason;
      const s = ((c && c.content && c.content.parts) || []).filter((p) => p.text && !p.thought).map((p) => p.text).join('');
      if (s) { any = true; yield s; }
    }
  }
  if (!any) { const e = new Error('empty answer ' + why); e.status = why === 'SAFETY' ? 'refusal' : 'empty'; throw e; }
  if (why === 'MAX_TOKENS') yield ' …';
}

// Gemini: the first RACE models of the list are asked at the same time and the first one that starts writing answers
// (the others are stopped); if none does, the next models are tried one by one. Each model gets up to PER_MODEL_MS to
// write its first words, all of them together TOTAL_MS; after that, Claude answers. The free models need 10–15 s.
async function* askGemini(env, system, history, question) {
  const contents = [...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: question }] }];
  const PER_MODEL_MS = +(env.GEMINI_WAIT_MS || 20000), TOTAL_MS = +(env.GEMINI_TOTAL_MS || 30000), RACE = +(env.GEMINI_RACE || 2), end = Date.now() + TOTAL_MS;
  const list = geminiList(env), fails = [];
  const start = (model) => {
    const wait = Math.min(PER_MODEL_MS, end - Date.now()), ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), wait);
    const gen = geminiStream(env, model, system, contents, ctl.signal);
    const first = gen.next().then((r) => (r.done ? { ok: false, why: 'empty answer' } : { ok: true, piece: r.value }),
      (e) => ({ ok: false, why: ctl.signal.aborted ? `no words in ${Math.round(wait / 1000)} s` : e.message, refusal: e.status === 'refusal' }));
    return { model, gen, ctl, timer, first };
  };
  const stop = (x) => { clearTimeout(x.timer); x.ctl.abort(); };
  const groups = [list.slice(0, RACE), ...list.slice(RACE).map((m) => [m])];
  for (const group of groups) {
    if (end - Date.now() < 2000) { fails.push(`${group.join(', ')} not tried (no time left)`); continue; }
    let left = group.map(start), win = null;
    while (left.length && !win) {
      const { x, v } = await Promise.race(left.map((x) => x.first.then((v) => ({ x, v }))));
      left = left.filter((y) => y !== x);
      if (v.ok) win = { x, v };
      else { fails.push(`${x.model} ${v.why}`); clearTimeout(x.timer); if (v.refusal) { left.forEach(stop); const e = new Error('gemini: ' + fails.join(' / ')); e.status = 'refusal'; throw e; } }
    }
    left.forEach(stop);                                                   // the slower ones are stopped
    if (!win) continue;
    clearTimeout(win.x.timer);                                            // the winner has no limit for the whole answer…
    yield win.v.piece;
    const IDLE_MS = +(env.GEMINI_IDLE_MS || 15000);                       // …but if it stops sending for IDLE_MS, give up
    for (;;) {
      let idle;
      const step = await Promise.race([win.x.gen.next(), new Promise((res) => { idle = setTimeout(() => res('idle'), IDLE_MS); })])
        .catch((e) => 'error');
      clearTimeout(idle);
      if (step === 'idle' || step === 'error') {
        win.x.ctl.abort();
        const x = new Error(`gemini: cut in the middle (${step === 'idle' ? 'nothing for ' + IDLE_MS / 1000 + ' s' : 'error'})`); x.status = 'cut'; throw x;   // keep what it wrote
      }
      if (step.done) return;
      yield step.value;
    }
  }
  const e = new Error(`gemini ${fails.join(' / ').slice(0, 300)}`); e.status = 'all'; throw e;
}

export async function tutor(req, env, url) {
  if (!env.ANTHROPIC_API_KEY && !env.GEMINI_API_KEY) return text('tutor not configured', 503);
  let d; try { d = await req.json(); } catch (e) { return text('bad json', 400); }
  const ok = (s, re) => typeof s === 'string' && re.test(s);
  if (!ok(d.page, /^[a-z0-9]+(-[a-z0-9]+){0,5}$/) || /^(404|offline)$/.test(d.page) || (d.lesson && !ok(d.lesson, /^l\d{1,2}$/)) || !['en', 'fr'].includes(d.lang) || typeof d.question !== 'string') return text('bad data', 400);
  const question = d.question.trim().slice(0, 1200); if (!question) return text('empty question', 400);
  // earlier turns of this conversation: at most 6 messages, alternating, starting with the student
  const history = (Array.isArray(d.history) ? d.history : []).slice(-6)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role, content: m.text.slice(0, 3000) }));
  while (history.length && history[0].role !== 'user') history.shift();
  for (let i = 1; i < history.length; i++) if (history[i].role === history[i - 1].role) { history.length = i; break; }
  if (history.length && history[history.length - 1].role === 'user') history.pop();

  const ip = req.headers.get('cf-connecting-ip') || 'x', day = new Date().toISOString().slice(0, 10), visitor = await sha(ip + day + (env.SUMMARY_TOKEN || 'ra'));
  if (env.TUTOR_LIMIT) { const { success } = await env.TUTOR_LIMIT.limit({ key: visitor }); if (!success) return text('limit: minute', 429); }
  if (env.FEEDBACK) {
    // daily limits (KV is not atomic: a burst may pass a few questions over the limit, which is fine)
    const perDay = +(env.TUTOR_PER_DAY || 30), cap = +(env.TUTOR_DAILY_CAP || 1500), who = `t:${day}:${visitor}`, all = `tg:${day}`;
    const [n1, n2] = await Promise.all([env.FEEDBACK.get(who), env.FEEDBACK.get(all)]).then((v) => v.map((x) => +x || 0));
    if (n1 >= perDay) return text('limit: visitor', 429);
    if (n2 >= cap) return text('limit: site', 429);
    await Promise.all([env.FEEDBACK.put(who, String(n1 + 1), { expirationTtl: 2 * 86400 }), env.FEEDBACK.put(all, String(n2 + 1), { expirationTtl: 40 * 86400 })]);
  }

  const lesson = await lessonText(env, url.origin, d.lang === 'fr' ? d.page + '-fr' : d.page, d.lesson || '', d.lang === 'fr' ? d.page : '');
  if (!lesson) { console.log('tutor error: lesson not found', d.page, d.lesson, d.lang); return text('lesson not found', 404); }

  const head = lesson.kind === 'lesson' ? 'The lesson' : 'The page of the site';
  const system = `${RULES(d.lang)}\n\n${head}: ${lesson.title}\n\n${lesson.body}`;
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(ctrl) {
      let started = false, gfail = '';
      // the first piece says which model answers ([[m:gemini]] or [[m:claude]]): the page shows it only in its test mode
      // (with Claude, also why Gemini did not answer: the page shows it in its test mode too)
      const put = (s, who) => { if (!started) ctrl.enqueue(enc.encode(`[[m:${who}${who === 'claude' && gfail ? '|' + gfail : ''}]]`)); started = true; ctrl.enqueue(enc.encode(s)); };
      // 1. Gemini, the main model
      if (env.GEMINI_API_KEY) {
        try { for await (const s of askGemini(env, system, history, question)) put(s, 'gemini'); ctrl.close(); return; }
        catch (e) {
          console.log('tutor: gemini failed', e && e.status, e && e.message);
          gfail = String((e && e.message) || 'error').replace(/^gemini:? ?/, '').replace(/[\[\]|\n\r]+/g, ' ').slice(0, 140);
          if (started) { ctrl.enqueue(enc.encode('\n\n[[error]]')); ctrl.close(); return; }   // it stopped in the middle: keep what it wrote
        }
      }
      // 2. Claude Haiku, the backup
      if (!env.ANTHROPIC_API_KEY) { ctrl.enqueue(enc.encode('\n\n[[error 503]]')); ctrl.close(); return; }
      try {
        const stream = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }).messages.stream({
          model: MODEL,
          max_tokens: 2000,
          output_config: { effort: 'low' },               // a chat answer: short thinking is enough
          // the rules and the lesson do not change from one question to the next: they are cached
          system: [{ type: 'text', text: RULES(d.lang) }, { type: 'text', text: `${head}: ${lesson.title}\n\n${lesson.body}`, cache_control: { type: 'ephemeral' } }],
          messages: [...history, { role: 'user', content: question }]
        });
        for await (const ev of stream) if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') put(ev.delta.text, 'claude');
        const msg = await stream.finalMessage();
        if (msg.stop_reason === 'refusal') ctrl.enqueue(enc.encode('\n\n[[refusal]]'));
        else if (msg.stop_reason === 'max_tokens') ctrl.enqueue(enc.encode(' …'));
      } catch (e) {
        console.log('tutor error', e && e.status, e && e.message);
        ctrl.enqueue(enc.encode(`\n\n[[error ${(e && e.status) || ''}]]`));
      }
      ctrl.close();
    }
  });
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}

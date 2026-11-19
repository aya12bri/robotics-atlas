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
const GEMINI = 'gemini-flash-latest';        // the main model (Google's alias for its latest Flash model); the variable GEMINI_MODEL overrides it
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
async function lessonText(env, origin, page, lesson) {
  const r = await getPage(env, `${origin}/${page}.html`);
  if (!r.ok) return null;
  const h = await r.text(), a = h.search(new RegExp(`<article[^>]*\\bid="${lesson}"`));
  if (a < 0) return null;
  const art = h.slice(a, h.indexOf('</article>', a));
  const title = (/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(art) || [, ''])[1].replace(/<[^>]+>/g, '').trim();
  const body = art
    .replace(/<(script|style|svg|canvas|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/li|\/h\d|\/tr|\/div|\/figcaption|\/pre)>/gi, '\n')
    .replace(/<(td|th)[^>]*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { title, body: body.slice(0, 60000) };
}

const RULES = (lang) => `You are the tutor of Robotics Atlas, a free website that teaches robotics from the basics to a professional level.
A student is reading the lesson given below and asks you a question about it.

How to answer:
- Answer in ${lang === 'fr' ? 'French' : 'English'}, the language of the page, with the simple words of the lesson. The students are beginners to engineers; many are not native speakers.
- Rely on the lesson first: use its notation, its examples and its numbers. If the question goes beyond the lesson, answer briefly and say so.
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
  try { const l = await lessonText(env, url.origin, 'learn-fr', 'l1'); out.lesson_text = l ? `ok (${l.body.length} characters)` : 'NOT FOUND'; } catch (e) { out.lesson_text = 'error: ' + e.message; }
  if (env.ANTHROPIC_API_KEY) {
    try { const m = await new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }).models.retrieve(MODEL); out.api = `ok: the key works and ${m.id} is available`; }
    catch (e) { out.api = `error ${e.status || ''}: ${(e.error && e.error.error && e.error.error.message) || e.message}`; }
  } else out.api = 'no key: add the secret ANTHROPIC_API_KEY in Cloudflare (Settings → Variables and Secrets)';
  const gm = env.GEMINI_MODEL || GEMINI;
  out.gemini_model = gm;
  if (env.GEMINI_API_KEY) {
    try {
      const r = await fetch(`${env.GEMINI_BASE_URL || GEMINI_URL}/models/${gm}`, { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
      const j = await r.json().catch(() => ({}));
      out.gemini = r.ok ? `ok: the key works and ${j.name || gm} is available (the daily free quota is not checked here)` : `error ${r.status}: ${(j.error && j.error.message) || r.statusText}`;
    } catch (e) { out.gemini = 'error: ' + e.message; }
  } else out.gemini = 'no key: add the secret GEMINI_API_KEY in Cloudflare (Settings → Variables and Secrets)';
  out.order = 'Gemini first, then Claude if Gemini fails';
  out.note = 'The Claude credit balance is not checked here: see platform.claude.com → Settings → Billing.';
  return new Response(JSON.stringify(out, null, 1), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

// Gemini, streamed: yields the text pieces; throws (with .status) before the first piece when it cannot answer
async function* askGemini(env, system, history, question) {
  const model = env.GEMINI_MODEL || GEMINI;
  const contents = [...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: question }] }];
  const r = await fetch(`${env.GEMINI_BASE_URL || GEMINI_URL}/models/${model}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 2000 } })
  });
  if (!r.ok || !r.body) { const e = new Error(`gemini ${r.status}: ${(await r.text().catch(() => '')).slice(0, 300)}`); e.status = r.status; throw e; }
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
  if (!any) { const e = new Error('gemini: empty answer ' + why); e.status = why === 'SAFETY' ? 'refusal' : 'empty'; throw e; }
  if (why === 'MAX_TOKENS') yield ' …';
}

export async function tutor(req, env, url) {
  if (!env.ANTHROPIC_API_KEY && !env.GEMINI_API_KEY) return text('tutor not configured', 503);
  let d; try { d = await req.json(); } catch (e) { return text('bad json', 400); }
  const ok = (s, re) => typeof s === 'string' && re.test(s);
  if (!ok(d.page, /^learn(-[a-z]+){0,3}$/) || !ok(d.lesson, /^l\d{1,2}$/) || !['en', 'fr'].includes(d.lang) || typeof d.question !== 'string') return text('bad data', 400);
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

  const lesson = await lessonText(env, url.origin, d.lang === 'fr' ? d.page + '-fr' : d.page, d.lesson);
  if (!lesson) { console.log('tutor error: lesson not found', d.page, d.lesson, d.lang); return text('lesson not found', 404); }

  const system = `${RULES(d.lang)}\n\nThe lesson: ${lesson.title}\n\n${lesson.body}`;
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(ctrl) {
      let started = false;
      // the first piece says which model answers ([[m:gemini]] or [[m:claude]]): the page shows it only in its test mode
      const put = (s, who) => { if (!started) ctrl.enqueue(enc.encode(`[[m:${who}]]`)); started = true; ctrl.enqueue(enc.encode(s)); };
      // 1. Gemini, the main model
      if (env.GEMINI_API_KEY) {
        try { for await (const s of askGemini(env, system, history, question)) put(s, 'gemini'); ctrl.close(); return; }
        catch (e) {
          console.log('tutor: gemini failed', e && e.status, e && e.message);
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
          system: [{ type: 'text', text: RULES(d.lang) }, { type: 'text', text: `The lesson: ${lesson.title}\n\n${lesson.body}`, cache_control: { type: 'ephemeral' } }],
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

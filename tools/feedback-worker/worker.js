// feedback-worker — the small API of Robotics Atlas. It is the Worker of the site itself (wrangler.jsonc at the root of the
// repository): Cloudflare runs it only for /api/*, every other address is served as a plain file. Anonymous: no cookie,
// no IP address is stored. Feedback needs a KV namespace bound as FEEDBACK (optional, see README.md); without it, votes are ignored.
//   POST /api/feedback          { page, lesson, vote: 1 | -1, lang: 'en' | 'fr', comment? }   → 204
//   GET  /api/feedback/summary  header  Authorization: Bearer <SUMMARY_TOKEN>                  → JSON totals + comments
//   POST /api/tutor             { page, lesson, lang, question, history? }                    → the answer, streamed as plain text
//   GET  /api/tutor/status                                                                    → what works (key, lesson text, API), no secret
import { tutor, tutorStatus } from './tutor.js';
const json = (o, status = 200) => new Response(JSON.stringify(o, null, 1), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/feedback' && req.method === 'POST') {
      if (!env.FEEDBACK) return new Response(null, { status: 204 });   // feedback storage not installed: accept and forget
      let d; try { d = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
      const ok = (s, re) => typeof s === 'string' && re.test(s);
      if (!ok(d.page, /^[a-z0-9-]{1,40}$/) || !ok(d.lesson, /^l\d{1,2}$/) || (d.vote !== 1 && d.vote !== -1) || !['en', 'fr'].includes(d.lang)) return json({ error: 'bad data' }, 400);
      const comment = typeof d.comment === 'string' ? d.comment.slice(0, 500) : '';
      const day = new Date().toISOString().slice(0, 10);
      // one record per vote (expires after a year), and a counter per lesson
      await env.FEEDBACK.put(`v:${day}:${crypto.randomUUID()}`, JSON.stringify({ page: d.page, lesson: d.lesson, vote: d.vote, lang: d.lang, comment }), { expirationTtl: 365 * 86400 });
      const k = `c:${d.page}#${d.lesson}`, c = (await env.FEEDBACK.get(k, 'json')) || { up: 0, down: 0 };
      if (d.vote > 0) c.up++; else c.down++;
      await env.FEEDBACK.put(k, JSON.stringify(c));                     // (KV is not atomic: two votes at the same instant may count once)
      return new Response(null, { status: 204 });
    }
    if (url.pathname === '/api/feedback/summary' && req.method === 'GET') {
      if (!env.FEEDBACK || !env.SUMMARY_TOKEN || req.headers.get('authorization') !== `Bearer ${env.SUMMARY_TOKEN}`) return json({ error: 'unauthorised' }, 401);
      const totals = [], comments = [];
      for (const prefix of ['c:', 'v:']) {
        let cursor;
        do {
          const r = await env.FEEDBACK.list({ prefix, cursor }); cursor = r.list_complete ? null : r.cursor;
          for (const key of r.keys) {
            const v = await env.FEEDBACK.get(key.name, 'json'); if (!v) continue;
            if (prefix === 'c:') totals.push({ lesson: key.name.slice(2), up: v.up, down: v.down, clear: Math.round(100 * v.up / Math.max(1, v.up + v.down)) + ' %' });
            else if (v.comment) comments.push({ day: key.name.slice(2, 12), lesson: v.page + '#' + v.lesson, lang: v.lang, comment: v.comment });
          }
        } while (cursor);
      }
      totals.sort((a, b) => (a.up / Math.max(1, a.up + a.down)) - (b.up / Math.max(1, b.up + b.down)));   // least clear first
      return json({ totals, comments: comments.sort((a, b) => b.day.localeCompare(a.day)).slice(0, 200) });
    }
    if (url.pathname === '/api/tutor' && req.method === 'POST') return tutor(req, env, url);
    if (url.pathname === '/api/tutor/status' && req.method === 'GET') return tutorStatus(env, url);
    if (!url.pathname.startsWith('/api/') && env.ASSETS) return env.ASSETS.fetch(req);   // (not reached: only /api/* runs the Worker)
    return json({ error: 'not found' }, 404);
  }
};

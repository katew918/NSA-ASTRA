const MAX_BYTES = 2048;
const LIMIT = 40;
const WINDOW_MS = 60000;
const TIMEOUT_MS = 8000;
const DEEPSEEK_BASE = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-flash";
const DEFAULT_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwen3-30b-a3b-instruct-2507";
const BANDS = ["low", "mid", "high"];
const PARTS = ["morning", "afternoon", "evening", "night"];
const PHASES = {training: "still training on Earth before launch", launch: "on launch day", arrive: "on their first day in space", orbit: "well into the mission, living in space", prereturn: "on the last day before landing", landed: "just after landing", after: "in the days after landing"};
const TONE = {low: "a hard answer", mid: "an in-between answer", high: "a good answer"};
const DAY_LABEL = /^(Day \d{1,5}|L[\u2212-]\d{1,5}|[MR]\+\d{1,5})$/;
const ROLE = /^[A-Za-z][A-Za-z -]{0,29}$/;
const MAX_HISTORY = 2;
const NAME_RATE = 0.35;
const DENY = ["diagnos", "disorder", "depress", "anxiety", "medicat", "prescri", "therap", "suicid", "as an ai", "language model", "chatbot", "should", "you need", "try to", "doctor"];
const hits = new Map();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function header(req, name) {
  const v = req.headers && req.headers[name];
  return Array.isArray(v) ? v[0] : v || "";
}

function hostOf(u) {
  try { return new URL(u).host.toLowerCase(); } catch (e) { return ""; }
}

function bareHost(h) {
  return String(h || "").toLowerCase().replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
}

function sameSite(req) {
  const src = header(req, "origin") || header(req, "referer");
  if (!src || src === "null") return false;
  const from = hostOf(src);
  if (!from) return false;
  const local = ["localhost", "127.0.0.1", "::1"];
  if (local.includes(bareHost(from))) return true;
  const hosts = [header(req, "x-forwarded-host"), header(req, "host")].map(function (h) { return String(h).split(",")[0].trim().toLowerCase(); }).filter(Boolean);
  return hosts.includes(from);
}

function clientIp(req) {
  const f = header(req, "x-forwarded-for").split(",")[0].trim();
  return f || header(req, "x-real-ip") || (req.socket && req.socket.remoteAddress) || "unknown";
}

function limited(ip, now) {
  const list = (hits.get(ip) || []).filter(function (t) { return now - t < WINDOW_MS; });
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] >= WINDOW_MS) hits.delete(k); }
  }
  return list.length > LIMIT;
}

function readRaw(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return Promise.resolve(req.body);
    if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body.toString("utf8"));
    return Promise.resolve(JSON.stringify(req.body));
  }
  return new Promise(function (resolve, reject) {
    let size = 0;
    const parts = [];
    req.on("data", function (c) {
      size += c.length;
      if (size > MAX_BYTES) { reject(new Error("big")); return; }
      parts.push(c);
    });
    req.on("end", function () { resolve(Buffer.concat(parts).toString("utf8")); });
    req.on("error", reject);
  });
}

function clean(s, max) {
  if (typeof s !== "string") return "";
  return s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function opt(x, max) {
  if (x === undefined || x === null) return "";
  if (typeof x !== "string" || x.length > max) return null;
  return clean(x, max);
}

function pairs(h) {
  if (h === undefined || h === null) return [];
  if (!Array.isArray(h) || h.length > MAX_HISTORY) return null;
  const out = [];
  for (const p of h) {
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    if (typeof p.q !== "string" || typeof p.a !== "string") return null;
    if (p.q.length > 140 || p.a.length > 40) return null;
    const q = clean(p.q, 140), a = clean(p.a, 40);
    if (!q || !a) return null;
    out.push({q, a});
  }
  return out;
}

function validate(b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  if (typeof b.question !== "string" || typeof b.answer !== "string") return null;
  if (b.question.length > 140 || b.answer.length > 40) return null;
  const question = clean(b.question, 140), answer = clean(b.answer, 40);
  if (!question || !answer) return null;
  if (!BANDS.includes(b.band)) return null;
  const name = clean(typeof b.name === "string" ? b.name : "", 30).replace(/[^A-Za-z\u00c0-\u024f' -]/g, "").trim();
  const partOfDay = PARTS.includes(b.partOfDay) ? b.partOfDay : "daytime";
  const md = Number(b.missionDay);
  const missionDay = Number.isInteger(md) && md >= -9999 && md <= 99999 ? md : null;
  const role = opt(b.role, 30), phase = opt(b.phase, 12), dayLabel = opt(b.dayLabel, 12), history = pairs(b.history);
  if (role === null || phase === null || dayLabel === null || history === null) return null;
  return {
    name, question, answer, band: b.band, partOfDay, missionDay, history,
    role: ROLE.test(role) ? role : "",
    phase: Object.prototype.hasOwnProperty.call(PHASES, phase) ? phase : "",
    dayLabel: DAY_LABEL.test(dayLabel) ? dayLabel : ""
  };
}

function systemPrompt(v, useName) {
  const who = [v.name ? "first name " + v.name : "", v.role ? "role " + v.role : ""].filter(Boolean).join(", ");
  const when = v.dayLabel ? "mission calendar: " + v.dayLabel : v.missionDay === null ? "mission calendar: an ongoing day" : "mission calendar: day " + v.missionDay;
  const stage = v.phase ? ", " + PHASES[v.phase] : "";
  const nameRule = v.name && useName ? " Address them by their first name in this reply." : " Do not use their name in this reply.";
  return "You are Mini Astra, the private check-in companion inside ASTRA, talking with one crew member on a space mission." +
    (who ? " About this person: " + who + "." : "") +
    " It is " + v.partOfDay + " on board" + stage + " (" + when + ")." +
    " They are doing a short check-in and tap one option per question." +
    " Reply with ONE short, warm sentence of at most 22 words that reflects exactly what they just tapped, so it reads as written for this person and this answer, not a stock phrase." +
    " Match the tone: gentle and steady for a hard answer, quietly glad for a good one, calm and even in between." +
    " If it fits naturally, you may connect to their earlier answers, the time of day or the stage of the mission in plain words." +
    nameRule +
    " Do not ask a question. Do not write any numbers or digits." +
    " Do not use medical, clinical or diagnostic words, and do not mention scores, moods, stress, measurements or what the question measures." +
    " Give no advice or instructions; at most one gentle, small idea such as a slow breath or a short pause, and never use the words should, need or try." +
    " Never mention being an AI, a model or a program. Plain text only, no quotes, no emoji.";
}

function userPrompt(v) {
  const earlier = v.history.length ? "Earlier in this check-in:\n" + v.history.map(function (p) { return "- Question: \"" + p.q + "\" Answer: \"" + p.a + "\""; }).join("\n") + "\n" : "";
  return earlier + "Now: Question: \"" + v.question + "\" Answer: \"" + v.answer + "\" (this was " + TONE[v.band] + ").";
}

function tidy(text) {
  if (typeof text !== "string") return "";
  let s = text.replace(/<think>[\s\S]*?<\/think>/gi, " ").replace(/<[^>]*>/g, " ");
  s = s.replace(/[\r\n\t]+/g, " ").replace(/[*_`#~>|\[\]{}]/g, "").replace(/["\u201c\u201d\u00ab\u00bb]/g, "");
  s = s.replace(/\s+/g, " ").trim().replace(/^['\u2018\u2019]+|['\u2018\u2019]+$/g, "").trim();
  const m = s.match(/^.*?[.!](?=\s|$)/);
  if (m) s = m[0];
  if (s.length > 160) {
    s = s.slice(0, 160);
    const sp = s.lastIndexOf(" ");
    if (sp > 40) s = s.slice(0, sp);
    s = s.replace(/[,;:\s-]+$/, "") + ".";
  }
  return s.trim();
}

function acceptable(s, name) {
  if (!s || s.length < 2) return false;
  if (/[?\uff1f]/.test(s) || /\d/.test(s)) return false;
  if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s)) return false;
  const low = (name ? s.split(name).join(" ") : s).toLowerCase();
  return !DENY.some(function (w) { return low.includes(w); });
}

function provider() {
  const ds = (process.env.DEEPSEEK_API_KEY || "").trim();
  if (ds) return {deepseek: true, key: ds, base: (process.env.DEEPSEEK_BASE_URL || DEEPSEEK_BASE).replace(/\/+$/, ""), model: process.env.DEEPSEEK_MODEL || DEEPSEEK_MODEL};
  const key = (process.env.LLM_API_KEY || "").trim();
  if (key) return {deepseek: false, key, base: (process.env.LLM_BASE_URL || DEFAULT_BASE).replace(/\/+$/, ""), model: process.env.LLM_MODEL || DEFAULT_MODEL};
  return null;
}

async function askModel(v, useName) {
  const p = provider();
  if (!p) return "";
  const key = p.key, base = p.base, model = p.model;
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
  try {
    const r = await fetch(base + "/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: Object.assign({"Content-Type": "application/json", "Authorization": "Bearer " + key}, p.deepseek ? {} : {"X-Title": "ASTRA"}),
      body: JSON.stringify(Object.assign({
        model,
        temperature: 0.8,
        max_tokens: 70,
        stream: false,
        messages: [
          {role: "system", content: systemPrompt(v, useName)},
          {role: "user", content: userPrompt(v)}
        ]
      }, p.deepseek ? {thinking: {type: "disabled"}} : {}))
    });
    if (!r.ok) return "";
    const j = await r.json();
    const msg = j && j.choices && j.choices[0] && j.choices[0].message;
    return msg && typeof msg.content === "string" ? msg.content : "";
  } catch (e) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}

async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return send(res, 405, {error: "method"}); }
    if (!sameSite(req)) return send(res, 403, {error: "forbidden"});
    const len = Number(header(req, "content-length"));
    if (len > MAX_BYTES) return send(res, 413, {error: "too large"});
    if (limited(clientIp(req), Date.now())) { res.setHeader("Retry-After", "60"); return send(res, 429, {error: "slow down"}); }
    let raw;
    try { raw = await readRaw(req); } catch (e) { return send(res, 413, {error: "too large"}); }
    if (Buffer.byteLength(raw || "", "utf8") > MAX_BYTES) return send(res, 413, {error: "too large"});
    let body;
    try { body = typeof req.body === "object" && req.body !== null && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(raw); } catch (e) { return send(res, 400, {error: "bad request"}); }
    const v = validate(body);
    if (!v) return send(res, 400, {error: "bad request"});
    const say = tidy(await askModel(v, Math.random() < NAME_RATE));
    if (!acceptable(say, v.name)) return send(res, 200, {fallback: true});
    return send(res, 200, {say});
  } catch (e) {
    return send(res, 200, {fallback: true});
  }
}

module.exports = handler;
module.exports.default = handler;

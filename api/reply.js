const MAX_BYTES = 1536;
const LIMIT = 40;
const WINDOW_MS = 60000;
const TIMEOUT_MS = 8000;
// Mini Astra replies come from DeepSeek. The key is read from the DEEPSEEK_API_KEY
// environment variable on Vercel and never reaches the browser.
const DEEPSEEK_BASE = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-flash";
// Older setting, kept so an existing OpenRouter key still works if no DeepSeek key is set.
const DEFAULT_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "qwen/qwen3-30b-a3b-instruct-2507";
const BANDS = ["low", "mid", "high"];
const PARTS = ["morning", "afternoon", "evening", "night"];
const DENY = ["diagnos", "disorder", "depress", "anxiety", "medicat", "prescri", "therap", "suicid", "as an ai", "should", "you need", "try to", "doctor"];
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
  return {name, question, answer, band: b.band, partOfDay, missionDay};
}

function systemPrompt(v) {
  const day = v.missionDay === null ? "an ongoing day" : String(v.missionDay);
  const who = v.name ? " Their first name is " + v.name + "." : "";
  return "You are Mini Astra, the private check-in companion inside ASTRA, talking with an astronaut on a long space mission. The crew member is on mission day " + day + "; it is " + v.partOfDay + " on board." + who + " They just answered one check-in question by tapping an option. Reply with ONE short, warm sentence (at most 14 words) that acknowledges their answer in a natural, human way, like a calm crewmate. Match the tone to the answer: gentle and steady if it was a hard answer, quietly glad if it was a good one, neutral if in between. Do not ask a question. Do not give advice, instructions or opinions about their health. Do not mention scores, moods, stress, measurements, diagnoses or what the question measures. Do not use their name more than once. Plain text only, no quotes, no emoji.";
}

function tidy(text) {
  if (typeof text !== "string") return "";
  let s = text.replace(/<think>[\s\S]*?<\/think>/gi, " ").replace(/<[^>]*>/g, " ");
  s = s.replace(/[\r\n\t]+/g, " ").replace(/[*_`#~>|\[\]{}]/g, "").replace(/["\u201c\u201d\u00ab\u00bb]/g, "");
  s = s.replace(/\s+/g, " ").trim().replace(/^['\u2018\u2019]+|['\u2018\u2019]+$/g, "").trim();
  const m = s.match(/^.*?[.!](?=\s|$)/);
  if (m) s = m[0];
  if (s.length > 110) {
    s = s.slice(0, 110);
    const sp = s.lastIndexOf(" ");
    if (sp > 40) s = s.slice(0, sp);
    s = s.replace(/[,;:\s-]+$/, "") + ".";
  }
  return s.trim();
}

function acceptable(s) {
  if (!s || s.length < 2) return false;
  if (/[?\uff1f]/.test(s) || /\d/.test(s)) return false;
  if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(s)) return false;
  const low = s.toLowerCase();
  return !DENY.some(function (w) { return low.includes(w); });
}

function provider() {
  const ds = (process.env.DEEPSEEK_API_KEY || "").trim();
  if (ds) return {deepseek: true, key: ds, base: (process.env.DEEPSEEK_BASE_URL || DEEPSEEK_BASE).replace(/\/+$/, ""), model: process.env.DEEPSEEK_MODEL || DEEPSEEK_MODEL};
  const key = (process.env.LLM_API_KEY || "").trim();
  if (key) return {deepseek: false, key, base: (process.env.LLM_BASE_URL || DEFAULT_BASE).replace(/\/+$/, ""), model: process.env.LLM_MODEL || DEFAULT_MODEL};
  return null;
}

async function askModel(v) {
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
        max_tokens: 40,
        stream: false,
        messages: [
          {role: "system", content: systemPrompt(v)},
          {role: "user", content: "Question: \"" + v.question + "\" Answer: \"" + v.answer + "\" (this was a " + v.band + " answer)."}
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
    const say = tidy(await askModel(v));
    if (!acceptable(say)) return send(res, 200, {fallback: true});
    return send(res, 200, {say});
  } catch (e) {
    return send(res, 200, {fallback: true});
  }
}

module.exports = handler;
module.exports.default = handler;

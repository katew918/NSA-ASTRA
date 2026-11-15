(function () {
  var DAY_LIMIT_H = 8;
  var CHANGES_PER_DAY = 2;
  var LIGHT_DAYS_PER_7 = 2;
  var REST_WATCH_DAYS = 6;

  var A = window.ASTRA_API;
  if (!A || typeof document === "undefined") return;
  function $(s) { return document.querySelector(s); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[c]; }); }
  function mod(a, n) { return ((a % n) + n) % n; }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function first(n) { return String(n || "").split(" ")[0]; }
  function ini(n) { return String(n || "").split(" ").map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase(); }
  function hrs(h) { var r = Math.round(h * 10) / 10; return (r % 1 ? r.toFixed(1) : String(r)) + " h"; }
  function durTxt(m) { if (m < 60) return m + " min"; var h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + r + " min" : ""); }
  function crew() { return A.CREW || []; }
  function crewById(id) { return crew().find(function (c) { return c.id === id; }); }
  function areaMin(a) { var m = /(\d+)\s*min/.exec((A.AREAS && A.AREAS[a] && A.AREAS[a].time) || ""); return m ? +m[1] : 20; }
  function areaLabel(a) { return (A.AREAS && A.AREAS[a] && A.AREAS[a].label) || a; }

  var SCI = ["Science block", "Sample processing", "Experiment setup", "Data review", "Plant growth check", "Microscope session"];
  var MAINT = ["Filter inspection", "Cargo inventory", "Water system check", "Air system check", "Stowage reorganisation", "Tool kit audit"];
  var OPS = {Commander: "Systems review", Pilot: "Vehicle systems check"};

  function isRest(c, d) { var p = A.phase(d); return (p === "training" || p === "orbit" || p === "after") && mod(d + c.idx * 2, 7) === 3; }

  function sched(d, add) {
    var due = A.dueOn ? A.dueOn(d) : [];
    if (due.indexOf("cog") >= 0) add("cog", "Cognitive test", "Health", "14:30", 3, {link: "cog", locked: true});
    if (due.indexOf("eyes") >= 0) add("eyes", "Eye exam", "Health", "15:00", areaMin("eyes"), {link: "scan", area: "eyes", locked: true});
    if (due.indexOf("neck") >= 0) add("neck", "Neck-vein ultrasound", "Health", "15:30", areaMin("neck"), {link: "scan", area: "neck", locked: true});
    if (due.indexOf("conf") >= 0) add("conf", "Private medical conference", "Health", "17:30", 15, {link: "conf", locked: true});
  }

  function gen(c, d) {
    var p = A.phase(d), mars = A.S.mission === "mars", out = [], seed = A.S.mission + ":" + d + ":" + c.id;
    function add(slug, name, cat, start, dur, x) { out.push(Object.assign({uid: c.id + ":" + A.S.mission + ":" + d + ":" + slug, name: name, cat: cat, start: start, dur: dur}, x || {})); }
    function pick(list, salt) { return list[hash(seed + salt) % list.length]; }
    var rest = isRest(c, d);
    if (p === "training") {
      add("health", "Training check", "Health", "07:30", 5, {link: "health", locked: true});
      if (rest) {
        add("ex", "Light exercise", "Exercise", "10:00", 45);
        add("free", "Personal time", "Rest", "13:00", 180);
        add("call", "Family call", "Rest", "17:00", 30);
        add("read", "Reading and music", "Rest", "19:30", 60);
        return out;
      }
      add("sim", "Simulator session", "Operations", "09:00", 120);
      add("fit", "Fitness session", "Exercise", "11:30", 60);
      var mb = A.missingBase ? A.missingBase() : [];
      if (mb.length) add("bscan", "Baseline scan: " + areaLabel(mb[0]).toLowerCase(), "Health", "13:30", areaMin(mb[0]), {link: "bscan", area: mb[0], locked: true});
      add("brief", "Mission briefing", "Operations", "15:00", 45);
      if (c.role === "Commander" || c.role === "Pilot") add("proc", c.role === "Pilot" ? "Vehicle systems training" : "Procedure review", "Operations", "16:30", 60);
      else add("sci", "Science training", "Science", "16:30", 90);
      return out;
    }
    if (p === "launch") {
      add("health", "Last check before you board", "Health", "06:00", 5, {link: "health", locked: true});
      add("suit", "Suit fit check", "Operations", "07:00", 45);
      add("brief", "Launch briefing", "Operations", "09:00", 30);
      add("ascent", "Launch and ascent", "Operations", "11:00", 240, {locked: true});
      add("rest", "Rest period", "Rest", "18:00", 120);
      return out;
    }
    if (p === "arrive") {
      add("health", "Arrival check", "Health", "08:00", 5, {link: "health", locked: true});
      add("dock", mars ? "Vehicle checkout" : "Docking watch", "Operations", "09:00", 120, {locked: true});
      add("unpack", "Unpack personal kit", "Maintenance", "12:00", 60);
      add("orient", "Orientation walkthrough", "Operations", "14:00", 60);
      sched(d, add);
      add("plan", "Daily planning conference", "Operations", "18:00", 15);
      return out;
    }
    if (p === "orbit") {
      add("health", "Daily health check", "Health", "07:30", 2, {link: "health", locked: true});
      if (rest) {
        sched(d, add);
        add("free", "Personal time", "Rest", "12:00", 180);
        add("call", "Family video call", "Rest", "17:00", 30);
        add("plan", "Daily planning conference", "Operations", "08:15", 15);
        return out.sort(byStart);
      }
      add("plan", "Daily planning conference", "Operations", "08:15", 15);
      add("ex", "Exercise session", "Exercise", "08:30", 150);
      var spec = c.role !== "Commander" && c.role !== "Pilot";
      add("sci", pick(SCI, "s1"), "Science", "11:00", 120 + (hash(seed + "d1") % 3) * 15);
      if (spec && hash(seed + "two") % 2) { var s2 = pick(SCI, "s2"); add("sci2", s2 === out[out.length - 1].name ? "Science block" : s2, "Science", "13:30", 60 + (hash(seed + "d2") % 3) * 15); }
      else if (!spec && hash(seed + "ops") % 2) add("ops", OPS[c.role], "Operations", "13:30", 60);
      else add("mnt", pick(MAINT, "m1"), "Maintenance", "13:30", 60 + (hash(seed + "d3") % 4) * 15);
      sched(d, add);
      if (hash(A.S.mission + ":" + d + ":crit:" + c.idx) % 6 === 0) add("crit", mars ? "Course correction watch" : "Docking watch", "Operations", "16:30", 90, {locked: true});
      else if (hash(seed + "m2") % 2) add("mnt2", pick(MAINT, "m2"), "Maintenance", "16:30", 60);
      return out.sort(byStart);
    }
    if (p === "prereturn") {
      add("health", mars ? "Before-landing check" : "Before-you-go-home check", "Health", "07:30", 10, {link: "health", locked: true});
      sched(d, add);
      add("pack", "Pack return cargo", "Maintenance", "09:00", 120);
      add("review", "Landing procedures review", "Operations", "11:30", 90);
      add("seat", "Seat and suit fit check", "Operations", "13:30", 45);
      add("brief", "Landing briefing", "Operations", "17:00", 30, {locked: true});
      return out.sort(byStart);
    }
    if (p === "landed") {
      add("health", mars ? "First check on Mars" : "Welcome-home check", "Health", "09:00", 20, {link: "health", locked: true});
      add("scan", "Guided scan: leg veins", "Health", "14:00", areaMin("legs"), {link: "scan", area: "legs", locked: true});
      add("med", "Medical tests", "Health", "10:00", 120);
      add("walk", "Short walk with support", "Exercise", "16:00", 20);
      add("rest", "Rest period", "Rest", "17:00", 180);
      return out.sort(byStart);
    }
    add("health", "Recovery check", "Health", "08:00", 2, {link: "health", locked: true});
    if (rest) {
      add("walk", "Easy walk", "Exercise", "10:00", 30);
      add("free", "Personal time", "Rest", "12:00", 180);
      add("call", "Family time", "Rest", "17:00", 120);
      add("read", "Reading and music", "Rest", "20:00", 60);
      return out;
    }
    add("recon", "Reconditioning session", "Exercise", "09:30", 60);
    add("debrief", "Mission debrief", "Operations", "11:00", 90);
    add("data", "Science data review", "Science", "14:00", 60);
    add("rest", "Rest period", "Rest", "16:00", 120);
    return out;
  }
  function toMin(t) { var p = String(t).split(":"); return +p[0] * 60 + +p[1]; }
  function fromMin(m) { var h = Math.floor(m / 60), r = m % 60; return (h < 10 ? "0" : "") + h + ":" + (r < 10 ? "0" : "") + r; }
  function byStart(a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; }

  function store(id) { var s = A.APP.crew[id]; if (!s.todo || typeof s.todo !== "object") s.todo = {}; return s.todo; }
  function rec(id, d, make) { var t = store(id), k = A.key(d); if (make && !t[k]) t[k] = {done: {}, ch: []}; var r = t[k] || {done: {}, ch: []}; r.done = r.done || {}; r.ch = r.ch || []; return r; }
  function snap(t) { return {uid: t.uid, name: t.name, cat: t.cat, start: t.start, dur: t.dur}; }

  var REPEAT = {neck: ["Repeat neck-vein ultrasound", "neck"], broken: ["Repeat leg scan", "legs"], kidney: ["Repeat kidney ultrasound", "bladder"]};
  var FOLLOW = {bone: ["Follow-up heel-bone scan", "legs"], eye: ["Follow-up eye exam", "eyes"]};
  function added(c, d, own) {
    var out = [], a = rec(c.id, d).add, f = rec(c.id, d - 7).add;
    function put(slug, name, cat, dur, locked, x) { out.push(Object.assign({uid: c.id + ":" + A.S.mission + ":" + d + ":new:" + slug, name: name, cat: cat, start: "14:00", dur: dur, locked: locked, added: true}, x || {})); }
    if (a && a.id) {
      var call = a.far ? "Voice message to flight surgeon" : "Call with flight surgeon";
      if (a.id === "sleep") put("rest", "Rest block", "Rest", 45, false);
      if (a.id === "hr") put("hr", "Repeat heart-rate check", "Health", 5, true);
      if (a.id === "rt") put("rt", "Repeat cognitive test", "Health", 3, true);
      if (FOLLOW[a.id] && !own.some(function (r) { return r.link === "conf"; })) put("conf", "Private medical conference", "Health", 15, true);
      if (a.id === "miss" && a.name) put("miss", a.name, "Health", areaMin(a.area), true, {link: "scan", area: a.area});
      if (a.id === "vhr" || REPEAT[a.id]) put("call", call, "Health", 15, true);
      if (a.id === "vhr") put("hr", "Repeat heart-rate check", "Health", 5, true);
      if (REPEAT[a.id]) put("scan", REPEAT[a.id][0], "Health", areaMin(REPEAT[a.id][1]), true);
    }
    if (f && FOLLOW[f.id]) put("follow", FOLLOW[f.id][0], "Health", areaMin(FOLLOW[f.id][1]), true);
    return out;
  }

  function list(c, d) {
    var own = A.withMember(c.id, function () { return gen(c, d); });
    var late = rec(c.id, d - 1).ch.filter(function (x) { return x.type === "delay"; }).map(function (x) { return Object.assign(snap(x.task), {late: true}); });
    var inc = [];
    crew().forEach(function (o) { if (o.id === c.id) return; rec(o.id, d).ch.forEach(function (x) { if (x.type === "hand" && x.to === c.id) inc.push(Object.assign(snap(x.task), {incoming: true, from: o.id})); }); });
    var busy = late.concat(own).map(function (r) { return [toMin(r.start), toMin(r.start) + r.dur]; });
    inc.sort(byStart).forEach(function (r) { var s = toMin(r.start), hit = true;
      while (hit) { hit = false; busy.forEach(function (b) { if (s < b[1] && s + r.dur > b[0]) { s = b[1]; hit = true; } }); }
      if (s !== toMin(r.start)) { r.was = r.start; r.start = fromMin(s); } busy.push([s, s + r.dur]); });
    var adds = added(c, d, own), from = toMin("14:00");
    busy.forEach(function (b) { if (b[0] < toMin("18:00") && b[1] > from) from = b[1]; });
    adds.forEach(function (r) { var s = from, hit = true;
      while (hit) { hit = false; busy.forEach(function (b) { if (s < b[1] && s + r.dur > b[0]) { s = b[1]; hit = true; } }); }
      r.start = fromMin(s); busy.push([s, s + r.dur]); from = s + r.dur; });
    var mine = rec(c.id, d).ch, rows = late.concat(own.concat(inc, adds).sort(byStart));
    rows.forEach(function (r) { var m = mine.find(function (x) { return x.uid === r.uid; }); if (m) r.moved = m; });
    return rows;
  }
  function load(c, d, rows) { rows = rows || list(c, d); return rows.reduce(function (s, r) { return s + (!r.moved && r.cat !== "Rest" ? r.dur / 60 : 0); }, 0); }
  function hardDay(c) {
    return A.withMember(c.id, function () { return (A.statuses ? A.statuses() : []).some(function (x) { return x.l === "watch" || x.l === "urgent"; }); });
  }
  function shortSleep() { return (A.statuses ? A.statuses() : []).some(function (x) { return /slept a lot less/.test(x.what); }); }
  function own(r) { return r.ch.filter(function (x) { return x.type !== "pause"; }); }
  function lightDays(c, d) { var n = 0; for (var x = d - 6; x <= d; x++) if (own(rec(c.id, x)).length) n++; return n; }
  function sinceRest(c, d) { var n = 0; for (var x = d; x > d - 400 && !isRest(c, x); x--) n++; return n; }
  function gates(c, d) {
    var ch = own(rec(c.id, d)).length, light = lightDays(c, d), unlocked = hardDay(c);
    var chFull = ch >= CHANGES_PER_DAY, lightFull = !ch && light >= LIGHT_DAYS_PER_7;
    return {unlocked: unlocked, ch: ch, light: light, chFull: chFull, lightFull: lightFull || (light >= LIGHT_DAYS_PER_7 && chFull), can: unlocked && !chFull && !lightFull, left: Math.max(0, CHANGES_PER_DAY - ch)};
  }

  var UI = {menu: null, sig: "", todayHTML: "", mindHTML: ""};

  function me() { return crewById(A.APP.active) || crew()[0]; }
  function linkState(t) {
    var pl = A.plan ? A.plan() : [];
    var lg = A.L ? A.L() : {}, dn = lg.done || {};
    if (t.link === "health") { var h = pl.find(function (x) { return x.flow && x.flow[0] === "daily"; }); return {done: !!lg.checkDone || (h ? !!h.done : false), open: function () { if (h) A.openFlow(h.flow, h.id); }}; }
    if (t.link === "conf") { var cf = pl.find(function (x) { return x.id === "conf"; }); return {done: cf ? !!cf.done : true, open: function () { if (A.markConf) A.markConf(); }}; }
    if (t.link === "cog") { return {done: !!(lg.rt && dn.cog), open: function () { A.openFlow(["rt", "fin"], "cog"); }}; }
    if (t.link === "bscan") { var b = pl.find(function (x) { return x.id === "bscan"; }); return {done: !b, open: function () { A.openFlow(b ? b.flow : ["scan:" + t.area], null); }}; }
    var S = A.S || {}, d0 = A.day();
    return {done: (S.scans || []).some(function (x) { return x.mission === S.mission && x.area === t.area && x.day === d0; }), open: function () { A.openFlow(["scan:" + t.area], null); }};
  }

  var toastT = 0, toastO = 0;
  function toast(msg) {
    var old = document.querySelector(".toast"); if (old) old.remove();
    clearTimeout(toastT); clearTimeout(toastO);
    var el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    document.body.appendChild(el);
    toastO = setTimeout(function () { el.classList.add("out"); }, 1950);
    toastT = setTimeout(function () { el.remove(); }, 2200);
  }
  var seen = {key: "", st: {}};
  function noteLinked(c, d, rows) {
    var k = c.id + ":" + A.S.mission + ":" + d, fresh = seen.key !== k, st = {};
    rows.forEach(function (t) {
      if (!t.link || t.late || t.incoming || t.moved) return;
      var on = linkState(t).done, was = seen.st[t.uid]; st[t.uid] = on;
      if (fresh || was === undefined || was === on) return;
      if (on) toast(t.name + (t.link === "scan" || t.link === "bscan" ? " sent" : " done"));
      else if (t.link === "conf") toast(t.name + " not done");
    });
    seen = {key: k, st: st};
  }

  function nasaLim() {
    var n = ((window.DATA || {}).nasa || []).find(function (x) { return x && x.topic === "sleep.recommended_sleep_period" && typeof x.value === "number"; });
    if (!n) return "";
    var id = String(n.requirement_id || "").replace(/\s+rationale.*$/, "");
    return "<span class=\"lim\">Recommended sleep period <b>" + esc(n.value) + " h</b> <span class=\"realtag\">NASA-STD-3001 " + esc(id) + "</span></span>";
  }

  function renderTodayCard(c, d) {
    var box = $("#todayCard"); if (!box) return;
    var rows = list(c, d), g = gates(c, d), h = load(c, d, rows), pct = h / DAY_LIMIT_H;
    noteLinked(c, d, rows);
    var lv = pct > 1.15 ? " urgent" : pct >= 1 ? " watch" : "";
    var sr = sinceRest(c, d), nextH = load(c, d + 1);
    var html = "<div class=\"chead\"><div class=\"th\"><h2>Today</h2><span class=\"simtag\">Simulated schedule</span></div>" +
      "<div class=\"load" + lv + "\" id=\"loadBox\"><b>" + hrs(h) + "</b><span>of " + DAY_LIMIT_H + " h</span><div class=\"load-bar\"><i style=\"width:" + Math.min(100, Math.round(pct * 100)) + "%\"></i></div></div></div>";
    html += "<div class=\"tasks\" id=\"tasks\">" + rows.map(function (t) {
      var ls = t.link && !t.late && !t.incoming ? linkState(t) : null;
      var done = ls ? ls.done : !!rec(c.id, d).done[t.uid];
      var cls = ["task"]; if (done && !t.moved) cls.push("done"); if (t.moved) cls.push("moved"); if (t.late) cls.push("late"); if (t.locked) cls.push("locked"); if (t.incoming) cls.push("incoming"); if (t.added) cls.push("added");
      var state = "";
      if (t.moved) state = t.moved.type === "pause" ? "Paused" : t.moved.type === "delay" ? "Tomorrow" : "Handed to " + first((crewById(t.moved.to) || {}).name);
      else if (t.incoming) state = "From " + first((crewById(t.from) || {}).name) + (t.was ? ", moved from " + t.was : "");
      else if (t.late) state = "From yesterday";
      else if (t.locked && g.unlocked) state = "Fixed";
      var acts = "";
      if (t.moved) acts = "<button class=\"tk-btn\" data-act=\"undo\" type=\"button\">Undo</button>";
      else if (g.can && !t.locked && !t.incoming && !done && t.cat !== "Rest") {
        if (!t.late && nextH + t.dur / 60 <= DAY_LIMIT_H) acts += "<button class=\"tk-btn\" data-act=\"delay\" type=\"button\">Delay a day</button>";
        acts += "<button class=\"tk-btn\" data-act=\"hand\" type=\"button\" aria-haspopup=\"menu\" aria-expanded=\"" + (UI.menu === t.uid) + "\">Hand over</button>";
      }
      var name = "<b class=\"tk-name\">" + esc(t.name) + (t.added || t.incoming ? "<span class=\"tk-new\">New</span>" : "") + "</b>";
      var menu = "";
      if (UI.menu === t.uid && acts.indexOf("data-act=\"hand\"") >= 0) {
        menu = "<div class=\"tk-menu\" role=\"menu\">" + crew().filter(function (o) { return o.id !== c.id; }).map(function (o) {
          var oh = load(o, d), over = oh + t.dur / 60 > DAY_LIMIT_H, full = over || hardDay(o);
          return "<button class=\"tk-opt\" role=\"menuitem\" data-to=\"" + o.id + "\" type=\"button\"" + (full ? " disabled" : "") + "><span class=\"av\">" + esc(ini(o.name)) + "</span><span class=\"who\"><span class=\"nm\">" + esc(o.name) + "</span><span class=\"rl\">" + hrs(oh) + " of " + DAY_LIMIT_H + " h today</span></span>" + (full ? "<span class=\"tk-full\">" + (over ? "Full" : "Unavailable") + "</span>" : "") + "</button>";
        }).join("") + "</div>";
      }
      return "<div class=\"" + cls.join(" ") + "\" data-id=\"" + esc(t.uid) + "\">" +
        "<button class=\"tk-check\" type=\"button\" aria-pressed=\"" + (done && !t.moved) + "\" aria-label=\"" + (done ? "Mark not done" : "Mark done") + "\"" + (t.moved ? " disabled" : "") + "></button>" +
        (ls ? "<button class=\"tk-main\" type=\"button\" data-act=\"open\">" : "<div class=\"tk-main\">") + name + "<span class=\"tk-meta\">" + esc(t.start) + " · " + durTxt(t.dur) + " · " + esc(t.cat) + "</span>" + (ls ? "</button>" : "</div>") +
        "<span class=\"tk-state\">" + esc(state) + "</span><div class=\"tk-acts\">" + acts + "</div>" + menu + "</div>";
    }).join("") + "</div>";
    html += "<div class=\"limits\" id=\"limits\"><span class=\"lim" + (g.chFull ? " watch" : "") + "\">Changes today <b>" + g.ch + "/" + CHANGES_PER_DAY + "</b></span>" +
      "<span class=\"lim" + (g.light >= LIGHT_DAYS_PER_7 ? " watch" : "") + "\">Light days, last 7 <b>" + g.light + "/" + LIGHT_DAYS_PER_7 + "</b></span>" +
      "<span class=\"lim" + (sr >= REST_WATCH_DAYS ? " watch" : "") + "\">Days since a rest day <b>" + sr + "/" + REST_WATCH_DAYS + "</b></span>" + nasaLim() +
      "<span class=\"lim-note\">Team-set demo limits</span></div>";
    if (html !== UI.todayHTML) { box.innerHTML = html; UI.todayHTML = html; }
  }

  var MIND = [{k: "mood", label: "Mood"}, {k: "stress", label: "Stress"}, {k: "fatigue", label: "Energy"}, {k: "sleep", label: "Sleep"}, {k: "readiness", label: "Readiness"}];
  function scaleOf(k) { var T = window.ASTRA_CHECKIN_TEST, it = T && T.ITEMS && T.ITEMS.find(function (x) { return x.k === k; }); return it ? it.scale : ["Very low", "Low", "OK", "Good", "Very good"]; }
  function score(v) { var n = Math.round(Number(v)); return v == null || !isFinite(n) ? null : Math.max(1, Math.min(5, n)); }

  function renderMindBox(c, d) {
    var box = $("#mindBox"); if (!box) return;
    var dd = A.realFill() || A.L().daily, ck = dd && dd.checkin, g = gates(c, d), short = shortSleep();
    var vals = {mood: score(dd && dd.mood), stress: score(ck && ck.stress), fatigue: score(ck && ck.fatigue), sleep: score(ck && ck.sleep), readiness: score(ck && ck.readiness)};
    var items = MIND.map(function (m) {
      var v = vals[m.k], hard = m.k === "sleep" ? short : m.k !== "readiness" && v != null && v <= 2, dots = "";
      for (var i = 1; i <= 5; i++) dots += "<i" + (v && i <= v ? " class=\"on\"" : "") + "></i>";
      return "<div class=\"ms-item" + (hard ? " watch" : "") + "\"><span class=\"ms-k\">" + m.label + "</span><div class=\"ms-dots\">" + dots + "</div><b class=\"ms-v\">" + (v ? esc(scaleOf(m.k)[v - 1]) : "–") + "</b></div>";
    }).join("");
    var trend = [];
    for (var x = d - 13; x <= d; x++) { var r = A.realFill(x) || A.L(x).daily; trend.push(r && r.mood != null ? +r.mood : null); }
    var html = "<div class=\"chead\"><div class=\"th\"><h2>Mini Astra - Companion</h2><span class=\"mc-priv\">Only you see this</span></div><button class=\"btn sm\" id=\"mhBtn\" type=\"button\">" + (ck ? "Check in again" : "Check in") + "</button></div>" +
      "<div class=\"mind-scores\" id=\"mindScores\">" + items + "</div>" +
      "<div class=\"mind-trend\"><span class=\"ms-k\">Mood, last 14 days</span><div id=\"mindTrend\"></div></div>" +
      "<div class=\"support" + (g.unlocked ? " on" : "") + "\" id=\"supportBox\"><b>Support options</b><span id=\"supportSt\">" + (g.unlocked ? "Available today · " + (g.can ? g.left + (g.left === 1 ? " change" : " changes") + " left" : "limit reached") : "Not active today") + "</span></div>";
    var sig = html + "|" + trend.join(",");
    if (sig === UI.mindHTML) return;
    UI.mindHTML = sig; box.innerHTML = html;
    var el = $("#mindTrend");
    if (el && window.ASTRAChart && trend.some(function (v) { return v != null; })) window.ASTRAChart.line(el, {spark: true, values: trend, unit: "", label: "Mood, last 14 days", fmt: function (v) { return String(Math.round(v)); }});
  }

  function renderToday() {
    if (!$("#todayCard") && !$("#mindBox")) return;
    var c = me(), d = A.day(), sig = c.id + ":" + A.key(d);
    if (sig !== UI.sig) { UI.sig = sig; UI.menu = null; }
    renderTodayCard(c, d);
    renderMindBox(c, d);
  }

  function changed() { A.save(); A.bump(); UI.todayHTML = ""; if (A.render) A.render(); else renderToday(); }
  function findRow(uid) { var c = me(), d = A.day(); return list(c, d).find(function (t) { return t.uid === uid; }); }

  function onClick(e) {
    var row = e.target.closest(".task"); if (!row) return;
    var uid = row.dataset.id, c = me(), d = A.day(), t = findRow(uid); if (!t) return;
    var b = e.target.closest("button"); if (!b) return;
    var act = b.classList.contains("tk-check") ? "check" : b.dataset.act || (b.classList.contains("tk-opt") ? "to" : "");
    var ls = t.link && !t.late && !t.incoming ? linkState(t) : null;
    if (act === "open" || (act === "check" && ls)) { if (ls) ls.open(); return; }
    if (act === "check") { if (t.moved) return; var r = rec(c.id, d, true); if (r.done[uid]) delete r.done[uid]; else r.done[uid] = true; changed(); return toast(t.name + (r.done[uid] ? " done" : " not done")); }
    if (act === "undo") { var r2 = rec(c.id, d, true); r2.ch = r2.ch.filter(function (x) { return x.uid !== uid; }); UI.menu = null; return changed(); }
    var g = gates(c, d); if (!g.can || t.locked || t.incoming || t.moved || t.cat === "Rest") return;
    if (act === "delay" && !t.late && load(c, d + 1) + t.dur / 60 <= DAY_LIMIT_H) { rec(c.id, d, true).ch.push({type: "delay", uid: uid, task: snap(t), at: Date.now()}); UI.menu = null; changed(); return toast("Moved to tomorrow"); }
    if (act === "hand") { UI.menu = UI.menu === uid ? null : uid; UI.todayHTML = ""; renderToday(); var first0 = $(".tk-menu .tk-opt:not([disabled])"); if (first0) first0.focus(); return; }
    if (act === "to" && !b.disabled) {
      var o = crewById(b.dataset.to); if (!o || o.id === c.id) return;
      if (load(o, d) + t.dur / 60 > DAY_LIMIT_H || hardDay(o)) return;
      rec(c.id, d, true).ch.push({type: "hand", uid: uid, to: o.id, task: snap(t), at: Date.now()}); UI.menu = null; changed(); return toast("Handed to " + first(o.name));
    }
  }

  window.clearToday = function () { var c = me(), d = A.day(), t = store(c.id), k = A.key(d); if (t[k]) { t[k].ch = []; delete t[k].add; } UI.menu = null; UI.todayHTML = ""; UI.mindHTML = ""; };
  window.ASTRA_TODAY_PAUSE = function (id, d) {
    var c = crewById(id); if (!c) return 0; var r = rec(id, d, true), n = 0, now = Date.now();
    list(c, d).forEach(function (t) { if (t.added || t.locked || t.late || t.incoming || t.moved || t.cat === "Rest") return; r.ch.push({type: "pause", uid: t.uid, task: snap(t), at: now}); n++; });
    UI.menu = null; UI.todayHTML = ""; A.save(); return n;
  };
  window.ASTRA_TODAY_ADD = function (id, d, x) {
    var c = crewById(id); if (!c) return []; rec(id, d, true).add = x; UI.todayHTML = ""; A.save();
    var names = list(c, d).filter(function (t) { return t.added; }).map(function (t) { return t.name; });
    if (FOLLOW[x.id]) names.push(FOLLOW[x.id][0] + " on " + A.dayChip(d + 7));
    return names;
  };
  window.renderToday = renderToday;

  var tc = $("#todayCard");
  if (tc) tc.addEventListener("click", onClick);
  document.addEventListener("click", function (e) { if (UI.menu && !e.target.closest(".tk-menu") && !e.target.closest("[data-act=\"hand\"]")) { UI.menu = null; UI.todayHTML = ""; renderToday(); } });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && UI.menu) { var id = UI.menu; UI.menu = null; UI.todayHTML = ""; renderToday(); var b = document.querySelector(".task[data-id=\"" + id.replace(/"/g, "") + "\"] [data-act=\"hand\"]"); if (b) b.focus(); } });
  renderToday();
})();

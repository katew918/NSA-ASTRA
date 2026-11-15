(function () {
  var cur = null;
  function A() { return window.ASTRA_API || {}; }
  function base() { return A().base(); } function day() { return A().day(); } function key(x) { return A().key(x); } function realFill(x) { return A().realFill(x); }
  function dayChip(x) { return A().dayChip(x); } function setDay(x) { return A().setDay(x); } function me() { return A().me(); } function save() { return A().save(); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function flag(txt, l) { return l === "watch" || l === "urgent" ? '<span class="flag ' + l + '">' + txt + "</span>" : txt; }
  function q(id) { return document.getElementById(id); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function fmtDate(s) { if (!s) return "–"; var d = new Date(String(s).length <= 10 ? s + "T00:00:00Z" : s); if (isNaN(d)) return "–"; return d.getUTCDate() + " " + MON[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function hhmm(t) { var d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function num(v, n) { return typeof v === "number" && isFinite(v) ? (n == null ? String(Math.round(v)) : v.toFixed(n)) : "–"; }
  function ageTxt(h) { if (h == null || !isFinite(h)) return ""; if (h < 1) return "just now"; if (h < 48) return Math.round(h) + " h old"; return Math.round(h / 24) + " days old"; }
  function st() { var P = A().APP; P.dc = P.dc || {k: "sleep", r: "30"}; return P.dc; }
  var WORD = {ok: "In range", watch: "Worth a look", urgent: "Needs attention"};
  var MOOD = ["Very low", "Low", "Okay", "Good", "Great"];

  var MET = {
    sleep: {unit: " h", n: 1, val: function (d) { return d.sleep; }, usual: function (b) { return b.sleep; },
      lvl: function (v, b) { return v < b.sleep - 1.5 ? "watch" : "ok"; },
      band: function (b) { return [b.sleep - 1.5, b.sleep + 1]; }, th: function (b) { return [{v: b.sleep - 1.5, c: "watch", side: "below", label: "amber · below " + num(b.sleep - 1.5, 1) + " h"}]; }, lo: 3, hi: 10},
    hr: {unit: " bpm", n: null, val: function (d) { return d.hr; }, usual: function (b) { return b.hr; },
      lvl: function (v, b) { return v <= 40 || v >= 131 ? "urgent" : v >= 111 || v <= 50 || Math.abs(v - b.hr) >= 20 ? "watch" : "ok"; },
      band: function (b) { return [Math.max(50, b.hr - 20), Math.min(111, b.hr + 20)]; },
      th: function (b) { var a = Math.max(50, b.hr - 20), z = Math.min(111, b.hr + 20); return [{v: a, c: "watch", side: "below", label: "amber · below " + num(a) + " bpm"}, {v: z, c: "watch", side: "above", label: "amber · above " + num(z) + " bpm"}, {v: 40, c: "urgent", side: "below", label: "red · below 40 bpm"}, {v: 131, c: "urgent", side: "above", label: "red · above 130 bpm"}]; }, lo: 40, hi: 100},
    mood: {unit: "", n: null, val: function (d) { return d.mood; }, usual: function (b) { return b.mood; }, txt: function (v) { return MOOD[Math.round(v) - 1] || "–"; },
      lvl: function (v) { return v <= 2 ? "watch" : "ok"; }, band: function (b) { return [Math.max(1, b.mood - 1), Math.min(5, b.mood + 1)]; }, th: function () { return [{v: 2, c: "watch", side: "below", label: "amber · Low (2) or below"}]; }, lo: 1, hi: 5}
  };

  function pmdata(k, r) {
    var m = MET[k], b = base(), c = day(), from = r === "7" ? c - 6 : r === "30" ? c - 29 : Math.min(-30, c), pts = [];
    for (var x = from; x <= c; x++) {
      var SL = A().S.log, dd = (SL[key(x)] && SL[key(x)].daily) || realFill(x);
      if (!dd) continue; var v = m.val(dd); if (typeof v !== "number" || !isFinite(v)) continue;
      pts.push({x: x, v: v, l: m.lvl(v, b), date: dd.date, sim: !!dd.sim, entered: !!dd.entered, day: dayChip(x), usual: m.usual(b)});
    }
    var dates = pts.filter(function (p) { return p.date; }).map(function (p) { return p.date; }).sort();
    var DD = A().D || {}, vol = (DD.crew && DD.crew[me().idx] && DD.crew[me().idx].source) || "";
    return {pts: pts, sel: pts.length - 1, m: m, b: b,
      tag: '<span class="realtag">PMData</span>',
      src: "PMData volunteer " + esc(vol) + (dates.length ? " · " + fmtDate(dates[0]) + " – " + fmtDate(dates[dates.length - 1]) : "") + (k === "mood" ? " · Only you see this" : "")};
  }

  function kpi(lab, val, note, cls) { return '<div class="dc-kpi' + (cls ? " " + cls : "") + '"><span>' + esc(lab) + "</span><b>" + val + "</b>" + (note ? "<small>" + esc(note) + "</small>" : "") + "</div>"; }
  function kpis(a) { return '<div class="dc-kpis">' + a.join("") + "</div>"; }
  function relLab(at, now) { var m = Math.round((now - at) / 60000); return m < 1 ? "now" : "−" + m + " min"; }
  var MISS = {iss: {rate: 0.5, land: 180}, mars: {rate: 1.8, land: 210}};

  function air() {
    var F = window.FEEDS || {}, i = F.iss || {}, snap = ((window.DATA || {}).samples || {}).isslive_snapshot || {}, now = Date.now(), buf = i.buf || {};
    var live = i.co2 != null, co2 = live ? i.co2 : snap.NODE3000003_ppCO2, p = i.p != null ? i.p : snap.USLAB000058_cabin_pressure, t = i.t != null ? i.t : snap.USLAB000059_cabin_temp;
    var sd = String(snap.read || "").slice(0, 10), snapNote = "snapshot read " + sd;
    function age(ts, has) { return has ? ageTxt(F.issAgeH(ts)) : snapNote; }
    var pt = {v: co2, lab: "now", l: co2 > 3 ? "watch" : "ok"};
    function ser(ch, cur, has) {
      var b = has ? (buf[ch] || []) : [], vals = b.map(function (x) { return x.v; }), labs = b.map(function (x) { return relLab(x.at, now); });
      if (!b.length) { vals = [cur, cur]; labs = ["snapshot", "now"]; }
      else { vals.push(b[b.length - 1].v); labs.push("now"); if (labs[0] === "now") labs[0] = "first reading"; }
      return {values: vals, labels: labs};
    }
    var charts = [
      {t: "CO₂ (mmHg)", s: ser("co2", co2, live), name: "CO₂", unit: "mmHg", n: 2, th: [{v: 3, cls: "watch", side: "above", label: "NASA limit 3 mmHg"}]},
      {t: "Pressure (mmHg)", s: ser("p", p, i.p != null), name: "Pressure", unit: "mmHg", n: 1},
      {t: "Temperature (°C)", s: ser("t", t, i.t != null), name: "Temperature", unit: "°C", n: 1}
    ];
    var co2Age = age(i.co2ts, live), pAge = age(i.pts, i.p != null), tAge = age(i.tts, i.t != null);
    var k = [kpi("CO₂ now", flag(num(co2, 2) + " mmHg", pt.l), (pt.l === "watch" ? "above" : "below") + " the 3 mmHg limit · " + co2Age, pt.l === "watch" ? "watch" : ""),
      kpi("O₂ partial pressure", num(snap.NODE3000001_ppO2, 1) + " mmHg", "Node 1 · " + snapNote),
      kpi("Cabin pressure", num(p, 1) + " mmHg", pAge), kpi("Temperature", num(t, 1) + " °C", tAge)];
    var plain = function (lab, a) { return /old$/.test(a) ? lab + " reading is " + a : a === "just now" ? lab + " reading is fresh" : lab + " from the " + snapNote; };
    return {pts: [pt], sel: 0, noRange: true, air: charts, kpi: kpis(k),
      tag: live ? '<span class="realtag">NASA ISS Live</span>' : '<span class="simtag">Snapshot</span>',
      read: "<b>" + flag(num(co2, 2) + " mmHg", pt.l) + " CO₂</b><span>Pressure " + num(p, 1) + " mmHg · " + num(t, 1) + " °C</span>",
      src: (live ? "NASA ISS Live · " : "NASA ISS Live snapshot read " + esc(sd) + " · ") + [plain("CO₂", co2Age), plain("Pressure", pAge), plain("Temperature", tAge)].join(" · "),
      rows: [["now", "–", num(co2, 2) + " mmHg", "below 3 mmHg", WORD[pt.l], pt.l]]};
  }

  function rad() {
    var F = window.FEEDS || {}, D = window.DATA || {}, live = F.pfu && F.pfu.state === "live" && F.pfu.series.length;
    var raw = live ? F.pfu.series : (D.protons || []).map(function (x) { return {t: x.t, v: x.flux}; });
    var pts = raw.map(function (x) { return {v: x.v, lab: hhmm(x.t), l: x.v >= 10 ? "watch" : "ok", date: x.t}; });
    var m = (F.rad && F.rad.modules && F.rad.modules.length ? F.rad.modules : ((D.samples || {}).radlab || {}).modules) || [];
    var fv = function (v) { return typeof v !== "number" ? "–" : v < 1 ? v.toFixed(2) : v.toFixed(1); };
    var last = pts[pts.length - 1], t24 = last ? new Date(last.date).getTime() - 864e5 : 0, pk = null;
    pts.forEach(function (p) { if (new Date(p.date).getTime() >= t24 && (!pk || p.v > pk.v)) pk = p; });
    var S = A().S || {}, ms = MISS[S.mission] || MISS.iss, d = day(), dose = 120 + Math.max(0, Math.min(d, ms.land)) * ms.rate, pct = dose / 600 * 100;
    var k = [kpi("Proton flux now", flag(fv(last && last.v) + " pfu", last && last.l), last ? new Date(last.date).toUTCString().slice(5, 22) + " UTC" : "", last && last.l === "watch" ? "watch" : ""),
      kpi("24 h peak", fv(pk && pk.v) + " pfu", pk ? new Date(pk.date).toUTCString().slice(5, 22) + " UTC" : "", pk && pk.v >= 10 ? "watch" : ""),
      kpi("Alert threshold", "10 pfu", "≥10 MeV protons"),
      kpi("Mission dose so far", num(dose) + " mSv", "Simulated · " + num(pct, 1) + "% of the 600 mSv limit", pct > 80 ? "watch" : "")];
    return {pts: pts, sel: pts.length - 1, log: true, noRange: true, unit: " pfu", modules: m, kpi: kpis(k),
      tag: '<span class="realtag">NOAA SWPC GOES</span>',
      src: live ? "NOAA SWPC GOES · ≥10 MeV protons, last 24 h · fetched " + hhmm(F.pfu.at) : "NOAA SWPC GOES bundled sample · hourly ≥10 MeV protons" + (pts.length ? " · " + fmtDate(pts[0].date) + " – " + fmtDate(last.date) : ""),
      readOf: function (p) { return "<b>" + flag(fv(p.v) + " pfu", p.l) + "</b><span>" + esc(new Date(p.date).toUTCString().slice(5, 22)) + " UTC</span>"; }};
  }

  var EV = {CME: "CME", FLR: "Solar flare", GST: "Geomagnetic storm", RBE: "Radiation belt enhancement", SEP: "Solar energetic particles", IPS: "Interplanetary shock", MPC: "Magnetopause crossing", HSS: "High speed stream", Report: "Weekly report"};
  function weather() {
    var F = window.FEEDS || {}, w = F.donki || {}, items = w.items || [], days = [], now = Date.now();
    for (var k = 29; k >= 0; k--) { var d = new Date(now - k * 864e5).toISOString().slice(0, 10); days.push({d: d, v: 0}); }
    items.forEach(function (i) { var d = String(i.time || "").slice(0, 10); days.forEach(function (x) { if (x.d === d) x.v++; }); });
    var pts = days.map(function (x) { return {v: x.v, lab: fmtDate(x.d).slice(0, -5), date: x.d, l: "ok"}; });
    var pos = F.pos && F.pos.state === "live" ? " · Station now " + num(F.pos.lat, 1) + "°, " + num(F.pos.lon, 1) + "°, " + Math.round(F.pos.alt) + " km (wheretheiss.at)" : "";
    var tm = function (i) { var x = new Date(String(i.time || "").replace(/Z?$/, "Z")).getTime(); return isNaN(x) ? 0 : x; };
    var smp = w.state !== "live" && w.counts, cnt = {};
    var n7 = items.filter(function (i) { return now - tm(i) <= 7 * 864e5; }).length, n30 = 0;
    if (smp) Object.keys(w.counts).forEach(function (c) { cnt[c] = w.counts[c]; });
    else items.forEach(function (i) { if (now - tm(i) <= 30 * 864e5) cnt[i.type] = (cnt[i.type] || 0) + 1; });
    Object.keys(cnt).forEach(function (c) { n30 += cnt[c]; });
    var kk = [kpi("Last 7 days", String(n7), n7 === 1 ? "event" : "events"), kpi("Last 30 days", String(n30), n30 === 1 ? "event" : "events")].concat(Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (c) { return kpi(EV[c] || c, String(cnt[c]), "in 30 days"); }));
    var rec = items.slice().sort(function (a, b) { return tm(b) - tm(a); }).slice(0, 6);
    var list = rec.length ? '<div class="dc-list">' + rec.map(function (i) {
      var t = tm(i), u = /^https:\/\//.test(i.url || "") ? '<a href="' + esc(i.url) + '" target="_blank" rel="noopener">Open</a>' : "";
      return '<div class="dc-li"><time datetime="' + esc(i.time) + '">' + (t ? fmtDate(new Date(t).toISOString()) + " " + new Date(t).toISOString().slice(11, 16) + " UTC" : "–") + "</time><b>" + esc(EV[i.type] || i.type || "Event") + "</b><span>" + u + "</span></div>";
    }).join("") + "</div>" : "";
    return {pts: pts, sel: pts.length - 1, bars: true, noRange: true, kpi: kpis(kk) + list,
      tag: '<span class="realtag">NASA DONKI</span>',
      src: (w.state === "live" ? "NASA DONKI notifications · fetched " + hhmm(w.at) : "NASA DONKI bundled sample · " + esc(w.window || "")) + pos,
      readOf: function (p) { return "<b>" + p.v + " event" + (p.v === 1 ? "" : "s") + "</b><span>" + fmtDate(p.date) + "</span>"; }};
  }

  function pmKpis(o) {
    var m = o.m, P = o.pts, k = st().k; if (!P.length) return "";
    var f = function (v) { return m.txt ? m.txt(v) : num(v, m.n) + m.unit; }, lo = P[0], hi = P[0], sum = 0, am = 0, un = 0;
    P.forEach(function (p) { if (p.v < lo.v) lo = p; if (p.v > hi.v) hi = p; sum += p.v; if (p.l !== "ok") am++; if (p.v < p.usual) un++; });
    var avg = sum / P.length, L = P[P.length - 1];
    var a = [kpi("Latest", flag(esc(f(L.v)), L.l), L.day, L.l !== "ok" ? L.l : ""),
      kpi("Average", esc(m.txt ? num(avg, 1) : num(avg, m.n === 1 ? 1 : 0) + m.unit), (m.txt ? m.txt(avg) + " · " : "") + P.length + " days"),
      kpi("Lowest", esc(f(lo.v)), lo.day), kpi("Highest", esc(f(hi.v)), hi.day),
      kpi("Days in amber", String(am), "of " + P.length, am > 0 ? "watch" : "")];
    if (k === "sleep") a.push(kpi("Nights under usual", String(un), "usual " + num(L.usual, 1) + " h"));
    return kpis(a);
  }

  function extraEl() {
    var c = q("dcChart"), e = q("dcExtra");
    if (!e && c) { e = document.createElement("div"); e.id = "dcExtra"; c.parentNode.insertBefore(e, c.nextSibling); }
    return e;
  }

  function drawExtra(o, C) {
    var e = extraEl(); if (!e) return;
    var h = "";
    if (o.air) h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">' + o.air.map(function (c, j) { return '<div><div class="dc-src">' + esc(c.t) + '</div><div id="dcAir' + j + '"></div></div>'; }).join("") + "</div>";
    if (o.modules && o.modules.length) h += '<div style="margin-top:16px"><div class="dc-src">Dose rate by ISS module · 5 Dec 2019 sample</div><div id="dcMods"></div></div>';
    e.innerHTML = h + (o.kpi || "");
    if (!C) return;
    if (o.air) o.air.forEach(function (c, j) {
      C.line(q("dcAir" + j), {values: c.s.values, labels: c.s.labels, name: c.name, label: c.t, unit: c.unit, height: 170, thresholds: c.th || [],
        xTicks: [0, c.s.values.length - 1], fmt: function (v) { return num(v, c.n); }, tickFmt: function (v) { return String(Math.round(v * 100) / 100); }});
    });
    if (o.modules && o.modules.length) C.hbars(q("dcMods"), {items: o.modules.map(function (x) { return {label: x.module, sub: x.instrument, value: x.mean_uGy_h}; }), unit: "µGy/h", name: "Dose rate", label: "Mean dose rate by ISS module, 5 Dec 2019", fmt: function (v) { return num(v, 1); }});
  }

  function readPm(o, p) { var m = o.m; if (!p) return ""; var val = m.txt ? m.txt(p.v) : num(p.v, m.n) + m.unit;
    return "<b>" + flag(esc(val), p.l) + "</b><span>" + (p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date)) + " · " + esc(p.day) + " · usual " + esc(m.txt ? m.txt(p.usual) : num(p.usual, m.n) + m.unit) + "</span>"; }

  function readOut(i) {
    var o = cur; if (!o) return;
    var p = o.pts[i >= 0 ? i : o.sel];
    q("dcRead").innerHTML = o.read || (o.m ? readPm(o, p) : o.readOf && p ? o.readOf(p) : "");
  }

  function chartEl() {
    var c = q("dcChart");
    if (c && c.tagName.toLowerCase() !== "div") {
      var d = document.createElement("div");
      d.id = "dcChart"; d.className = "dc-chart";
      c.parentNode.replaceChild(d, c); c = d;
    }
    return c;
  }

  function pickAt(i) {
    var o = cur; if (!o || !o.pts[i]) return;
    if (o.m) { setDay(o.pts[i].x); return; }
    o.sel = i; draw();
  }

  function draw() {
    var o = cur; if (!o) return;
    var el = chartEl(), C = window.ASTRAChart, pts = o.pts;
    if (!el) return;
    readOut(-1);
    if (o.m && !o.kpi) o.kpi = pmKpis(o);
    el.hidden = !!o.air;
    drawExtra(o, C);
    if (!C) { el.innerHTML = '<div class="ch-empty">Chart unavailable</div>'; return; }
    var vals = pts.map(function (p) { return p.v; }), flags = pts.map(function (p) { return p.l; }), labs = pts.map(function (p) { return p.lab || p.day; });
    var common = {values: vals, labels: labs, flags: flags, selected: o.sel, onHover: readOut, onPick: pickAt};
    if (o.air) { el.innerHTML = ""; return; }
    if (o.m) {
      var m = o.m, b = o.b, names = {sleep: "Sleep", hr: "Resting heart rate", mood: "Mood"};
      common.name = names[st().k] || "Value";
      common.label = common.name;
      common.unit = m.unit.trim();
      common.band = m.band(b); common.bandLabel = "usual " + (m.txt ? m.txt(m.usual(b)) : num(m.usual(b), m.n === 1 ? 1 : null) + m.unit);
      common.yMin = st().k === "mood" ? null : 0; if (st().k === "mood") { common.yInclude = [1, 5]; common.integer = true; common.tickFmt = m.txt; }
      common.thresholds = m.th(b).map(function (t) { return {v: t.v, cls: t.c, side: t.side, label: t.label}; });
      common.fmt = m.txt ? function (v) { return m.txt(v); } : function (v) { return num(v, m.n); };
      if (m.txt) common.unit = "";
      common.tipX = function (i) { var p = pts[i]; return (p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date)) + " · " + p.day; };
      common.tipNote = function (i) { var p = pts[i]; return "usual " + (m.txt ? m.txt(p.usual) : num(p.usual, m.n) + m.unit) + " · " + WORD[p.l]; };
      C.line(el, common);
      return;
    }
    if (o.log) {
      common.name = "Protons ≥10 MeV"; common.label = "Proton flux"; common.unit = "pfu"; common.yLog = true;
      common.thresholds = [{v: 10, cls: "watch", side: "above", label: "amber · above 10 pfu"}];
      common.fmt = function (v) { return v < 1 ? v.toFixed(2) : v.toFixed(1); };
      common.tipX = function (i) { return new Date(pts[i].date).toUTCString().slice(5, 22) + " UTC"; };
      common.xTicks = pts.map(function (p, i) { var d = new Date(p.date); return d.getMinutes() === 0 && d.getHours() % 6 === 0 ? i : -1; }).filter(function (i) { return i >= 0; });
      C.line(el, common);
      return;
    }
    common.name = "Events"; common.label = "Space weather notifications per day"; common.integer = true;
    common.tipX = function (i) { return fmtDate(pts[i].date); };
    C.bars(el, common);
  }

  function table() {
    var o = cur, box = q("dcTableBox"); if (!o || box.hidden) return;
    var rows = o.rows || o.pts.map(function (p) {
      if (o.m) return [p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date), p.day, o.m.txt ? o.m.txt(p.v) : num(p.v, o.m.n) + o.m.unit, o.m.txt ? o.m.txt(p.usual) : num(p.usual, o.m.n) + o.m.unit, WORD[p.l], p.l];
      return [p.date ? fmtDate(p.date) : p.lab, "–", o.readOf ? o.readOf(p).replace(/<[^>]+>/g, " ").trim().split("  ")[0] : String(p.v), "–", WORD[p.l] || "–", p.l];
    });
    box.innerHTML = "<table><thead><tr><th>Date recorded</th><th>Mission day</th><th>Value</th><th>Usual</th><th>Status</th></tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.slice(0, 5).map(function (c, i) { return "<td>" + (i === 2 ? flag(esc(c), r[5]) : esc(c)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  window.renderData = function () {
    if (!q("dataCard") || !window.ASTRA_API || !A().APP) return;
    var s = st(), k = s.k, r = s.r;
    if (MET[k]) cur = pmdata(k, r);
    else cur = k === "air" ? air() : k === "rad" ? rad() : weather();
    document.querySelectorAll("#dataCard .dc-tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.k === k)); });
    document.querySelectorAll("#dataCard .dc-rg").forEach(function (t) { t.setAttribute("aria-pressed", String(t.dataset.r === r)); });
    q("dcRange").hidden = !!cur.noRange;
    q("dcTag").innerHTML = cur.tag || ""; q("dcSrc").innerHTML = cur.src || "";
    draw(); table();
  };

  function wire() {
    var card = q("dataCard"); if (!card) return;
    card.addEventListener("click", function (e) {
      var t = e.target.closest(".dc-tab"); if (t) { st().k = t.dataset.k; save(); window.renderData(); return; }
      var g = e.target.closest(".dc-rg"); if (g) { st().r = g.dataset.r; save(); window.renderData(); return; }
      if (e.target.closest("#dcTable")) { var b = q("dcTableBox"); b.hidden = !b.hidden; q("dcTable").textContent = b.hidden ? "Show the numbers" : "Hide the numbers"; table(); return; }
    });
    chartEl();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { wire(); window.renderData(); }); else { wire(); window.renderData(); }
})();

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
      band: function (b) { return [b.sleep - 1.5, b.sleep + 1]; }, th: function (b) { return [{v: b.sleep - 1.5, c: "watch"}]; }, lo: 3, hi: 10},
    hr: {unit: " bpm", n: null, val: function (d) { return d.hr; }, usual: function (b) { return b.hr; },
      lvl: function (v, b) { return v <= 40 || v >= 131 ? "urgent" : v >= 111 || v <= 50 || Math.abs(v - b.hr) >= 20 ? "watch" : "ok"; },
      band: function (b) { return [Math.max(51, b.hr - 20), Math.min(110, b.hr + 20)]; },
      th: function (b) { return [{v: Math.max(51, b.hr - 20), c: "watch"}, {v: Math.min(110, b.hr + 20), c: "watch"}, {v: 50, c: "urgent"}]; }, lo: 40, hi: 100},
    mood: {unit: "", n: null, val: function (d) { return d.mood; }, usual: function (b) { return b.mood; }, txt: function (v) { return MOOD[Math.round(v) - 1] || "–"; },
      lvl: function (v) { return v <= 2 ? "watch" : "ok"; }, band: function (b) { return [Math.max(1, b.mood - 1), Math.min(5, b.mood + 1)]; }, th: function () { return [{v: 2, c: "watch"}]; }, lo: 1, hi: 5}
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
      tag: '<span class="realtag">Real data · PMData</span>',
      src: "PMData volunteer " + esc(vol) + (dates.length ? " · " + fmtDate(dates[0]) + " – " + fmtDate(dates[dates.length - 1]) : "") + (k === "mood" ? " · Only you see this" : "")};
  }

  function air() {
    var F = window.FEEDS || {}, i = F.iss || {}, snap = ((window.DATA || {}).samples || {}).isslive_snapshot || {};
    var live = i.co2 != null, co2 = live ? i.co2 : snap.NODE3000003_ppCO2, p = live ? i.p : snap.USLAB000058_cabin_pressure, t = live ? i.t : snap.USLAB000059_cabin_temp;
    var age = live ? ageTxt(F.issAgeH(i.co2ts)) : "";
    var pt = {v: co2, lab: "now", l: co2 > 3 ? "watch" : "ok"};
    var items = live ? [{label: "Node 3", value: co2, cls: co2 > 3 ? "watch" : ""}] : [["Node 3", snap.NODE3000003_ppCO2], ["US Lab", snap.USLAB000055_ppCO2]].filter(function (x) { return typeof x[1] === "number"; }).map(function (x) { return {label: x[0], value: x[1], cls: x[1] > 3 ? "watch" : ""}; });
    return {pts: [pt], sel: 0, noRange: true, hbars: {items: items, unit: "mmHg", name: "CO₂", max: 4, label: "Cabin CO₂ partial pressure", threshold: {v: 3, cls: "watch", label: "NASA limit 3 mmHg"}, fmt: function (v) { return num(v, 2); }},
      tag: live ? '<span class="realtag">Live · NASA ISS Live</span>' : '<span class="simtag">Snapshot</span>',
      read: "<b>" + flag(num(co2, 2) + " mmHg", pt.l) + " CO₂</b><span>Pressure " + num(p, 1) + " mmHg · " + num(t, 1) + " °C</span>",
      src: live ? "NASA ISS Live · CO₂ " + age + (i.pts != null ? " · pressure " + ageTxt(F.issAgeH(i.pts)) : "") + (i.tts != null ? " · temperature " + ageTxt(F.issAgeH(i.tts)) : "") : "NASA ISS Live snapshot read " + esc(String(snap.read || "").slice(0, 10)),
      rows: [["now", "–", num(co2, 2) + " mmHg", "below 3 mmHg", WORD[pt.l], pt.l]]};
  }

  function rad() {
    var F = window.FEEDS || {};
    if (F.pfu && F.pfu.state === "live" && F.pfu.series.length) {
      var pts = F.pfu.series.map(function (x) { return {v: x.v, lab: hhmm(x.t), l: x.v >= 10 ? "watch" : "ok", date: x.t}; });
      return {pts: pts, sel: pts.length - 1, log: true, noRange: true, tag: '<span class="realtag">Live · NOAA SWPC GOES</span>', unit: " pfu",
        src: "NOAA SWPC GOES · ≥10 MeV protons, last 24 h · fetched " + hhmm(F.pfu.at),
        readOf: function (p) { return "<b>" + flag((p.v < 1 ? p.v.toFixed(2) : p.v.toFixed(1)) + " pfu", p.l) + "</b><span>" + esc(new Date(p.date).toUTCString().slice(5, 22)) + " UTC</span>"; }};
    }
    var m = (F.rad && F.rad.modules) || (((window.DATA || {}).samples || {}).radlab || {}).modules || [];
    var bp = m.map(function (x) { return {v: x.mean_uGy_h, lab: x.module, l: "ok", inst: x.instrument}; });
    return {pts: bp, sel: 0, noRange: true, hbars: {items: bp.map(function (p) { return {label: p.lab, sub: p.inst, value: p.v}; }), unit: "µGy/h", name: "Dose rate", label: "Mean dose rate by ISS module", fmt: function (v) { return num(v, 1); }}, tag: '<span class="simtag">Sample · NASA OSDR RadLab, 5 Dec 2019</span>',
      src: "NASA OSDR RadLab · mean dose rate per module, 5 Dec 2019 00:00–06:00 UTC",
      readOf: function (p) { return "<b>" + num(p.v, 1) + " µGy/h</b><span>" + esc(p.lab) + " · " + esc(p.inst || "") + "</span>"; }};
  }

  function weather() {
    var F = window.FEEDS || {}, w = F.donki || {}, items = w.items || [], days = [], now = Date.now();
    for (var k = 29; k >= 0; k--) { var d = new Date(now - k * 864e5).toISOString().slice(0, 10); days.push({d: d, v: 0}); }
    items.forEach(function (i) { var d = String(i.time || "").slice(0, 10); days.forEach(function (x) { if (x.d === d) x.v++; }); });
    var pts = days.map(function (x) { return {v: x.v, lab: fmtDate(x.d).slice(0, -5), date: x.d, l: "ok"}; });
    var pos = F.pos && F.pos.state === "live" ? " · Station now " + num(F.pos.lat, 1) + "°, " + num(F.pos.lon, 1) + "°, " + Math.round(F.pos.alt) + " km (wheretheiss.at)" : "";
    return {pts: pts, sel: pts.length - 1, bars: true, noRange: true,
      tag: w.state === "live" ? '<span class="realtag">Live · NASA DONKI</span>' : '<span class="simtag">Sample · NASA DONKI</span>',
      src: (w.state === "live" ? "NASA DONKI notifications · fetched " + hhmm(w.at) : "NASA DONKI bundled sample · " + esc(w.window || "")) + pos,
      readOf: function (p) { return "<b>" + p.v + " event" + (p.v === 1 ? "" : "s") + "</b><span>" + fmtDate(p.date) + "</span>"; }};
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
    if (!C) { el.innerHTML = '<div class="ch-empty">Chart unavailable</div>'; return; }
    var vals = pts.map(function (p) { return p.v; }), flags = pts.map(function (p) { return p.l; }), labs = pts.map(function (p) { return p.lab || p.day; });
    var common = {values: vals, labels: labs, flags: flags, selected: o.sel, onHover: readOut, onPick: pickAt};
    if (o.hbars) { var h = o.hbars; h.onHover = readOut; C.hbars(el, h); return; }
    if (o.m) {
      var m = o.m, b = o.b, names = {sleep: "Sleep", hr: "Resting heart rate", mood: "Mood"};
      common.name = names[st().k] || "Value";
      common.label = common.name;
      common.unit = m.unit.trim();
      common.band = m.band(b); common.bandLabel = "usual";
      common.yMin = st().k === "mood" ? 1 : 0; if (st().k === "mood") { common.yMax = 5; common.yInclude = [1, 5]; common.integer = true; common.tickFmt = m.txt; }
      common.thresholds = m.th(b).map(function (t) { return {v: t.v, cls: t.c, label: t.c === "urgent" ? "red" : "amber"}; });
      common.fmt = m.txt ? function (v) { return m.txt(v); } : function (v) { return num(v, m.n); };
      if (m.txt) common.unit = "";
      common.tipX = function (i) { var p = pts[i]; return (p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date)) + " · " + p.day; };
      common.tipNote = function (i) { var p = pts[i]; return "usual " + (m.txt ? m.txt(p.usual) : num(p.usual, m.n) + m.unit) + " · " + WORD[p.l]; };
      C.line(el, common);
      return;
    }
    if (o.log) {
      common.name = "Protons ≥10 MeV"; common.label = "Proton flux, last 24 h"; common.unit = "pfu"; common.yLog = true;
      common.thresholds = [{v: 10, cls: "watch", label: "10 pfu"}];
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

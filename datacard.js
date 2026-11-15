(function () {
  var W = 800, H = 260, PL = 48, PR = 14, PT = 14, PB = 28;
  var cur = null;
  function A() { return window.ASTRA_API || {}; }
  function base() { return A().base(); } function day() { return A().day(); } function key(x) { return A().key(x); } function realFill(x) { return A().realFill(x); }
  function dayChip(x) { return A().dayChip(x); } function setDay(x) { return A().setDay(x); } function me() { return A().me(); } function save() { return A().save(); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

  function chartLine(o, opt) {
    var pts = o.pts, vs = pts.map(function (p) { return p.v; });
    var lo = Math.min.apply(null, vs.concat([opt.lo])), hi = Math.max.apply(null, vs.concat([opt.hi]));
    (opt.extra || []).forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); });
    if (opt.log) { lo = Math.log10(Math.max(1e-3, lo)); hi = Math.log10(Math.max(1e-2, hi)); }
    var pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
    var tv = function (v) { return opt.log ? Math.log10(Math.max(1e-3, v)) : v; };
    var Y = function (v) { return PT + (hi - tv(v)) / (hi - lo) * (H - PT - PB); };
    var n = pts.length, X = function (i) { return n <= 1 ? (PL + W - PR) / 2 : PL + i / (n - 1) * (W - PL - PR); };
    var s = "";
    if (opt.band) { var y1 = Y(opt.band[1]), y2 = Y(opt.band[0]); s += '<rect class="dc-band" x="' + PL + '" y="' + y1.toFixed(1) + '" width="' + (W - PL - PR) + '" height="' + Math.max(0, y2 - y1).toFixed(1) + '"/>'; }
    (opt.th || []).forEach(function (t) { var y = Y(t.v).toFixed(1); s += '<line class="dc-th ' + t.c + '" x1="' + PL + '" x2="' + (W - PR) + '" y1="' + y + '" y2="' + y + '"/>'; });
    for (var k = 0; k < 4; k++) { var v = lo + (hi - lo) * (k + 0.5) / 4, real = opt.log ? Math.pow(10, v) : v;
      s += '<text class="dc-ax" x="' + (PL - 6) + '" y="' + (Y(real) + 4).toFixed(1) + '" text-anchor="end">' + (opt.fmtY ? opt.fmtY(real) : num(real, Math.abs(hi - lo) < 10 ? 1 : null)) + "</text>"; }
    if (n) { s += '<text class="dc-ax" x="' + X(0).toFixed(1) + '" y="' + (H - 8) + '">' + esc(pts[0].lab || pts[0].day) + "</text>";
      s += '<text class="dc-ax" x="' + X(n - 1).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="end">' + esc(pts[n - 1].lab || pts[n - 1].day) + "</text>"; }
    if (n > 1) s += '<polyline class="dc-line" fill="none" points="' + pts.map(function (p, i) { return X(i).toFixed(1) + "," + Y(p.v).toFixed(1); }).join(" ") + '"/>';
    var sel = o.sel;
    if (sel >= 0 && sel < n) s += '<line class="dc-cursor" x1="' + X(sel).toFixed(1) + '" x2="' + X(sel).toFixed(1) + '" y1="' + PT + '" y2="' + (H - PB) + '"/>';
    if (!opt.noPts) pts.forEach(function (p, i) { s += '<circle class="dc-pt' + (p.l && p.l !== "ok" ? " " + p.l : "") + (i === sel ? " on" : "") + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(p.v).toFixed(1) + '" r="' + (i === sel ? 6 : 4) + '"/>'; });
    else if (sel >= 0 && sel < n) s += '<circle class="dc-pt on" cx="' + X(sel).toFixed(1) + '" cy="' + Y(pts[sel].v).toFixed(1) + '" r="5"/>';
    return s;
  }

  function chartBars(o, opt) {
    var pts = o.pts, n = pts.length, hi = Math.max.apply(null, pts.map(function (p) { return p.v; }).concat([opt.hi || 1])) * 1.1;
    var bw = (W - PL - PR) / Math.max(1, n), Y = function (v) { return PT + (hi - v) / hi * (H - PT - PB); }, s = "";
    for (var k = 0; k < 4; k++) { var v = hi * k / 3; s += '<text class="dc-ax" x="' + (PL - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + num(v, hi < 10 ? 1 : null) + "</text>"; }
    pts.forEach(function (p, i) { var y = Y(p.v); s += '<rect class="dc-bar' + (p.l && p.l !== "ok" ? " " + p.l : "") + (i === o.sel ? " on" : "") + '" x="' + (PL + i * bw + bw * 0.15).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + Math.max(0, H - PB - y).toFixed(1) + '"/>'; });
    if (n) { s += '<text class="dc-ax" x="' + PL + '" y="' + (H - 8) + '">' + esc(pts[0].lab) + "</text>"; s += '<text class="dc-ax" x="' + (W - PR) + '" y="' + (H - 8) + '" text-anchor="end">' + esc(pts[n - 1].lab) + "</text>"; }
    if (o.sel >= 0 && o.sel < n) { var cx = (PL + o.sel * bw + bw / 2).toFixed(1); s += '<line class="dc-cursor" x1="' + cx + '" x2="' + cx + '" y1="' + PT + '" y2="' + (H - PB) + '"/>'; }
    return s;
  }

  function air() {
    var F = window.FEEDS || {}, i = F.iss || {}, snap = ((window.DATA || {}).samples || {}).isslive_snapshot || {};
    var live = i.co2 != null, co2 = live ? i.co2 : snap.NODE3000003_ppCO2, p = live ? i.p : snap.USLAB000058_cabin_pressure, t = live ? i.t : snap.USLAB000059_cabin_temp;
    var age = live ? ageTxt(F.issAgeH(i.co2ts)) : "";
    var hi = 4, X = function (v) { return PL + Math.min(v, hi) / hi * (W - PL - PR); }, y = 90, h = 60;
    var s = '<rect class="dc-bar' + (co2 > 3 ? " watch" : "") + '" x="' + PL + '" y="' + y + '" width="' + (X(co2 || 0) - PL).toFixed(1) + '" height="' + h + '"/>';
    s += '<line class="dc-th watch" x1="' + X(3).toFixed(1) + '" x2="' + X(3).toFixed(1) + '" y1="' + (y - 30) + '" y2="' + (y + h + 30) + '"/>';
    [0, 1, 2, 3, 4].forEach(function (v) { s += '<text class="dc-ax" x="' + X(v).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + v + "</text>"; });
    s += '<text class="dc-ax" x="' + (X(3) + 6).toFixed(1) + '" y="' + (y - 14) + '">NASA limit 3 mmHg</text>';
    var pt = {v: co2, lab: "now", l: co2 > 3 ? "watch" : "ok"};
    return {pts: [pt], sel: 0, svg: s, noRange: true,
      tag: live ? '<span class="realtag">Live · NASA ISS Live</span>' : '<span class="simtag">Snapshot</span>',
      read: "<b>" + num(co2, 2) + " mmHg CO₂</b><span>Pressure " + num(p, 1) + " mmHg · " + num(t, 1) + " °C</span>",
      src: live ? "NASA ISS Live · CO₂ " + age + (i.pts != null ? " · pressure " + ageTxt(F.issAgeH(i.pts)) : "") + (i.tts != null ? " · temperature " + ageTxt(F.issAgeH(i.tts)) : "") : "NASA ISS Live snapshot read " + esc(String(snap.read || "").slice(0, 10)) + " (feed down)",
      rows: [["now", "–", num(co2, 2) + " mmHg", "below 3 mmHg", WORD[pt.l]]]};
  }

  function rad() {
    var F = window.FEEDS || {};
    if (F.pfu && F.pfu.state === "live" && F.pfu.series.length) {
      var pts = F.pfu.series.map(function (x) { return {v: x.v, lab: hhmm(x.t), l: x.v >= 10 ? "watch" : "ok", date: x.t}; });
      return {pts: pts, sel: pts.length - 1, log: true, noRange: true, tag: '<span class="realtag">Live · NOAA SWPC GOES</span>', unit: " pfu",
        src: "NOAA SWPC GOES · ≥10 MeV protons, last 24 h · fetched " + hhmm(F.pfu.at) + " · S1 storm at 10 pfu",
        readOf: function (p) { return "<b>" + (p.v < 1 ? p.v.toFixed(2) : p.v.toFixed(1)) + " pfu</b><span>" + esc(new Date(p.date).toUTCString().slice(5, 22)) + " UTC · storm level 10 pfu</span>"; }};
    }
    var m = (F.rad && F.rad.modules) || (((window.DATA || {}).samples || {}).radlab || {}).modules || [];
    var bp = m.map(function (x) { return {v: x.mean_uGy_h, lab: x.module, l: "ok", inst: x.instrument}; });
    return {pts: bp, sel: 0, bars: true, noRange: true, tag: '<span class="simtag">Sample · NASA OSDR RadLab, 5 Dec 2019</span>',
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
    return "<b>" + esc(val) + "</b><span>" + (p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date)) + " · " + esc(p.day) + " · usual " + esc(m.txt ? m.txt(p.usual) : num(p.usual, m.n) + m.unit) + "</span>"; }

  function draw() {
    var o = cur; if (!o) return;
    var svg = o.svg || (o.bars ? chartBars(o, {}) : chartLine(o, o.opt || {log: o.log, lo: Math.min.apply(null, o.pts.map(function (p) { return p.v; })), hi: Math.max.apply(null, o.pts.map(function (p) { return p.v; })), extra: o.log ? [10] : [], th: o.log ? [{v: 10, c: "watch"}] : [], noPts: o.log, fmtY: o.log ? function (v) { return v < 1 ? v.toFixed(2) : num(v, v < 10 ? 1 : null); } : null}));
    q("dcChart").innerHTML = svg;
    var p = o.pts[o.sel];
    q("dcRead").innerHTML = o.read || (o.m ? readPm(o, p) : o.readOf && p ? o.readOf(p) : "");
  }

  function table() {
    var o = cur, box = q("dcTableBox"); if (!o || box.hidden) return;
    var rows = o.rows || o.pts.map(function (p) {
      if (o.m) return [p.sim ? "Simulated" : p.entered ? "Entered" : fmtDate(p.date), p.day, o.m.txt ? o.m.txt(p.v) : num(p.v, o.m.n) + o.m.unit, o.m.txt ? o.m.txt(p.usual) : num(p.usual, o.m.n) + o.m.unit, WORD[p.l]];
      return [p.date ? fmtDate(p.date) : p.lab, "–", o.readOf ? o.readOf(p).replace(/<[^>]+>/g, " ").trim().split("  ")[0] : String(p.v), "–", WORD[p.l] || "–"];
    });
    box.innerHTML = "<table><thead><tr><th>Date recorded</th><th>Mission day</th><th>Value</th><th>Usual</th><th>Status</th></tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  window.renderData = function () {
    if (!q("dataCard") || !window.ASTRA_API || !A().APP) return;
    var s = st(), k = s.k, r = s.r;
    if (MET[k]) { cur = pmdata(k, r); var b = cur.b, m = cur.m; cur.opt = {band: m.band(b), th: m.th(b), lo: m.lo, hi: m.hi}; }
    else cur = k === "air" ? air() : k === "rad" ? rad() : weather();
    document.querySelectorAll("#dataCard .dc-tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.dataset.k === k)); });
    document.querySelectorAll("#dataCard .dc-rg").forEach(function (t) { t.setAttribute("aria-pressed", String(t.dataset.r === r)); });
    q("dcRange").hidden = !!cur.noRange;
    q("dcTag").innerHTML = cur.tag || ""; q("dcSrc").innerHTML = cur.src || "";
    draw(); table();
  };

  function pick(e, commit) {
    var o = cur; if (!o || !o.pts.length || o.svg) return;
    var r = q("dcChart").getBoundingClientRect(), fx = (e.clientX - r.left) / r.width * W, n = o.pts.length, i;
    if (o.bars) i = Math.floor((fx - PL) / ((W - PL - PR) / n)); else i = n <= 1 ? 0 : Math.round((fx - PL) / (W - PL - PR) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    if (commit && o.m) { setDay(o.pts[i].x); return; }
    if (i !== o.sel) { o.sel = i; draw(); }
  }

  function wire() {
    var card = q("dataCard"); if (!card) return;
    card.addEventListener("click", function (e) {
      var t = e.target.closest(".dc-tab"); if (t) { st().k = t.dataset.k; save(); window.renderData(); return; }
      var g = e.target.closest(".dc-rg"); if (g) { st().r = g.dataset.r; save(); window.renderData(); return; }
      if (e.target.closest("#dcTable")) { var b = q("dcTableBox"); b.hidden = !b.hidden; q("dcTable").textContent = b.hidden ? "Show the numbers" : "Hide the numbers"; table(); return; }
    });
    q("dcChart").addEventListener("pointermove", function (e) { pick(e, false); });
    q("dcChart").addEventListener("click", function (e) { pick(e, true); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { wire(); window.renderData(); }); else { wire(); window.renderData(); }
})();

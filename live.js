(function () {
  var timer = null, st = null;
  var WORDS = {ok: "In range", watch: "Amber · worth a look", urgent: "Red · needs attention"};
  function evVal(v) { var r = Math.round(v - st.rest); return (r >= 0 ? "+" : "") + r + " bpm"; }
  function flag(txt, l) { return l === "watch" || l === "urgent" ? '<span class="flag ' + l + '">' + txt + "</span>" : txt; }
  var RECS = [{id: "baseline", label: "Resting → standing (record 1)"}, {id: "today", label: "Resting → standing (record 2)"}];

  function D() { return window.DATA || {}; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function median(a) { a = a.filter(function (x) { return typeof x === "number" && !isNaN(x); }).sort(function (x, y) { return x - y; }); return a.length ? a[Math.floor(a.length / 2)] : null; }
  function mmss(s) { s = Math.max(0, Math.floor(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }
  function step() { var t = (D().curve || {}).t || []; var d = t.length > 1 ? t[1] - t[0] : 1; return d > 0 ? d : 1; }
  function trace(id) { var ex = (D().examples || {})[id] || {}; return (ex.hr || []).map(function (x) { return typeof x === "number" ? x : null; }); }

  function q(id) { return st && st.el ? st.el.querySelector("#" + id) : null; }

  function firstAmber(hr, rest) { var n = 0; for (var k = 0; k < hr.length; k++) { if (hr[k] != null && rest != null && hr[k] - rest >= 20) { n++; if (n >= 3) return k - 2; } else n = 0; } return -1; }

  function load(id, fromStart) {
    var hr = trace(id), rest = median(hr.slice(0, Math.round(30 / step())));
    var fa = fromStart ? -1 : firstAmber(hr, rest), start = fa > 0 ? Math.max(0, fa - Math.round(20 / step())) : 0;
    st.rec = id; st.hr = hr; st.rest = rest; st.i = start; st.shown = []; st.state = "ok"; st.pend = null; st.pendN = 0; st.peak = null; st.elapsed = start * step();
    st.log = [{l: "ok", t: st.elapsed, txt: "Monitoring started"}];
    renderCtl(); draw();
  }

  function levelOf(v) { if (v == null || st.rest == null) return "ok"; var r = v - st.rest; return r >= 30 ? "urgent" : r >= 20 ? "watch" : "ok"; }

  function tick() {
    if (document.hidden || st.paused || !st.hr.length) return;
    for (var r = 0; r < (st.fast ? 10 : 1); r++) sample();
    draw();
  }

  function sample() {
    var v = st.hr[st.i % st.hr.length];
    st.i++; st.elapsed += step();
    if (st.i % st.hr.length === 0) { st.shown = []; st.peak = null; st.elapsed = 0; }
    if (v != null) {
      st.shown.push(v); var cap = Math.round(60 / step()) + 1; if (st.shown.length > cap) st.shown.shift();
      st.peak = st.peak == null ? v : Math.max(st.peak, v);
      var l = levelOf(v);
      if (l !== st.state) { if (l === st.pend) st.pendN++; else { st.pend = l; st.pendN = 1; } if (st.pendN >= 3) { st.state = l; st.pend = null; st.pendN = 0; st.log.unshift({l: l, t: st.elapsed, v: evVal(v), txt: "above resting"}); st.log = st.log.slice(0, 12); } }
      else { st.pend = null; st.pendN = 0; }
    }
  }

  function chart() {
    var W = 600, H = 220, L = 40, R = 8, T = 10, B = 20, rest = st.rest || 70;
    var vals = st.shown.concat([rest - 10, rest + 35]);
    var lo = Math.floor(Math.min.apply(null, vals) / 10) * 10 - 5, hi = Math.ceil(Math.max.apply(null, vals) / 10) * 10 + 5;
    var Y = function (v) { return T + (hi - v) / (hi - lo) * (H - T - B); };
    var n = Math.round(60 / step()), X = function (k) { return L + k / n * (W - L - R); };
    var s = '<rect class="lv-band" x="' + L + '" y="' + Y(rest + 10).toFixed(1) + '" width="' + (W - L - R) + '" height="' + (Y(rest - 10) - Y(rest + 10)).toFixed(1) + '"/>';
    s += '<line class="lv-th watch" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(rest + 20).toFixed(1) + '" y2="' + Y(rest + 20).toFixed(1) + '" stroke-dasharray="6 4"/>';
    s += '<line class="lv-th urgent" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(rest + 30).toFixed(1) + '" y2="' + Y(rest + 30).toFixed(1) + '" stroke-dasharray="6 4"/>';
    for (var t = Math.ceil(lo / 20) * 20; t <= hi; t += 20) s += '<text class="lv-ax" x="' + (L - 6) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end">' + t + "</text>";
    var off = n + 1 - st.shown.length;
    if (st.shown.length > 1) s += '<polyline class="lv-line" fill="none" points="' + st.shown.map(function (v, k) { return X(k + off - 1).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") + '"/>';
    if (st.shown.length) { var last = st.shown[st.shown.length - 1], l = levelOf(last); s += '<circle class="lv-dot' + (l === "ok" ? "" : " " + l) + '" cx="' + X(n).toFixed(1) + '" cy="' + Y(last).toFixed(1) + '" r="5"/>'; }
    return s;
  }

  function tile(label, value, note, l) { return '<div class="lv-tile' + (l && l !== "ok" ? " " + l : "") + '"><span>' + esc(label) + "</span><b>" + flag(esc(value), l) + "</b><small>" + esc(note) + "</small></div>"; }

  function draw() {
    var last = st.shown.length ? st.shown[st.shown.length - 1] : null, rise = last != null && st.rest != null ? Math.round(last - st.rest) : null;
    var snap = (D().samples || {}).isslive_snapshot || {}, co2 = snap.NODE3000003_ppCO2;
    q("lvHr").textContent = last != null ? Math.round(last) : "–";
    var pill = q("lvState"); pill.className = "pill " + st.state; pill.textContent = WORDS[st.state];
    q("lvClock").textContent = mmss(st.elapsed);
    q("lvChart").innerHTML = chart();
    q("lvSide").innerHTML = tile("Rise from rest", rise == null ? "–" : (rise >= 0 ? "+" : "") + rise + " bpm", "amber at +20, red at +30", levelOf(last))
      + tile("Resting (first 30 s)", st.rest == null ? "–" : Math.round(st.rest) + " bpm", "median of this recording")
      + tile("Peak so far", st.peak == null ? "–" : Math.round(st.peak) + " bpm", "since this loop started")
      + tile("Cabin CO₂", co2 == null ? "–" : co2 + " mmHg", "NASA ISS Live snapshot · limit 3 mmHg", co2 != null && co2 >= 3 ? "watch" : "ok");
    q("lvLog").innerHTML = st.log.map(function (e) { return '<div class="lv-ev ' + e.l + '"><time>' + mmss(e.t) + "</time><b>" + (e.l === "ok" ? "OK" : WORDS[e.l]) + "</b><span>" + (e.v != null ? flag(esc(e.v), e.l) + " " : "") + esc(e.txt) + "</span></div>"; }).join("");
  }

  function renderCtl() {
    var c = q("lvCtrl"); if (!c) return;
    c.innerHTML = RECS.map(function (r) { return '<button class="lv-btn" type="button" data-rec="' + r.id + '" aria-pressed="' + (st.rec === r.id) + '">' + esc(r.label) + "</button>"; }).join("")
      + '<button class="lv-btn" type="button" data-act="pause" aria-pressed="' + !!st.paused + '">' + (st.paused ? "Resume" : "Pause") + "</button>"
      + '<button class="lv-btn" type="button" data-act="restart" aria-pressed="false">From start</button>'
      + '<button class="lv-btn" type="button" data-act="fast" aria-pressed="' + !!st.fast + '">10× speed</button>';
  }

  window.renderLive = function (el, astra) {
    if (!el) return;
    window.stopLive();
    var who = "Maya Ortiz";
    if (astra && astra.crew && astra.live) { for (var k = 0; k < astra.crew.length; k++) if (astra.crew[k].id === astra.live.id) who = astra.crew[k].name; }
    el.innerHTML = '<div class="lv-head"><div><div class="eyebrow">Live monitor</div><h1 class="lv-title">' + esc(who) + '</h1></div><span class="lv-badge"><span class="dot ok"></span>LIVE <b id="lvClock">00:00</b></span></div>'
      + '<p class="sub"><span class="realtag">Real recording · PhysioNet CVES · replayed</span> <span class="simtag">Simulated profile</span></p>'
      + '<div class="lv-grid"><div class="lv-card lv-main"><div class="lv-now"><b id="lvHr">–</b><small>bpm</small><span class="pill ok" id="lvState">In range</span></div>'
      + '<svg class="lv-chart" id="lvChart" viewBox="0 0 600 220" preserveAspectRatio="none" role="img" aria-label="Heart rate, last 60 seconds"></svg><div class="lv-ctrl" id="lvCtrl"></div></div>'
      + '<div class="lv-side" id="lvSide"></div></div>'
      + '<div class="lv-card"><h2>Events</h2><div class="lv-log" id="lvLog"></div></div>';
    st = {el: el, paused: false};
    el.querySelector("#lvCtrl").onclick = function (e) {
      var b = e.target.closest ? e.target.closest("button") : null; if (!b) return;
      if (b.dataset.rec) load(b.dataset.rec);
      else if (b.dataset.act === "pause") { st.paused = !st.paused; renderCtl(); }
      else if (b.dataset.act === "restart") load(st.rec, true);
      else if (b.dataset.act === "fast") { st.fast = !st.fast; renderCtl(); }
    };
    load("today");
    timer = setInterval(tick, step() * 1000);
  };

  window.stopLive = function () { if (timer) clearInterval(timer); timer = null; };
})();

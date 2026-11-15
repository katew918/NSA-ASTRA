(function () {
  "use strict";

  var PAL = ["#2F6FB6", "#1FA39B", "#D67A30", "#8A4A1F"];
  var CW = 6.4;
  var uid = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function nv(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function trim(v) {
    if (v == null || !isFinite(v)) return "–";
    var a = Math.abs(v), d = a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : 3;
    if (a >= 1000) return Math.round(v).toLocaleString("en-US");
    var s = v.toFixed(d);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s === "-0" ? "0" : s;
  }
  var FF = "Inter, sans-serif", mc = null;
  function tw(s, px) {
    s = String(s == null ? "" : s); px = px || 11;
    try { mc = mc || document.createElement("canvas").getContext("2d"); mc.font = px + "px " + FF; return mc.measureText(s).width; }
    catch (e) { return s.length * CW * px / 11; }
  }

  function niceTicks(lo, hi, integer, minV, maxV, noHead) {
    if (lo === hi) { var p = Math.abs(lo) * 0.1 || 1; lo -= p; hi += p; }
    var span = hi - lo, head = noHead ? 0 : span * 0.06, allPos = lo >= 0;
    lo -= head; hi += head;
    if (allPos && lo < 0) lo = 0;
    if (minV != null && lo < minV) lo = minV;
    if (maxV != null && hi > maxV) hi = maxV;
    var rough = (hi - lo) / 4, mag = Math.pow(10, Math.floor(Math.log10(rough))), step = mag * 10;
    var c = [1, 2, 2.5, 5, 10];
    for (var k = 0; k < c.length; k++) {
      var s = c[k] * mag;
      if (integer && s < 1) continue;
      if (Math.ceil(hi / s - 1e-9) - Math.floor(lo / s + 1e-9) <= 4) { step = s; break; }
    }
    var a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, t = [];
    for (var v = a; v <= b + step * 1e-6; v += step) t.push(Math.round(v / step) * step);
    return { lo: a, hi: b, ticks: t };
  }

  function tightTicks(lo, hi, integer, minV, maxV) {
    if (lo === hi) { var p = Math.abs(lo) * 0.1 || 1; lo -= p; hi += p; }
    var pad = (hi - lo) * 0.08, pos = lo >= 0;
    lo -= pad; hi += pad;
    if (pos && lo < 0) lo = 0;
    if (minV != null && lo < minV) lo = minV;
    if (maxV != null && hi > maxV) hi = maxV;
    var mag = Math.pow(10, Math.floor(Math.log10((hi - lo) / 5))), c = [1, 2, 2.5, 5, 10, 20], step = mag * 20;
    for (var k = 0; k < c.length; k++) {
      var s = c[k] * mag;
      if (integer && s < 1) continue;
      if (Math.floor(hi / s + 1e-9) - Math.ceil(lo / s - 1e-9) + 1 <= 6) { step = s; break; }
    }
    var t = [];
    for (var v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step) t.push(Math.round(v / step) * step);
    return { lo: lo, hi: hi, ticks: t };
  }

  function logTicks(lo, hi) {
    var a = Math.floor(lo), b = Math.ceil(hi);
    if (a === b) { a -= 1; b += 1; }
    var st = Math.max(1, Math.ceil((b - a) / 5)), t = [];
    for (var v = a; v <= b; v += st) t.push(v);
    if (t[t.length - 1] < b) { t.push(t[t.length - 1] + st); b = t[t.length - 1]; }
    return { lo: a, hi: b, ticks: t };
  }

  function mono(p) {
    var n = p.length, i;
    if (!n) return "";
    var s = "M" + p[0].x.toFixed(1) + "," + p[0].y.toFixed(1);
    if (n === 1) return s;
    if (n === 2) return s + "L" + p[1].x.toFixed(1) + "," + p[1].y.toFixed(1);
    var d = [], m = [];
    for (i = 0; i < n - 1; i++) d[i] = (p[i + 1].y - p[i].y) / ((p[i + 1].x - p[i].x) || 1);
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      var a = m[i] / d[i], b = m[i + 1] / d[i], q = a * a + b * b;
      if (q > 9) { var t = 3 / Math.sqrt(q); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    for (i = 0; i < n - 1; i++) {
      var dx = (p[i + 1].x - p[i].x) / 3;
      s += "C" + (p[i].x + dx).toFixed(1) + "," + (p[i].y + m[i] * dx).toFixed(1) + " " +
        (p[i + 1].x - dx).toFixed(1) + "," + (p[i + 1].y - m[i + 1] * dx).toFixed(1) + " " +
        p[i + 1].x.toFixed(1) + "," + p[i + 1].y.toFixed(1);
    }
    return s;
  }

  function segments(vals, X, Y) {
    var out = [], cur = [];
    vals.forEach(function (v, i) {
      if (v == null) { if (cur.length) out.push(cur); cur = []; return; }
      cur.push({ x: X(i), y: Y(v), i: i });
    });
    if (cur.length) out.push(cur);
    return out;
  }

  function spread(items, gap, lo, hi) {
    items.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < items.length; i++) if (items[i].y - items[i - 1].y < gap) items[i].y = items[i - 1].y + gap;
    var over = items.length ? items[items.length - 1].y - hi : 0;
    if (over > 0) for (var j = items.length - 1; j >= 0; j--) {
      var lim = j === items.length - 1 ? hi : items[j + 1].y - gap;
      if (items[j].y > lim) items[j].y = lim;
    }
    items.forEach(function (it) { if (it.y < lo) it.y = lo; });
    return items;
  }

  function xLabels(labels, n, X, W, ticks) {
    if (!labels || !n) return [];
    var mw = 0, i;
    for (i = 0; i < n; i++) mw = Math.max(mw, tw(labels[i]));
    var room = mw + 14;
    if (Array.isArray(ticks) && ticks.length) {
      var out = [], lastX = -1e9;
      ticks.forEach(function (t) { if (t >= 0 && t < n && X(t) - lastX >= room) { out.push(t); lastX = X(t); } });
      return out;
    }
    if (n === 1) return [0];
    var slot = Math.abs(X(n - 1) - X(0));
    var k = Math.max(2, Math.min(W < 520 ? 5 : 9, Math.floor(slot / room) + 1));
    var c = [1, 2, 5, 7, 10, 14, 20, 28, 50, 100, 200, 500, 1000], step = c[c.length - 1];
    for (i = 0; i < c.length; i++) if (Math.floor((n - 1) / c[i]) + 1 <= k) { step = c[i]; break; }
    var idx = [];
    for (i = n - 1; i >= 0; i -= step) idx.unshift(i);
    return idx;
  }

  function ensure(el, opts, kind) {
    var st = el.__astraChart;
    if (st) { if (st.ro) st.ro.disconnect(); if (st.raf) cancelAnimationFrame(st.raf); }
    st = el.__astraChart = { w: -1, raf: 0, ro: null };
    function go() {
      st.raf = 0;
      if (!el.isConnected) { if (st.ro) st.ro.disconnect(); return; }
      var w = Math.floor(el.clientWidth);
      if (!w || w === st.w) return;
      st.w = w;
      FF = getComputedStyle(el).fontFamily || FF;
      DRAW[kind](el, opts, w);
    }
    if (document.fonts && document.fonts.status !== "loaded" && document.fonts.ready) document.fonts.ready.then(function () { if (el.__astraChart === st) { st.w = -1; go(); } });
    if (window.ResizeObserver) {
      st.ro = new ResizeObserver(function () { if (!st.raf) st.raf = requestAnimationFrame(go); });
      st.ro.observe(el);
    }
    if (el.clientWidth) go(); else el.innerHTML = "";
  }

  function empty(el, o) { el.innerHTML = '<div class="ch-empty">' + esc(o.empty || "No data for this range") + "</div>"; }

  function shell(legend, svg) {
    return '<div class="ch">' + (legend ? '<div class="ch-legend">' + legend + "</div>" : "") +
      '<div class="ch-plot">' + svg + '<div class="ch-tip" hidden></div></div></div>';
  }

  function svgOpen(W, H, label) {
    return '<svg class="ch-svg" xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H +
      '" role="img" tabindex="0" aria-label="' + esc(label) + '">';
  }

  function summary(name, vals, f, unit) {
    var v = vals.filter(function (x) { return x != null; });
    if (!v.length) return name;
    var u = unit ? " " + unit : "";
    return name + ": lowest " + f(Math.min.apply(null, v)) + u + ", highest " + f(Math.max.apply(null, v)) + u + ", latest " + f(v[v.length - 1]) + u;
  }

  function interact(el, cfg) {
    var svg = el.querySelector(".ch-svg"), tip = el.querySelector(".ch-tip"), hov = svg && svg.querySelector(".ch-hover");
    if (!svg || !tip) return;
    var ki = cfg.selected != null && cfg.selected >= 0 ? cfg.selected : cfg.n - 1, active = -1;
    function show(i) {
      if (i < 0 || i >= cfg.n) return;
      active = i;
      if (hov) hov.innerHTML = cfg.hover(i);
      tip.innerHTML = cfg.tip(i);
      tip.hidden = false;
      var a = cfg.anchor(i), tw2 = tip.offsetWidth, th = tip.offsetHeight;
      var left = !cfg.side && a.x > cfg.W / 2 ? a.x - 14 - tw2 : a.x + 14;
      if (left + tw2 > cfg.W - 4) left = a.x - 14 - tw2;
      if (left < 0) left = Math.max(0, Math.min(cfg.W - tw2, a.x - tw2 / 2));
      var bot = cfg.bottom != null ? cfg.bottom : cfg.H;
      var top = cfg.side ? a.y - th / 2 : a.y - th - 12;
      if (top < 0 && !cfg.side) top = a.y + 14;
      top = Math.max(0, Math.min(bot - th, top));
      tip.style.left = Math.round(left) + "px";
      tip.style.top = Math.round(top) + "px";
      if (cfg.onHover) cfg.onHover(i);
    }
    function hide() {
      if (active < 0) return;
      active = -1;
      if (hov) hov.innerHTML = "";
      tip.hidden = true;
      if (cfg.onHover) cfg.onHover(-1);
    }
    function at(e) {
      var r = svg.getBoundingClientRect(), t = e.touches && e.touches[0] ? e.touches[0] : e;
      return cfg.index(t.clientX - r.left, t.clientY - r.top);
    }
    svg.addEventListener("pointermove", function (e) { var i = at(e); if (i < 0) { hide(); return; } ki = i; if (i !== active) show(i); });
    svg.addEventListener("pointerdown", function (e) { if (e.pointerType === "touch") { var i = at(e); if (i >= 0) { ki = i; show(i); } } });
    svg.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") hide(); });
    svg.addEventListener("click", function (e) { var i = at(e); if (i >= 0 && cfg.onPick) cfg.onPick(i); });
    svg.addEventListener("focus", function () { show(ki); });
    svg.addEventListener("blur", hide);
    svg.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown") ki = Math.min(cfg.n - 1, ki + 1);
      else if (k === "ArrowLeft" || k === "ArrowUp") ki = Math.max(0, ki - 1);
      else if (k === "Home") ki = 0;
      else if (k === "End") ki = cfg.n - 1;
      else if ((k === "Enter" || k === " ") && cfg.onPick) { e.preventDefault(); cfg.onPick(ki); return; }
      else if (k === "Escape") { hide(); return; }
      else return;
      e.preventDefault();
      show(ki);
    });
  }

  function tipRow(key, name, val) {
    return '<span class="ch-tip-row">' + key + "<span>" + esc(name) + "</span><b>" + esc(val) + "</b></span>";
  }

  function drawLine(el, o, W) {
    var spark = !!o.spark, unit = o.unit || "", f = o.fmt || trim;
    var main = Array.isArray(o.values) ? o.values.map(nv) : null;
    var pi = 0;
    var ser = (o.series || []).map(function (s) {
      var c = s.emphasis ? null : (s.color || PAL[pi % PAL.length]);
      if (!s.emphasis) pi++;
      return { name: s.name, values: (s.values || []).map(nv), color: c, emphasis: !!s.emphasis };
    });
    var n = 0, all = [];
    if (main) { n = main.length; main.forEach(function (v) { if (v != null) all.push(v); }); }
    ser.forEach(function (s) { n = Math.max(n, s.values.length); s.values.forEach(function (v) { if (v != null) all.push(v); }); });
    if (!n || !all.length) { empty(el, o); return; }
    var H = o.height || (spark ? 44 : W < 520 ? 210 : 260);
    var useEnd = !spark && ser.length > 0 && o.endLabels !== false && W >= 420;
    var dom = all.slice(), band = Array.isArray(o.band) && nv(o.band[0]) != null && nv(o.band[1]) != null ? [Math.min(o.band[0], o.band[1]), Math.max(o.band[0], o.band[1])] : null;
    var bs = o.bandSeries && Array.isArray(o.bandSeries.lo) && Array.isArray(o.bandSeries.hi) ? o.bandSeries : null;
    var ths = (o.thresholds || []).filter(function (t) { return nv(t.v) != null; });
    if (!spark || o.sparkBand !== false) { if (band) dom.push(band[0], band[1]); }
    if (bs) bs.lo.concat(bs.hi).forEach(function (v) { if (nv(v) != null) dom.push(v); });
    ths.forEach(function (t) { dom.push(t.v); });
    (o.yInclude || []).forEach(function (v) { if (nv(v) != null) dom.push(v); });
    var log = !!o.yLog, tv = log ? function (v) { return Math.log10(Math.max(1e-4, v)); } : function (v) { return v; };
    var lo = Math.min.apply(null, dom.map(tv)), hi = Math.max.apply(null, dom.map(tv)), sc;
    if (spark) { var pd = (hi - lo) * 0.1 || 1; sc = { lo: lo - pd, hi: hi + pd, ticks: [] }; }
    else sc = log ? logTicks(lo, hi) : tightTicks(lo, hi, o.integer, nv(o.yMin), nv(o.yMax));
    var tf = o.tickFmt || trim, tlab = sc.ticks.map(function (t) { return String(tf(log ? Math.pow(10, t) : t)); });
    var gl = [];
    if (!spark && !useEnd) {
      if (band && o.bandLabel) gl.push(o.bandLabel);
      if (bs && bs.label) gl.push(bs.label);
      ths.forEach(function (t) { if (t.label) gl.push(t.label); });
    }
    var gut = gl.length ? Math.ceil(Math.max.apply(null, gl.map(function (x) { return tw(x, 10.5); }))) + 14 : 0;
    var M = spark ? { l: 3, r: 6, t: 6, b: 6 } : { l: Math.max(26, Math.ceil(Math.max.apply(null, tlab.map(function (x) { return tw(x); }).concat([0]))) + 12), r: useEnd ? 64 : Math.max(20, gut), t: unit ? 24 : 18, b: 30 };
    var pw = Math.max(10, W - M.l - M.r), ph = Math.max(10, H - M.t - M.b);
    var dense = !spark && pw / n < 4;
    function Y(v) { return M.t + (sc.hi - tv(v)) / ((sc.hi - sc.lo) || 1) * ph; }
    function X(i) { return n <= 1 ? M.l + pw / 2 : M.l + i * pw / (n - 1); }
    var gid = "chGrad" + (++uid), s = "", notes = [];
    var label = o.label || o.name || "Chart";
    var sumVals = main || (ser.filter(function (x) { return x.emphasis; })[0] || ser[0]).values;
    s += svgOpen(W, H, summary(label, sumVals, f, unit));
    s += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="ch-g0"/><stop offset="1" class="ch-g1"/></linearGradient></defs>';
    if (!spark) {
      sc.ticks.forEach(function (t, k) {
        var y = Y(log ? Math.pow(10, t) : t).toFixed(1);
        s += '<line class="ch-grid" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + y + '" y2="' + y + '"/>';
        s += '<text class="ch-tick" x="' + (M.l - 8) + '" y="' + (+y + 4).toFixed(1) + '" text-anchor="end">' + esc(tlab[k]) + "</text>";
      });
      if (unit) s += '<text class="ch-unit" x="0" y="10">' + esc(unit) + "</text>";
    }
    (o.spans || []).forEach(function (sp) {
      var a = X(Math.max(0, sp.from)), b = X(Math.min(n - 1, sp.to)), x0 = Math.min(a, b), x1 = Math.max(a, b);
      s += '<rect class="ch-span" x="' + x0.toFixed(1) + '" y="' + M.t + '" width="' + Math.max(1, x1 - x0).toFixed(1) + '" height="' + ph + '"/>';
      if (sp.label && !spark) s += '<text class="ch-note" x="' + ((x0 + x1) / 2).toFixed(1) + '" y="' + (M.t - 6) + '" text-anchor="middle">' + esc(sp.label) + "</text>";
    });
    if (band) {
      var by1 = Y(band[1]), by2 = Y(band[0]);
      s += '<rect class="ch-band" x="' + M.l + '" y="' + by1.toFixed(1) + '" width="' + pw + '" height="' + Math.max(0, by2 - by1).toFixed(1) + '"/>';
      if (o.bandLabel && !spark && by2 - by1 >= 14) notes.push({ y: useEnd ? by1 + 12 : (by1 + by2) / 2 + 4, t: o.bandLabel, c: "" });
    }
    if (bs) {
      var top = [], bot = [];
      for (var i = 0; i < n; i++) { if (nv(bs.hi[i]) != null && nv(bs.lo[i]) != null) { top.push({ x: X(i), y: Y(bs.hi[i]) }); bot.push({ x: X(i), y: Y(bs.lo[i]) }); } }
      if (top.length > 1) {
        var rb = bot.slice().reverse();
        s += '<path class="ch-band" d="' + mono(top) + "L" + rb[0].x.toFixed(1) + "," + rb[0].y.toFixed(1) + mono(rb).replace(/^M[^C L]+/, "") + 'Z"/>';
        if (bs.label && !spark) notes.push({ y: useEnd ? top[top.length - 1].y - 6 : (top[top.length - 1].y + bot[bot.length - 1].y) / 2 + 4, t: bs.label, c: "" });
      }
    }
    ths.forEach(function (t) {
      var y = Y(t.v).toFixed(1), c = t.cls || "watch";
      s += '<line class="ch-th ' + esc(c) + '" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + y + '" y2="' + y + '"/>';
      if (t.label && !spark) notes.push({ y: useEnd ? +y - 4 : +y + 3.5, t: t.label, c: c });
    });
    if (!spark) {
      s += '<line class="ch-axis" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + (M.t + ph) + '" y2="' + (M.t + ph) + '"/>';
      var labs = o.labels || [], idx = xLabels(labs, n, X, W, o.xTicks);
      idx.forEach(function (i) {
        var half = tw(labs[i]) / 2, x = Math.max(half + 2, Math.min(W - half - 2, X(i)));
        s += '<text class="ch-tick" x="' + x.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(labs[i]) + "</text>";
      });
    }
    (o.marks || []).forEach(function (mk) {
      var x = X(mk.x).toFixed(1);
      s += '<line class="ch-mark" x1="' + x + '" x2="' + x + '" y1="' + M.t + '" y2="' + (M.t + ph) + '"/>';
      if (mk.label && !spark) {
        var right = +x + tw(mk.label) + 6 > M.l + pw;
        s += '<text class="ch-note" x="' + (right ? +x - 4 : +x + 4).toFixed(1) + '" y="' + (M.t - 6) + '"' + (right ? ' text-anchor="end"' : "") + ">" + esc(mk.label) + "</text>";
      }
    });
    spread(notes, useEnd ? 14 : 12, M.t + 9, useEnd ? M.t + ph - 3 : M.t + ph + 3).forEach(function (nt) {
      s += '<text class="ch-note' + (nt.c ? " " + esc(nt.c) : "") + '" x="' + (useEnd ? M.l + pw - 4 : M.l + pw + 7) + '" y="' + nt.y.toFixed(1) + '" text-anchor="' + (useEnd ? "end" : "start") + '">' + esc(nt.t) + "</text>";
    });
    var base = M.t + ph, ends = [];
    ser.forEach(function (sr) {
      if (sr.emphasis) return;
      segments(sr.values, X, Y).forEach(function (seg) {
        s += '<path class="ch-line2" fill="none" stroke="' + esc(sr.color) + '" d="' + mono(seg) + '"/>';
      });
    });
    function mainPath(vals, cls) {
      var out = "";
      segments(vals, X, Y).forEach(function (seg) {
        if (seg.length > 1) out += '<path class="ch-area" fill="url(#' + gid + ')" d="' + mono(seg) + "L" + seg[seg.length - 1].x.toFixed(1) + "," + base + "L" + seg[0].x.toFixed(1) + "," + base + 'Z"/>';
      });
      segments(vals, X, Y).forEach(function (seg) { out += '<path class="' + cls + '" fill="none" d="' + mono(seg) + '"/>'; });
      return out;
    }
    if (main) s += mainPath(main, dense ? "ch-line ch-dense" : "ch-line");
    ser.forEach(function (sr) {
      if (!sr.emphasis) return;
      if (!main) s += mainPath(sr.values, "ch-line ch-main");
      else segments(sr.values, X, Y).forEach(function (seg) { s += '<path class="ch-line ch-main" fill="none" d="' + mono(seg) + '"/>'; });
    });
    var sel = o.selected != null ? o.selected : -1, flags = o.flags || [];
    if (main) {
      main.forEach(function (v, i) {
        if (v == null) return;
        var l = flags[i], fl = l === "watch" || l === "urgent";
        var show = spark ? i === lastIdx(main) : (n <= 14 || fl || i === sel);
        if (!show) return;
        s += '<circle class="ch-pt' + (fl ? " " + l : "") + (i === sel || (spark && i === lastIdx(main)) ? " on" : "") + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (i === sel ? 5 : spark ? 3 : fl ? 4.5 : 3.5) + '"/>';
      });
    }
    ser.forEach(function (sr) {
      if (!sr.emphasis || spark || n > 14) return;
      sr.values.forEach(function (v, i) { if (v != null) s += '<circle class="ch-pt ch-main" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3"/>'; });
    });
    if (useEnd) {
      ser.forEach(function (sr) {
        var li = lastIdx(sr.values);
        if (li >= 0) ends.push({ y: Y(sr.values[li]) + 4, x: X(li) + 6, t: sr.name, c: sr.color });
      });
      spread(ends, 14, M.t + 4, M.t + ph + 4).forEach(function (e) {
        s += '<text class="ch-end' + (e.c ? "" : " ch-main") + '" x="' + e.x.toFixed(1) + '" y="' + e.y.toFixed(1) + '"' + (e.c ? ' fill="' + esc(e.c) + '"' : "") + ">" + esc(e.t) + "</text>";
      });
    }
    if (!spark) s += '<g class="ch-hover"></g><rect class="ch-hit" x="' + M.l + '" y="0" width="' + pw + '" height="' + H + '" fill="none" pointer-events="all"/>';
    s += "</svg>";
    var legend = "";
    if (ser.length && !spark) {
      legend = (main ? '<span class="ch-key"><i class="ch-key-main"></i>' + esc(o.name || "Value") + "</span>" : "") + ser.map(function (sr) {
        return '<span class="ch-key' + (sr.color ? "" : " ch-key-em") + '"><i' + (sr.color ? ' style="background:' + esc(sr.color) + '"' : ' class="ch-key-main"') + "></i>" + esc(sr.name) + "</span>";
      }).join("");
    }
    el.innerHTML = shell(legend, s);
    if (spark) return;
    var u = unit ? " " + unit : "";
    interact(el, {
      n: n, W: W, H: H, bottom: M.t + ph, selected: sel, onHover: o.onHover, onPick: o.onPick,
      index: function (x) { if (x < M.l - 12 || x > M.l + pw + 12) return -1; return Math.max(0, Math.min(n - 1, n <= 1 ? 0 : Math.round((x - M.l) / pw * (n - 1)))); },
      anchor: function (i) {
        var v = main ? main[i] : null;
        if (v == null) ser.forEach(function (sr) { if (v == null && sr.emphasis) v = sr.values[i]; });
        if (v == null) ser.forEach(function (sr) { if (v == null) v = sr.values[i]; });
        return { x: X(i), y: v == null ? M.t + ph / 2 : Y(v) };
      },
      hover: function (i) {
        var h = '<line class="ch-cursor" x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="' + M.t + '" y2="' + (M.t + ph) + '"/>';
        ser.forEach(function (sr) {
          var v = sr.values[i];
          if (v != null) h += '<circle class="ch-hpt' + (sr.color ? "" : " ch-main") + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="' + (sr.color ? 4.5 : 5.5) + '"' + (sr.color ? ' fill="' + esc(sr.color) + '"' : "") + "/>";
        });
        if (main && main[i] != null) { var l = flags[i]; h += '<circle class="ch-pt on' + (l === "watch" || l === "urgent" ? " " + l : "") + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(main[i]).toFixed(1) + '" r="5.5"/>'; }
        return h;
      },
      tip: function (i) {
        var hx = o.tipX ? o.tipX(i) : (o.labels || [])[i];
        var multi = ser.length + (main ? 1 : 0) > 1, ru = multi ? "" : u;
        var h = '<b class="ch-tip-x">' + esc(hx == null ? "" : hx) + (multi && unit ? " · " + esc(unit) : "") + "</b>";
        if (main) h += tipRow('<i class="ch-key-main"></i>', o.name || "Value", main[i] == null ? "–" : f(main[i]) + ru);
        ser.forEach(function (sr) {
          var v = sr.values[i];
          h += tipRow(sr.color ? '<i style="background:' + esc(sr.color) + '"></i>' : '<i class="ch-key-main"></i>', sr.name, v == null ? "–" : f(v) + ru);
        });
        if (o.tipNote) { var t = o.tipNote(i); if (t) h += '<span class="ch-tip-note">' + esc(t) + "</span>"; }
        return h;
      }
    });
  }

  function lastIdx(a) { for (var i = a.length - 1; i >= 0; i--) if (a[i] != null) return i; return -1; }

  function drawBars(el, o, W) {
    var vals = (o.values || []).map(nv), n = vals.length, f = o.fmt || trim, unit = o.unit || "", u = unit ? " " + unit : "";
    if (!n || !vals.some(function (v) { return v != null; })) { empty(el, o); return; }
    var dom = vals.filter(function (v) { return v != null; }).concat([0]);
    (o.thresholds || []).forEach(function (t) { if (nv(t.v) != null) dom.push(t.v); });
    var mx = Math.max.apply(null, dom), sc = niceTicks(Math.min.apply(null, dom), mx > 0 ? mx : 1, o.integer);
    var H = o.height || (W < 520 ? 210 : 260), M = { l: Math.max(26, Math.ceil(Math.max.apply(null, sc.ticks.map(function (t) { return tw(trim(t)); }))) + 12), r: 20, t: 18, b: 30 };
    var pw = Math.max(10, W - M.l - M.r), ph = Math.max(10, H - M.t - M.b);
    function Y(v) { return M.t + (sc.hi - v) / ((sc.hi - sc.lo) || 1) * ph; }
    var slot = pw / n, bw = Math.max(1, slot * 0.6);
    function X(i) { return M.l + (i + 0.5) * slot; }
    var sel = o.selected != null ? o.selected : -1, flags = o.flags || [], notes = [];
    var s = svgOpen(W, H, summary(o.label || o.name || "Chart", vals, f, unit));
    sc.ticks.forEach(function (t) {
      var y = Y(t).toFixed(1);
      s += '<line class="ch-grid" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + y + '" y2="' + y + '"/>';
      s += '<text class="ch-tick" x="' + (M.l - 8) + '" y="' + (+y + 4).toFixed(1) + '" text-anchor="end">' + esc(trim(t)) + "</text>";
    });
    if (unit) s += '<text class="ch-unit" x="0" y="10">' + esc(unit) + "</text>";
    var y0 = Y(Math.max(sc.lo, 0));
    vals.forEach(function (v, i) {
      if (v == null || v === 0) return;
      var y = Y(v), l = flags[i], c = (l === "watch" || l === "urgent" ? " " + l : "") + (i === sel ? " on" : "");
      var bx = X(i) - bw / 2, br = v > 0 ? Math.min(3, bw / 2, Math.abs(y0 - y)) : 0;
      if (br > 0) s += '<path class="ch-bar' + c + '" d="M' + bx.toFixed(1) + "," + y0.toFixed(1) + "V" + (y + br).toFixed(1) + "Q" + bx.toFixed(1) + "," + y.toFixed(1) + " " + (bx + br).toFixed(1) + "," + y.toFixed(1) + "H" + (bx + bw - br).toFixed(1) + "Q" + (bx + bw).toFixed(1) + "," + y.toFixed(1) + " " + (bx + bw).toFixed(1) + "," + (y + br).toFixed(1) + "V" + y0.toFixed(1) + 'Z"/>';
      else s += '<rect class="ch-bar' + c + '" x="' + bx.toFixed(1) + '" y="' + Math.min(y, y0).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, Math.abs(y0 - y)).toFixed(1) + '"/>';
    });
    (o.thresholds || []).forEach(function (t) {
      if (nv(t.v) == null) return;
      var y = Y(t.v).toFixed(1), c = t.cls || "watch";
      s += '<line class="ch-th ' + esc(c) + '" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + y + '" y2="' + y + '"/>';
      if (t.label) notes.push({ y: +y - 4, t: t.label, c: c });
    });
    spread(notes, 14, M.t + 9, M.t + ph - 3).forEach(function (nt) {
      s += '<text class="ch-note ' + esc(nt.c) + '" x="' + (M.l + pw - 4) + '" y="' + nt.y.toFixed(1) + '" text-anchor="end">' + esc(nt.t) + "</text>";
    });
    s += '<line class="ch-axis" x1="' + M.l + '" x2="' + (M.l + pw) + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '"/>';
    var labs = o.labels || [];
    xLabels(labs, n, X, W, o.xTicks).forEach(function (i) {
      var half = tw(labs[i]) / 2, x = Math.max(half + 2, Math.min(W - half - 2, X(i)));
      s += '<text class="ch-tick" x="' + x.toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(labs[i]) + "</text>";
    });
    s += '<g class="ch-hover"></g><rect class="ch-hit" x="' + M.l + '" y="0" width="' + pw + '" height="' + H + '" fill="none" pointer-events="all"/></svg>';
    el.innerHTML = shell("", s);
    interact(el, {
      n: n, W: W, H: H, bottom: M.t + ph, selected: sel, onHover: o.onHover, onPick: o.onPick,
      index: function (x) { if (x < M.l || x > M.l + pw) return -1; return Math.max(0, Math.min(n - 1, Math.floor((x - M.l) / slot))); },
      anchor: function (i) { return { x: X(i), y: vals[i] == null ? M.t + ph / 2 : Math.min(Y(vals[i]), y0 - 10) }; },
      hover: function (i) { return '<rect class="ch-cursor" x="' + (X(i) - slot / 2).toFixed(1) + '" y="' + M.t + '" width="' + slot.toFixed(1) + '" height="' + ph + '"/>'; },
      tip: function (i) {
        var hx = o.tipX ? o.tipX(i) : labs[i];
        var h = '<b class="ch-tip-x">' + esc(hx == null ? "" : hx) + "</b>" + tipRow('<i class="ch-key-main"></i>', o.name || "Value", vals[i] == null ? "–" : f(vals[i]) + u);
        if (o.tipNote) { var t = o.tipNote(i); if (t) h += '<span class="ch-tip-note">' + esc(t) + "</span>"; }
        return h;
      }
    });
  }

  function drawHbars(el, o, W) {
    var f = o.fmt || trim, unit = o.unit || "", u = unit ? " " + unit : "";
    var items = (o.items || []).map(function (it, i) { return { label: it.label, sub: it.sub, value: nv(it.value), cls: it.cls, i: i }; }).filter(function (it) { return it.value != null; });
    if (!items.length) { empty(el, o); return; }
    if (o.sort !== false) items.sort(function (a, b) { return b.value - a.value; });
    var th = o.threshold && nv(o.threshold.v) != null ? o.threshold : null;
    var seen = {}, dup = {};
    items.forEach(function (it) { var k = String(it.label); if (seen[k]) dup[k] = 1; seen[k] = 1; });
    var maxLab = 0, maxVal = 0;
    items.forEach(function (it) {
      it.text = String(it.label == null ? "" : it.label) + (dup[String(it.label)] && it.sub ? " · " + it.sub : "");
      maxLab = Math.max(maxLab, tw(it.text, 12.4)); maxVal = Math.max(maxVal, tw(f(it.value), 12));
    });
    var stack = maxLab + 12 > W * 0.42;
    var labW = stack ? 0 : Math.round(Math.max(56, maxLab + 12));
    var valW = Math.round(Math.max(28, maxVal + 14, stack && unit ? tw(unit) + 18 : 0));
    var RH = stack ? 40 : 26, BH = stack ? 12 : 16, BY = stack ? 21 : 5;
    var M = { l: labW, r: valW, t: th && th.label ? 22 : 6, b: 26 };
    var pw = Math.max(10, W - M.l - M.r), H = M.t + items.length * RH + M.b;
    var dom = items.map(function (it) { return it.value; }).concat([0]);
    if (th) dom.push(th.v);
    if (nv(o.max) != null) dom.push(o.max);
    var sc = niceTicks(0, Math.max.apply(null, dom) || 1, false, 0, null, true);
    sc.lo = 0;
    function X(v) { return M.l + (v - sc.lo) / ((sc.hi - sc.lo) || 1) * pw; }
    var s = svgOpen(W, H, summary(o.label || o.name || "Chart", items.map(function (it) { return it.value; }), f, unit));
    var all = sc.ticks.map(function (t, k) { return k; });
    var ti = xLabels(sc.ticks.map(trim), sc.ticks.length, function (k) { return X(sc.ticks[k]); }, W, all);
    sc.ticks.forEach(function (t, k) {
      var x = X(t).toFixed(1);
      if (stack) items.forEach(function (it, r) { var gy = M.t + r * RH + BY; s += '<line class="' + (k ? "ch-grid" : "ch-axis") + '" x1="' + x + '" x2="' + x + '" y1="' + (gy - 3) + '" y2="' + (gy + BH + 3) + '"/>'; });
      else s += '<line class="ch-grid" x1="' + x + '" x2="' + x + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>';
      if (ti.indexOf(k) >= 0) s += '<text class="ch-tick" x="' + x + '" y="' + (H - 9) + '" text-anchor="' + (stack && k === 0 ? "start" : "middle") + '">' + esc(trim(t)) + "</text>";
    });
    if (unit) s += '<text class="ch-unit" x="' + (stack ? W - 2 : 4) + '" y="' + (H - 9) + '"' + (stack ? ' text-anchor="end"' : "") + ">" + esc(unit) + "</text>";
    var tx0 = th ? X(th.v) : null;
    items.forEach(function (it, r) {
      var y = M.t + r * RH, bx = X(0), ex = X(it.value), vt = f(it.value), vx = ex + 6, cy = y + BY + BH / 2 + 4;
      if (tx0 != null && vx < tx0 + 4 && vx + tw(vt, 12) > tx0 - 4) vx = tx0 + 6;
      if (stack) s += '<text class="ch-cat" x="0" y="' + (y + 14) + '">' + esc(it.text) + "</text>";
      else s += '<text class="ch-cat" x="' + (labW - 10) + '" y="' + cy.toFixed(1) + '" text-anchor="end">' + esc(it.text) + "</text>";
      s += '<rect class="ch-bar' + (it.cls ? " " + esc(it.cls) : "") + '" x="' + bx.toFixed(1) + '" y="' + (y + BY) + '" width="' + Math.max(1, ex - bx).toFixed(1) + '" height="' + BH + '" rx="3"/>';
      s += '<text class="ch-val" x="' + vx.toFixed(1) + '" y="' + cy.toFixed(1) + '">' + esc(vt) + "</text>";
    });
    if (!stack) s += '<line class="ch-axis" x1="' + X(0).toFixed(1) + '" x2="' + X(0).toFixed(1) + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>';
    if (th) {
      var tx = X(th.v).toFixed(1), c = th.cls || "watch";
      s += '<line class="ch-th ' + esc(c) + '" x1="' + tx + '" x2="' + tx + '" y1="' + (M.t - 4) + '" y2="' + (H - M.b) + '"/>';
      if (th.label) {
        var right = +tx + tw(th.label, 10.5) / 2 > W - 2;
        s += '<text class="ch-note ' + esc(c) + '" x="' + (right ? W - 2 : tx) + '" y="' + (M.t - 8) + '" text-anchor="' + (right ? "end" : "middle") + '">' + esc(th.label) + "</text>";
      }
    }
    s += '<g class="ch-hover"></g><rect class="ch-hit" x="0" y="' + M.t + '" width="' + W + '" height="' + (items.length * RH) + '" fill="none" pointer-events="all"/></svg>';
    el.innerHTML = shell("", s);
    var n = items.length;
    interact(el, {
      n: n, W: W, H: H, side: true, selected: -1,
      onHover: o.onHover ? function (k) { o.onHover(k < 0 ? -1 : items[k].i); } : null,
      onPick: o.onPick ? function (k) { o.onPick(items[k].i); } : null,
      index: function (x, y) { var k = Math.floor((y - M.t) / RH); return k < 0 || k >= n ? -1 : k; },
      anchor: function (k) { return { x: Math.min(W - 40, X(items[k].value)), y: M.t + k * RH + RH / 2 }; },
      hover: function (k) { var y = M.t + k * RH; return '<rect class="ch-cursor" x="0" y="' + y + '" width="' + W + '" height="' + RH + '" fill="none"/>'; },
      tip: function (k) {
        var it = items[k];
        var h = '<b class="ch-tip-x">' + esc(it.label) + (it.sub ? " · " + esc(it.sub) : "") + "</b>" + tipRow('<i class="ch-key-main"></i>', o.name || "Value", f(it.value) + u);
        if (o.tipNote) { var t = o.tipNote(it.i); if (t) h += '<span class="ch-tip-note">' + esc(t) + "</span>"; }
        return h;
      }
    });
  }

  var DRAW = { line: drawLine, bars: drawBars, hbars: drawHbars };

  window.ASTRAChart = {
    line: function (el, opts) { if (el) ensure(el, opts || {}, "line"); },
    bars: function (el, opts) { if (el) ensure(el, opts || {}, "bars"); },
    hbars: function (el, opts) { if (el) ensure(el, opts || {}, "hbars"); },
    palette: PAL.slice(),
    nice: niceTicks,
    fmt: trim,
    r1: r1
  };
})();

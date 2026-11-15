(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function fmt(v, d) { v = num(v); return v == null ? "–" : v.toFixed(d == null ? 0 : d); }
  function median(a) {
    a = a.filter(function (x) { return num(x) != null; }).slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }
  function avg(a) {
    a = a.filter(function (x) { return num(x) != null; });
    if (!a.length) return null;
    return a.reduce(function (s, x) { return s + x; }, 0) / a.length;
  }
  function D() { return (window.DATA || {}); }
  function real(src) { return '<span class="realtag">Real data · ' + esc(src) + "</span>"; }

  var KEY = "astraGuideHidden";
  function getHidden() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }
  function setHidden(v) { try { sessionStorage.setItem(KEY, v ? "1" : "0"); } catch (e) { } }

  var STEPS = [
    ["Training on Earth", "Baseline: sleep, heart rate, mood, reflexes, scans."],
    ["Every mission day", "90-second check, wearables. Daily checks, weekly conference, exams on set flight days."],
    ["Compare with their own normal", "Green, Amber or Red."],
    ["Who sees it", "Mood private. Red goes to flight surgeon."]
  ];

  window.renderGuide = function (el) {
    if (!el) return;
    var hidden = getHidden();
    var h = '<div class="g-head"><h2>How ASTRA works</h2>' +
      '<button type="button" class="g-toggle" aria-expanded="' + (!hidden) + '">' + (hidden ? "Show" : "Hide") + "</button></div>";
    if (!hidden) {
      h += '<ol class="g-steps">';
      STEPS.forEach(function (s, i) {
        h += '<li><span class="g-n">' + (i + 1) + '</span><div><b>' + esc(s[0]) + "</b><p>" + esc(s[1]) + "</p></div></li>";
      });
      h += "</ol>";
    }
    el.innerHTML = '<div class="g-card' + (hidden ? " is-hidden" : "") + '">' + h + "</div>";
    var b = el.querySelector(".g-toggle");
    if (b) b.addEventListener("click", function () { setHidden(!hidden); window.renderGuide(el); });
  };

  var SLOTS = [];
  function slot(kind, opts, cls) {
    SLOTS.push({kind: kind, opts: opts});
    return '<div class="c-ch ' + (cls || "") + '" data-ch="' + (SLOTS.length - 1) + '"></div>';
  }
  function mountAll(root) {
    var C = window.ASTRAChart, list = SLOTS;
    SLOTS = [];
    root.querySelectorAll("[data-ch]").forEach(function (el) {
      var sp = list[+el.getAttribute("data-ch")];
      el.removeAttribute("data-ch");
      if (!sp) return;
      if (!C) { el.innerHTML = '<p class="c-note">Chart unavailable.</p>'; return; }
      C[sp.kind](el, sp.opts);
    });
  }
  function quant(a, q) {
    a = a.slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var p = (a.length - 1) * q, i = Math.floor(p);
    return i + 1 < a.length ? a[i] + (a[i + 1] - a[i]) * (p - i) : a[i];
  }

  function sparkline(vals, name) {
    var v = vals.filter(function (x) { return num(x) != null; });
    if (v.length < 2) return '<p class="c-note">Not enough data.</p>';
    return slot("line", {spark: true, values: v, band: [quant(v, 0.25), quant(v, 0.75)], unit: "h", label: "Sleep hours, " + name, fmt: function (x) { return fmt(x, 1); }}, "c-spark");
  }

  var STATUS = { ok: "Green · fine", watch: "Amber · worth a look", urgent: "Red · needs attention" };
  var i4Analyte = null;

  function sexWord(s) { return s === "f" ? "Female" : s === "m" ? "Male" : "–"; }

  function flag(txt, l) { return l === "watch" || l === "urgent" ? '<span class="flag ' + l + '">' + txt + "</span>" : txt; }
  function sleepLvl(v, b) { return num(v) != null && num(b.sleep) != null && v < b.sleep - 1.5 ? "watch" : "ok"; }
  function hrLvl(v, b) { if (num(v) == null) return "ok"; return v <= 40 || v >= 131 ? "urgent" : v >= 111 || v <= 50 || (num(b.hr) != null && Math.abs(v - b.hr) >= 20) ? "watch" : "ok"; }
  function todayVals(c) {
    var t = c.today, b = c.base || {}, parts = [];
    if (!t) return "";
    if (num(t.sleep) != null) parts.push("Sleep " + flag(fmt(t.sleep, 1) + " h", sleepLvl(t.sleep, b)));
    if (num(t.hr) != null) parts.push("Resting HR " + flag(fmt(t.hr) + " bpm", hrLvl(t.hr, b)));
    return parts.length ? '<p class="c-stt">' + parts.join(" · ") + "</p>" : "";
  }

  function secToday(crew) {
    if (!crew.length) return "<p class=\"c-note\">No crew loaded.</p>";
    return '<div class="c-cards">' + crew.map(function (c) {
      var st = STATUS[c.status] ? c.status : "ok";
      return '<div class="c-card st-' + st + '"><div class="c-nm">' + esc(c.name || c.id) +
        ' <span class="c-sx">' + (c.sex === "f" ? "F" : c.sex === "m" ? "M" : "") + "</span></div>" +
        '<div class="c-rl">' + esc(c.role || "") + "</div>" +
        '<div class="c-st"><span class="c-dot"></span>' + STATUS[st] + "</div>" +
        todayVals(c) + "</div>";
    }).join("") + "</div>";
  }

  var ROWS = [
    ["Sleep (h)", function (b) { return fmt(b.sleep, 1); }],
    ["Resting heart rate (bpm)", function (b) { return fmt(b.hr); }],
    ["Blood pressure (mmHg) <span class='simtag'>Simulated</span>", function (b) { return num(b.sbp) == null ? "–" : fmt(b.sbp) + "/" + fmt(b.dbp); }],
    ["Mood (1–5)", function (b) { return fmt(b.mood, 1); }],
    ["Reaction time (ms) <span class='simtag'>Simulated</span>", function (b) { return fmt(b.rt); }],
    ["Standing heart-rate rise (bpm) <span class='simtag'>Simulated</span>", function (b) { return fmt(b.stand, 1); }]
  ];

  function pmIndex(c, i) {
    var dc = D().crew || [];
    for (var k = 0; k < dc.length; k++) if (c.source && dc[k].source === c.source) return k;
    return i;
  }

  function secBaseline(crew) {
    if (!crew.length) return "";
    var order = crew.slice().sort(function (a, b) { return (a.sex === "f" ? 0 : 1) - (b.sex === "f" ? 0 : 1); });
    var nf = order.filter(function (c) { return c.sex === "f"; }).length, nm = order.length - nf;
    var h = '<div class="c-tw"><table class="c-table"><thead><tr><th></th>' +
      (nf ? '<th colspan="' + nf + '" class="grp">Female</th>' : "") +
      (nm ? '<th colspan="' + nm + '" class="grp">Male</th>' : "") + "</tr><tr><th><span class=\"sr\">Measure</span></th>" +
      order.map(function (c) { return "<th>" + esc(c.name || c.id) + "</th>"; }).join("") + "</tr></thead><tbody>";
    ROWS.forEach(function (r) {
      h += "<tr><th>" + r[0] + "</th>" + order.map(function (c) { return "<td>" + r[1](c.base || {}) + "</td>"; }).join("") + "</tr>";
    });
    h += "</tbody></table></div>";
    h += '<div class="c-sparks">';
    order.forEach(function (c) {
      var idx = pmIndex(c, crew.indexOf(c));
      var pd = (D().crew || [])[idx];
      var vals = [];
      if (pd && pd.days) {
        pd.days.forEach(function (d) { if (num(d.sleep_min) != null && d.sleep_min > 0) vals.push(d.sleep_min / 60); });
        vals = vals.slice(-30);
      }
      h += '<div class="c-sp"><div class="c-sph"><b>' + esc(c.name || c.id) + '</b><span>median ' + fmt(median(vals), 1) + " h</span></div>" +
        sparkline(vals, c.name || c.id) + "</div>";
    });
    h += '</div><p class="c-src">Sleep (h), last 30 nights · shaded = middle half of nights ' + real("PMData (volunteers relabelled as crew)") + "</p>";
    return h;
  }

  function secSex(crew) {
    var f = crew.filter(function (c) { return c.sex === "f"; }), m = crew.filter(function (c) { return c.sex === "m"; });
    function a(list, k) { return avg(list.map(function (c) { return (c.base || {})[k]; })); }
    var rows = [["Sleep (h)", "sleep", 1], ["Resting heart rate (bpm)", "hr", 0], ["Systolic blood pressure (mmHg) <span class='simtag'>Simulated</span>", "sbp", 0],
      ["Mood (1–5)", "mood", 1], ["Reaction time (ms) <span class='simtag'>Simulated</span>", "rt", 0], ["Standing heart-rate rise (bpm) <span class='simtag'>Simulated</span>", "stand", 1]];
    var h = '<div class="c-tw"><table class="c-table c-fm"><thead><tr><th>Crew average</th><th>Female (' + f.length + ')</th><th>Male (' + m.length + ")</th></tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr><th>" + r[0] + "</th><td>" + fmt(a(f, r[1]), r[2]) + "</td><td>" + fmt(a(m, r[1]), r[2]) + "</td></tr>"; });
    h += "</tbody></table></div>";
    return h;
  }

  function i4Chart(an) {
    var tp = (D().samples && D().samples.inspiration4 && D().samples.inspiration4.timepoints) || [];
    var by = an.by_crew || {}, ids = Object.keys(by);
    if (!ids.length || tp.length < 2) return '<p class="c-note">No data.</p>';
    var series = ids.map(function (k) { return {name: k, values: tp.map(function (_, i) { return num((by[k] || [])[i]); })}; });
    var med = tp.map(function (_, i) { return median(ids.map(function (k) { return (by[k] || [])[i]; })); });
    series.push({name: "Median", values: med, emphasis: true});
    var rng = Array.isArray(an.range) && num(an.range[0]) != null && num(an.range[1]) != null ? an.range : null;
    var ri = -1;
    tp.forEach(function (t, i) { if (ri < 0 && /^R/.test(t)) ri = i; });
    var d = Math.max.apply(null, [0].concat(series.map(function (s) { return Math.max.apply(null, s.values.map(function (v) { return v == null ? 0 : Math.abs(v); })); })));
    var dp = d >= 100 ? 0 : d >= 10 ? 1 : 2;
    return slot("line", {series: series, labels: tp, unit: an.units || "", label: "Inspiration4 crew values over time",
      band: rng, endLabels: false, marks: ri > 0 ? [{x: ri - 0.5, label: "3 days in orbit"}] : [],
      fmt: function (v) { return fmt(v, dp); }}, "c-chart");
  }

  function secI4(root) {
    var i4 = D().samples && D().samples.inspiration4;
    if (!i4 || !i4.analytes) return '<p class="c-note">Inspiration4 data not loaded.</p>';
    var keys = Object.keys(i4.analytes);
    if (!keys.length) return "";
    if (keys.indexOf(i4Analyte) < 0) i4Analyte = keys[0];
    var NAMES = { glucose: "Glucose", calcium: "Calcium", wbc: "White blood cells", lymphocytes: "Lymphocytes" };
    var an = i4.analytes[i4Analyte];
    var h = '<div class="c-seg" role="group" aria-label="Choose a blood value">' + keys.map(function (k) {
      return '<button type="button" data-an="' + esc(k) + '" aria-pressed="' + (k === i4Analyte) + '">' + esc(NAMES[k] || k) + "</button>";
    }).join("") + "</div>";
    h += '<p class="c-note">' + esc(NAMES[i4Analyte] || i4Analyte) + " (" + esc(an.units || "") + ") · thin: " +
      Object.keys(an.by_crew || {}).length + ' crew · thick: median · shaded: reference range · L = days before launch, R = days after return</p>';
    h += '<div class="c-chartwrap">' + i4Chart(an) + "</div>";
    h += '<p class="c-src">' + real("NASA OSDR") + " " + esc(i4.source || "") + "</p>";
    return h;
  }

  function secEvidence() {
    var d = D(), out = [];
    var cv = d.curve;
    if (cv && cv.mean_rise_curve) {
      var t = cv.t || [], m = cv.mean_rise_curve, p25 = cv.p25_rise_curve || [], p75 = cv.p75_rise_curve || [];
      var zi = t.indexOf(0);
      var svg = slot("line", {values: m.map(num), name: "Mean rise", label: "Heart-rate rise on standing", unit: "bpm",
        labels: t.map(function (x) { return (x > 0 ? "+" : "") + x + " s"; }), yInclude: [0],
        xTicks: t.map(function (x, i) { return x % 60 === 0 ? i : -1; }).filter(function (i) { return i >= 0; }),
        bandSeries: p25.length === m.length && p75.length === m.length ? {lo: p25, hi: p75} : null,
        marks: zi >= 0 ? [{x: zi, label: "stand up"}] : [], fmt: function (v) { return fmt(v, 1); },
        tipNote: function (i) { return num(p25[i]) != null && num(p75[i]) != null ? "middle half " + fmt(p25[i], 1) + " to " + fmt(p75[i], 1) + " bpm" : ""; }}, "e-chart");
      out.push(card("Stand-up test", "<p><b class=\"e-big\">+" + fmt(cv.sustained_rise_median, 1) + " bpm</b> median sustained rise · 90th percentile +" +
        fmt(cv.sustained_rise_p90, 1) + " bpm · n = " + esc(cv.n_records) + "</p>" + svg +
        '<p class="c-note">Line: mean · shaded: 25th–75th percentile</p>', "PhysioNet CVES"));
    }
    var rl = d.samples && d.samples.radlab;
    if (rl && rl.modules && rl.modules.length) {
      var mods = rl.modules.slice().sort(function (a, b) { return b.mean_uGy_h - a.mean_uGy_h; });
      var bars = slot("hbars", {items: mods.map(function (r) { return {label: r.module, sub: r.instrument, value: r.mean_uGy_h}; }),
        unit: "µGy/h", name: "Dose rate", label: "Station radiation by module", fmt: function (v) { return fmt(v, 1); }}, "e-chart");
      out.push(card("Station radiation by module", '<p class="c-note">Mean absorbed dose rate, µGy/h · ' + esc(rl.query_window || "") + "</p>" + bars, "NASA OSDR RadLab"));
    }
    var iss = d.samples && d.samples.isslive_snapshot;
    if (iss) {
      var co = [["Node 3", iss.NODE3000003_ppCO2], ["US Lab", iss.USLAB000055_ppCO2]].filter(function (x) { return num(x[1]) != null; });
      var rows = slot("hbars", {items: co.map(function (x) { return {label: x[0], value: x[1], cls: x[1] > 3 ? "watch" : ""}; }),
        unit: "mmHg", name: "CO₂", max: 4, label: "Cabin CO₂ snapshot", threshold: {v: 3, cls: "watch", label: "limit 3 mmHg"},
        fmt: function (v) { return fmt(v, 2); }}, "e-chart");
      out.push(card("Cabin CO₂ snapshot", '<p class="c-note">Partial pressure, mmHg · mark: 3 mmHg NASA limit</p>' + rows +
        '<p class="c-note">Read ' + esc(iss.read || "") + "</p>", "ISS Live telemetry"));
    }
    var dk = d.samples && d.samples.donki;
    if (dk && dk.counts) {
      var NM = { RBE: "Radiation belt enhancements", CME: "Coronal mass ejections", GST: "Geomagnetic storms", Report: "Weekly reports", FLR: "Solar flares", SEP: "Solar energetic particles" };
      var li = slot("hbars", {items: Object.keys(dk.counts).map(function (k) { return {label: NM[k] || k, value: num(+dk.counts[k])}; }),
        name: "Notifications", label: "Space weather notifications by type", fmt: function (v) { return fmt(v); }}, "e-chart");
      out.push(card("Space weather", '<p class="c-note">Notifications, ' + esc(dk.window || "") + ".</p>" + li, "NASA DONKI"));
    }
    return out.length ? '<div class="e-grid">' + out.join("") + "</div>" : '<p class="c-note">No data.</p>';
  }

  function card(title, body, src) {
    return '<div class="e-card"><h4>' + esc(title) + "</h4>" + body + '<div class="e-src">' + real(src) + "</div></div>";
  }

  window.renderCompare = function (el, astra) {
    if (!el) return;
    var crew = (astra && Array.isArray(astra.crew)) ? astra.crew.filter(Boolean) : [];
    var h = "";
    h += '<div class="c-sec"><h3>Today</h3>' + secToday(crew) + "</div>";
    h += '<div class="c-sec"><h3>Own normal</h3>' + secBaseline(crew) + "</div>";
    h += '<div class="c-sec"><h3>Female / Male</h3>' + secSex(crew) + "</div>";
    h += '<div class="c-sec" id="cmpI4"><h3>Inspiration4 crew</h3><div class="c-i4">' + secI4() + "</div></div>";
    h += '<div class="c-sec"><h3>Reference data</h3>' + secEvidence() + "</div>";
    el.innerHTML = h;
    mountAll(el);
    var i4 = el.querySelector(".c-i4");
    if (i4) i4.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("button[data-an]") : null;
      if (!b) return;
      i4Analyte = b.getAttribute("data-an");
      i4.innerHTML = secI4();
      mountAll(i4);
    });
  };
})();

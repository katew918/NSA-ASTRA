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
    ["Every mission day", "90-second check, wearables, scheduled scans."],
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

  function sparkline(vals, w, h) {
    var v = vals.filter(function (x) { return num(x) != null; });
    if (v.length < 2) return '<p class="c-note">Not enough data.</p>';
    var lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
    if (hi === lo) { hi += 1; lo -= 1; }
    var pad = 3;
    function X(i) { return pad + i * (w - 2 * pad) / (v.length - 1); }
    function Y(x) { return pad + (hi - x) * (h - 2 * pad) / (hi - lo); }
    var pts = v.map(function (x, i) { return X(i).toFixed(1) + "," + Y(x).toFixed(1); }).join(" ");
    var m = median(v);
    return '<svg viewBox="0 0 ' + w + " " + h + '" class="c-spark" role="img" aria-label="Sleep hours, median ' + fmt(m, 1) + ' h">' +
      '<line x1="0" x2="' + w + '" y1="' + Y(m).toFixed(1) + '" y2="' + Y(m).toFixed(1) + '" class="s-med"/>' +
      '<polyline points="' + pts + '" class="s-line"/></svg>';
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
      (nm ? '<th colspan="' + nm + '" class="grp">Male</th>' : "") + "</tr><tr><th>Own normal</th>" +
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
        sparkline(vals, 160, 40) + "</div>";
    });
    h += '</div><p class="c-src">Sleep (h), last 30 nights · dashed = median ' + real("PMData (volunteers relabelled as crew)") + "</p>";
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
    var w = 560, hgt = 220, L = 46, R = 70, T = 12, B = 30;
    var tp = (D().samples && D().samples.inspiration4 && D().samples.inspiration4.timepoints) || [];
    var by = an.by_crew || {};
    var ids = Object.keys(by);
    var all = [];
    ids.forEach(function (k) { (by[k] || []).forEach(function (v) { if (num(v) != null) all.push(v); }); });
    var rng = Array.isArray(an.range) ? an.range : null;
    if (rng) all.push(rng[0], rng[1]);
    if (!all.length || tp.length < 2) return '<p class="c-note">No data.</p>';
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), padv = (hi - lo) * 0.08 || 1;
    lo -= padv; hi += padv;
    function X(i) { return L + i * (w - L - R) / (tp.length - 1); }
    function Y(v) { return T + (hi - v) * (hgt - T - B) / (hi - lo); }
    var s = '<svg viewBox="0 0 ' + w + " " + hgt + '" class="c-chart" role="img" aria-label="Inspiration4 crew values over time">';
    if (rng) {
      s += '<rect x="' + L + '" y="' + Y(rng[1]).toFixed(1) + '" width="' + (w - L - R) + '" height="' + (Y(rng[0]) - Y(rng[1])).toFixed(1) + '" class="i-band"/>';
      s += '<text x="' + (w - R + 4) + '" y="' + (Y(rng[1]) + 4).toFixed(1) + '" class="i-lbl">ref ' + rng[1] + "</text>";
      s += '<text x="' + (w - R + 4) + '" y="' + (Y(rng[0]) + 4).toFixed(1) + '" class="i-lbl">ref ' + rng[0] + "</text>";
    }
    var ticks = [lo + padv, (lo + hi) / 2, hi - padv];
    ticks.forEach(function (t) {
      s += '<text x="' + (L - 6) + '" y="' + (Y(t) + 4).toFixed(1) + '" class="i-ax" text-anchor="end">' + (Math.abs(t) >= 100 ? Math.round(t) : t.toFixed(1)) + "</text>";
    });
    var ri = -1;
    tp.forEach(function (t, i) { if (ri < 0 && /^R/.test(t)) ri = i; });
    if (ri > 0) {
      var xd = (X(ri - 1) + X(ri)) / 2;
      s += '<line x1="' + xd + '" x2="' + xd + '" y1="' + T + '" y2="' + (hgt - B) + '" class="i-div"/>';
      s += '<text x="' + (xd + 4) + '" y="' + (T + 10) + '" class="i-lbl">3 days in orbit</text>';
    }
    tp.forEach(function (t, i) { s += '<text x="' + X(i).toFixed(1) + '" y="' + (hgt - 10) + '" class="i-ax" text-anchor="middle">' + esc(t) + "</text>"; });
    ids.forEach(function (k) {
      var pts = (by[k] || []).map(function (v, i) { return num(v) == null ? null : X(i).toFixed(1) + "," + Y(v).toFixed(1); }).filter(Boolean).join(" ");
      s += '<polyline points="' + pts + '" class="i-crew"><title>' + esc(k) + "</title></polyline>";
    });
    var med = tp.map(function (_, i) { return median(ids.map(function (k) { return (by[k] || [])[i]; })); });
    var mp = med.map(function (v, i) { return v == null ? null : X(i).toFixed(1) + "," + Y(v).toFixed(1); }).filter(Boolean).join(" ");
    s += '<polyline points="' + mp + '" class="i-med"/>';
    med.forEach(function (v, i) { if (v != null) s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3" class="i-dot"/>'; });
    return s + "</svg>";
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
      var w = 240, hh = 90, all = m.concat(p25, p75).filter(function (x) { return num(x) != null; });
      var lo = Math.min.apply(null, all.concat([0])), hi = Math.max.apply(null, all);
      if (hi === lo) hi = lo + 1;
      var n = m.length;
      var X = function (i) { return 4 + i * (w - 8) / Math.max(1, n - 1); };
      var Y = function (v) { return 4 + (hi - v) * (hh - 18) / (hi - lo); };
      var band = "";
      if (p25.length === n && p75.length === n) {
        var top = [], bot = [];
        for (var i = 0; i < n; i++) { if (num(p75[i]) != null) top.push(X(i).toFixed(1) + "," + Y(p75[i]).toFixed(1)); }
        for (var j = n - 1; j >= 0; j--) { if (num(p25[j]) != null) bot.push(X(j).toFixed(1) + "," + Y(p25[j]).toFixed(1)); }
        band = '<polygon points="' + top.concat(bot).join(" ") + '" class="e-band"/>';
      }
      var line = m.map(function (v, i) { return num(v) == null ? null : X(i).toFixed(1) + "," + Y(v).toFixed(1); }).filter(Boolean).join(" ");
      var zi = t.indexOf(0), stand = zi >= 0 ? '<line x1="' + X(zi).toFixed(1) + '" x2="' + X(zi).toFixed(1) + '" y1="2" y2="' + (hh - 14) + '" class="e-div"/><text x="' + (X(zi) + 3).toFixed(1) + '" y="' + (hh - 3) + '" class="i-lbl">stand up</text>' : "";
      var svg = '<svg viewBox="0 0 ' + w + " " + hh + '" class="e-svg" role="img" aria-label="Heart-rate rise on standing">' + band +
        '<line x1="0" x2="' + w + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '" class="e-zero"/>' + stand +
        '<polyline points="' + line + '" class="e-line"/></svg>';
      out.push(card("Stand-up test", "<p><b class=\"e-big\">+" + fmt(cv.sustained_rise_median, 1) + " bpm</b> median sustained rise · 90th percentile +" +
        fmt(cv.sustained_rise_p90, 1) + " bpm · n = " + esc(cv.n_records) + "</p>" + svg +
        '<p class="c-note">Line: mean · shaded: 25th–75th percentile</p>', "PhysioNet CVES"));
    }
    var rl = d.samples && d.samples.radlab;
    if (rl && rl.modules && rl.modules.length) {
      var mods = rl.modules.slice().sort(function (a, b) { return b.mean_uGy_h - a.mean_uGy_h; });
      var mx = mods[0].mean_uGy_h || 1;
      var bars = mods.map(function (r) {
        return '<div class="e-bar"><span class="e-bl">' + esc(r.module) + " <i>" + esc(r.instrument) + '</i></span><span class="e-bt"><span style="width:' +
          (100 * r.mean_uGy_h / mx).toFixed(1) + '%"></span></span><span class="e-bv">' + fmt(r.mean_uGy_h, 1) + "</span></div>";
      }).join("");
      out.push(card("Station radiation by module", '<p class="c-note">Mean absorbed dose rate, µGy/h · ' + esc(rl.query_window || "") + "</p>" + bars, "NASA OSDR RadLab"));
    }
    var iss = d.samples && d.samples.isslive_snapshot;
    if (iss) {
      var co = [["Node 3", iss.NODE3000003_ppCO2], ["US Lab", iss.USLAB000055_ppCO2]].filter(function (x) { return num(x[1]) != null; });
      var lim = 3;
      var rows = co.map(function (x) {
        return '<div class="e-bar"><span class="e-bl">' + x[0] + '</span><span class="e-bt"><span style="width:' + Math.min(100, 100 * x[1] / 4).toFixed(1) +
          '%"></span><b class="e-lim" style="left:' + (100 * lim / 4) + '%"></b></span><span class="e-bv">' + fmt(x[1], 2) + "</span></div>";
      }).join("");
      out.push(card("Cabin CO₂ snapshot", '<p class="c-note">Partial pressure, mmHg · mark: 3 mmHg NASA limit</p>' + rows +
        '<p class="c-note">Read ' + esc(iss.read || "") + "</p>", "ISS Live telemetry"));
    }
    var dk = d.samples && d.samples.donki;
    if (dk && dk.counts) {
      var NM = { RBE: "Radiation belt enhancements", CME: "Coronal mass ejections", GST: "Geomagnetic storms", Report: "Weekly reports", FLR: "Solar flares", SEP: "Solar energetic particles" };
      var li = Object.keys(dk.counts).map(function (k) {
        return '<li><span>' + esc(NM[k] || k) + '</span><b>' + esc(dk.counts[k]) + "</b></li>";
      }).join("");
      out.push(card("Space weather", '<p class="c-note">Notifications, ' + esc(dk.window || "") + ".</p><ul class=\"e-list\">" + li + "</ul>", "NASA DONKI"));
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
    var i4 = el.querySelector(".c-i4");
    if (i4) i4.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("button[data-an]") : null;
      if (!b) return;
      i4Analyte = b.getAttribute("data-an");
      i4.innerHTML = secI4();
    });
  };
})();

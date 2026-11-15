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
    ["Training on Earth", "ASTRA learns each crew member's own normal: sleep, heart rate, mood, reflexes and six baseline scans."],
    ["Every mission day", "A 90-second check plus wearables, and guided scans on a NASA-style schedule (eyes day 30/120, neck 50/150, heart 90)."],
    ["Compare with their own normal", "Green: fine. Amber: worth a look. Red: needs attention."],
    ["Who sees it", "Mood stays private. Amber is shared only if the crew member chooses. Red safety items go to the flight surgeon automatically."]
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
      h += '</ol><p class="g-try">Try it: pick a crew member, pick a mission day, then press a ‘Simulate an issue’ button.</p>';
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

  function secToday(crew) {
    if (!crew.length) return "<p class=\"c-note\">No crew loaded.</p>";
    return '<div class="c-cards">' + crew.map(function (c) {
      var st = STATUS[c.status] ? c.status : "ok";
      return '<div class="c-card st-' + st + '"><div class="c-nm">' + esc(c.name || c.id) +
        ' <span class="c-sx">' + (c.sex === "f" ? "F" : c.sex === "m" ? "M" : "") + "</span></div>" +
        '<div class="c-rl">' + esc(c.role || "") + "</div>" +
        '<div class="c-st"><span class="c-dot"></span>' + STATUS[st] + "</div>" +
        (c.statusText ? '<p class="c-stt">' + esc(c.statusText) + "</p>" : "") + "</div>";
    }).join("") + "</div>";
  }

  var ROWS = [
    ["Sleep (h)", function (b) { return fmt(b.sleep, 1); }],
    ["Resting heart rate (bpm)", function (b) { return fmt(b.hr); }],
    ["Blood pressure (mmHg)", function (b) { return num(b.sbp) == null ? "–" : fmt(b.sbp) + "/" + fmt(b.dbp); }],
    ["Mood (1–5)", function (b) { return fmt(b.mood, 1); }],
    ["Reaction time (ms)", function (b) { return fmt(b.rt); }],
    ["Standing heart-rate rise (bpm)", function (b) { return fmt(b.stand, 1); }]
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
    h += '<p class="c-key">The same number can be normal for one person and a warning for another, so ASTRA compares each person with themselves.</p>';
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
    h += '</div><p class="c-src">Training sleep, last 30 nights with data. Line = nights, dashed = median. ' + real("PMData (volunteers relabelled as crew)") + "</p>";
    return h;
  }

  function secSex(crew) {
    var f = crew.filter(function (c) { return c.sex === "f"; }), m = crew.filter(function (c) { return c.sex === "m"; });
    function a(list, k) { return avg(list.map(function (c) { return (c.base || {})[k]; })); }
    var rows = [["Sleep (h)", "sleep", 1], ["Resting heart rate (bpm)", "hr", 0], ["Systolic blood pressure (mmHg)", "sbp", 0],
      ["Mood (1–5)", "mood", 1], ["Reaction time (ms)", "rt", 0], ["Standing heart-rate rise (bpm)", "stand", 1]];
    var h = '<div class="c-tw"><table class="c-table c-fm"><thead><tr><th>Crew average</th><th>Female (' + f.length + ')</th><th>Male (' + m.length + ")</th></tr></thead><tbody>";
    rows.forEach(function (r) { h += "<tr><th>" + r[0] + "</th><td>" + fmt(a(f, r[1]), r[2]) + "</td><td>" + fmt(a(m, r[1]), r[2]) + "</td></tr>"; });
    h += "</tbody></table></div>";
    h += '<p class="c-note">Four people is far too few to conclude anything about sex from this crew. Profiles are simulated <span class="simtag">Simulated</span>.</p>';
    h += '<h4>Published differences</h4><ul class="c-facts">' +
      "<li>NASA's career radiation limit is 600 mSv for everyone since 2022, regardless of sex and age; older limits were lower for women. <cite>NASA-STD-3001 Vol 1</cite></li>" +
      "<li>Feeling faint on standing after landing has been reported more often in women than in men. <cite>Waters et al., J Appl Physiol 2002</cite></li>" +
      "<li>Eye changes in flight (SANS) have been reported more often in men. <cite>Mark et al., J Women's Health 2014</cite></li>" +
      "<li>On Earth, clinical ranges differ by sex: haemoglobin about 12.0–15.5 g/dL (women) and 13.5–17.5 g/dL (men); resting heart rate tends to be a few beats higher in women. <cite>Clinical reference ranges</cite></li>" +
      "</ul>";
    h += '<p class="c-rule"><b>ASTRA’s rule:</b> own normal first; sex-specific ranges only set the outer reference band.</p>';
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
    h += '<p class="c-note">' + esc(NAMES[i4Analyte] || i4Analyte) + " (" + esc(an.units || "") + "). Thin lines: the " +
      Object.keys(an.by_crew || {}).length + ' crew members. Thick line: median. Shaded: clinical reference range. L = days before launch, R = days after return.</p>';
    h += '<div class="c-chartwrap">' + i4Chart(an) + "</div>";
    h += '<p class="c-src">' + real("NASA OSDR") + " " + esc(i4.source || "") + ". A real 3-day civilian flight: values move after return and settle back toward each person’s own level.</p>";
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
      out.push(card("Stand-up test", "<p><b class=\"e-big\">+" + fmt(cv.sustained_rise_median, 1) + " bpm</b> median sustained heart-rate rise; 90th percentile +" +
        fmt(cv.sustained_rise_p90, 1) + " bpm (n = " + esc(cv.n_records) + " records).</p>" + svg +
        '<p class="c-note">Line: mean rise. Shaded: middle half of people.</p>', "PhysioNet CVES"));
    }
    var rl = d.samples && d.samples.radlab;
    if (rl && rl.modules && rl.modules.length) {
      var mods = rl.modules.slice().sort(function (a, b) { return b.mean_uGy_h - a.mean_uGy_h; });
      var mx = mods[0].mean_uGy_h || 1;
      var bars = mods.map(function (r) {
        return '<div class="e-bar"><span class="e-bl">' + esc(r.module) + " <i>" + esc(r.instrument) + '</i></span><span class="e-bt"><span style="width:' +
          (100 * r.mean_uGy_h / mx).toFixed(1) + '%"></span></span><span class="e-bv">' + fmt(r.mean_uGy_h, 1) + "</span></div>";
      }).join("");
      out.push(card("Station radiation by module", '<p class="c-note">Mean absorbed dose rate, µGy/h, ' + esc(rl.query_window || "") +
        ". This is the dose at the module, not a person’s dose.</p>" + bars, "NASA OSDR RadLab"));
    }
    var iss = d.samples && d.samples.isslive_snapshot;
    if (iss) {
      var co = [["Node 3", iss.NODE3000003_ppCO2], ["US Lab", iss.USLAB000055_ppCO2]].filter(function (x) { return num(x[1]) != null; });
      var lim = 3;
      var rows = co.map(function (x) {
        return '<div class="e-bar"><span class="e-bl">' + x[0] + '</span><span class="e-bt"><span style="width:' + Math.min(100, 100 * x[1] / 4).toFixed(1) +
          '%"></span><b class="e-lim" style="left:' + (100 * lim / 4) + '%"></b></span><span class="e-bv">' + fmt(x[1], 2) + "</span></div>";
      }).join("");
      out.push(card("Cabin CO₂ snapshot", '<p class="c-note">Partial pressure, mmHg. Mark = 3 mmHg NASA limit.</p>' + rows +
        '<p class="c-note">Read ' + esc(iss.read || "") + (iss.note ? ". " + esc(iss.note) : "") + ".</p>", "ISS Live telemetry"));
    }
    var dk = d.samples && d.samples.donki;
    if (dk && dk.counts) {
      var NM = { RBE: "Radiation belt enhancements", CME: "Coronal mass ejections", GST: "Geomagnetic storms", Report: "Weekly reports", FLR: "Solar flares", SEP: "Solar energetic particles" };
      var li = Object.keys(dk.counts).map(function (k) {
        return '<li><span>' + esc(NM[k] || k) + '</span><b>' + esc(dk.counts[k]) + "</b></li>";
      }).join("");
      out.push(card("Space weather", '<p class="c-note">Notifications, ' + esc(dk.window || "") + ".</p><ul class=\"e-list\">" + li + "</ul>", "NASA DONKI"));
    }
    return out.length ? '<div class="e-grid">' + out.join("") + "</div>" : '<p class="c-note">No evidence data loaded.</p>';
  }

  function card(title, body, src) {
    return '<div class="e-card"><h4>' + esc(title) + "</h4>" + body + '<div class="e-src">' + real(src) + "</div></div>";
  }

  window.renderCompare = function (el, astra) {
    if (!el) return;
    var crew = (astra && Array.isArray(astra.crew)) ? astra.crew.filter(Boolean) : [];
    var h = "";
    h += '<div class="c-sec"><h3>Today across the crew</h3>' + secToday(crew) +
      '<p class="c-note">A Crew Dragon or Artemis crew is 4 people; the ISS usually holds 7 in total.</p></div>';
    h += '<div class="c-sec"><h3>Each person’s own normal</h3>' + secBaseline(crew) + "</div>";
    h += '<div class="c-sec"><h3>Female and male: what differs</h3>' + secSex(crew) + "</div>";
    h += '<div class="c-sec" id="cmpI4"><h3>Real crew reference: Inspiration4</h3><div class="c-i4">' + secI4() + "</div></div>";
    h += '<div class="c-sec"><h3>Evidence the checks are built on</h3>' + secEvidence() + "</div>";
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

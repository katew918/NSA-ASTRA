(function () {
  var F = window.FEEDS = {iss: {state: "loading"}, donki: {state: "loading"}, pfu: {state: "loading"}, pos: {state: "loading"}, rad: {state: "loading"}};

  function SM() { return (window.DATA && window.DATA.samples) || {}; }
  var pend = null;
  function changed(k) { if (pend) return; pend = setTimeout(function () { pend = null; try { if (window.renderData) window.renderData(); } catch (e) {} }, 300); }

  function get(url, text) {
    var ac = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ac) ac.abort(); }, 8000);
    return fetch(url, ac ? {signal: ac.signal} : {}).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return text ? r.text() : r.json(); }, function (e) { clearTimeout(t); throw e; });
  }

  function yearH(ts) { var y0 = Date.UTC(new Date().getUTCFullYear(), 0, 1); return (Date.now() - y0) / 36e5 - ts; }

  function startIss() {
    var got = false;
    setTimeout(function () { if (!got) { F.iss.state = "off"; changed("iss"); } }, 8000);
    function go() {
      try {
        var c = new LightstreamerClient("https://push.lightstreamer.com", "ISSLIVE");
        var sub = new Subscription("MERGE", ["NODE3000003", "USLAB000058", "USLAB000059"], ["TimeStamp", "Value"]);
        sub.addListener({onItemUpdate: function (u) {
          var v = parseFloat(u.getValue("Value")), n = u.getItemName(), ts = parseFloat(u.getValue("TimeStamp"));
          if (isNaN(v)) return;
          got = true; F.iss.state = "live"; F.iss.at = Date.now();
          if (n === "NODE3000003") { F.iss.co2 = v; F.iss.co2ts = ts; }
          if (n === "USLAB000058") { F.iss.p = v; F.iss.pts = ts; }
          if (n === "USLAB000059") { F.iss.t = v; F.iss.tts = ts; }
          try { var CONN = window.ASTRA_API && window.ASTRA_API.CONN; if (CONN) { CONN.iss = CONN.iss || {}; if (F.iss.co2 != null) { CONN.iss.co2 = F.iss.co2; CONN.iss.ageH = yearH(F.iss.co2ts); } CONN.iss.p = F.iss.p; CONN.iss.t = F.iss.t; } } catch (e) {}
          changed("iss");
        }});
        c.subscribe(sub); c.connect();
      } catch (e) { F.iss.state = "off"; changed("iss"); }
    }
    if (window.LightstreamerClient) go();
    else { var s = document.createElement("script"); s.src = "https://unpkg.com/lightstreamer-client-web@9.2.3/lightstreamer.min.js"; s.onload = go; s.onerror = function () { F.iss.state = "off"; changed("iss"); }; document.head.appendChild(s); }
  }
  F.issAgeH = function (ts) { return ts == null ? null : yearH(ts); };

  function donki() {
    var end = new Date(), st = new Date(Date.now() - 30 * 864e5), ymd = function (x) { return x.toISOString().slice(0, 10); };
    get("https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications?startDate=" + ymd(st) + "&endDate=" + ymd(end) + "&type=all").then(function (items) {
      F.donki = {state: "live", at: Date.now(), items: (Array.isArray(items) ? items : []).map(function (i) { return {time: i.messageIssueTime, type: i.messageType}; })};
      changed("donki");
    }).catch(function () { var sm = SM().donki || {}; F.donki = {state: "sample", items: sm.latest || [], window: sm.window, counts: sm.counts}; changed("donki"); });
  }

  function protons() {
    get("https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json").then(function (a) {
      var pts = (Array.isArray(a) ? a : []).filter(function (x) { return x.energy === ">=10 MeV" && typeof x.flux === "number"; }).map(function (x) { return {t: x.time_tag, v: x.flux}; });
      F.pfu = pts.length ? {state: "live", at: Date.now(), series: pts} : {state: "off"}; changed("pfu");
    }).catch(function () { F.pfu = {state: "off"}; changed("pfu"); });
  }

  function position() {
    get("https://api.wheretheiss.at/v1/satellites/25544").then(function (p) {
      F.pos = typeof p.latitude === "number" ? {state: "live", at: Date.now(), lat: p.latitude, lon: p.longitude, alt: p.altitude} : {state: "off"}; changed("pos");
    }).catch(function () { F.pos = {state: "off"}; changed("pos"); });
  }

  function radlab() {
    get("https://visualization.osdr.nasa.gov/radlab/api/?query=(timestamp%3E=2019-12-05)AND(timestamp%3C2019-12-05T01:00)&fields+=absorbed_dose_rate,module&format=csv", true)
      .then(function () { F.rad = {state: "live", at: Date.now(), modules: (SM().radlab || {}).modules || []}; changed("rad"); })
      .catch(function () { F.rad = {state: "sample", modules: (SM().radlab || {}).modules || []}; changed("rad"); });
  }

  function start() {
    startIss(); donki(); protons(); position(); radlab();
    setInterval(donki, 600000); setInterval(protons, 300000);
    setInterval(function () { if (!document.hidden && F.pos.state === "live") position(); }, 10000);
  }
  setTimeout(start, 0);
})();

(() => {
const NS = "http://www.w3.org/2000/svg";
const BODY = "M200 64C205.6 64 211 65.7 215.8 68.4C221.2 71.4 225.2 75.8 228.7 80.8C232.5 86.2 234.8 92.3 236.2 98.8C237.2 103.2 237.4 107.5 237.5 112C237.6 116.8 237.3 121.3 236.6 126C235.9 130.7 234.8 135 233.4 139.5C232.1 143.5 230.3 147.1 228.8 151C227.7 154 226.3 156.8 225.6 160C225 162.8 224.4 165.6 224.6 168.5C224.8 171.5 225.4 174.3 226.6 177C227.8 179.8 229.7 182.3 231.8 184.5C234.4 187.3 237.7 189 241 191C245.2 193.6 249.6 195.3 254 197.5C258.4 199.7 262.7 201.6 267 204C271.2 206.4 275.2 208.5 279 211.5C282.6 214.4 285.8 217.3 288.5 221C291.3 224.7 293.1 228.8 295 233C298 239.6 299.5 246.4 301.5 253.3C304.9 265.1 307.1 276.5 310 288.4C313.2 301.6 316.2 314 319.4 327.3C322 338.2 324.2 348.5 326.9 359.4C330.3 373.3 334.3 386.2 337.5 400.1C340.6 413.4 343 426 345.7 439.4C347.5 448.7 347.1 458.3 351.1 466.9C352.2 469.5 353.3 471.9 355 474.1C357.3 477.1 360.5 478.8 363.2 481.4C366.2 484.1 369 486.8 371.9 489.7C374.3 492.1 376.8 494.1 378.9 496.7C380.2 498.4 381.8 499.9 382.3 502C382.8 503.8 383.3 506.1 382.1 507.5C380.9 508.8 378.7 508.8 377 508.6C374.4 508.4 372.6 506.1 370.6 504.6C367.9 502.7 365.6 500.7 363.4 498.3C364.4 502.1 365.3 505.6 366.2 509.4C367.3 514.1 368.5 518.4 369.3 523.1C369.8 526.9 370.5 530.4 370.4 534.2C370.3 537.2 370.2 540.2 369.1 542.9C368.2 545.1 367.2 547.3 365.4 548.7C363.9 549.8 362.1 550.6 360.2 550.7C358 550.7 356.1 549.4 354.3 548.2C351.8 546.5 350.3 544 348.5 541.5C345.8 537.6 344.2 533.2 342.4 528.7C340.3 523.7 338.7 518.8 337.2 513.6C335.4 507.4 334.1 501.4 332.7 495.1C331.3 488.4 330.7 482 328.9 475.4C326.3 465.5 321.9 456.8 318.4 447.2C313.6 434.4 308.9 422.5 304.5 409.6C299.8 396.1 296.3 383.1 291.9 369.5C288.5 358.8 285 348.8 281.5 338.1C277.2 325.2 272.7 313.2 269.1 300.1C265.8 287.9 263.2 276.4 261 264C261.3 272.2 261.4 279.8 261.2 288C261 296.9 260.5 305.2 259.8 314C259.1 322.2 257.9 329.8 257.3 338C256.8 344.8 256.1 351.2 256.2 358C256.3 365.5 257 372.6 258 380C259.2 388.3 261.2 395.9 263 404C264.6 411.5 266.6 418.5 268 426C269.4 433.4 270.7 440.5 271.3 448C272.3 459.5 271.3 470.4 270.8 482C270 501.8 267.6 520.3 265.5 540C263.3 560.4 260.3 579.6 258 600C257 608.8 255.7 617.1 255.3 626C254.9 635.5 255.6 644.5 255.8 654C255.9 662.2 256.4 669.8 256.2 678C256 687.5 255.4 696.5 254.5 706C253.5 716.2 252.1 725.8 250.5 736C249.1 744.9 247.5 753.2 246 762C245.1 767.4 243.9 772.5 243.4 778C243 781.7 242.6 785.3 242.8 789C243 792.8 243.7 796.4 244.8 800C246.1 804.3 248.4 808 250.5 812C252.7 816.2 255.7 819.6 257.5 824C258.9 827.4 260.8 830.8 260.5 834.5C260.2 837.6 259 840.6 257 843C254.8 845.7 251.7 847.2 248.5 848.5C245.3 849.8 241.9 850.6 238.5 850.3C235.4 850 232.5 849 230 847.2C227.3 845.2 225.8 842.1 224.3 839C222.3 834.9 221.9 830.5 221 826C219.9 820.9 219.5 816.1 218.6 811C217.8 806.2 216.8 801.8 216 797C215.3 792.3 214.8 787.8 214.2 783C213.3 775.2 212.6 767.8 211.8 760C210.6 748.1 209.2 736.9 208.3 725C207.5 713.8 206.7 703.2 206.6 692C206.5 681.1 206.9 670.9 207.4 660C207.9 649.8 209 640.2 209.4 630C209.8 619.8 209.7 610.2 209.6 600C209.5 583 208.7 567 208.2 550C207.7 534.7 207.2 520.3 206.6 505C206.3 495.8 206.6 487.1 205.6 478C205.1 473.6 205.6 469.1 203.8 465C202.8 462.8 202.4 459 200 459C197.6 459 197.2 462.8 196.2 465C194.4 469.1 194.9 473.6 194.4 478C193.4 487.1 193.7 495.8 193.4 505C192.8 520.3 192.3 534.7 191.8 550C191.3 567 190.5 583 190.4 600C190.3 610.2 190.2 619.8 190.6 630C191 640.2 192.1 649.8 192.6 660C193.1 670.9 193.5 681.1 193.4 692C193.3 703.2 192.5 713.8 191.7 725C190.8 736.9 189.4 748.1 188.2 760C187.4 767.8 186.7 775.2 185.8 783C185.2 787.8 184.7 792.3 184 797C183.2 801.8 182.2 806.2 181.4 811C180.5 816.1 180.1 820.9 179 826C178.1 830.5 177.7 834.9 175.7 839C174.2 842.1 172.7 845.2 170 847.2C167.5 849 164.6 850 161.5 850.3C158.1 850.6 154.7 849.8 151.5 848.5C148.3 847.2 145.2 845.7 143 843C141 840.6 139.8 837.6 139.5 834.5C139.2 830.8 141.1 827.4 142.5 824C144.3 819.6 147.3 816.2 149.5 812C151.6 808 153.9 804.3 155.2 800C156.3 796.4 157 792.8 157.2 789C157.4 785.3 157 781.7 156.6 778C156.1 772.5 154.9 767.4 154 762C152.5 753.2 150.9 744.9 149.5 736C147.9 725.8 146.5 716.2 145.5 706C144.6 696.5 144 687.5 143.8 678C143.6 669.8 144.1 662.2 144.2 654C144.4 644.5 145.1 635.5 144.7 626C144.3 617.1 143 608.8 142 600C139.7 579.6 136.7 560.4 134.5 540C132.4 520.3 130 501.8 129.2 482C128.7 470.4 127.7 459.5 128.7 448C129.3 440.5 130.6 433.4 132 426C133.4 418.5 135.4 411.5 137 404C138.8 395.9 140.8 388.3 142 380C143 372.6 143.7 365.5 143.8 358C143.9 351.2 143.2 344.8 142.7 338C142.1 329.8 140.9 322.2 140.2 314C139.5 305.2 139 296.9 138.8 288C138.6 279.8 138.7 272.2 139 264C136.8 276.4 134.2 287.9 130.9 300.1C127.3 313.2 122.8 325.2 118.5 338.1C115 348.8 111.5 358.8 108.1 369.5C103.7 383.1 100.2 396.1 95.5 409.6C91.1 422.5 86.4 434.4 81.6 447.2C78.1 456.8 73.7 465.5 71.1 475.4C69.3 482 68.7 488.4 67.3 495.1C65.9 501.4 64.6 507.4 62.8 513.6C61.3 518.8 59.7 523.7 57.6 528.7C55.8 533.2 54.2 537.6 51.5 541.5C49.7 544 48.2 546.5 45.7 548.2C43.9 549.4 42 550.7 39.8 550.7C37.9 550.6 36.1 549.8 34.6 548.7C32.8 547.3 31.8 545.1 30.9 542.9C29.8 540.2 29.7 537.2 29.6 534.2C29.5 530.4 30.2 526.9 30.7 523.1C31.5 518.4 32.7 514.1 33.8 509.4C34.7 505.6 35.6 502.1 36.6 498.3C34.4 500.7 32.1 502.7 29.4 504.6C27.4 506.1 25.6 508.4 23 508.6C21.3 508.8 19.1 508.8 17.9 507.5C16.7 506.1 17.2 503.8 17.7 502C18.2 499.9 19.8 498.4 21.1 496.7C23.2 494.1 25.7 492.1 28.1 489.7C31 486.8 33.8 484.1 36.8 481.4C39.5 478.8 42.7 477.1 45 474.1C46.7 471.9 47.8 469.5 48.9 466.9C52.9 458.3 52.5 448.7 54.3 439.4C57 426 59.4 413.4 62.5 400.1C65.7 386.2 69.7 373.3 73.1 359.4C75.8 348.5 78 338.2 80.6 327.3C83.8 314 86.8 301.6 90 288.4C92.9 276.5 95.1 265.1 98.5 253.3C100.5 246.4 102 239.6 105 233C106.9 228.8 108.7 224.7 111.5 221C114.2 217.3 117.4 214.4 121 211.5C124.8 208.5 128.8 206.4 133 204C137.3 201.6 141.6 199.7 146 197.5C150.4 195.3 154.8 193.6 159 191C162.3 189 165.6 187.3 168.2 184.5C170.3 182.3 172.2 179.8 173.4 177C174.6 174.3 175.2 171.5 175.4 168.5C175.6 165.6 175 162.8 174.4 160C173.7 156.8 172.3 154 171.2 151C169.7 147.1 167.9 143.5 166.6 139.5C165.2 135 164.1 130.7 163.4 126C162.7 121.3 162.4 116.8 162.5 112C162.6 107.5 162.8 103.2 163.8 98.8C165.2 92.3 167.5 86.2 171.3 80.8C174.8 75.8 178.8 71.4 184.2 68.4C189 65.7 194.4 64 200 64Z";
const LABEL = {head: "Head", eyes: "Eyes", neck: "Neck", heart: "Heart", lungs: "Lungs", abdomen: "Abdomen", legs: "Legs"};
const WORDS = {ok: "OK", watch: "Amber, worth a look", urgent: "Red, needs attention"};
const RANK = {ok: 0, watch: 1, urgent: 2};
const F = "front", B = "back";
const ANCHORS = {head: [F, 200, 85], eyes: [F, 200, 121], neck: [F, 213, 173], heart: [F, 221, 266], abdomen: [F, 200, 372], lungs: [B, 228, 258], legs: [B, 169, 682]};
const PINS = {
  eye_r: [F, 187, 121], eye_l: [F, 213, 121], neck_l: [F, 212, 174], heart: [F, 219, 272], bladder: [F, 200, 436], shin_l: [F, 231, 705],
  brain: [F, 200, 85], pancreas: [F, 211, 330], core: [F, 200, 268],
  lung_r_low: [B, 228, 302], kidney_l: [B, 178, 350], heel_l: [B, 173, 812], calf_l: [B, 169, 690], popliteal_l: [B, 168, 628]
};
const FLIP_MS = 260;
let box = null, svg = null, grp = null, layer = null, views = null, mounted = null;
let pinOf = {}, sex = "", areas = [], levels = {}, isNew = {}, btns = {};
let view = F, flip = null, raf = 0, drag = {on: false, id: 0, x: 0, done: false};

const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(k => e.setAttribute(k, attrs[k])); if (parent) parent.appendChild(e); return e; };
const mirror = v => v === F ? "" : "translate(400 0) scale(-1 1)";

function mount(container) {
  if (mounted) return mounted;
  if (!container) return (mounted = Promise.resolve(false));
  box = container;
  svg = el("svg", {class: "b2d b3-canvas", viewBox: "0 0 400 900", role: "img", "aria-label": "Body figure", tabindex: "0"});
  grp = el("g", {}, svg);
  el("path", {class: "b2d-body", d: BODY}, grp);
  layer = document.createElement("div");
  layer.className = "b3-markers";
  views = document.createElement("div");
  views.className = "b2d-views";
  views.innerHTML = '<button class="b2d-view" aria-pressed="true" data-v="front" type="button">Front</button><button class="b2d-view" aria-pressed="false" data-v="back" type="button">Back</button>';
  box.appendChild(svg);
  box.appendChild(layer);
  box.appendChild(views);
  wire();
  if (window.ResizeObserver) new ResizeObserver(() => draw()).observe(box);
  sex = "f";
  setView(F, false);
  return (mounted = Promise.resolve(true));
}

function spot(key) { const ar = areas.find(x => x.key === key); return (ar && ar.pin && PINS[ar.pin.anchor]) || ANCHORS[key] || null; }

function setView(v, animate) {
  if (!svg) return;
  if (v !== F && v !== B) v = F;
  views.querySelectorAll(".b2d-view").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false"));
  if (!animate || (v === view && !flip)) { flip = null; view = v; grp.setAttribute("transform", mirror(v)); layer.style.visibility = ""; draw(); return; }
  flip = {from: view, to: v, t0: performance.now()};
  layer.style.visibility = "hidden";
  kick();
}

function kick() { if (!raf) raf = requestAnimationFrame(frame); }
function frame(now) {
  raf = 0;
  if (!flip) return;
  const t = Math.min(1, (now - flip.t0) / FLIP_MS), s = Math.max(0.001, Math.abs(Math.cos(t * Math.PI)));
  const v = t < 0.5 ? flip.from : flip.to;
  grp.setAttribute("transform", `translate(200 0) scale(${s.toFixed(4)} 1) translate(-200 0) ${mirror(v)}`);
  if (t < 1) { kick(); return; }
  view = flip.to; flip = null;
  grp.setAttribute("transform", mirror(view));
  layer.style.visibility = "";
  draw();
}

function update(data) {
  if (!svg || !data) return;
  sex = data.sex === "m" ? "m" : "f";
  areas = (data.areas || []).filter(a => a && LABEL[a.key]).map(a => ({key: a.key, label: a.label || LABEL[a.key], level: RANK[a.level] !== undefined ? a.level : "ok", fresh: !!a.fresh, pin: a.pin && a.pin.anchor ? {anchor: String(a.pin.anchor), label: String(a.pin.label || "")} : null}));
  const turn = [];
  areas.forEach(a => {
    const prev = levels[a.key], pk = a.pin ? a.pin.anchor + "|" + a.pin.label : "", moved = !!pk && pinOf[a.key] !== pk;
    pinOf[a.key] = pk;
    if (a.level === "ok") isNew[a.key] = false;
    else if (a.fresh || moved || (prev !== undefined && prev !== a.level)) { isNew[a.key] = true; turn.push(a); }
    else if (prev !== a.level) isNew[a.key] = false;
    levels[a.key] = a.level;
  });
  markers();
  svg.setAttribute("aria-label", "Body figure, front and back views. " + areas.map(a => `${a.label}: ${WORDS[a.level]}`).join(". ") + ".");
  if (turn.length) { turn.sort((x, y) => RANK[y.level] - RANK[x.level]); focus(turn[0].key); } else draw();
}

function markers() {
  const keys = areas.map(a => a.key);
  Object.keys(btns).forEach(k => { if (!keys.includes(k)) { btns[k].remove(); delete btns[k]; } });
  areas.forEach(a => {
    let b = btns[a.key];
    if (!b) { b = btns[a.key] = document.createElement("button"); b.type = "button"; b.dataset.spot = a.key; b.innerHTML = "<i></i>"; b.addEventListener("click", e => { e.stopPropagation(); const p = project(a.key); if (!p.front) focus(a.key); if (api.onPick) api.onPick(a.key, b.getBoundingClientRect()); }); layer.appendChild(b); }
    let lab = b.querySelector(".b3-lab");
    if (a.pin) { if (!lab) { lab = document.createElement("span"); lab.className = "b3-lab"; b.appendChild(lab); } if (lab.textContent !== a.pin.label) lab.textContent = a.pin.label; }
    else if (lab) lab.remove();
    b.setAttribute("aria-label", `${a.label}: ${WORDS[a.level]}${a.pin ? ` · ${a.pin.label}` : ""}`);
    b.dataset.level = a.level;
  });
}

function focus(key) { const s = spot(key); if (!svg || !s) return; setView(s[0], true); }
function reset() { setView(F, true); }

function project(key) {
  const s = spot(key);
  if (!s || !box || !svg) return {x: 0, y: 0, front: false};
  const br = box.getBoundingClientRect(), r = svg.getBoundingClientRect(), k = Math.min(r.width / 400, r.height / 900), ox = r.left - br.left + (r.width - 400 * k) / 2, oy = r.top - br.top + (r.height - 900 * k) / 2;
  const on = s[0] === view, x = on ? s[1] : 400 - s[1];
  return {x: ox + x * k, y: oy + s[2] * k, front: on};
}

function draw() {
  if (!svg || !box.clientWidth) return;
  areas.forEach(a => { const b = btns[a.key]; if (!b) return; const p = project(a.key);
    b.style.left = `${Math.round(p.x)}px`; b.style.top = `${Math.round(p.y)}px`;
    const c = `b3-mk ${a.level}${a.pin ? " pin" : ""}${p.front ? "" : " back"}${isNew[a.key] ? " new" : ""}`; if (b.className !== c) b.className = c; });
  if (api.onFrame) api.onFrame();
}

function wire() {
  views.addEventListener("click", e => { const b = e.target.closest(".b2d-view"); if (!b) return; e.stopPropagation(); setView(b.dataset.v, true); });
  svg.addEventListener("pointerdown", e => { if (e.button !== undefined && e.button !== 0) return; drag.on = true; drag.id = e.pointerId; drag.x = e.clientX; drag.done = false; try { svg.setPointerCapture(e.pointerId); } catch (x) {} });
  svg.addEventListener("pointermove", e => { if (!drag.on || e.pointerId !== drag.id || drag.done) return; if (Math.abs(e.clientX - drag.x) > 36) { drag.done = true; setView(view === F ? B : F, true); } });
  const end = e => { if (!drag.on || e.pointerId !== drag.id) return; drag.on = false; try { svg.releasePointerCapture(e.pointerId); } catch (x) {} };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  svg.addEventListener("dblclick", e => { e.preventDefault(); reset(); });
  svg.addEventListener("keydown", e => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); setView(view === F ? B : F, true); }
    else if (k === "Home" || k === "0") { e.preventDefault(); reset(); }
  });
}

function mini(container, list) {
  if (!container) return null;
  const old = container.querySelector(".b2d-mini"); if (old) old.remove();
  const issues = (list || []).filter(a => a && LABEL[a.key] && (a.level === "watch" || a.level === "urgent")).map(a => ({a, s: (a.pin && a.pin.anchor && PINS[a.pin.anchor]) || ANCHORS[a.key]}));
  const v = issues.length && issues.every(i => i.s[0] === B) ? B : F;
  const wrap = document.createElement("div");
  wrap.className = "b2d-mini";
  const sv = el("svg", {viewBox: "0 0 400 900", "aria-hidden": "true"});
  el("path", {class: "b2d-body", d: BODY, transform: mirror(v)}, sv);
  wrap.appendChild(sv);
  issues.forEach(({a, s}) => {
    const d = document.createElement("i");
    d.className = `b2d-dot ${a.level}`;
    const x = s[0] === v ? s[1] : 400 - s[1];
    d.style.left = `${(x / 4).toFixed(2)}%`; d.style.top = `${(s[2] / 9).toFixed(2)}%`;
    wrap.appendChild(d);
  });
  if (v === B) { const c = document.createElement("span"); c.className = "b2d-cap"; c.textContent = "Back"; wrap.appendChild(c); }
  const names = issues.map(i => i.a.label || LABEL[i.a.key]);
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", names.length ? `Body: ${names.join(", ")}` : "Body: no issues");
  container.appendChild(wrap);
  return wrap;
}

const api = window.ASTRABody = {
  mount, update, focus, reset, project, mini,
  onPick: null, onFrame: null,
  get active() { return !!svg; },
  get view() { return view; },
  render: () => draw()
};
})();

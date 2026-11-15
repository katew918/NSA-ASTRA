(() => {
const URL3 = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const LABEL = {head: "Head", eyes: "Eyes", neck: "Neck", heart: "Heart", lungs: "Lungs", abdomen: "Abdomen", legs: "Legs"};
const WORDS = {ok: "OK", watch: "Amber, worth a look", urgent: "Red, needs attention"};
const RANK = {ok: 0, watch: 1, urgent: 2};
const TILT = 18 * Math.PI / 180;
const CENTER = 3.6;
let T = null, box = null, canvas = null, layer = null, renderer = null, scene = null, camera = null, pivot = null, fig = null;
let meshes = {}, anchors = {}, pins = {}, pinOf = {}, sex = "", areas = [], levels = {}, isNew = {}, btns = {}, mounted = null;
const view = {yaw: -0.28, tilt: 0.05, vy: 0}, anim = {from: null, to: null, t0: 0, dur: 700}, drag = {on: false, id: 0, x: 0, y: 0, lx: 0, lt: 0, moved: 0};
let raf = 0, inertia = false, pieces = {};

const ease = t => 1 - Math.pow(1 - t, 3);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const clampT = v => Math.max(-TILT, Math.min(TILT, v));

function hasGL() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }

function mount(container) {
  if (mounted) return mounted;
  mounted = (async () => {
    if (!container || !hasGL()) return false;
    try { T = await import(URL3); } catch (e) { return false; }
    try { setup(container); build("f"); sex = "f"; return true; } catch (e) { teardown(); return false; }
  })();
  return mounted;
}

function teardown() { if (renderer) { try { renderer.dispose(); } catch (e) {} } if (canvas) canvas.remove(); if (layer) layer.remove(); renderer = null; canvas = null; layer = null; box = null; }

function setup(container) {
  box = container;
  renderer = new T.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  canvas = renderer.domElement;
  canvas.className = "b3-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Body figure");
  layer = document.createElement("div");
  layer.className = "b3-markers";
  box.appendChild(canvas);
  box.appendChild(layer);
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(26, 1, 0.1, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0xbfd3ea, 2.1));
  const key = new T.DirectionalLight(0xffffff, 1.1);
  key.position.set(-4, 7, 6);
  scene.add(key);
  const fill = new T.DirectionalLight(0xffffff, 0.45);
  fill.position.set(5, 2, 3);
  scene.add(fill);
  pivot = new T.Group();
  pivot.position.y = CENTER;
  scene.add(pivot);
  wire();
  new ResizeObserver(resize).observe(box);
  resize();
}

function resize() {
  if (!renderer || !box) return;
  const w = box.clientWidth, h = box.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const tv = Math.tan(13 * Math.PI / 180), dv = 7.2 / 0.82 / 2 / tv, dh = 3.4 / 0.82 / 2 / (tv * camera.aspect);
  camera.position.set(0, CENTER + 0.04, Math.max(dv, dh));
  camera.lookAt(0, CENTER, 0);
  camera.updateProjectionMatrix();
  draw();
}

const BASE = 0xdce9f7, TINT = {watch: 0xf3d27a, urgent: 0xf0a49b};
function piece(name, geo, pos, rz) {
  const m = new T.Mesh(geo, new T.MeshStandardMaterial({color: BASE, roughness: 0.7, metalness: 0}));
  m.position.copy(pos);
  if (rz) m.rotation.z = rz;
  fig.add(m);
  pieces[name] = m;
  return m;
}

function torsoGeo() {
  const top = SH.top, h = SH.th, bot = top - h, mid = (top + bot) / 2, w = SH.w, n = 2.35, pts = [];
  for (let i = 0; i <= 96; i++) {
    const a = -Math.PI / 2 + Math.PI * i / 96, c = Math.cos(a), sn = Math.sin(a);
    const e = sn > 0 ? 3.2 : n, y = mid + h / 2 * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / e);
    const k = (y - bot) / h, ww = w * (0.86 + 0.14 * Math.pow(k, 0.7));
    pts.push(new T.Vector2(Math.max(0.0001, ww * Math.pow(Math.max(0, c), 2 / e)), y - mid));
  }
  const g = new T.LatheGeometry(pts, 64);
  g.scale(1, 1, SH.zs);
  g.computeVertexNormals();
  return g;
}

const SH = {head: 0.55, hy: 6.6, top: 5.85, th: 2.6, w: 0.75, zs: 0.58, ar: 0.19, al: 2.3, atop: 5.62, agap: 0.13, tilt: 5 * Math.PI / 180, lr: 0.27, lgap: 0.12, ltop: 3.17};
function build() {
  if (fig) { pivot.remove(fig); fig.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
  pieces = {}; anchors = {}; pins = {};
  fig = new T.Group();
  fig.position.y = -CENTER;
  pivot.add(fig);
  const V = (x, y, z) => new T.Vector3(x, y, z || 0);
  piece("head", new T.SphereGeometry(SH.head, 64, 48), V(0, SH.hy));
  piece("torso", torsoGeo(), V(0, SH.top - SH.th / 2));
  const ax = SH.w + SH.agap + SH.ar, alen = SH.al - 2 * SH.ar;
  [1, -1].forEach(sd => {
    const dir = V(sd * Math.sin(SH.tilt), -Math.cos(SH.tilt)), c = V(sd * ax, SH.atop - SH.ar).addScaledVector(dir, alen / 2);
    piece(sd > 0 ? "armL" : "armR", new T.CapsuleGeometry(SH.ar, alen, 20, 56), c, sd * SH.tilt);
    const llen = SH.ltop - 2 * SH.lr;
    piece(sd > 0 ? "legL" : "legR", new T.CapsuleGeometry(SH.lr, llen, 20, 56), V(sd * (SH.lgap / 2 + SH.lr), SH.ltop / 2));
  });
  pivot.rotation.set(0, 0, 0);
  pivot.updateMatrixWorld(true);
  const ray = new T.Raycaster();
  const hit = (name, o, d) => { ray.set(o, d.clone().normalize()); const h = ray.intersectObject(pieces[name], false)[0]; return h ? fig.worldToLocal(h.point.clone()) : fig.worldToLocal(o.clone()); };
  const sph = d => V(0, SH.hy).addScaledVector(d.clone().normalize(), SH.head);
  anchors.head = {p: sph(V(0, 0.78, 0.62)), n: V(0, 0.78, 0.62).normalize()};
  anchors.eyes = {p: sph(V(0, 0, 1)), n: V(0, 0.05, 1).normalize()};
  const gy = (SH.hy - SH.head + SH.top) / 2;
  anchors.neck = {p: V(0.25, gy, 0.06), n: V(1, 0, 0.55).normalize()};
  const W = V;
  anchors.heart = {p: hit("torso", W(0.3, 5.12, 3), V(0, 0, -1)), n: V(0.25, 0.1, 1).normalize()};
  anchors.lungs = {p: hit("torso", W(-0.32, 5.12, -3), V(0, 0, 1)), n: V(-0.25, 0.1, -1).normalize()};
  anchors.abdomen = {p: hit("torso", W(0, 3.85, 3), V(0, 0, -1)), n: V(0, 0, 1)};
  const lx = SH.lgap / 2 + SH.lr;
  anchors.legs = {p: hit("legL", W(lx, 0.95, -3), V(0, 0, 1)), n: V(0.1, 0, -1).normalize()};
  const eye = (x, y) => { const d = V(x, y, 1).normalize(); return {p: sph(d), n: d.clone()}; };
  pins.eye_r = eye(-0.36, 0.08);
  pins.eye_l = eye(0.36, 0.08);
  pins.neck_l = {p: V(0.2, gy, 0.12), n: V(1, 0, 0.8).normalize()};
  pins.heart = {p: hit("torso", W(0.28, 4.95, 3), V(0, 0, -1)), n: V(0.25, 0.1, 1).normalize()};
  pins.lung_r_low = {p: hit("torso", W(-0.38, 4.45, -3), V(0, 0, 1)), n: V(-0.3, 0, -1).normalize()};
  pins.kidney_l = {p: hit("torso", W(0.33, 3.95, -3), V(0, 0, 1)), n: V(0.3, 0, -1).normalize()};
  pins.bladder = {p: hit("torso", W(0, 3.5, 3), V(0, 0, -1)), n: V(0, -0.1, 1).normalize()};
  pins.heel_l = {p: hit("legL", W(lx, 0.3, -3), V(0, 0, 1)), n: V(0, -0.2, -1).normalize()};
  pins.shin_l = {p: hit("legL", W(lx, 0.85, 3), V(0, 0, -1)), n: V(0.1, 0, 1).normalize()};
  pins.calf_l = {p: hit("legL", W(lx, 1.15, -3), V(0, 0, 1)), n: V(0.1, 0, -1).normalize()};
  tint();
}

const PART_OF = {head: "head", eyes: "head", heart: "torso", lungs: "torso", abdomen: "torso", legs: "legL"};
function tint() {
  const worst = {};
  areas.forEach(a => { const p = PART_OF[a.key]; if (p && RANK[a.level] > (RANK[worst[p]] || 0)) worst[p] = a.level; });
  const base = new T.Color(BASE);
  Object.keys(pieces).forEach(p => { const l = worst[p]; pieces[p].material.color.copy(base); if (l) pieces[p].material.color.lerp(new T.Color(TINT[l]), 0.45); });
}

function update(data) {
  if (!renderer || !data) return;
  const s = data.sex === "m" ? "m" : "f";
  areas = (data.areas || []).filter(a => LABEL[a.key]).map(a => ({key: a.key, label: a.label || LABEL[a.key], level: RANK[a.level] !== undefined ? a.level : "ok", fresh: !!a.fresh, pin: a.pin && a.pin.anchor && pins[a.pin.anchor] ? {anchor: a.pin.anchor, label: String(a.pin.label || "")} : null}));
  sex = s;
  tint();
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
  canvas.setAttribute("aria-label", "Body figure, drag or use arrow keys to turn. " + areas.map(a => `${a.label}: ${WORDS[a.level]}`).join(". ") + ".");
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

function spot(key) { const ar = areas.find(x => x.key === key); return ar && ar.pin ? pins[ar.pin.anchor] : anchors[key]; }
function facing(key) { const a = spot(key); if (!a) return 0; return wrap(Math.atan2(-a.n.x, a.n.z)); }
function focus(key) {
  if (!renderer || !spot(key)) return;
  const y = facing(key), tgt = view.yaw + wrap(y - view.yaw), tl = key === "head" ? 0.12 : key === "legs" ? -0.1 : 0.04;
  inertia = false; view.vy = 0;
  anim.from = {yaw: view.yaw, tilt: view.tilt}; anim.to = {yaw: tgt, tilt: clampT(tl)}; anim.t0 = performance.now(); anim.dur = 700;
  kick();
}
function reset() { if (!renderer) return; inertia = false; view.vy = 0; anim.from = {yaw: view.yaw, tilt: view.tilt}; anim.to = {yaw: Math.round(view.yaw / (2 * Math.PI)) * 2 * Math.PI - 0.28, tilt: 0.05}; anim.t0 = performance.now(); anim.dur = 600; kick(); }

function kick() { if (!raf) raf = requestAnimationFrame(frame); }
function frame(now) {
  raf = 0;
  let more = false;
  if (anim.to) {
    const t = Math.min(1, (now - anim.t0) / anim.dur), e = ease(t);
    view.yaw = anim.from.yaw + (anim.to.yaw - anim.from.yaw) * e; view.tilt = anim.from.tilt + (anim.to.tilt - anim.from.tilt) * e;
    if (t < 1) more = true; else anim.to = null;
  } else if (inertia && !drag.on) {
    view.yaw += view.vy; view.vy *= 0.92;
    if (Math.abs(view.vy) > 0.0006) more = true; else inertia = false;
  }
  draw();
  if (more) kick();
}

const tmp = () => new T.Vector3();
function project(key) {
  const a = spot(key);
  if (!a || !box || !camera) return {x: 0, y: 0, front: false};
  pivot.updateMatrixWorld(true);
  const p = fig.localToWorld(a.p.clone()), n = a.n.clone().transformDirection(fig.matrixWorld), v = tmp().subVectors(camera.position, p).normalize();
  const s = p.clone().project(camera), w = box.clientWidth, h = box.clientHeight;
  return {x: (s.x + 1) / 2 * w, y: (1 - s.y) / 2 * h, front: n.dot(v) >= 0};
}

function draw() {
  if (!renderer || !fig || !box.clientWidth) return;
  pivot.rotation.set(view.tilt, 0, 0);
  fig.rotation.set(0, view.yaw, 0);
  pivot.updateMatrixWorld(true);
  renderer.render(scene, camera);
  areas.forEach(a => { const b = btns[a.key]; if (!b) return; const p = project(a.key);
    b.style.left = `${Math.round(p.x)}px`; b.style.top = `${Math.round(p.y)}px`;
    const c = `b3-mk ${a.level}${a.pin ? " pin" : ""}${p.front ? "" : " back"}${isNew[a.key] ? " new" : ""}`; if (b.className !== c) b.className = c; });
  if (api.onFrame) api.onFrame();
}

function wire() {
  canvas.addEventListener("pointerdown", e => {
    if (e.button !== undefined && e.button !== 0) return;
    drag.on = true; drag.id = e.pointerId; drag.x = drag.lx = e.clientX; drag.y = e.clientY; drag.lt = performance.now(); drag.moved = 0;
    anim.to = null; inertia = false; view.vy = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
  });
  canvas.addEventListener("pointermove", e => {
    if (!drag.on || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.lx, dy = e.clientY - drag.y, now = performance.now(), dt = Math.max(8, now - drag.lt);
    drag.moved += Math.abs(dx);
    view.yaw += dx * 0.011;
    view.vy = view.vy * 0.4 + (dx * 0.011) * (16 / dt) * 0.6;
    if (e.pointerType !== "touch") { view.tilt = clampT(view.tilt + dy * 0.006); drag.y = e.clientY; }
    drag.lx = e.clientX; drag.lt = now;
    kick();
  });
  const end = e => {
    if (!drag.on || e.pointerId !== drag.id) return;
    drag.on = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (x) {}
    if (performance.now() - drag.lt < 90 && Math.abs(view.vy) > 0.002) { inertia = true; kick(); } else view.vy = 0;
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("dblclick", e => { e.preventDefault(); reset(); });
  canvas.addEventListener("keydown", e => {
    const k = e.key, step = 15 * Math.PI / 180;
    if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); const to = (anim.to ? anim.to.yaw : view.yaw) + (k === "ArrowLeft" ? -step : step); anim.from = {yaw: view.yaw, tilt: view.tilt}; anim.to = {yaw: to, tilt: view.tilt}; anim.t0 = performance.now(); anim.dur = 260; kick(); }
    else if (k === "ArrowUp" || k === "ArrowDown") { e.preventDefault(); view.tilt = clampT(view.tilt + (k === "ArrowUp" ? -0.08 : 0.08)); kick(); }
    else if (k === "Home" || k === "0") { e.preventDefault(); reset(); }
  });
}

const api = window.ASTRABody = {
  mount, update, focus, reset, project,
  onPick: null, onFrame: null,
  get active() { return !!renderer; },
  render: () => kick()
};
})();

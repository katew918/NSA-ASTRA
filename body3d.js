(() => {
const URL3 = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const LABEL = {head: "Head", eyes: "Eyes", neck: "Neck", heart: "Heart", lungs: "Lungs", abdomen: "Abdomen", legs: "Legs"};
const WORDS = {ok: "OK", watch: "Amber, worth a look", urgent: "Red, needs attention"};
const RANK = {ok: 0, watch: 1, urgent: 2};
const TILT = 18 * Math.PI / 180;
const CENTER = 0.88;
let T = null, box = null, canvas = null, layer = null, renderer = null, scene = null, camera = null, pivot = null, fig = null;
let meshes = {}, anchors = {}, sex = "", areas = [], levels = {}, isNew = {}, btns = {}, mounted = null;
const view = {yaw: -0.25, tilt: 0.05, vy: 0}, anim = {from: null, to: null, t0: 0, dur: 700}, drag = {on: false, id: 0, x: 0, y: 0, lx: 0, lt: 0, moved: 0};
let raf = 0, inertia = false;

const ease = t => 1 - Math.pow(1 - t, 3);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const clampT = v => Math.max(-TILT, Math.min(TILT, v));

function hasGL() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }

function mount(container) {
  if (mounted) return mounted;
  mounted = (async () => {
    if (!container || !hasGL()) return false;
    try { T = await import(URL3); } catch (e) { return false; }
    try { setup(container); return true; } catch (e) { teardown(); return false; }
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
  camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
  scene.add(new T.HemisphereLight(0xffffff, 0xc8d8ec, 1.55));
  const key = new T.DirectionalLight(0xffffff, 1.25);
  key.position.set(-2.2, 3.4, 3.2);
  scene.add(key);
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
  const tv = Math.tan(14 * Math.PI / 180), dv = 1.0 / tv, dh = 0.4 / (tv * camera.aspect);
  camera.position.set(0, CENTER + 0.04, Math.max(dv, dh));
  camera.lookAt(0, CENTER, 0);
  camera.updateProjectionMatrix();
  draw();
}

function bodyMat() { return new T.MeshStandardMaterial({color: 0xdce9f7, roughness: 0.6, metalness: 0, emissive: 0x000000, emissiveIntensity: 0}); }
let lineMat = null;
function outlineMat() {
  if (lineMat) return lineMat;
  lineMat = new T.MeshBasicMaterial({color: 0x4e86be, side: T.BackSide});
  lineMat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normal * 0.0085;"); };
  return lineMat;
}

function part(group, geo, name, pos, quat) {
  const m = new T.Mesh(geo, bodyMat());
  const o = new T.Mesh(geo, outlineMat());
  [m, o].forEach(x => { if (pos) x.position.copy(pos); if (quat) x.quaternion.copy(quat); group.add(x); });
  o.renderOrder = -1;
  (meshes[name] = meshes[name] || []).push(m);
  return m;
}
const ell = (rx, ry, rz) => { const g = new T.SphereGeometry(1, 48, 32); g.scale(rx, ry, rz); return g; };
const ball = r => new T.SphereGeometry(r, 36, 24);

function limb(group, name, a, b, radii, seg) {
  const dir = new T.Vector3().subVectors(b, a), len = dir.length(), n = 28, pts = [];
  const curve = new T.CatmullRomCurve3(radii.map((r, i) => new T.Vector3(r, i / (radii.length - 1), 0)));
  for (let i = 0; i <= n; i++) { const p = curve.getPoint(i / n); pts.push(new T.Vector2(Math.max(0.004, p.x), p.y * len)); }
  const g = new T.LatheGeometry(pts, seg || 36);
  const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
  part(group, g, name, a, q);
}

function build(s) {
  if (fig) { pivot.remove(fig); fig.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== lineMat) o.material.dispose(); }); }
  meshes = {}; anchors = {};
  fig = new T.Group();
  fig.position.y = -CENTER;
  pivot.add(fig);
  const f = s === "f", V = (x, y, z) => new T.Vector3(x, y, z || 0);
  const prof = f
    ? [[0.045, 1.53], [0.1, 1.505], [0.15, 1.47], [0.168, 1.42], [0.165, 1.36], [0.162, 1.3], [0.148, 1.24], [0.125, 1.15], [0.12, 1.1], [0.14, 1.02], [0.172, 0.95], [0.178, 0.9], [0.165, 0.86], [0.11, 0.83], [0.02, 0.815]]
    : [[0.05, 1.535], [0.12, 1.51], [0.18, 1.475], [0.2, 1.42], [0.195, 1.36], [0.185, 1.3], [0.172, 1.23], [0.158, 1.15], [0.152, 1.08], [0.155, 1.0], [0.16, 0.94], [0.158, 0.89], [0.145, 0.855], [0.09, 0.83], [0.02, 0.82]];
  const tc = new T.CatmullRomCurve3(prof.map(([r, y]) => new T.Vector3(r, y, 0)), false, "centripetal");
  const tp = tc.getPoints(64).reverse().map(p => new T.Vector2(Math.max(0.002, p.x), p.y));
  const torso = new T.LatheGeometry(tp, 64);
  torso.scale(1, 1, 0.6);
  part(fig, torso, "torso");
  const hip = f ? 0.17 : 0.152;
  part(fig, ell(hip * 0.96, 0.105, hip * 0.66), "pelvis", V(0, 0.9));
  part(fig, ell(0.085, 0.118, 0.1), "head", V(0, 1.632));
  part(fig, ell(0.018, 0.026, 0.02), "head", V(0, 1.618, 0.098));
  part(fig, ell(0.012, 0.024, 0.016), "head", V(0.084, 1.625, -0.004));
  part(fig, ell(0.012, 0.024, 0.016), "head", V(-0.084, 1.625, -0.004));
  limb(fig, "neck", V(0, 1.44), V(0, 1.585), [0.052, 0.047, 0.045, 0.046], 40);
  const sx = f ? 0.158 : 0.19, sy = f ? 1.425 : 1.43, ang = 11 * Math.PI / 180, ua = f ? 0.29 : 0.3, fa = f ? 0.245 : 0.26;
  [1, -1].forEach(side => {
    const sh = V(side * sx, sy), dv = V(side * Math.sin(ang), -Math.cos(ang)), el = sh.clone().addScaledVector(dv, ua), dv2 = V(side * Math.sin(ang * 0.7), -Math.cos(ang * 0.7), 0.06).normalize(), wr = el.clone().addScaledVector(dv2, fa);
    const r0 = f ? 0.044 : 0.054;
    part(fig, ball(r0), "arms", sh);
    limb(fig, "arms", sh, el, [r0, r0 * 0.93, r0 * 0.86, r0 * 0.74, r0 * 0.7]);
    part(fig, ball(r0 * 0.7), "arms", el);
    limb(fig, "arms", el, wr, [r0 * 0.7, r0 * 0.74, r0 * 0.64, r0 * 0.5, r0 * 0.46]);
    const hq = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dv2.clone().negate());
    part(fig, ell(f ? 0.019 : 0.022, f ? 0.068 : 0.075, f ? 0.038 : 0.043), "arms", wr.clone().addScaledVector(dv2, 0.06), hq);
    const lx = side * (f ? 0.092 : 0.088), hp = V(lx, 0.9), kn = V(side * 0.075, 0.485), an = V(side * 0.07, 0.085);
    const t0 = f ? 0.098 : 0.09;
    part(fig, ball(t0 * 0.92), "legs", hp);
    limb(fig, "legs", hp, kn, [t0, t0 * 0.97, t0 * 0.86, t0 * 0.7, t0 * 0.58]);
    part(fig, ball(t0 * 0.58), "legs", kn);
    limb(fig, "legs", kn, an, [t0 * 0.56, t0 * 0.64, t0 * 0.6, t0 * 0.44, t0 * 0.34, t0 * 0.33]);
    part(fig, ball(t0 * 0.34), "legs", an);
    part(fig, ell(f ? 0.036 : 0.04, 0.034, f ? 0.1 : 0.11), "legs", V(side * 0.07, 0.035, 0.045));
  });
  const ray = new T.Raycaster(), hit = (name, o, d) => { ray.set(o, d.clone().normalize()); const h = ray.intersectObjects(meshes[name], false)[0]; return h ? h.point.clone() : o.clone(); };
  pivot.rotation.set(0, 0, 0);
  pivot.updateMatrixWorld(true);
  const toLocal = p => fig.worldToLocal(p);
  const A = (key, name, o, d, n) => { anchors[key] = {p: toLocal(hit(name, V(o[0], o[1], o[2]), V(...d))), n: V(...n).normalize()}; };
  A("head", "head", [0, 2.4, 0.42], [0, -1, -0.55], [0, 0.85, 0.5]);
  A("eyes", "head", [0.034, 1.64, 1], [0, 0, -1], [0.15, 0.05, 1]);
  A("neck", "neck", [1, 1.5, 0.008], [-1, 0, 0], [1, 0, 0.15]);
  A("heart", "torso", [0.065, 1.31, 1], [0, 0, -1], [0.25, 0.1, 1]);
  A("lungs", "torso", [-0.075, 1.34, -1], [0, 0, 1], [-0.2, 0.1, -1]);
  A("abdomen", "torso", [0, 1.06, 1], [0, 0, -1], [0, 0, 1]);
  A("legs", "legs", [0.073, 0.36, -1], [0, 0, 1], [0.1, 0, -1]);
  tint();
}

const PART_OF = {head: ["head"], eyes: ["head"], neck: ["neck"], heart: ["torso"], lungs: ["torso"], abdomen: ["pelvis"], legs: ["legs"]};
function tint() {
  const worst = {};
  areas.forEach(a => PART_OF[a.key] && PART_OF[a.key].forEach(p => { if (RANK[a.level] > (RANK[worst[p]] || 0)) worst[p] = a.level; }));
  Object.keys(meshes).forEach(p => meshes[p].forEach(m => { const l = worst[p]; m.material.emissive.set(l === "urgent" ? 0xd92d20 : l === "watch" ? 0xe0a100 : 0x000000); m.material.emissiveIntensity = l === "urgent" ? 0.26 : l === "watch" ? 0.2 : 0; }));
}

function update(data) {
  if (!renderer || !data) return;
  const s = data.sex === "m" ? "m" : "f";
  areas = (data.areas || []).filter(a => LABEL[a.key]).map(a => ({key: a.key, label: a.label || LABEL[a.key], level: RANK[a.level] !== undefined ? a.level : "ok", fresh: !!a.fresh}));
  if (s !== sex) { sex = s; build(s); } else tint();
  const turn = [];
  areas.forEach(a => {
    const prev = levels[a.key];
    if (a.level === "ok") isNew[a.key] = false;
    else if (a.fresh || (prev !== undefined && prev !== a.level)) { isNew[a.key] = true; turn.push(a); }
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
    b.setAttribute("aria-label", `${a.label}: ${WORDS[a.level]}`);
    b.dataset.level = a.level;
  });
}

function facing(key) { const a = anchors[key]; if (!a) return 0; return wrap(Math.atan2(-a.n.x, a.n.z)); }
function focus(key) {
  if (!renderer || !anchors[key]) return;
  const y = facing(key), tgt = view.yaw + wrap(y - view.yaw), tl = key === "head" ? 0.12 : key === "legs" ? -0.1 : 0.04;
  inertia = false; view.vy = 0;
  anim.from = {yaw: view.yaw, tilt: view.tilt}; anim.to = {yaw: tgt, tilt: clampT(tl)}; anim.t0 = performance.now(); anim.dur = 700;
  kick();
}
function reset() { if (!renderer) return; inertia = false; view.vy = 0; anim.from = {yaw: view.yaw, tilt: view.tilt}; anim.to = {yaw: Math.round(view.yaw / (2 * Math.PI)) * 2 * Math.PI - 0.25, tilt: 0.05}; anim.t0 = performance.now(); anim.dur = 600; kick(); }

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
  const a = anchors[key];
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
    const c = `b3-mk ${a.level}${p.front ? "" : " back"}${isNew[a.key] ? " new" : ""}`; if (b.className !== c) b.className = c; });
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

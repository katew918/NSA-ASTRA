(() => {
const NS = "http://www.w3.org/2000/svg";
const BODY = "M197 70C200 69 200 69 203 70C205 70 209 70 211 71C213 72 214 72 217 73C219 74 221 75 224 77C226 79 230 83 232 85C233 87 233 88 234 90C235 92 235 93 236 96C236 98 236 100 237 106C237 111 237 121 237 128C236 134 236 139 235 143C234 147 233 151 232 154C231 157 230 159 228 161C226 163 224 166 223 168C221 170 221 170 221 172C221 173 221 177 221 179C221 180 221 177 221 179C221 181 221 187 222 189C222 191 223 192 225 193C226 193 226 194 228 194C230 194 232 194 236 194C239 194 243 192 248 192C252 192 260 192 264 193C268 193 269 194 271 195C273 195 275 196 276 197C277 198 278 199 279 200C279 200 279 200 280 202C280 204 279 208 280 210C280 212 281 214 282 216C283 218 282 220 284 224C286 227 291 235 293 240C295 244 296 246 297 250C298 254 299 260 300 266C301 271 301 280 302 285C303 289 303 290 304 294C305 297 306 299 308 303C310 307 316 314 318 318C320 321 320 320 321 323C321 325 322 329 322 331C323 332 322 332 324 334C325 335 328 338 330 341C331 343 332 345 333 348C334 350 335 353 336 358C337 363 338 372 340 378C341 383 342 388 344 394C345 399 348 404 350 409C351 413 353 415 355 418C356 421 357 423 358 427C358 430 358 438 359 441C359 444 358 441 360 443C361 445 367 449 369 452C371 454 371 456 374 459C376 462 382 469 385 472C387 475 387 475 387 476C387 477 387 478 387 479C387 479 387 479 386 480C385 480 384 480 383 480C381 480 380 481 379 482C378 482 378 482 378 483C377 484 377 484 377 486C376 487 376 489 377 490C377 491 376 491 378 494C379 496 382 503 384 505C385 508 384 508 385 509C385 510 384 510 384 511C384 512 383 512 382 513C381 514 379 515 378 516C376 516 375 518 375 519C374 519 375 519 373 520C370 520 364 520 361 520C357 519 356 517 354 517C351 516 349 516 348 516C346 515 346 515 346 514C345 513 345 514 344 510C342 505 339 493 338 488C336 482 334 481 333 478C331 476 331 475 331 473C330 470 329 467 329 464C329 461 329 456 329 453C329 450 329 450 328 448C327 446 324 442 323 439C322 436 322 435 322 433C321 430 321 425 321 422C320 419 319 416 318 414C317 411 319 413 316 408C313 403 304 390 300 384C296 378 295 376 294 372C292 368 291 366 290 362C289 357 290 352 289 347C287 342 282 338 281 332C279 327 278 319 277 314C276 309 275 307 273 303C271 299 267 293 265 290C263 287 263 286 262 285C260 284 259 282 258 282C256 281 256 281 255 281C254 280 253 280 253 281C252 281 251 281 251 282C250 282 248 283 247 286C246 289 246 293 247 300C247 306 247 314 250 327C253 339 260 365 262 374C264 383 263 378 264 380C265 382 267 384 268 386C269 388 270 392 270 394C271 395 271 394 271 396C271 398 270 405 270 407C270 409 271 410 272 411C272 411 272 411 274 413C275 414 279 415 281 417C283 419 283 419 284 423C285 426 287 431 288 436C289 440 290 446 290 452C291 458 291 466 291 473C290 480 289 488 288 494C287 501 287 504 285 512C283 519 278 532 276 539C274 546 274 548 274 552C274 556 274 559 275 563C275 568 278 574 278 579C279 583 277 588 278 591C278 594 278 594 279 595C279 596 280 598 281 600C282 601 282 601 283 606C284 610 286 622 286 629C287 635 286 642 286 647C286 651 286 651 285 656C284 661 283 669 282 676C281 683 278 693 277 699C276 705 276 708 276 712C275 716 275 717 276 722C276 726 277 735 278 740C278 745 279 748 280 752C281 756 283 761 285 765C286 768 289 772 290 775C291 778 292 780 292 782C292 783 292 784 292 786C292 787 291 788 291 790C291 791 291 794 292 795C292 796 292 796 293 797C293 798 295 799 297 801C299 803 303 805 305 807C306 809 307 811 307 812C307 813 307 814 307 816C307 817 306 818 306 820C305 821 305 821 304 822C302 823 301 824 299 825C297 825 294 825 291 826C287 827 282 829 279 830C275 830 273 830 271 830C268 830 266 829 265 829C263 828 262 826 261 826C260 825 260 826 260 823C260 820 260 812 259 808C258 803 255 797 255 794C254 790 255 787 255 784C254 781 253 779 253 776C252 772 253 766 253 765C253 763 253 766 254 764C254 762 254 754 254 752C253 749 253 752 253 751C253 750 254 748 253 743C253 738 251 729 250 721C249 713 247 703 245 694C242 684 237 673 235 666C233 658 232 653 231 649C230 645 230 644 230 640C230 635 231 625 231 620C231 614 229 612 229 609C228 606 229 606 228 604C228 602 226 598 226 595C225 592 225 589 226 584C227 579 229 569 230 563C230 557 230 554 230 549C229 544 229 540 227 533C225 526 222 514 220 508C218 502 218 500 218 497C217 493 217 493 217 489C216 485 217 478 217 475C216 472 216 472 215 471C214 470 213 469 212 468C210 467 208 467 207 468C205 468 204 468 202 469C200 469 198 469 197 469C195 468 194 468 193 468C192 467 189 467 188 468C187 469 185 470 185 471C184 472 183 472 183 475C183 478 183 485 183 489C183 493 183 493 182 497C181 500 181 502 180 508C178 514 174 526 173 533C171 540 170 544 170 549C170 554 169 557 170 563C171 569 173 579 174 584C174 589 174 592 174 595C174 598 172 602 172 604C171 606 172 606 171 609C171 612 169 616 169 620C168 623 168 626 169 628C169 631 170 631 170 635C170 638 169 644 169 649C168 654 167 658 165 666C162 673 157 686 155 694C153 701 153 701 152 709C150 717 147 734 147 743C146 752 146 760 146 764C146 768 146 763 147 765C147 766 147 772 147 776C147 779 145 781 145 784C145 787 146 790 145 794C144 797 141 803 141 808C140 812 140 820 140 823C139 826 139 825 139 826C138 826 137 827 137 828C136 828 136 828 135 829C134 829 131 830 129 830C127 830 124 830 121 830C118 829 112 827 109 826C106 825 103 825 101 825C98 824 97 823 96 822C95 821 95 821 94 820C93 818 93 817 93 816C92 814 92 813 93 812C93 811 93 809 95 807C97 805 101 803 103 801C105 799 106 798 107 797C108 796 108 796 108 795C108 794 109 791 109 790C108 788 108 787 108 786C107 784 107 783 108 782C108 780 108 778 110 775C111 772 113 768 115 765C117 761 118 756 120 752C121 748 121 745 122 740C123 735 124 726 124 722C124 717 124 716 124 712C124 708 124 705 123 699C121 693 119 683 118 676C116 669 115 661 115 656C114 651 114 651 114 647C113 642 113 635 114 629C114 622 116 610 117 606C117 601 118 601 119 600C119 598 120 596 121 595C122 594 122 594 122 591C122 588 121 583 122 579C122 574 124 568 125 563C126 559 126 556 126 552C125 548 125 546 124 539C122 532 117 519 115 512C113 504 113 501 112 494C111 488 109 480 109 473C109 466 109 458 110 452C110 446 111 440 112 436C113 431 114 426 116 423C117 419 117 419 119 417C120 415 125 413 127 412C128 411 129 409 129 409C130 408 130 409 130 407C130 404 129 399 129 396C129 394 130 393 130 392C131 390 131 389 132 386C133 383 135 381 138 375C140 369 143 356 145 348C147 340 148 335 150 329C151 323 151 319 152 315C153 310 153 304 154 300C154 295 153 289 153 287C153 284 153 285 152 284C151 283 150 282 149 281C148 280 149 281 148 281C147 281 144 280 143 281C141 282 139 284 138 286C136 287 136 287 135 290C133 292 129 299 127 303C125 307 124 309 123 314C121 319 121 327 119 332C117 338 113 343 111 347C110 352 111 355 110 359C109 363 108 368 106 372C104 376 103 378 100 384C96 390 87 403 84 408C81 413 82 411 82 414C81 416 80 419 79 422C78 425 78 430 78 433C78 435 78 436 77 439C76 442 73 446 72 448C71 450 71 450 71 453C70 456 71 461 71 464C70 467 70 470 69 473C68 475 68 476 67 478C66 481 64 482 62 488C60 493 57 505 56 510C55 514 55 513 54 514C53 515 53 515 52 516C51 516 48 516 46 517C44 517 42 519 39 520C36 520 29 520 27 520C25 519 26 519 25 519C24 518 23 516 22 516C21 515 19 514 18 513C16 512 16 512 16 511C15 510 15 510 15 509C15 508 15 508 16 505C17 503 21 496 22 494C23 491 23 491 23 490C23 489 23 487 23 486C23 484 22 484 22 483C22 482 21 482 21 482C20 481 18 480 17 480C16 480 15 480 15 480C14 480 13 479 13 479C12 478 12 477 13 476C13 475 12 477 14 474C16 472 22 465 25 461C27 457 29 454 31 452C32 449 33 449 34 448C35 447 35 448 36 447C37 446 39 444 40 443C41 442 41 444 41 441C41 438 41 430 42 427C43 423 44 421 45 418C46 415 48 413 50 409C52 404 54 399 56 394C58 388 59 383 60 378C61 372 62 363 64 358C65 353 65 350 67 348C68 345 68 343 70 341C72 338 75 335 76 334C77 332 77 332 78 331C78 329 78 325 79 323C80 320 79 321 82 318C84 314 89 307 92 303C94 299 95 297 96 294C97 290 97 289 98 285C98 280 99 271 100 266C100 260 101 254 103 250C104 246 104 244 107 240C109 235 114 227 116 224C117 220 115 223 116 221C117 218 119 213 120 210C121 207 120 204 120 202C120 200 120 200 121 200C122 199 122 198 124 197C125 196 127 195 129 195C131 194 132 193 136 193C139 192 147 192 152 192C157 192 161 194 164 194C167 194 170 194 172 194C173 194 174 193 175 193C176 192 177 191 178 189C179 187 178 181 179 179C179 177 179 180 179 179C179 177 179 173 179 172C178 170 178 170 177 168C176 166 173 163 172 161C170 159 169 157 168 154C166 151 165 147 165 143C164 139 163 134 163 128C163 121 163 111 163 106C163 100 163 99 164 96C165 93 166 90 167 88C167 85 168 85 170 83C171 82 172 80 174 79C176 77 177 76 179 75C181 74 183 73 186 72C189 71 194 70 197 70Z";
const LABEL = {head: "Head", eyes: "Eyes", neck: "Neck", heart: "Heart", lungs: "Lungs", abdomen: "Abdomen", legs: "Legs"};
const WORDS = {ok: "OK", watch: "Amber, worth a look", urgent: "Red, needs attention"};
const RANK = {ok: 0, watch: 1, urgent: 2};
const F = "front", B = "back";
const ANCHORS = {head: [F, 200, 104], eyes: [F, 200, 131], neck: [F, 214, 182], heart: [F, 222, 262], abdomen: [F, 200, 362], lungs: [B, 226, 262], legs: [B, 142, 678]};
const PINS = {
  eye_r: [F, 187, 131], eye_l: [F, 213, 131], neck_l: [F, 212, 184], heart: [F, 219, 272], bladder: [F, 200, 444], shin_l: [F, 262, 690],
  brain: [F, 200, 86], pancreas: [F, 213, 318], core: [F, 200, 262],
  lung_r_low: [B, 224, 300], kidney_l: [B, 180, 338], heel_l: [B, 126, 818], calf_l: [B, 141, 662], popliteal_l: [B, 147, 606]
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

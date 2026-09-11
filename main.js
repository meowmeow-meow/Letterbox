import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import LOVE_LETTERS from './letters-data.js';
import THEMES from './themes.js';

/* ------------------------------------------------------------------ */
/*  Basic scene setup                                                  */
/* ------------------------------------------------------------------ */

const container = document.getElementById('scene-container');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.7, 6.2);
camera.lookAt(0, 1.1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

// soft studio-style environment reflections — no external HDRI needed,
// this is what gives the pastel plastic/paper surfaces a believable sheen
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();

// gentle bloom for a soft, dreamy "cute" glow — kept subtle on purpose
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.35,  // strength
  0.6,   // radius
  0.82   // threshold
);
composer.addPass(bloomPass);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

/* Lighting — soft, pastel, no harsh shadows */
const hemi = new THREE.HemisphereLight(0xfff0fa, 0xd7c8ff, 0.85);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(3, 6, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.radius = 4;
keyLight.shadow.bias = -0.0015;
scene.add(keyLight);

const rim = new THREE.PointLight(0xffc2e6, 0.7, 12);
rim.position.set(-3, 2, -2);
scene.add(rim);

const fill = new THREE.PointLight(0xbfe8ff, 0.4, 12);
fill.position.set(2, 1, -3);
scene.add(fill);

/* ------------------------------------------------------------------ */
/*  Small procedural textures (no external image assets needed)        */
/* ------------------------------------------------------------------ */

function makeGrainTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 195 + Math.random() * 60;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}
const grainTex = makeGrainTexture();

function makeGlowSpriteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowSpriteTexture();

/* ------------------------------------------------------------------ */
/*  Small tween helper (no external library needed)                   */
/* ------------------------------------------------------------------ */

const activeTweens = [];
function tween(duration, onUpdate, onComplete, easing = easeOutCubic) {
  const start = performance.now();
  const entry = { start, duration, onUpdate, onComplete, easing, done: false };
  activeTweens.push(entry);
  return entry;
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) { const c = 1.7; return 1 + c * Math.pow(t - 1, 3) + Math.pow(t - 1, 2) * -c; }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

function tickTweens(now) {
  for (let i = activeTweens.length - 1; i >= 0; i--) {
    const t = activeTweens[i];
    const raw = Math.min(1, (now - t.start) / t.duration);
    const eased = t.easing(raw);
    t.onUpdate(eased, raw);
    if (raw >= 1 && !t.done) {
      t.done = true;
      if (t.onComplete) t.onComplete();
      activeTweens.splice(i, 1);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Palette                                                             */
/* ------------------------------------------------------------------ */

const PALETTE = {
  pink: 0xffc9e3,
  pinkDeep: 0xff9cc7,
  blue: 0xb9ddff,
  blueDeep: 0x8fc4ff,
  cyan: 0xaef2e8,
  cyanDeep: 0x7fe0d1,
  purple: 0xdcc6ff,
  purpleDeep: 0xb98cff,
  cream: 0xfff6ef,
  ink: 0x5c4b7a
};

/* ------------------------------------------------------------------ */
/*  Ground                                                              */
/* ------------------------------------------------------------------ */

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(9, 48),
  new THREE.MeshPhysicalMaterial({ color: 0xf3e9ff, roughness: 0.9, clearcoat: 0.15, clearcoatRoughness: 0.6 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ------------------------------------------------------------------ */
/*  Mailbox — glossy, rounded, candy-coated pastel plastic             */
/* ------------------------------------------------------------------ */

const mailbox = new THREE.Group();
mailbox.position.set(-1.6, 0, 0);
scene.add(mailbox);

const postMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.purpleDeep, roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3 });
const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.5, 16), postMat);
post.position.y = 0.75;
post.castShadow = true;
mailbox.add(post);

const plinth = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.55, 0.12, 32),
  new THREE.MeshPhysicalMaterial({ color: PALETTE.cyanDeep, roughness: 0.65, clearcoat: 0.3 })
);
plinth.position.y = 0.06;
plinth.receiveShadow = true;
mailbox.add(plinth);

// glossy rounded body — softer, cuter silhouette than a sharp box
const bodyMat = new THREE.MeshPhysicalMaterial({
  color: PALETTE.pink, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2,
  bumpMap: grainTex, bumpScale: 0.0006
});
const lowerBody = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.55, 0.75, 4, 0.07), bodyMat);
lowerBody.position.set(0, 1.55, 0);
lowerBody.castShadow = true;
mailbox.add(lowerBody);

const domeMat = new THREE.MeshPhysicalMaterial({
  color: PALETTE.pink, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2
});
const dome = new THREE.Mesh(
  new THREE.CylinderGeometry(0.475, 0.475, 0.75, 32, 1, false, 0, Math.PI),
  domeMat
);
dome.rotation.z = Math.PI / 2;
dome.rotation.y = Math.PI / 2;
dome.position.set(0, 1.825, 0);
dome.castShadow = true;
mailbox.add(dome);

// a little heart sticker on the front — purely decorative, cute touch
function makeHeartSpriteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '92px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💕', 64, 70);
  return new THREE.CanvasTexture(c);
}
const heartSticker = new THREE.Mesh(
  new THREE.PlaneGeometry(0.16, 0.16),
  new THREE.MeshBasicMaterial({ map: makeHeartSpriteTexture(), transparent: true, alphaTest: 0.3 })
);
heartSticker.position.set(0, 1.78, 0.478);
mailbox.add(heartSticker);

const mouth = new THREE.Mesh(
  new THREE.CircleGeometry(0.34, 24, 0, Math.PI),
  new THREE.MeshStandardMaterial({ color: 0x3d3350, roughness: 1 })
);
const mouthEdge = new THREE.Mesh(
  new THREE.PlaneGeometry(0.68, 0.24),
  new THREE.MeshStandardMaterial({ color: 0x3d3350, roughness: 1 })
);
mouthEdge.position.set(0, 1.475, 0.001);
mailbox.add(mouthEdge);
mouth.position.set(0, 1.825, 0.376);
mailbox.add(mouth);

// door flap — hinged at the bottom of the opening, swings open outward
const doorPivot = new THREE.Group();
doorPivot.position.set(0, 1.475, 0.376);
mailbox.add(doorPivot);

const doorShape = new THREE.Shape();
doorShape.moveTo(-0.34, 0);
doorShape.lineTo(0.34, 0);
doorShape.lineTo(0.34, 0.35);
doorShape.absarc(0, 0.35, 0.34, 0, Math.PI, false);
doorShape.lineTo(-0.34, 0);
const door = new THREE.Mesh(
  new THREE.ExtrudeGeometry(doorShape, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }),
  new THREE.MeshPhysicalMaterial({ color: PALETTE.pinkDeep, roughness: 0.3, clearcoat: 0.55, side: THREE.DoubleSide })
);
door.castShadow = true;
doorPivot.add(door);

// flag — flips up when there's mail
const flagPivot = new THREE.Group();
flagPivot.position.set(0.5, 1.65, 0.2);
mailbox.add(flagPivot);
const flag = new THREE.Mesh(
  new THREE.BoxGeometry(0.05, 0.32, 0.05),
  new THREE.MeshPhysicalMaterial({ color: PALETTE.cyanDeep, roughness: 0.4, clearcoat: 0.4 })
);
flag.position.y = 0.16;
flagPivot.add(flag);
flagPivot.rotation.z = Math.PI / 2.1; // resting flat/down

/* ------------------------------------------------------------------ */
/*  Keypad machine (stands beside the mailbox)                         */
/* ------------------------------------------------------------------ */

const keypadGroup = new THREE.Group();
keypadGroup.position.set(0.35, 0, 0.15);
keypadGroup.rotation.y = -0.35;
scene.add(keypadGroup);

const standMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.purpleDeep, roughness: 0.4, clearcoat: 0.5 });
const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.3), standMat);
stand.position.y = 0.55;
stand.castShadow = true;
keypadGroup.add(stand);

const panel = new THREE.Mesh(
  new RoundedBoxGeometry(0.5, 0.75, 0.1, 3, 0.03),
  new THREE.MeshPhysicalMaterial({ color: PALETTE.blueDeep, roughness: 0.35, clearcoat: 0.5 })
);
panel.position.set(0, 1.25, 0.02);
panel.castShadow = true;
keypadGroup.add(panel);

// screen — a canvas texture we redraw as the user types
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 512;
screenCanvas.height = 256;
const screenCtx = screenCanvas.getContext('2d');
const screenTexture = new THREE.CanvasTexture(screenCanvas);

function drawScreen(text, opts = {}) {
  const { flash = false, sub = 'TYPE YOUR NAME' } = opts;
  const w = screenCanvas.width, h = screenCanvas.height;
  const grad = screenCtx.createLinearGradient(0, 0, 0, h);
  if (flash) {
    grad.addColorStop(0, '#4a1338'); grad.addColorStop(1, '#2c0e22');
  } else {
    grad.addColorStop(0, '#2c2144'); grad.addColorStop(1, '#1c1530');
  }
  screenCtx.fillStyle = grad;
  screenCtx.fillRect(0, 0, w, h);
  screenCtx.strokeStyle = 'rgba(255,255,255,0.07)';
  for (let y = 0; y < h; y += 8) {
    screenCtx.beginPath();
    screenCtx.moveTo(0, y);
    screenCtx.lineTo(w, y);
    screenCtx.stroke();
  }
  // faint scanline glow vignette for a softer "screen" feel
  const vg = screenCtx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6);
  vg.addColorStop(0, 'rgba(255,255,255,0.05)');
  vg.addColorStop(1, 'rgba(0,0,0,0.25)');
  screenCtx.fillStyle = vg;
  screenCtx.fillRect(0, 0, w, h);

  screenCtx.fillStyle = flash ? '#ff9cc7' : '#bdf7ee';
  screenCtx.font = '600 26px "JetBrains Mono", monospace';
  screenCtx.textAlign = 'left';
  screenCtx.textBaseline = 'middle';
  screenCtx.fillText('> ' + text + (blinkOn ? '_' : ''), 24, h / 2);
  screenCtx.font = '400 16px "JetBrains Mono", monospace';
  screenCtx.fillStyle = 'rgba(189,247,238,0.55)';
  screenCtx.fillText(sub, 24, h - 26);
  screenTexture.needsUpdate = true;
}

let blinkOn = true;
setInterval(() => {
  blinkOn = !blinkOn;
  if (appState === 'idle-name') drawScreen(currentName);
}, 500);

const screenMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(0.42, 0.21),
  new THREE.MeshBasicMaterial({ map: screenTexture })
);
screenMesh.position.set(0, 1.32, 0.075);
keypadGroup.add(screenMesh);

// a subtle glass-like overlay on the screen for extra realism
const screenGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(0.42, 0.21),
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.05,
    roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05
  })
);
screenGlass.position.set(0, 1.32, 0.0755);
keypadGroup.add(screenGlass);

// decorative key buttons
const keyMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.cream, roughness: 0.4, clearcoat: 0.4 });
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 4; col++) {
    const key3d = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 12), keyMat);
    key3d.rotation.x = Math.PI / 2;
    key3d.position.set(-0.15 + col * 0.1, 0.98 - row * 0.09, 0.075);
    key3d.castShadow = true;
    keypadGroup.add(key3d);
  }
}

// ENTER button — clickable
const enterButton = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 0.025, 20),
  new THREE.MeshPhysicalMaterial({ color: PALETTE.pinkDeep, roughness: 0.3, clearcoat: 0.6 })
);
enterButton.rotation.x = Math.PI / 2;
enterButton.position.set(0.19, 0.66, 0.075);
enterButton.userData.isEnterButton = true;
keypadGroup.add(enterButton);

/* ------------------------------------------------------------------ */
/*  Envelope + letter (built once, reused for every recipient)        */
/*  Colors/stamp are re-skinned per person via applyTheme()           */
/* ------------------------------------------------------------------ */

const envelopeGroup = new THREE.Group();
envelopeGroup.visible = false;
scene.add(envelopeGroup);

const envelopeMat = new THREE.MeshPhysicalMaterial({
  color: PALETTE.cream, roughness: 0.75, clearcoat: 0.08, clearcoatRoughness: 0.6,
  bumpMap: grainTex, bumpScale: 0.0012
});
const envelopeBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.02), envelopeMat);
envelopeBody.castShadow = true;
envelopeGroup.add(envelopeBody);

// diagonal fold lines (decorative envelope look) — recolored per theme
const foldMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.pink, roughness: 0.7 });
const foldL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.055, 0.016), foldMat);
foldL.position.set(-0.09, 0.06, 0.011);
foldL.rotation.z = 0.62;
envelopeGroup.add(foldL);
const foldR = foldL.clone();
foldR.material = foldMat;
foldR.position.x = 0.09;
foldR.rotation.z = -0.62;
envelopeGroup.add(foldR);

// the flap that hinges open at the top
const flapPivot = new THREE.Group();
flapPivot.position.set(0, 0.21, 0.012);
envelopeGroup.add(flapPivot);
const flapShape = new THREE.Shape();
flapShape.moveTo(-0.31, 0);
flapShape.lineTo(0.31, 0);
flapShape.lineTo(0, -0.22);
flapShape.lineTo(-0.31, 0);
const flapMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.pinkDeep, roughness: 0.55, clearcoat: 0.15, side: THREE.DoubleSide });
const flap = new THREE.Mesh(
  new THREE.ExtrudeGeometry(flapShape, { depth: 0.01, bevelEnabled: false }),
  flapMat
);
flap.castShadow = true;
flapPivot.add(flap);

// stamp — a canvas-drawn scalloped postage sticker, redrawn per theme
const stampCanvas = document.createElement('canvas');
stampCanvas.width = stampCanvas.height = 256;
const stampCtx = stampCanvas.getContext('2d');
const stampTexture = new THREE.CanvasTexture(stampCanvas);

function drawStamp(theme) {
  const ctx = stampCtx, size = 256, margin = 16, teeth = 8;
  ctx.clearRect(0, 0, size, size);

  // base card with rounded corners
  const r = 14;
  ctx.fillStyle = '#fffaf5';
  ctx.beginPath();
  ctx.moveTo(margin + r, margin);
  ctx.arcTo(size - margin, margin, size - margin, size - margin, r);
  ctx.arcTo(size - margin, size - margin, margin, size - margin, r);
  ctx.arcTo(margin, size - margin, margin, margin, r);
  ctx.arcTo(margin, margin, size - margin, margin, r);
  ctx.closePath();
  ctx.fill();

  // punch scalloped perforation notches out of the edges — classic stamp look
  ctx.globalCompositeOperation = 'destination-out';
  const edgeLen = size - 2 * margin;
  const step = edgeLen / teeth;
  const notchR = step * 0.4;
  for (let i = 0; i < teeth; i++) {
    const p = margin + step * (i + 0.5);
    ctx.beginPath(); ctx.arc(p, margin, notchR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p, size - margin, notchR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(margin, p, notchR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(size - margin, p, notchR, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // inner border in the theme's accent color
  ctx.strokeStyle = theme.stampColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(margin + 16, margin + 16, size - 2 * margin - 32, size - 2 * margin - 32);

  // icon
  ctx.font = '108px "Apple Color Emoji","Segoe UI Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.stampIcon, size / 2, size / 2 + 6);

  stampTexture.needsUpdate = true;
}
drawStamp(THEMES.classicPink);

const stampGroup = new THREE.Group();
stampGroup.position.set(0.18, 0.05, 0.022);
envelopeGroup.add(stampGroup);
const stampMat = new THREE.MeshPhysicalMaterial({
  map: stampTexture, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide,
  roughness: 0.55, clearcoat: 0.2
});
const stampMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), stampMat);
stampMesh.userData.isStamp = true;
stampGroup.add(stampMesh);

// the letter paper hidden inside, slides up + unfolds on open
const paperGroup = new THREE.Group();
paperGroup.position.set(0, 0.05, 0.005);
paperGroup.visible = false;
envelopeGroup.add(paperGroup);
const paperMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(0.5, 0.62),
  new THREE.MeshPhysicalMaterial({
    color: 0xfffdf9, roughness: 0.85, clearcoat: 0.05, side: THREE.DoubleSide,
    bumpMap: grainTex, bumpScale: 0.001
  })
);
paperGroup.add(paperMesh);

/* ------------------------------------------------------------------ */
/*  Theme application — recolors the envelope/stamp for this person   */
/* ------------------------------------------------------------------ */

let currentTheme = THEMES.classicPink;
const ALL_THEME_CLASSES = Object.values(THEMES).map((t) => t.cssClass);
const letterPaperEl = document.querySelector('#letter-modal .letter-paper');

function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.classicPink;
  currentTheme = theme;
  envelopeMat.color.set(theme.envelopeColor);
  foldMat.color.set(theme.flapColor);
  flapMat.color.set(theme.flapColor);
  drawStamp(theme);

  letterPaperEl.classList.remove(...ALL_THEME_CLASSES);
  letterPaperEl.classList.add(theme.cssClass);
}

/* ------------------------------------------------------------------ */
/*  Floating sparkles — a small, deliberate touch of whimsy            */
/* ------------------------------------------------------------------ */

const sparkleColors = [PALETTE.pinkDeep, PALETTE.blueDeep, PALETTE.cyanDeep, PALETTE.purpleDeep];
const sparkles = [];
for (let i = 0; i < 16; i++) {
  const mat = new THREE.SpriteMaterial({
    map: glowTex,
    color: sparkleColors[i % sparkleColors.length],
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const spr = new THREE.Sprite(mat);
  const scale = 0.045 + Math.random() * 0.06;
  spr.scale.set(scale, scale, 1);
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.1 + Math.random() * 2.0;
  spr.userData.baseX = Math.cos(angle) * radius - 0.6;
  spr.userData.baseZ = Math.sin(angle) * radius * 0.55 + 0.4;
  spr.userData.baseY = 0.5 + Math.random() * 1.9;
  spr.userData.speed = 0.35 + Math.random() * 0.55;
  spr.userData.phase = Math.random() * Math.PI * 2;
  scene.add(spr);
  sparkles.push(spr);
}

/* ------------------------------------------------------------------ */
/*  Raycasting / pointer interaction                                   */
/* ------------------------------------------------------------------ */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function setPointerFromEvent(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

let swipeTracking = false;
let swipeStartY = 0;
let swipeHandled = false;

renderer.domElement.addEventListener('pointerdown', (e) => {
  setPointerFromEvent(e);
  raycaster.setFromCamera(pointer, camera);

  if (appState === 'idle-name') {
    const hits = raycaster.intersectObject(enterButton);
    if (hits.length) {
      trySubmit();
      return;
    }
  }

  if (appState === 'awaiting-stamp') {
    const hits = raycaster.intersectObject(stampMesh);
    if (hits.length) {
      removeStamp();
      return;
    }
  }

  if (appState === 'awaiting-swipe') {
    swipeTracking = true;
    swipeStartY = e.clientY;
    swipeHandled = false;
  }
});

window.addEventListener('pointermove', (e) => {
  if (!swipeTracking || swipeHandled) return;
  const delta = swipeStartY - e.clientY;
  if (delta > 70) {
    swipeHandled = true;
    swipeTracking = false;
    openLetter();
  }
});

window.addEventListener('pointerup', () => { swipeTracking = false; });

/* ------------------------------------------------------------------ */
/*  App state machine                                                   */
/* ------------------------------------------------------------------ */

let appState = 'idle-name';
let currentName = '';
let currentPerson = null;

const hintBubble = document.getElementById('hint-bubble');
const swipePrompt = document.getElementById('swipe-prompt');
const toast = document.getElementById('not-found-toast');
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const passwordSubmit = document.getElementById('password-submit');
const passwordTitle = document.getElementById('password-title');
const letterModal = document.getElementById('letter-modal');
const letterBody = document.getElementById('letter-body');
const letterSignature = document.getElementById('letter-signature');
const letterClose = document.getElementById('letter-close');

function setHint(text) { hintBubble.textContent = text; }

window.addEventListener('keydown', (e) => {
  if (appState !== 'idle-name') return;

  if (e.key === 'Enter') {
    trySubmit();
    return;
  }
  if (e.key === 'Backspace') {
    currentName = currentName.slice(0, -1);
    drawScreen(currentName);
    return;
  }
  // letters only, case preserved exactly as typed (matching is case-sensitive)
  if (/^[a-zA-Z]$/.test(e.key) && currentName.length < 18) {
    currentName += e.key;
    drawScreen(currentName);
  }
});

function trySubmit() {
  if (!currentName.length) return;
  const person = LOVE_LETTERS[currentName]; // exact-case lookup on purpose
  if (person) {
    currentPerson = person;
    applyTheme(person.theme);
    appState = 'checking';
    setHint('looks like there\'s something for you...');
    playDoorOpen();
  } else {
    showNotFound();
  }
}

function showNotFound() {
  toast.classList.remove('hidden');
  drawScreen(currentName, { flash: true, sub: 'NO MATCH FOUND' });
  setTimeout(() => {
    toast.classList.add('hidden');
    currentName = '';
    drawScreen(currentName);
  }, 1600);
}

function playDoorOpen() {
  tween(650, (t) => {
    doorPivot.rotation.x = -t * (Math.PI / 1.7);
  }, () => {
    tween(500, (t) => { flagPivot.rotation.z = (Math.PI / 2.1) * (1 - t); });
    spawnEnvelope();
  });
}

function spawnEnvelope() {
  envelopeGroup.visible = true;
  envelopeGroup.position.copy(mailbox.position).add(new THREE.Vector3(0, 1.825, 0.4));
  envelopeGroup.rotation.set(0, 0, 0);
  envelopeGroup.scale.setScalar(0.001);

  const startPos = mailbox.position.clone().add(new THREE.Vector3(0, 1.825, 0.4));
  const targetPos = new THREE.Vector3(0, 1.35, 2.4);

  tween(900, (t) => {
    envelopeGroup.position.lerpVectors(startPos, targetPos, t);
    envelopeGroup.scale.setScalar(0.001 + t * 1.4);
    envelopeGroup.rotation.y = t * Math.PI * 0.06;
  }, () => {
    appState = 'awaiting-stamp';
    setHint('pull off the stamp to continue');
  }, easeOutCubic);
}

function removeStamp() {
  appState = 'removing-stamp';
  const start = stampGroup.position.clone();
  tween(500, (t) => {
    stampGroup.position.set(start.x + t * 0.9, start.y + t * 1.1, start.z + t * 0.6);
    stampGroup.rotation.z = t * 2.4;
    stampGroup.scale.setScalar(1 - t * 0.6);
  }, () => {
    stampGroup.visible = false;
    appState = 'awaiting-swipe';
    swipePrompt.classList.remove('hidden');
    setHint('now swipe up to open it');
  });
}

function openLetter() {
  swipePrompt.classList.add('hidden');
  setHint('opening...');
  tween(500, (t) => {
    flapPivot.rotation.x = -t * Math.PI * 0.85;
  }, () => {
    paperGroup.visible = true;
    paperGroup.position.y = 0.02;
    paperGroup.scale.set(1, 0.05, 1);
    tween(550, (t) => {
      paperGroup.position.y = 0.02 + t * 0.55;
      paperGroup.scale.set(1, 0.05 + t * 0.95, 1);
    }, () => {
      appState = 'awaiting-password';
      showPasswordModal();
    }, easeInOutSine);
  });
}

function showPasswordModal() {
  passwordTitle.textContent = `dear ${currentName}, this one's locked`;
  passwordError.classList.add('hidden');
  passwordInput.value = '';
  passwordModal.classList.remove('hidden');
  setTimeout(() => passwordInput.focus(), 50);
}

function checkPassword() {
  if (!currentPerson) return;
  if (passwordInput.value === currentPerson.password) {
    passwordModal.classList.add('hidden');
    letterBody.textContent = currentPerson.letter;
    letterSignature.textContent = currentPerson.signature || '';
    letterModal.classList.remove('hidden');
    appState = 'reading';
    setHint('enjoy your letter :3');
  } else {
    passwordError.classList.remove('hidden');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

passwordSubmit.addEventListener('click', checkPassword);
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPassword();
});

letterClose.addEventListener('click', resetScene);

function resetScene() {
  letterModal.classList.add('hidden');
  envelopeGroup.visible = false;
  paperGroup.visible = false;
  flapPivot.rotation.x = 0;
  doorPivot.rotation.x = 0;
  stampGroup.visible = true;
  stampGroup.position.set(0.18, 0.05, 0.022);
  stampGroup.rotation.z = 0;
  stampGroup.scale.setScalar(1);
  currentName = '';
  currentPerson = null;
  appState = 'idle-name';
  drawScreen('');
  setHint('type your name, then press enter');
}

/* ------------------------------------------------------------------ */
/*  Render loop                                                        */
/* ------------------------------------------------------------------ */

drawScreen('');

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) - 0.5;
  mouseY = (e.clientY / window.innerHeight) - 0.5;
});

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  tickTweens(now);

  sparkles.forEach((s) => {
    const t = now * 0.001 * s.userData.speed + s.userData.phase;
    s.position.set(
      s.userData.baseX + Math.sin(t * 0.6) * 0.08,
      s.userData.baseY + Math.sin(t) * 0.15,
      s.userData.baseZ
    );
    s.material.opacity = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7));
  });

  // one gentle, deliberate ambient touch — a soft camera drift, nothing more
  camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
  camera.position.y += (1.7 - mouseY * 0.4 - camera.position.y) * 0.02;
  camera.lookAt(0, 1.15, 0.6);

  composer.render();
}
animate();

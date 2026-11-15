/**
 * Bé Mochee 3D – dựng hoàn toàn bằng khối cơ bản của three.js (không cần file model),
 * tạo hình theo ảnh của bé: tóc đen lưa thưa, băng đô nơ kem, áo liền quần caro vàng, tất trắng.
 *
 * `frame(progress, time)` nhận tiến trình cuộn 0 → 1 và diễn lần lượt:
 * nằm ngửa → LẬT → TRƯỜN → BÒ → ĐỨNG → ĐI → reo mừng bên chiếc bánh mochi.
 */
import * as THREE from 'three';

export type MocheeStage = {
  resize(width: number, height: number): void;
  frame(progress: number, time: number): void;
  /** Điểm ngay bên trái đầu bé lúc về đích, tính theo tỉ lệ 0–1 của khung (để đặt bong bóng thoại). */
  anchor(): { x: number; y: number };
  dispose(): void;
};

/* ───────────────────────── tiện ích ───────────────────────── */

const DEG = Math.PI / 180;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const up = (x: number) => Math.max(0, x);

/** Tư thế = bộ góc khớp (độ) + độ cao hông. Trái = phía +X của bé. */
type Pose = {
  y: number; // độ cao hông
  pitch: number; // gập người về trước (90 = nằm sấp)
  roll: number; // xoay quanh sống lưng (180 = nằm ngửa)
  lean: number; // nghiêng trái/phải
  yaw: number; // hướng nhìn của cả người
  chest: number;
  hx: number; hy: number; hz: number; // đầu
  sLx: number; sLz: number; eL: number; // vai + khuỷu trái
  sRx: number; sRz: number; eR: number;
  hLx: number; hLz: number; kL: number; // hông + gối trái
  hRx: number; hRz: number; kR: number;
};

const POSE_KEYS = [
  'y', 'pitch', 'roll', 'lean', 'yaw', 'chest', 'hx', 'hy', 'hz',
  'sLx', 'sLz', 'eL', 'sRx', 'sRz', 'eR', 'hLx', 'hLz', 'kL', 'hRx', 'hRz', 'kR',
] as const;

function mix(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out = {} as Pose;
  for (const k of POSE_KEYS) out[k] = lerp(a[k], b[k], t);
  return out;
}

/* ───────────────────────── các tư thế ───────────────────────── */

const sin = Math.sin;
const cos = Math.cos;

/** Nằm ngửa, đạp chân, quơ tay. */
const supine = (ph: number, t: number): Pose => ({
  y: 0.25, pitch: 72, roll: -180, lean: 0, yaw: 108, chest: 0,
  hx: 14, hy: 42 + 10 * sin(t * 0.9), hz: 0,
  sLx: -78 + 16 * sin(ph * 2), sLz: 42, eL: -58,
  sRx: -78 - 16 * sin(ph * 2), sRz: -42, eR: -58,
  hLx: -82 + 22 * sin(ph * 2 + 0.6), hLz: 24, kL: 74 - 22 * sin(ph * 2 + 0.6),
  hRx: -82 - 22 * sin(ph * 2 + 0.6), hRz: -24, kR: 74 + 22 * sin(ph * 2 + 0.6),
});

/** Nằm sấp, chống tay ngẩng đầu. */
const prone = (ph: number, t: number): Pose => ({
  y: 0.25, pitch: 78, roll: 0, lean: 0, yaw: 62, chest: -14,
  hx: -62, hy: -18 + 6 * sin(t * 1.1), hz: 0,
  sLx: -128, sLz: 20, eL: -52,
  sRx: -128, sRz: -20, eR: -52,
  hLx: 6, hLz: 16, kL: 26 + 24 * sin(ph * 2),
  hRx: 6, hRz: -16, kR: 26 - 24 * sin(ph * 2),
});

/** Trườn: bụng sát sàn, tay kéo – chân ếch đạp. */
const commando = (ph: number): Pose => ({
  y: 0.25, pitch: 83, roll: 9 * sin(ph), lean: 0, yaw: 62 + 5 * sin(ph), chest: -10,
  hx: -64, hy: -16 - 6 * sin(ph), hz: 4 * sin(ph),
  sLx: -128 - 30 * sin(ph), sLz: 22, eL: -46 + 26 * sin(ph),
  sRx: -128 + 30 * sin(ph), sRz: -22, eR: -46 - 26 * sin(ph),
  hLx: -28 + 26 * sin(ph), hLz: 34, kL: 62 - 30 * sin(ph),
  hRx: -28 - 26 * sin(ph), hRz: -34, kR: 62 + 30 * sin(ph),
});

/** Bò bằng tay và gối – tay trái đi cùng chân phải. */
const crawl = (ph: number): Pose => ({
  y: 0.31 + 0.012 * sin(ph * 2), pitch: 76, roll: 5 * sin(ph), lean: 0, yaw: 60 + 4 * sin(ph), chest: 0,
  hx: -66, hy: -14 + 7 * sin(ph), hz: 3 * sin(ph),
  sLx: -76 - 24 * sin(ph), sLz: 7, eL: -34 * up(cos(ph)),
  sRx: -76 + 24 * sin(ph), sRz: -7, eR: -34 * up(-cos(ph)),
  hLx: -76 + 20 * sin(ph), hLz: 8, kL: 92 + 14 * up(-cos(ph)),
  hRx: -76 - 20 * sin(ph), hRz: -8, kR: 92 + 14 * up(cos(ph)),
});

/** Đứng chựng: dang tay giữ thăng bằng, nhún nhún đầu gối. */
const stand = (t: number): Pose => {
  const bounce = 0.5 + 0.5 * sin(t * 3.2);
  return {
    y: 0.47 - 0.012 * bounce, pitch: 3 + 2 * sin(t * 1.3), roll: 0, lean: 4 * sin(t * 1.7), yaw: 28, chest: 0,
    hx: -4, hy: 0, hz: 4 * sin(t * 1.7 + 0.5),
    sLx: -22, sLz: 58 + 8 * sin(t * 2.1), eL: -28,
    sRx: -22, sRz: -58 + 8 * sin(t * 2.1 + 1), eR: -28,
    hLx: -6 - 6 * bounce, hLz: 9, kL: 8 + 12 * bounce,
    hRx: -6 - 6 * bounce, hRz: -9, kR: 8 + 12 * bounce,
  };
};

/** Chập chững đi: lắc lư, tay giơ cao. */
const walk = (ph: number): Pose => ({
  y: 0.465 + 0.022 * Math.abs(sin(ph)), pitch: 5, roll: 9 * sin(ph), lean: 5 * cos(ph), yaw: 48, chest: 0,
  hx: -6, hy: -10, hz: 5 * cos(ph),
  sLx: -34 + 12 * sin(ph), sLz: 64, eL: -72,
  sRx: -34 - 12 * sin(ph), sRz: -64, eR: -72,
  hLx: -5 - 27 * sin(ph), hLz: 7, kL: 8 + 34 * up(cos(ph)),
  hRx: -5 + 27 * sin(ph), hRz: -7, kR: 8 + 34 * up(-cos(ph)),
});

/** Tới nơi: giơ hai tay reo mừng. */
const cheer = (t: number): Pose => {
  const hop = Math.abs(sin(t * 4.2));
  return {
    y: 0.455 + 0.07 * hop, pitch: 0, roll: 0, lean: 3 * sin(t * 4.2), yaw: 16, chest: 0,
    hx: -10, hy: 0, hz: 5 * sin(t * 2.1),
    sLx: -30, sLz: 122 + 10 * sin(t * 8.4), eL: -8,
    sRx: -30, sRz: -122 - 10 * sin(t * 8.4), eR: -8,
    hLx: -8 + 6 * hop, hLz: 10, kL: 16 - 12 * hop,
    hRx: -8 + 6 * hop, hRz: -10, kR: 16 - 12 * hop,
  };
};

/* ───────────────────────── dựng hình ───────────────────────── */

function ginghamTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffd84a';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.fillRect(0, 0, 32, 64);
  g.fillRect(0, 0, 64, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(9, 6);
  return tex;
}

function shadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(120,72,20,0.42)');
  grad.addColorStop(0.6, 'rgba(120,72,20,0.16)');
  grad.addColorStop(1, 'rgba(120,72,20,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMocheeStage(canvas: HTMLCanvasElement): MocheeStage {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  /* ánh sáng ấm như trong tiệm bánh */
  scene.add(new THREE.HemisphereLight(0xfffdf6, 0xffe6cc, 1.45));
  const key = new THREE.DirectionalLight(0xfff6e8, 1.45);
  key.position.set(-2.5, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2a8, 0.5);
  rim.position.set(3, 2, -3);
  scene.add(rim);

  /* camera trực giao, hơi nhìn từ trên xuống. Mặt quầy (y = 0) nằm ở 22% chiều cao tính từ dưới. */
  const BASE_VIEW_H = 2.7; // bé cao ~1.85 đơn vị
  const MIN_VIEW_W = 5.4; // màn hẹp thì lùi camera ra để quầy đủ dài cho bé đi
  const GROUND = 0.22;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  const camTilt = 11 * DEG;
  let viewH = BASE_VIEW_H;
  let viewW = viewH * 3;
  const aimCamera = () => {
    const centerY = viewH * (0.5 - GROUND);
    camera.position.set(0, centerY + 12 * Math.sin(camTilt), 12 * Math.cos(camTilt));
    camera.lookAt(0, centerY, 0);
    camera.left = -viewW / 2;
    camera.right = viewW / 2;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
    camera.updateProjectionMatrix();
  };
  aimCamera();

  /** Đường đi trên quầy: bé xuất phát bên trái, dừng ngay trước chiếc bánh ở bên phải. */
  const path = () => {
    const xCake = viewW / 2 - 0.8;
    const xStart = -viewW / 2 + Math.min(2.1, Math.max(1.5, viewW * 0.3));
    return { xCake, xStart, xEnd: xCake - 1.14 };
  };

  /* vật liệu */
  const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    track(new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...extra }));
  const gingham = track(ginghamTexture());
  const M = {
    skin: mat(0xffe0c8),
    skinDark: mat(0xf3bfa2),
    hair: mat(0x2c1d17, { roughness: 0.95 }),
    cream: mat(0xfff4dc),
    romper: mat(0xffffff, { map: gingham }),
    yellow: mat(0xffd84a),
    white: mat(0xffffff),
    eye: mat(0x2a1a14, { roughness: 0.35 }),
    blush: mat(0xff9d9d, { transparent: true, opacity: 0.55, depthWrite: false }),
    mouth: mat(0xd9606a),
    gold: mat(0xf2c14e, { roughness: 0.4, metalness: 0.5 }),
    duck: mat(0xffd23f),
    beak: mat(0xff9a3c),
    pink: mat(0xffc7cf),
    berry: mat(0xff6b6b),
    leaf: mat(0x8fcf7a),
    flame: mat(0xffb23f, { emissive: 0xff8a1f, emissiveIntensity: 1.2 }),
  };

  const geo = {
    sphere: track(new THREE.SphereGeometry(1, 36, 28)),
    lowSphere: track(new THREE.SphereGeometry(1, 18, 14)),
  };
  const ball = (r: number, m: THREE.Material, sx = 1, sy = 1, sz = 1, low = false) => {
    const mesh = new THREE.Mesh(low ? geo.lowSphere : geo.sphere, m);
    mesh.scale.set(r * sx, r * sy, r * sz);
    return mesh;
  };
  const capsule = (r: number, len: number, m: THREE.Material) =>
    new THREE.Mesh(track(new THREE.CapsuleGeometry(r, len, 8, 18)), m);
  const at = <T extends THREE.Object3D>(o: T, x: number, y: number, z: number) => (o.position.set(x, y, z), o);

  /* ── bé Mochee ── */
  const root = new THREE.Group(); // vị trí trên quầy + hướng
  const pelvis = new THREE.Group();
  root.add(pelvis);
  scene.add(root);

  // quần phồng + thân áo caro vàng
  pelvis.add(at(ball(0.255, M.romper, 1.06, 0.82, 0.98), 0, 0.06, 0));
  pelvis.add(at(ball(0.29, M.romper, 1, 1.02, 0.9), 0, 0.25, 0.005));

  const chest = at(new THREE.Group(), 0, 0.4, 0);
  pelvis.add(chest);
  // cổ áo bèo kem + tay áo cánh tiên
  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.15, 0.05, 10, 28)), M.cream);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1.1, 1, 0.55);
  chest.add(at(collar, 0, 0.07, 0.01));
  for (const s of [-1, 1]) {
    const ruffle = ball(0.15, M.yellow, 1.15, 0.42, 1.1);
    ruffle.rotation.z = -s * 0.5;
    chest.add(at(ruffle, s * 0.25, 0.04, 0));
    const lace = ball(0.165, M.cream, 1.15, 0.2, 1.1);
    lace.rotation.z = -s * 0.5;
    chest.add(at(lace, s * 0.262, 0.012, 0));
  }

  type Limb = { a: THREE.Group; b: THREE.Group };
  const limb = (
    parent: THREE.Object3D, x: number, y: number,
    r1: number, l1: number, m1: THREE.Material,
    r2: number, l2: number, m2: THREE.Material,
    end: THREE.Object3D,
  ): Limb => {
    const a = at(new THREE.Group(), x, y, 0);
    parent.add(a);
    a.add(at(capsule(r1, l1, m1), 0, -l1 / 2, 0));
    const b = at(new THREE.Group(), 0, -l1, 0);
    a.add(b);
    b.add(at(capsule(r2, l2, m2), 0, -l2 / 2, 0));
    b.add(end);
    return { a, b };
  };

  const hand = () => at(ball(0.078, M.skin), 0, -0.19, 0);
  const foot = () => at(ball(0.098, M.white, 0.95, 0.78, 1.32), 0, -0.2, 0.035);
  const armL = limb(chest, 0.265, 0.03, 0.074, 0.17, M.skin, 0.068, 0.15, M.skin, hand());
  const armR = limb(chest, -0.265, 0.03, 0.074, 0.17, M.skin, 0.068, 0.15, M.skin, hand());
  const legL = limb(pelvis, 0.135, -0.02, 0.105, 0.2, M.skin, 0.088, 0.17, M.white, foot());
  const legR = limb(pelvis, -0.135, -0.02, 0.105, 0.2, M.skin, 0.088, 0.17, M.white, foot());
  // viền bèo ống quần
  for (const leg of [legL, legR]) {
    const cuff = new THREE.Mesh(track(new THREE.TorusGeometry(0.1, 0.035, 8, 20)), M.yellow);
    cuff.rotation.x = Math.PI / 2;
    leg.a.add(at(cuff, 0, -0.07, 0));
  }

  /* đầu */
  const neck = at(new THREE.Group(), 0, 0.1, 0);
  chest.add(neck);
  const head = at(new THREE.Group(), 0, 0.37, 0.01);
  neck.add(head);
  const HR = 0.44;
  head.add(ball(HR, M.skin, 1.06, 0.97, 1));
  // má bánh bao
  for (const s of [-1, 1]) head.add(at(ball(0.2, M.skin, 1, 0.9, 0.95), s * 0.215, -0.15, 0.125));

  // tóc: chỏm tóc đen ôm đỉnh đầu + mái lưa thưa
  const hairCap = new THREE.Mesh(
    track(new THREE.SphereGeometry(HR * 1.035, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.5)),
    M.hair,
  );
  hairCap.scale.set(1.06, 0.99, 1.02);
  hairCap.rotation.x = -29 * DEG;
  head.add(hairCap);
  const bangs: [number, number, number, number][] = [
    [-0.23, 0.262, 0.285, 0.75], [-0.11, 0.315, 0.315, 0.3], [0.02, 0.33, 0.315, -0.1], [0.14, 0.31, 0.31, -0.4], [0.25, 0.25, 0.275, -0.85],
  ];
  for (const [x, y, z, rz] of bangs) {
    const lock = ball(0.085, M.hair, 1, 0.5, 0.4);
    lock.rotation.z = rz;
    head.add(at(lock, x, y, z));
  }

  // khuôn mặt
  const eyes: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const eye = at(new THREE.Group(), s * 0.165, -0.015, 0.398);
    eye.add(ball(0.056, M.eye, 1, 1.2, 0.55));
    eye.add(at(ball(0.019, M.white, 1, 1, 0.6, true), 0.018, 0.026, 0.029));
    eye.rotation.y = s * 0.36;
    head.add(eye);
    eyes.push(eye);
    const brow = ball(0.05, M.hair, 1, 0.2, 0.3, true);
    brow.rotation.z = -s * 0.16;
    head.add(at(brow, s * 0.17, 0.1, 0.405));
    const blush = ball(0.085, M.blush, 1, 0.68, 0.3, true);
    blush.rotation.y = s * 0.62;
    head.add(at(blush, s * 0.29, -0.135, 0.318));
    head.add(at(ball(0.075, M.skin, 0.5, 1, 0.8, true), s * 0.455, -0.03, 0.0)); // tai
    head.add(at(ball(0.016, M.gold, 1, 1, 1, true), s * 0.47, -0.1, 0.01)); // khuyên tai
  }
  head.add(at(ball(0.024, M.skinDark, 1.1, 0.8, 0.8, true), 0, -0.075, 0.445));
  const smile = new THREE.Mesh(track(new THREE.TorusGeometry(0.058, 0.015, 8, 18, Math.PI)), M.mouth);
  smile.rotation.z = Math.PI;
  smile.rotation.x = -0.2;
  head.add(at(smile, 0, -0.135, 0.418));

  // băng đô nơ kem
  const band = new THREE.Group();
  band.rotation.x = 13 * DEG;
  head.add(band);
  const bandRing = new THREE.Mesh(track(new THREE.TorusGeometry(HR * 1.05, 0.022, 8, 48, Math.PI * 1.1)), M.cream);
  bandRing.rotation.z = -0.05 * Math.PI;
  bandRing.scale.set(1.06, 0.99, 1);
  band.add(bandRing);
  for (const deg of [38, 90, 142]) {
    const a = deg * DEG;
    const bow = at(new THREE.Group(), HR * 1.13 * cos(a), HR * 1.06 * sin(a), 0.01);
    bow.rotation.z = a + Math.PI / 2;
    for (const s of [-1, 1]) {
      const wing = ball(0.1, M.cream, 1, 0.68, 0.5, true);
      wing.rotation.z = s * 0.25;
      bow.add(at(wing, s * 0.095, 0.012, 0));
    }
    bow.add(ball(0.045, M.cream, 1, 1, 0.9, true));
    band.add(bow);
  }

  /* ── bạn vịt con lẽo đẽo theo sau ── */
  const duck = new THREE.Group();
  const duckBody = new THREE.Group();
  duck.add(duckBody);
  duckBody.add(at(ball(0.19, M.duck, 1.05, 0.92, 1.2), 0, 0.19, 0));
  duckBody.add(at(ball(0.135, M.duck), 0, 0.42, 0.13));
  duckBody.add(at(ball(0.062, M.beak, 1.05, 0.42, 1.15, true), 0, 0.4, 0.27));
  for (const s of [-1, 1]) {
    duckBody.add(at(ball(0.02, M.eye, 1, 1, 1, true), s * 0.07, 0.455, 0.235));
    const wing = ball(0.1, M.duck, 0.35, 0.7, 1.05, true);
    duckBody.add(at(wing, s * 0.19, 0.2, -0.02));
    duck.add(at(ball(0.05, M.beak, 1, 0.3, 1.4, true), s * 0.08, 0.015, 0.05));
  }
  const tail = ball(0.07, M.duck, 0.8, 0.8, 1.2, true);
  tail.rotation.x = -0.7;
  duckBody.add(at(tail, 0, 0.27, -0.22));
  scene.add(duck);

  /* ── chiếc bánh mochi sinh nhật ở cuối quầy ── */
  const cake = new THREE.Group();
  const plate = new THREE.Mesh(track(new THREE.CylinderGeometry(0.6, 0.52, 0.05, 40)), M.white);
  cake.add(at(plate, 0, 0.025, 0));
  cake.add(at(ball(0.46, M.cream, 1.14, 0.66, 1.14), 0, 0.3, 0));
  cake.add(at(ball(0.33, M.pink, 1.12, 0.64, 1.12), 0, 0.66, 0));
  cake.add(at(ball(0.21, M.yellow, 1.1, 0.7, 1.1), 0, 0.93, 0));
  // mặt cười của bánh
  for (const s of [-1, 1]) {
    cake.add(at(ball(0.026, M.eye, 1, 1.2, 0.6, true), s * 0.13, 0.36, 0.5));
    cake.add(at(ball(0.05, M.blush, 1, 0.6, 0.3, true), s * 0.24, 0.3, 0.47));
  }
  const cakeSmile = new THREE.Mesh(track(new THREE.TorusGeometry(0.04, 0.012, 8, 14, Math.PI)), M.mouth);
  cakeSmile.rotation.z = Math.PI;
  cake.add(at(cakeSmile, 0, 0.32, 0.515));
  const candle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 14)), M.white);
  cake.add(at(candle, 0, 1.17, 0));
  const flame = ball(0.05, M.flame, 0.8, 1.35, 0.8, true);
  cake.add(at(flame, 0, 1.36, 0));
  cake.add(at(ball(0.07, M.berry, 1, 1.1, 1, true), 0.2, 0.92, 0.2));
  cake.add(at(ball(0.035, M.leaf, 1.3, 0.4, 1.3, true), 0.2, 0.995, 0.2));
  cake.add(at(ball(0.07, M.berry, 1, 1.1, 1, true), -0.3, 0.72, 0.22));
  cake.add(at(ball(0.035, M.leaf, 1.3, 0.4, 1.3, true), -0.3, 0.795, 0.22));
  scene.add(cake);

  /* bóng đổ mềm dưới chân */
  const shadowTex = track(shadowTexture());
  const shadowGeo = track(new THREE.PlaneGeometry(1, 1));
  const mkShadow = () => {
    const m = new THREE.Mesh(
      shadowGeo,
      track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.004;
    m.renderOrder = -1;
    scene.add(m);
    return m;
  };
  const babyShadow = mkShadow();
  const duckShadow = mkShadow();
  const cakeShadow = mkShadow();
  cakeShadow.scale.set(1.7, 1.2, 1);

  /* ── áp tư thế vào khung xương ── */
  function apply(p: Pose) {
    pelvis.position.y = p.y;
    pelvis.rotation.set(p.pitch * DEG, p.roll * DEG, p.lean * DEG);
    root.rotation.y = p.yaw * DEG;
    chest.rotation.x = p.chest * DEG;
    neck.rotation.set(p.hx * DEG, p.hy * DEG, p.hz * DEG);
    armL.a.rotation.set(p.sLx * DEG, 0, p.sLz * DEG);
    armL.b.rotation.x = p.eL * DEG;
    armR.a.rotation.set(p.sRx * DEG, 0, p.sRz * DEG);
    armR.b.rotation.x = p.eR * DEG;
    legL.a.rotation.set(p.hLx * DEG, 0, p.hLz * DEG);
    legL.b.rotation.x = p.kL * DEG;
    legR.a.rotation.set(p.hRx * DEG, 0, p.hRz * DEG);
    legR.b.rotation.x = p.kR * DEG;
  }

  function poseAt(p: number, t: number): Pose {
    const ph = p * Math.PI * 2 * 30; // ~30 nhịp tay chân cho cả hành trình
    const kick = ph + t * 2.2; // lúc nằm thì tay chân tự đạp nhẹ

    const fRoll = smooth(0.045, 0.16, p);
    let pose = mix(supine(kick, t), prone(kick, t), fRoll);
    // lật: xoay quanh sống lưng, hơi nhổm người lên ở giữa cú lật
    pose.roll = -180 * (1 - fRoll);
    pose.y += 0.05 * sin(Math.PI * fRoll);
    pose = mix(pose, commando(ph), smooth(0.17, 0.235, p));
    pose = mix(pose, crawl(ph), smooth(0.36, 0.44, p));
    pose = mix(pose, stand(t), smooth(0.58, 0.69, p));
    pose = mix(pose, walk(ph * 0.8), smooth(0.79, 0.85, p));
    pose = mix(pose, cheer(t), smooth(0.955, 0.99, p));
    return pose;
  }

  let disposed = false;

  return {
    resize(width, height) {
      if (disposed || width < 2 || height < 2) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      const aspect = width / height;
      viewH = Math.max(BASE_VIEW_H, MIN_VIEW_W / aspect);
      viewW = viewH * aspect;
      aimCamera();
    },

    anchor() {
      const { xEnd } = path();
      const v = new THREE.Vector3(xEnd - 0.62, 1.72, 0.15).project(camera);
      return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
    },

    frame(progress, time) {
      if (disposed) return;
      const p = clamp01(progress);
      const pose = poseAt(p, time);
      apply(pose);

      const { xStart, xEnd, xCake } = path();
      const x = lerp(xStart, xEnd, p);
      root.position.set(x, 0, 0.15);

      // thở nhẹ + chớp mắt để bé luôn "sống"
      const breathe = 1 + 0.012 * sin(time * 2.4);
      chest.scale.set(breathe, breathe, breathe);
      const blink = (time % 3.6) > 3.45 ? 0.12 : 1;
      for (const e of eyes) e.scale.y = blink;

      // bóng của bé: dài khi nằm, tròn khi đứng
      const lying = clamp01(pose.pitch / 80);
      const yawR = pose.yaw * DEG;
      const reach = 0.42 * lying;
      babyShadow.position.set(x + sin(yawR) * reach, 0.004, 0.15 + cos(yawR) * reach);
      babyShadow.scale.set(lerp(1.0, 1.9, lying), lerp(0.75, 1.0, lying), 1);

      // vịt con chạy theo sau, nhảy lóc cóc theo nhịp cuộn
      const follow = lerp(1.2, 0.8, smooth(0.55, 0.7, p));
      const hopPh = p * Math.PI * 2 * 30 + time * 1.5;
      const dx = x - follow;
      const hop = Math.abs(sin(hopPh)) * 0.07;
      duck.position.set(dx, 0, -0.12);
      duck.rotation.y = 72 * DEG;
      duckBody.position.y = hop;
      duckBody.rotation.z = sin(hopPh) * 0.14;
      duckBody.rotation.x = -0.06 + cos(hopPh * 2) * 0.05;
      duckShadow.position.set(dx, 0.004, -0.12);
      duckShadow.scale.set(0.62 - hop, 0.44 - hop, 1);

      // bánh + ngọn nến lung linh
      cake.position.set(xCake, 0, -0.05);
      cake.rotation.y = -0.25;
      cakeShadow.position.set(xCake, 0.004, -0.02);
      const fl = 1 + 0.12 * sin(time * 11) + 0.06 * sin(time * 23);
      flame.scale.set(0.05 * 0.8, 0.05 * 1.35 * fl, 0.05 * 0.8);
      const wobble = smooth(0.955, 0.99, p) * 0.03 * sin(time * 8.4);
      cake.scale.set(1 + wobble, 1 - wobble, 1 + wobble);

      renderer.render(scene, camera);
    },

    dispose() {
      disposed = true;
      for (const d of disposables) d.dispose();
      renderer.dispose();
    },
  };
}

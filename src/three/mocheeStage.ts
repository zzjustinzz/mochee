/**
 * Bé Mochee 3D – dựng hoàn toàn bằng khối cơ bản của three.js (không cần file model),
 * tạo hình theo ảnh của bé: tóc đen lưa thưa, băng đô nơ kem, áo liền quần caro vàng, tất trắng.
 *
 * `frame(progress, time)` nhận tiến trình cuộn 0 → 1 và diễn lần lượt:
 * nằm ngửa → LẬT → TRƯỜN → BÒ → ĐỨNG → ĐI → reo mừng bên chiếc bánh mochi.
 */
import * as THREE from 'three';
import { clamp01, cos, DEG, lerp, poseAt, sin, smooth, type Pose } from './poses';

export type MocheeStage = {
  resize(width: number, height: number): void;
  frame(progress: number, time: number): void;
  /** Điểm ngay bên trái đầu bé lúc về đích, tính theo tỉ lệ 0–1 của khung (để đặt bong bóng thoại). */
  anchor(): { x: number; y: number };
  dispose(): void;
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

  /* vật liệu hoạt hình: đổ bóng theo 4 nấc mềm + viền nâu cacao như sticker */
  const toonRamp = track(new THREE.DataTexture(new Uint8Array([150, 196, 232, 255]), 4, 1, THREE.RedFormat));
  toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter;
  toonRamp.needsUpdate = true;
  const mat = (color: number, extra: THREE.MeshToonMaterialParameters = {}) =>
    track(new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...extra }));
  const flat = (color: number, extra: THREE.MeshBasicMaterialParameters = {}) =>
    track(new THREE.MeshBasicMaterial({ color, ...extra }));

  // viền: vẽ lại mặt sau của khối, đẩy ra theo pháp tuyến trong không gian camera (dày đều, không phụ thuộc tỉ lệ)
  const outlineMat = track(
    new THREE.ShaderMaterial({
      uniforms: { thickness: { value: 0.022 }, color: { value: new THREE.Color(0x5b3a1e) } },
      vertexShader: `uniform float thickness;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normal);
          mv.xyz += n * thickness;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform vec3 color; void main() { gl_FragColor = vec4(color, 1.0); }`,
      side: THREE.BackSide,
    }),
  );
  const outlined = <T extends THREE.Mesh>(m: T): T => {
    m.add(new THREE.Mesh(m.geometry, outlineMat));
    return m;
  };
  const gingham = track(ginghamTexture());
  const M = {
    skin: mat(0xffe3cf),
    skinDark: mat(0xf2b79a),
    hair: mat(0x3a2519),
    cream: mat(0xfff6e2),
    romper: mat(0xffffff, { map: gingham }),
    yellow: mat(0xffd84a),
    shoe: mat(0xffc928),
    white: mat(0xffffff),
    eye: flat(0x2a1a14),
    shine: flat(0xffffff),
    blush: flat(0xff9aa2, { transparent: true, opacity: 0.6, depthWrite: false }),
    mouth: flat(0xc94a5a),
    tongue: flat(0xff8f9c),
    stripe: flat(0x3a2519),
    gold: mat(0xf2c14e),
    duck: mat(0xffd23f),
    beak: mat(0xff9a3c),
    pink: mat(0xffc7cf),
    berry: mat(0xff5f6d),
    leaf: mat(0x8fcf7a),
    flame: flat(0xffc23f),
    glow: flat(0xffe9a6, { transparent: true, opacity: 0.45, depthWrite: false }),
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
  pelvis.add(at(outlined(ball(0.255, M.romper, 1.06, 0.82, 0.98)), 0, 0.06, 0));
  pelvis.add(at(outlined(ball(0.29, M.romper, 1, 1.02, 0.9)), 0, 0.25, 0.005));
  // 3 cúc áo nhỏ
  for (const y of [0.33, 0.25, 0.17]) pelvis.add(at(ball(0.022, M.cream, 1, 1, 0.5, true), 0, y, 0.262));

  const chest = at(new THREE.Group(), 0, 0.4, 0);
  pelvis.add(chest);
  // cổ áo bèo kem + tay áo cánh tiên
  const collar = new THREE.Mesh(track(new THREE.TorusGeometry(0.15, 0.05, 10, 28)), M.cream);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1.1, 1, 0.55);
  chest.add(at(collar, 0, 0.07, 0.01));
  for (const s of [-1, 1]) {
    const ruffle = outlined(ball(0.15, M.yellow, 1.15, 0.42, 1.1));
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
    a.add(at(outlined(capsule(r1, l1, m1)), 0, -l1 / 2, 0));
    const b = at(new THREE.Group(), 0, -l1, 0);
    a.add(b);
    b.add(at(outlined(capsule(r2, l2, m2)), 0, -l2 / 2, 0));
    b.add(end);
    return { a, b };
  };

  const hand = () => at(outlined(ball(0.078, M.skin)), 0, -0.19, 0);
  // giày thể thao vàng sọc đen (như đôi giày trong ảnh chụp gia đình) + đế trắng
  const foot = () => {
    const g = at(new THREE.Group(), 0, -0.2, 0.035);
    g.add(outlined(ball(0.1, M.shoe, 0.95, 0.74, 1.34)));
    g.add(at(outlined(ball(0.1, M.white, 1.0, 0.3, 1.38)), 0, -0.05, 0));
    for (const s of [-1, 1]) {
      const st = ball(0.05, M.stripe, 0.18, 0.28, 1.2, true);
      st.rotation.x = 0.5;
      g.add(at(st, s * 0.088, 0.005, 0.01));
    }
    return g;
  };
  const armL = limb(chest, 0.265, 0.03, 0.074, 0.17, M.skin, 0.068, 0.15, M.skin, hand());
  const armR = limb(chest, -0.265, 0.03, 0.074, 0.17, M.skin, 0.068, 0.15, M.skin, hand());
  const legL = limb(pelvis, 0.135, -0.02, 0.105, 0.2, M.skin, 0.088, 0.17, M.white, foot());
  const legR = limb(pelvis, -0.135, -0.02, 0.105, 0.2, M.skin, 0.088, 0.17, M.white, foot());
  // vòng tay vàng (bé đeo trong ảnh)
  const bangle = new THREE.Mesh(track(new THREE.TorusGeometry(0.072, 0.014, 8, 24)), M.gold);
  bangle.rotation.x = Math.PI / 2;
  armL.b.add(at(bangle, 0, -0.12, 0));
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
  head.add(outlined(ball(HR, M.skin, 1.06, 0.97, 1)));
  // má bánh bao
  for (const s of [-1, 1]) head.add(at(outlined(ball(0.2, M.skin, 1, 0.9, 0.95)), s * 0.215, -0.15, 0.125));

  // tóc: chỏm tóc đen ôm đỉnh đầu + mái lưa thưa
  const hairCap = new THREE.Mesh(
    track(new THREE.SphereGeometry(HR * 1.035, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.5)),
    M.hair,
  );
  hairCap.scale.set(1.06, 0.99, 1.02);
  hairCap.rotation.x = -29 * DEG;
  head.add(outlined(hairCap));
  // lọn tóc xoăn trên đỉnh – "chỏm mochi"
  const curl = new THREE.Mesh(track(new THREE.TorusGeometry(0.075, 0.026, 10, 24, Math.PI * 1.55)), M.hair);
  curl.rotation.set(0, Math.PI / 2, -0.4);
  head.add(at(outlined(curl), 0, HR * 1.04 + 0.06, -0.03));
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
    const eye = at(new THREE.Group(), s * 0.165, -0.02, 0.395);
    eye.add(ball(0.066, M.eye, 1, 1.2, 0.5));
    eye.add(at(ball(0.024, M.shine, 1, 1, 0.5, true), 0.02, 0.032, 0.03));
    eye.add(at(ball(0.011, M.shine, 1, 1, 0.5, true), -0.024, -0.03, 0.03));
    const lash = ball(0.026, M.eye, 1.4, 0.4, 0.4, true);
    lash.rotation.z = s * 0.5;
    eye.add(at(lash, s * 0.062, 0.05, 0.004));
    eye.rotation.y = s * 0.36;
    head.add(eye);
    eyes.push(eye);
    const brow = ball(0.05, M.hair, 1, 0.2, 0.3, true);
    brow.rotation.z = -s * 0.16;
    head.add(at(brow, s * 0.17, 0.1, 0.405));
    const blush = ball(0.085, M.blush, 1, 0.68, 0.3, true);
    blush.rotation.y = s * 0.62;
    head.add(at(blush, s * 0.29, -0.135, 0.318));
    head.add(at(outlined(ball(0.075, M.skin, 0.5, 1, 0.8, true)), s * 0.455, -0.03, 0.0)); // tai
    head.add(at(ball(0.016, M.gold, 1, 1, 1, true), s * 0.47, -0.1, 0.01)); // khuyên tai
  }
  head.add(at(ball(0.024, M.skinDark, 1.1, 0.8, 0.8, true), 0, -0.075, 0.445));
  // miệng cười hé + lưỡi hồng thè ra (như ảnh JOY_3892)
  const mouthG = at(new THREE.Group(), 0, -0.13, 0.428);
  mouthG.rotation.x = -0.32;
  const mouth = new THREE.Mesh(track(new THREE.CircleGeometry(0.06, 24, Math.PI, Math.PI)), M.mouth);
  mouth.scale.set(1.15, 0.85, 1);
  mouthG.add(mouth);
  const tongue = new THREE.Mesh(track(new THREE.CircleGeometry(0.034, 20)), M.tongue);
  tongue.scale.set(1.2, 0.8, 1);
  mouthG.add(at(tongue, 0, -0.042, 0.002));
  head.add(mouthG);

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
      const wing = outlined(ball(0.1, M.cream, 1, 0.68, 0.5, true));
      wing.rotation.z = s * 0.25;
      bow.add(at(wing, s * 0.095, 0.012, 0));
    }
    bow.add(outlined(ball(0.045, M.cream, 1, 1, 0.9, true)));
    band.add(bow);
  }

  /* ── bạn vịt con lẽo đẽo theo sau ── */
  const duck = new THREE.Group();
  const duckBody = new THREE.Group();
  duck.add(duckBody);
  duckBody.add(at(outlined(ball(0.19, M.duck, 1.05, 0.92, 1.2)), 0, 0.19, 0));
  duckBody.add(at(outlined(ball(0.135, M.duck)), 0, 0.42, 0.13));
  duckBody.add(at(outlined(ball(0.062, M.beak, 1.05, 0.42, 1.15, true)), 0, 0.4, 0.27));
  // nơ hồng trên cổ vịt
  for (const s of [-1, 1]) duckBody.add(at(outlined(ball(0.05, M.pink, 1, 0.7, 0.5, true)), s * 0.05, 0.31, 0.2));
  for (const s of [-1, 1]) {
    duckBody.add(at(ball(0.022, M.eye, 1, 1.2, 1, true), s * 0.07, 0.455, 0.235));
    duckBody.add(at(ball(0.03, M.blush, 1, 0.7, 0.4, true), s * 0.1, 0.41, 0.215));
    const wing = outlined(ball(0.1, M.duck, 0.35, 0.7, 1.05, true));
    duckBody.add(at(wing, s * 0.19, 0.2, -0.02));
    duck.add(at(ball(0.05, M.beak, 1, 0.3, 1.4, true), s * 0.08, 0.015, 0.05));
  }
  const tail = outlined(ball(0.07, M.duck, 0.8, 0.8, 1.2, true));
  tail.rotation.x = -0.7;
  duckBody.add(at(tail, 0, 0.27, -0.22));
  scene.add(duck);

  /* ── chiếc bánh mochi sinh nhật ở cuối quầy: 3 tầng, viền kem, dâu, nến số 1 ── */
  const cake = new THREE.Group();
  const plate = outlined(new THREE.Mesh(track(new THREE.CylinderGeometry(0.62, 0.54, 0.06, 40)), M.white));
  cake.add(at(plate, 0, 0.03, 0));
  cake.add(at(outlined(ball(0.46, M.cream, 1.14, 0.66, 1.14)), 0, 0.3, 0));
  cake.add(at(outlined(ball(0.33, M.pink, 1.12, 0.64, 1.12)), 0, 0.66, 0));
  cake.add(at(outlined(ball(0.21, M.yellow, 1.1, 0.7, 1.1)), 0, 0.93, 0));
  // viền kem trắng giữa các tầng
  for (const [y, r] of [[0.5, 0.36], [0.83, 0.23]] as const) {
    const rim = outlined(new THREE.Mesh(track(new THREE.TorusGeometry(r, 0.045, 10, 36)), M.cream));
    rim.rotation.x = Math.PI / 2;
    cake.add(at(rim, 0, y, 0));
  }
  // mặt cười của bánh
  for (const s of [-1, 1]) {
    cake.add(at(ball(0.03, M.eye, 1, 1.2, 0.6, true), s * 0.13, 0.36, 0.5));
    cake.add(at(ball(0.012, M.shine, 1, 1, 0.6, true), s * 0.13 + 0.01, 0.375, 0.52));
    cake.add(at(ball(0.055, M.blush, 1, 0.6, 0.3, true), s * 0.24, 0.3, 0.47));
  }
  const cakeMouth = new THREE.Mesh(track(new THREE.CircleGeometry(0.04, 18, Math.PI, Math.PI)), M.mouth);
  cake.add(at(cakeMouth, 0, 0.32, 0.522));
  // nến hình số 1
  const one = new THREE.Group();
  const stem = outlined(new THREE.Mesh(track(new THREE.BoxGeometry(0.1, 0.36, 0.08)), M.pink));
  one.add(at(stem, 0, 0.18, 0));
  const flag = outlined(new THREE.Mesh(track(new THREE.BoxGeometry(0.1, 0.07, 0.08)), M.pink));
  flag.rotation.z = 0.7;
  one.add(at(flag, -0.06, 0.32, 0));
  for (const y of [0.08, 0.18, 0.28]) one.add(at(new THREE.Mesh(track(new THREE.BoxGeometry(0.104, 0.03, 0.084)), M.white), 0, y, 0));
  const wick = new THREE.Mesh(track(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6)), M.stripe);
  one.add(at(wick, 0, 0.385, 0));
  cake.add(at(one, 0, 1.02, 0));
  const flame = ball(0.05, M.flame, 0.8, 1.35, 0.8, true);
  cake.add(at(flame, 0, 1.47, 0));
  const glow = ball(0.13, M.glow, 1, 1.2, 1, true);
  cake.add(at(glow, 0, 1.47, 0));
  for (const [x, y, z] of [[0.2, 0.92, 0.2], [-0.3, 0.72, 0.22], [0.34, 0.68, -0.05]] as const) {
    cake.add(at(outlined(ball(0.07, M.berry, 1, 1.1, 1, true)), x, y, z));
    cake.add(at(ball(0.035, M.leaf, 1.3, 0.4, 1.3, true), x, y + 0.075, z));
  }
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

      const { xStart, xEnd, xCake } = path();
      const x = lerp(xStart, xEnd, p);
      apply(pose);
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
      glow.scale.setScalar(0.13 * (0.95 + 0.1 * fl));
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

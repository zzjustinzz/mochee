/**
 * Các tư thế của bé (góc khớp tính bằng độ) + hàm trộn theo tiến trình cuộn.
 */

/* ───────────────────────── tiện ích ───────────────────────── */

export const DEG = Math.PI / 180;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const up = (x: number) => Math.max(0, x);

/** Tư thế = bộ góc khớp (độ) + độ cao hông. Trái = phía +X của bé. */
export type Pose = {
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

export const sin = Math.sin;
export const cos = Math.cos;

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

/** Tư thế của bé theo tiến trình cuộn p (0 → 1) và thời gian t (giây). */
export function poseAt(p: number, t: number): Pose {
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

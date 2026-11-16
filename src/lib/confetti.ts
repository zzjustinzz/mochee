'use client';

/**
 * Pháo giấy nhỏ (không cần thư viện): bánh mochi tròn, rắc cốm và trái tim bay ra từ một điểm.
 * Tự dọn sau ~2,5 giây. Bỏ qua nếu khách bật "giảm chuyển động".
 */
const COLORS = ['#ffd84a', '#ff9aa8', '#c9eaba', '#bfe6ee', '#dccaf3', '#ff9a3c', '#ffffff'];

type P = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; c: string; shape: 0 | 1 | 2 };

export function confetti(origin?: { x: number; y: number }, count = 90) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.remove();
  ctx.scale(dpr, dpr);

  const ox = origin?.x ?? window.innerWidth / 2;
  const oy = origin?.y ?? window.innerHeight / 2;
  const ps: P[] = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const sp = 6 + Math.random() * 9;
    return {
      x: ox, y: oy,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
    };
  });

  const t0 = performance.now();
  const draw = (now: number) => {
    const t = now - t0;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of ps) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 2500);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.strokeStyle = '#5b3a1e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (p.shape === 0) {
        // viên mochi
        ctx.ellipse(0, 0, p.r * 1.2, p.r * 0.9, 0, 0, Math.PI * 2);
      } else if (p.shape === 1) {
        // cốm rắc
        ctx.roundRect(-p.r * 1.3, -p.r * 0.35, p.r * 2.6, p.r * 0.7, p.r * 0.35);
      } else {
        // trái tim
        const s = p.r * 0.9;
        ctx.moveTo(0, s * 0.9);
        ctx.bezierCurveTo(-s * 1.6, -s * 0.2, -s * 0.6, -s * 1.4, 0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.6, -s * 1.4, s * 1.6, -s * 0.2, 0, s * 0.9);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (t < 2600) requestAnimationFrame(draw);
    else canvas.remove();
  };
  requestAnimationFrame(draw);
}

/** Bắn pháo giấy từ giữa một phần tử (nút bấm, thẻ…). */
export function confettiFrom(el: Element | null, count?: number) {
  if (!el) return confetti(undefined, count);
  const r = el.getBoundingClientRect();
  confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, count);
}

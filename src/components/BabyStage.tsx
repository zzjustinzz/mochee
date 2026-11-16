'use client';

import { useEffect, useRef, useState } from 'react';
import { MILESTONES, milestoneIndex } from '@/three/milestones';
import { Duck } from './Decor';
import { confettiFrom } from '@/lib/confetti';

type Props = {
  /** phần tử bao toàn bộ hành trình (để biết lúc nào cuộn tới cuối) */
  sectionRef: React.RefObject<HTMLElement | null>;
  /** danh sách ảnh – tiến trình tính từ ảnh đầu tới ảnh cuối */
  trackRef: React.RefObject<HTMLElement | null>;
};

/**
 * Quầy bánh dính ở đáy màn hình: bé Mochee 3D đi từ trái sang phải theo tiến trình cuộn,
 * lần lượt lật → trườn → bò → đứng → đi, tới chiếc bánh sinh nhật ở cuối quầy.
 */
export default function BabyStage({ sectionRef, trackRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blown, setBlown] = useState(false);
  const stageRef = useRef<import('@/three/mocheeStage').MocheeStage | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let stage: import('@/three/mocheeStage').MocheeStage | null = null;
    let raf = 0;
    let alive = true;
    let visible = true;
    let current = 0;
    let lastStep = -1;
    let lastArrived = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();

    /** 0 khi ảnh đầu nằm giữa vùng xem ảnh, 1 khi ảnh cuối nằm giữa (hoặc đã cuộn hết). */
    const section = sectionRef.current;
    const shots = trackRef.current?.querySelectorAll<HTMLElement>('[data-shot]');
    const firstShot = shots?.[0];
    const lastShot = shots?.[shots.length - 1];
    let topbar = 0;
    let stageH = wrap.offsetHeight;

    const readProgress = () => {
      if (!section || !firstShot || !lastShot || firstShot === lastShot) return 0;
      const vh = window.innerHeight;
      const centerLine = (topbar + (vh - stageH)) / 2;
      const first = firstShot.getBoundingClientRect();
      const last = lastShot.getBoundingClientRect();
      const a = first.top + first.height / 2 - centerLine;
      const b = Math.min(last.top + last.height / 2 - centerLine, section.getBoundingClientRect().bottom - vh);
      const range = b - a;
      return range <= 1 ? 0 : Math.min(1, Math.max(0, -a / range));
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!stage || !visible) return;
      const target = readProgress();
      current += (target - current) * (reduced ? 1 : 0.14);
      if (Math.abs(target - current) < 0.0004) current = target;
      stage.frame(current, reduced ? 1.2 : (now - t0) / 1000);

      const s = milestoneIndex(current);
      if (s !== lastStep) setStep((lastStep = s));
      const done = current > 0.975;
      if (done !== lastArrived) setArrived((lastArrived = done));
    };

    const fit = () => {
      if (!stage) return;
      stage.resize(wrap.clientWidth, wrap.clientHeight);
      stageH = wrap.offsetHeight;
      topbar = parseFloat(getComputedStyle(wrap).getPropertyValue('--topbar')) || 0;
      // bong bóng thoại neo ngay bên trái đầu bé lúc về đích
      const a = stage.anchor();
      const bubble = bubbleRef.current;
      if (bubble) {
        bubble.style.right = `${((1 - a.x) * wrap.clientWidth).toFixed(1)}px`;
        bubble.style.bottom = `${((1 - a.y) * wrap.clientHeight).toFixed(1)}px`;
      }
    };
    const ro = new ResizeObserver(fit);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '80px' });

    import('@/three/mocheeStage')
      .then(({ createMocheeStage }) => {
        if (!alive) return;
        stage = createMocheeStage(canvas);
        stageRef.current = stage;
        fit();
        ro.observe(wrap);
        io.observe(wrap);
        raf = requestAnimationFrame(loop);
      })
      .catch((err) => {
        console.warn('Không khởi tạo được WebGL, dùng hình thay thế.', err);
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stage?.dispose();
    };
  }, [sectionRef, trackRef]);

  return (
    <div
      ref={wrapRef}
      className={`stage ${arrived ? 'is-arrived' : ''}`}
      role="img"
      aria-label={`Bé Mochee 3D trên quầy bánh – đang ở chặng: ${MILESTONES[step].label}`}
    >
      <div className="stage__counter" aria-hidden="true" />
      {failed ? <Duck className="stage__fallback" /> : <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />}
      <button
        ref={bubbleRef}
        type="button"
        className="stage__bubble"
        tabIndex={arrived ? 0 : -1}
        aria-hidden={!arrived}
        onClick={(e) => {
          stageRef.current?.blowCandle();
          confettiFrom(e.currentTarget, 80);
          setBlown(true);
          window.setTimeout(() => setBlown(false), 6000);
        }}
      >
        {blown ? 'Chúc mừng sinh nhật Mochee!' : 'Thổi nến giúp Mochee nha!'}
      </button>
      <ol className="stage__steps" aria-hidden="true">
        {MILESTONES.map((m, i) => (
          <li key={m.key} className={i === step ? 'is-on' : i < step ? 'is-done' : undefined}>
            {m.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

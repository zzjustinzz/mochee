'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Decor';

export type LightboxItem = { src: string; alt: string; remote?: boolean };
type Opener = (items: LightboxItem[], index: number) => void;

const LightboxContext = createContext<Opener>(() => {});
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ items: LightboxItem[]; index: number } | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const open = useCallback<Opener>((items, index) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setState({ items, index });
  }, []);

  const close = useCallback(() => {
    setState(null);
    lastFocus.current?.focus?.();
  }, []);

  const step = useCallback((d: number) => {
    setState((s) => (s ? { ...s, index: (s.index + d + s.items.length) % s.items.length } : s));
  }, []);

  const isOpen = state !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
    };
  }, [isOpen, close, step]);

  const value = useMemo(() => open, [open]);
  const item = state?.items[state.index];

  return (
    <LightboxContext.Provider value={value}>
      {children}
      {state && item && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={item.src}
            className="lightbox__img"
            src={item.src}
            alt={item.alt}
            referrerPolicy={item.remote ? 'no-referrer' : undefined}
          />
          <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={close} aria-label="Đóng">
            <Icon name="close" />
          </button>
          {state.items.length > 1 && (
            <>
              <button type="button" className="lightbox__btn lightbox__prev" onClick={() => step(-1)} aria-label="Ảnh trước">
                <Icon name="left" />
              </button>
              <button type="button" className="lightbox__btn lightbox__next" onClick={() => step(1)} aria-label="Ảnh sau">
                <Icon name="right" />
              </button>
              <p className="lightbox__count" aria-live="polite">
                {state.index + 1} / {state.items.length}
              </p>
            </>
          )}
        </div>
      )}
    </LightboxContext.Provider>
  );
}

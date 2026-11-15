'use client';

import { useCallback, useEffect, useState } from 'react';
import { Duck, Mochi, Sparkle } from './Decor';
import { site } from '@/lib/site';

type Phase = 'closed' | 'opening' | 'gone';

/** Màn mở đầu: mặt tiền tiệm bánh, chạm vào thì hai cánh cửa mở ra rồi "bước vào" trang. */
export default function Intro() {
  const [phase, setPhase] = useState<Phase>('closed');

  const openDoors = useCallback(() => {
    setPhase((p) => (p === 'closed' ? 'opening' : p));
  }, []);

  // khoá cuộn khi cửa còn đóng
  useEffect(() => {
    const root = document.documentElement;
    if (phase === 'gone') {
      root.classList.remove('is-intro');
      return;
    }
    root.classList.add('is-intro');
    return () => root.classList.remove('is-intro');
  }, [phase]);

  // tự mở sau vài giây nếu khách chưa chạm
  useEffect(() => {
    if (phase !== 'closed') return;
    const timer = window.setTimeout(openDoors, 4200);
    return () => window.clearTimeout(timer);
  }, [phase, openDoors]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setPhase('gone'), reduced ? 500 : 2300);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div className={`intro ${phase === 'opening' ? 'is-opening' : ''}`} aria-label={`${site.shopName} đang mở cửa`}>
      <div className="intro__sky" aria-hidden="true">
        <Sparkle className="intro__spark intro__spark--1" />
        <Sparkle className="intro__spark intro__spark--2" />
        <Sparkle className="intro__spark intro__spark--3" />
      </div>

      <div className="shop">
        <div className="shop__sign">
          <Mochi className="shop__sign-mochi" flavor="cream" />
          <div>
            <p className="shop__sign-name">{site.shopName}</p>
            <p className="shop__sign-sub">mochi tươi mỗi ngày · từ {site.birthLabel}</p>
          </div>
        </div>

        <div className="shop__awning" aria-hidden="true" />

        <div className="shop__front">
          <div className="shop__window" aria-hidden="true">
            <div className="shop__shelf">
              <Mochi flavor="peach" />
              <Mochi flavor="butter" />
            </div>
            <div className="shop__shelf">
              <Mochi flavor="matcha" />
              <Mochi flavor="taro" />
            </div>
          </div>

          <button type="button" className="shop__doorway" onClick={openDoors} aria-label="Mở cửa tiệm bánh">
            <span className="shop__glow" aria-hidden="true" />
            <span className="shop__welcome" aria-hidden="true">
              Mời vào!
            </span>
            <span className="shop__door shop__door--l" aria-hidden="true">
              <span className="shop__glass" />
              <span className="shop__knob" />
            </span>
            <span className="shop__door shop__door--r" aria-hidden="true">
              <span className="shop__glass" />
              <span className="shop__knob" />
            </span>
            <span className="shop__hanger" aria-hidden="true">
              <span className="shop__hanger-card">
                <span className="shop__hanger-face shop__hanger-face--closed">Sắp mở</span>
                <span className="shop__hanger-face shop__hanger-face--open">Mở cửa</span>
              </span>
            </span>
          </button>

          <div className="shop__window" aria-hidden="true">
            <div className="shop__shelf">
              <Mochi flavor="butter" />
              <Mochi flavor="taro" />
            </div>
            <div className="shop__shelf shop__shelf--duck">
              <Duck />
            </div>
          </div>
        </div>

        <div className="shop__step" aria-hidden="true" />
        <Duck className="shop__duck shop__duck--1" />
        <Duck className="shop__duck shop__duck--2" />
      </div>

      <p className="intro__hint">
        <span>Chạm vào cửa để ghé tiệm</span>
      </p>
    </div>
  );
}

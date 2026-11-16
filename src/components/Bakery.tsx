/**
 * Bộ sticker "đồ làm bánh" vẽ tay bằng SVG – viền nâu cacao, màu pastel.
 * Dùng chung cho cột trái (bếp bánh) và các thẻ bên phải.
 */
import type { CSSProperties } from 'react';

const C = '#5b3a1e'; // viền cacao
type P = { className?: string; style?: CSSProperties };
const svg = (vb: string, p: P, children: React.ReactNode) => (
  <svg className={p.className} style={p.style} viewBox={vb} aria-hidden="true" focusable="false">
    <g stroke={C} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
);

export const RollingPin = (p: P) =>
  svg('0 0 120 60', p, <>
    <rect x="4" y="23" width="20" height="14" rx="7" fill="#e7b778" />
    <rect x="96" y="23" width="20" height="14" rx="7" fill="#e7b778" />
    <rect x="20" y="12" width="80" height="36" rx="15" fill="#f8d9a6" />
    <path d="M30 22h46" stroke="#fff" strokeOpacity=".75" />
    <path d="M34 39h10M56 39h18" stroke="#e7b778" />
  </>);

export const Whisk = (p: P) =>
  svg('0 0 60 120', p, <>
    <path d="M30 70C8 56 10 10 30 6c20 4 22 50 0 64z" fill="#fffaf0" fillOpacity=".55" />
    <path d="M30 70C19 54 20 12 30 6c10 6 11 48 0 64z" fill="none" />
    <path d="M30 6v64" />
    <rect x="23" y="68" width="14" height="46" rx="7" fill="#ffb3bd" />
    <circle cx="30" cy="104" r="2.5" fill={C} stroke="none" />
  </>);

export const PipingBag = (p: P) =>
  svg('0 0 100 120', p, <>
    <path d="M18 34h64L55 104h-10z" fill="#bfe6ee" />
    <path d="M32 46l6 34M50 46v40M68 46l-6 34" stroke="#fff" strokeOpacity=".8" />
    <path d="M14 36c4-16 18-12 22-20 6 8 12-6 18 0 6-6 14 6 18 0 6 8 14 6 14 20z" fill="#fffaf0" />
    <path d="M44 104h12l-2 12h-8z" fill="#d9d2c8" />
  </>);

export const Bowl = (p: P) =>
  svg('0 0 120 100', p, <>
    <path d="M18 42c4-18 20-14 26-22 8 10 16-4 24 4 8-6 18 2 22 6 8-2 14 6 14 12z" fill="#fffaf0" />
    <rect x="6" y="38" width="108" height="12" rx="6" fill="#ffb3bd" />
    <path d="M12 50h96c0 26-22 40-48 40S12 76 12 50z" fill="#ffc9d0" />
    <path d="M30 62c6 10 16 16 30 16" stroke="#fff" strokeOpacity=".8" fill="none" />
    <path d="M44 90h32l-4 6H48z" fill="#ffb3bd" />
    <path d="M84 30L104 4" />
    <ellipse cx="80" cy="34" rx="7" ry="9" fill="#fffaf0" transform="rotate(35 80 34)" />
  </>);

export const Spatula = (p: P) =>
  svg('0 0 50 130', p, <>
    <rect x="17" y="58" width="16" height="66" rx="8" fill="#ffd84a" />
    <path d="M8 14C8 4 42 4 42 14v34c0 8-6 12-17 12S8 56 8 48z" fill="#c9eaba" />
    <path d="M16 18v26" stroke="#fff" strokeOpacity=".8" />
  </>);

export const Cupcake = (p: P) =>
  svg('0 0 100 110', p, <>
    <path d="M20 62h60l-8 42H28z" fill="#ffd84a" />
    <path d="M36 64l3 38M50 64v38M64 64l-3 38" stroke="#f0b62a" />
    <path d="M14 62c-6-14 8-24 16-20 0-14 14-22 24-14 10-8 26 0 22 14 10-2 18 10 10 20z" fill="#ffd6dc" />
    <path d="M30 50c8 4 18 4 26 0" stroke="#fff" strokeOpacity=".8" fill="none" />
    <circle cx="54" cy="16" r="9" fill="#ff6b6b" />
    <path d="M54 7c2-5 6-6 9-6" fill="none" />
    <path d="M28 40l4-3M46 34l5 1M64 44l3 4M40 52l-3 3" stroke="#7ac6e0" />
  </>);

export const Strawberry = (p: P) =>
  svg('0 0 80 90', p, <>
    <path d="M40 84C14 70 8 44 16 32c8-10 40-10 48 0 8 12 2 38-24 52z" fill="#ff6b6b" />
    <path d="M22 30c6 6 14 4 18-2 4 6 12 8 18 2l-4-10-14 4-14-4z" fill="#8fcf7a" />
    <path d="M40 22V8" />
    <g fill="#fff3c4" stroke="none">
      <ellipse cx="30" cy="46" rx="2" ry="3" /><ellipse cx="50" cy="46" rx="2" ry="3" />
      <ellipse cx="40" cy="58" rx="2" ry="3" /><ellipse cx="28" cy="62" rx="2" ry="3" />
      <ellipse cx="52" cy="62" rx="2" ry="3" /><ellipse cx="40" cy="72" rx="2" ry="3" />
    </g>
  </>);

export const Dango = (p: P) =>
  svg('0 0 50 130', p, <>
    <path d="M25 4v122" stroke="#d9a868" strokeWidth="5" />
    <path d="M25 4v122" />
    <circle cx="25" cy="26" r="18" fill="#ffc9d0" />
    <circle cx="25" cy="60" r="18" fill="#fffaf0" />
    <circle cx="25" cy="94" r="18" fill="#c9eaba" />
    <g stroke="none" fill={C}>
      <circle cx="19" cy="58" r="2" /><circle cx="31" cy="58" r="2" />
    </g>
    <path d="M21 64c2 2 6 2 8 0" fill="none" strokeWidth="2.2" />
    <ellipse cx="16" cy="20" rx="4" ry="2.5" fill="#fff" stroke="none" opacity=".8" />
  </>);

export const Egg = (p: P) =>
  svg('0 0 70 86', p, <>
    <path d="M35 4C18 4 6 34 6 52c0 18 13 30 29 30s29-12 29-30C64 34 52 4 35 4z" fill="#fffaf0" />
    <ellipse cx="24" cy="30" rx="5" ry="9" fill="#fff" stroke="none" transform="rotate(20 24 30)" />
    <g stroke="none" fill={C}>
      <circle cx="26" cy="52" r="2.6" /><circle cx="44" cy="52" r="2.6" />
    </g>
    <ellipse cx="20" cy="60" rx="5" ry="3" fill="#ff9d9d" stroke="none" opacity=".6" />
    <ellipse cx="50" cy="60" rx="5" ry="3" fill="#ff9d9d" stroke="none" opacity=".6" />
  </>);

export const Mitt = (p: P) =>
  svg('0 0 90 110', p, <>
    <path d="M26 96V44c0-22 10-36 26-36s24 14 24 30v58z" fill="#ffd6dc" />
    <path d="M26 64c-14 0-22-8-20-18 2-8 12-10 20-2" fill="#ffd6dc" />
    <rect x="22" y="90" width="58" height="14" rx="6" fill="#ffd84a" />
    <path d="M52 50c-4-6-14-2-10 6l10 10 10-10c4-8-6-12-10-6z" fill="#ff8a96" />
  </>);

export const Flour = (p: P) =>
  svg('0 0 100 110', p, <>
    <path d="M18 26c0-10 64-10 64 0l8 70c0 10-80 10-80 0z" fill="#fffaf0" />
    <path d="M18 26c10 8 54 8 64 0" fill="none" />
    <path d="M28 18c4-10 14-2 22-10 8 8 18 0 22 10" fill="#fffaf0" />
    <rect x="28" y="48" width="44" height="28" rx="8" fill="#ffd84a" />
    <text x="50" y="68" textAnchor="middle" fontFamily="'Baloo 2 Variable', sans-serif" fontWeight="800" fontSize="16" fill={C} stroke="none">BỘT</text>
  </>);

export const Sprinkles = (p: P) =>
  svg('0 0 80 80', p, <g strokeWidth="5">
    <path d="M10 14l8 4" stroke="#ff8a96" /><path d="M40 8l-2 9" stroke="#7ac6e0" />
    <path d="M64 18l8-3" stroke="#ffd84a" /><path d="M20 44l-4 8" stroke="#c9a6ef" />
    <path d="M50 40l9 3" stroke="#8fcf7a" /><path d="M30 68l9-2" stroke="#ff9a3c" />
    <path d="M66 60l-3 9" stroke="#ff8a96" />
  </g>);

/** Bánh mochi trên kệ đỡ bánh nhiều tầng – dùng làm "đế" cho ảnh chân dung. */
export const CakeStand = (p: P) =>
  svg('0 0 300 90', p, <>
    <ellipse cx="150" cy="20" rx="146" ry="16" fill="#fffaf0" />
    <path d="M10 22c10 14 270 14 280 0" fill="none" stroke="#e8d3a6" />
    <path d="M128 34h44l-8 36h-28z" fill="#ffd84a" />
    <ellipse cx="150" cy="78" rx="52" ry="9" fill="#ffd84a" />
  </>);

/* ── đồ chơi cho trò "Mochee sẽ bốc món nào?" ── */
export const Laptop = (p: P) =>
  svg('0 0 100 80', p, <>
    <rect x="18" y="8" width="64" height="44" rx="6" fill="#bfe6ee" />
    <rect x="25" y="15" width="50" height="30" rx="3" fill="#fffaf0" />
    <path d="M44 30c2 3 10 3 12 0" fill="none" />
    <circle cx="42" cy="25" r="2" fill={C} stroke="none" /><circle cx="58" cy="25" r="2" fill={C} stroke="none" />
    <path d="M6 58h88l-6 12H12z" fill="#e9eef2" />
    <path d="M42 63h16" />
  </>);

export const Stethoscope = (p: P) =>
  svg('0 0 100 100', p, <>
    <path d="M26 10v26c0 14 8 24 20 24s20-10 20-24V10" fill="none" strokeWidth="5" />
    <path d="M26 10v26c0 14 8 24 20 24s20-10 20-24V10" fill="none" stroke="#ff9aa8" strokeWidth="2.5" />
    <path d="M46 60v14c0 10 8 16 18 16s16-8 16-16" fill="none" strokeWidth="5" />
    <path d="M46 60v14c0 10 8 16 18 16s16-8 16-16" fill="none" stroke="#ff9aa8" strokeWidth="2.5" />
    <circle cx="80" cy="66" r="11" fill="#d9d2c8" /><circle cx="80" cy="66" r="5" fill="#fffaf0" />
    <circle cx="26" cy="9" r="4" fill="#ffd84a" /><circle cx="66" cy="9" r="4" fill="#ffd84a" />
  </>);

export const Mic = (p: P) =>
  svg('0 0 70 110', p, <>
    <path d="M28 54h14l-3 48h-8z" fill={C} />
    <circle cx="35" cy="30" r="22" fill="#dccaf3" />
    <path d="M19 22h32M16 32h38M19 42h32" stroke="#fff" strokeOpacity=".8" />
    <rect x="22" y="50" width="26" height="8" rx="4" fill="#ffd84a" />
  </>);

export const Pencil = (p: P) =>
  svg('0 0 40 120', p, <>
    <rect x="8" y="10" width="24" height="12" rx="4" fill="#ff9aa8" />
    <rect x="8" y="20" width="24" height="8" fill="#d9d2c8" />
    <rect x="8" y="28" width="24" height="64" fill="#ffd84a" />
    <path d="M16 30v60M24 30v60" stroke="#f0b62a" />
    <path d="M8 92h24l-12 24z" fill="#f8d9a6" />
    <path d="M16 108l4 8 4-8z" fill={C} />
  </>);

export const Coin = (p: P) =>
  svg('0 0 90 90', p, <>
    <circle cx="45" cy="47" r="38" fill="#f0b62a" />
    <circle cx="45" cy="43" r="38" fill="#ffd84a" />
    <circle cx="45" cy="43" r="27" fill="none" stroke="#f0b62a" strokeWidth="4" />
    <path d="M45 26l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#fff3c4" />
  </>);

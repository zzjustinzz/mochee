/** Hình trang trí vẽ tay bằng SVG: vịt con, bánh mochi, lấp lánh… */
import type { CSSProperties } from 'react';

type SvgProps = { className?: string; style?: CSSProperties; title?: string };

export function Duck({ className, style }: SvgProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 124 108" aria-hidden="true" focusable="false">
      <path d="M46 90l-7 11h15zM68 90l-7 11h15z" fill="#ff9a3c" />
      <path d="M24 60 9 46c-2-2 0-5 3-4l20 6z" fill="#ffd23f" />
      <ellipse cx="57" cy="67" rx="37" ry="27" fill="#ffd23f" />
      <circle cx="86" cy="37" r="23" fill="#ffd23f" />
      <path d="M38 66c9-14 25-13 33-1-9 15-25 15-33 1z" fill="#f7b928" />
      <path d="M106 33c9 1 16 4 15 8-1 5-10 6-17 3z" fill="#ff9a3c" />
      <circle cx="92" cy="31" r="3.6" fill="#3a2416" />
      <circle cx="93.2" cy="29.8" r="1.2" fill="#fff" />
      <ellipse cx="85" cy="44" rx="5.5" ry="3.6" fill="#ffab91" opacity=".75" />
    </svg>
  );
}

const MOCHI_COLORS: Record<string, [string, string]> = {
  butter: ['#fff1b8', '#f3d27a'],
  peach: ['#ffd6d9', '#f3a9b0'],
  matcha: ['#dcedc0', '#b5d18c'],
  taro: ['#e6d8f5', '#c4abe3'],
  cream: ['#fffaf0', '#ecdcb8'],
};

export function Mochi({ className, style, flavor = 'butter', face = true }: SvgProps & { flavor?: string; face?: boolean }) {
  const [fill, shade] = MOCHI_COLORS[flavor] ?? MOCHI_COLORS.butter;
  return (
    <svg className={className} style={style} viewBox="0 0 120 88" aria-hidden="true" focusable="false">
      <path d="M8 56C8 26 34 8 60 8s52 18 52 48c0 16-18 24-52 24S8 72 8 56z" fill={fill} />
      <path d="M8 56c0 16 18 24 52 24s52-8 52-24c0 10-20 16-52 16S8 66 8 56z" fill={shade} opacity=".55" />
      <ellipse cx="42" cy="26" rx="13" ry="6" fill="#fff" opacity=".55" transform="rotate(-18 42 26)" />
      {face && (
        <>
          <ellipse cx="45" cy="47" rx="3.4" ry="4.2" fill="#4a2e18" />
          <ellipse cx="75" cy="47" rx="3.4" ry="4.2" fill="#4a2e18" />
          <path d="M54 52c3 4 9 4 12 0" fill="none" stroke="#4a2e18" strokeWidth="2.6" strokeLinecap="round" />
          <ellipse cx="35" cy="55" rx="6" ry="3.6" fill="#ff9d9d" opacity=".6" />
          <ellipse cx="85" cy="55" rx="6" ry="3.6" fill="#ff9d9d" opacity=".6" />
        </>
      )}
    </svg>
  );
}

export function Sparkle({ className, style }: SvgProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 2c1.6 9.5 5.5 14.4 18 18-12.5 3.6-16.4 8.5-18 18-1.6-9.5-5.5-14.4-18-18 12.5-3.6 16.4-8.5 18-18z" fill="currentColor" />
    </svg>
  );
}

export function Icon({ name, className }: { name: 'clock' | 'pin' | 'route' | 'calendar' | 'heart' | 'send' | 'photos' | 'arrow' | 'close' | 'check' | 'minus' | 'plus' | 'left' | 'right'; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
    pin: (<><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>),
    route: (<><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></>),
    calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
    heart: <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
    send: <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" />,
    photos: (<><rect x="3.5" y="6" width="14" height="13" rx="2.5" /><path d="M7 3.5h11A2.5 2.5 0 0 1 20.5 6v10M6 16l3.5-4 3 3 2-2 3 3" /></>),
    arrow: <path d="M12 5v14M6 13l6 6 6-6" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    minus: <path d="M6 12h12" />,
    plus: <path d="M12 6v12M6 12h12" />,
    left: <path d="M14.5 5l-7 7 7 7" />,
    right: <path d="M9.5 5l7 7-7 7" />,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

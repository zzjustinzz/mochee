'use client';

import { useEffect, useState } from 'react';
import { site } from '@/lib/site';

const TARGET = new Date(site.partyStart).getTime();
const END = new Date(site.partyEnd).getTime();
const pad = (n: number) => String(n).padStart(2, '0');

export default function Countdown() {
  // null cho tới khi chạy trên trình duyệt -> tránh lệch giờ giữa server và client
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now !== null && now >= TARGET) {
    return (
      <div className="countdown countdown--done" role="status">
        <p className="countdown__done">
          {now < END ? 'Tiệm đang mở tiệc – mời bạn vào ngay!' : 'Tiệc đã tan – cảm ơn bạn đã đến chung vui cùng Mochee!'}
        </p>
      </div>
    );
  }

  const diff = now === null ? null : Math.max(0, TARGET - now);
  const s = diff === null ? null : Math.floor(diff / 1000);
  const units: [string, string][] = [
    ['ngày', s === null ? '--' : pad(Math.floor(s / 86400))],
    ['giờ', s === null ? '--' : pad(Math.floor((s % 86400) / 3600))],
    ['phút', s === null ? '--' : pad(Math.floor((s % 3600) / 60))],
    ['giây', s === null ? '--' : pad(s % 60)],
  ];

  return (
    <div className="countdown">
      <p className="countdown__label">Mẻ bánh sinh nhật sẽ ra lò sau</p>
      <ol
        className="countdown__units"
        role="timer"
        aria-label={s === null ? 'Đếm ngược tới bữa tiệc' : `Còn ${units[0][1]} ngày ${units[1][1]} giờ ${units[2][1]} phút`}
      >
        {units.map(([label, value]) => (
          <li key={label} className="countdown__unit">
            <span className="countdown__num" aria-hidden="true">
              {value}
            </span>
            <span className="countdown__name" aria-hidden="true">
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

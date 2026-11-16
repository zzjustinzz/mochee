'use client';

import { useState } from 'react';
import { site } from '@/lib/site';

/** Gửi thiệp cho bạn bè: dùng bảng chia sẻ của điện thoại, máy tính thì chép đường link. */
export default function ShareButton({ label = 'Gửi thiệp cho bạn bè', className = 'btn btn--ghost' }: { label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.origin;
    const text = `Mời bạn đến dự tiệc sinh nhật đầu tiên của bé ${site.nickname} (${site.babyFullName}) – ${site.partyTimeLabel}, ${site.partyDateLabel}, ${site.venue.name} – ${site.venue.hall}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Sinh nhật 1 tuổi bé ${site.nickname}`, text, url });
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return; // khách tự đóng bảng chia sẻ
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Chép đường link thiệp:', url);
    }
  }

  return (
    <button type="button" className={className} onClick={share}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      <span aria-live="polite">{copied ? 'Đã chép đường link!' : label}</span>
    </button>
  );
}

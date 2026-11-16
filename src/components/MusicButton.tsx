'use client';

import { useEffect, useState } from 'react';
import { isPlaying, onMusicChange, pauseMusic, playMusic } from '@/lib/music';

/** Nút bật/tắt nhạc hộp nhạc trên thanh điều hướng. */
export default function MusicButton() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isPlaying());
    return onMusicChange(setOn);
  }, []);

  return (
    <button
      type="button"
      className={`music-btn ${on ? 'is-on' : ''}`}
      onClick={() => (on ? pauseMusic() : void playMusic())}
      aria-pressed={on}
      aria-label={on ? 'Tắt nhạc' : 'Bật nhạc'}
      title={on ? 'Tắt nhạc' : 'Bật nhạc hộp nhạc'}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.6" fill="currentColor" />
        <circle cx="16.5" cy="16" r="2.6" fill="currentColor" />
      </svg>
      <span className="music-btn__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {!on && <span className="music-btn__off" aria-hidden="true" />}
    </button>
  );
}

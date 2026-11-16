'use client';

/**
 * Nhạc nền hộp nhạc (public/music/mochee-music-box.mp3 – giai điệu tự sáng tác + Happy Birthday).
 * Trình duyệt chỉ cho phát nhạc sau một cú chạm của khách, nên nhạc bắt đầu khi khách mở cửa tiệm
 * hoặc bấm nút loa. Lựa chọn tắt nhạc được nhớ lại cho lần ghé sau.
 */
const SRC = '/music/mochee-music-box.mp3';
const PREF = 'mochee:music';

type Listener = (playing: boolean) => void;
let audio: HTMLAudioElement | null = null;
let wantPlaying = false;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(!!audio && !audio.paused));

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.45;
    audio.addEventListener('play', emit);
    audio.addEventListener('pause', emit);
    // chuyển tab / khoá màn hình thì tạm dừng, quay lại thì phát tiếp
    document.addEventListener('visibilitychange', () => {
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (wantPlaying) void audio.play().catch(() => {});
    });
  }
  return audio;
}

function savePref(on: boolean) {
  try {
    localStorage.setItem(PREF, on ? 'on' : 'off');
  } catch {
    /* bỏ qua */
  }
}

export function musicMutedByGuest(): boolean {
  try {
    return localStorage.getItem(PREF) === 'off';
  } catch {
    return false;
  }
}

/** Gọi trong một sự kiện chạm/bấm của khách. */
export async function playMusic(remember = true) {
  wantPlaying = true;
  if (remember) savePref(true);
  try {
    await el().play();
  } catch {
    wantPlaying = false; // trình duyệt chặn – khách bấm nút loa sau cũng được
  }
  emit();
}

export function pauseMusic() {
  wantPlaying = false;
  savePref(false);
  audio?.pause();
  emit();
}

export function isPlaying() {
  return !!audio && !audio.paused;
}

export function onMusicChange(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

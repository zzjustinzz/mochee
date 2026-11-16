'use client';

import { useEffect, useMemo, useState } from 'react';
import { confettiFrom } from '@/lib/confetti';
import { GUESS_ITEMS, type GuessKey } from '@/lib/guess';
import { Coin, Laptop, Mic, Pencil, Stethoscope, Whisk } from './Bakery';
import { Duck } from './Decor';

const ICONS: Record<GuessKey, React.ComponentType<{ className?: string }>> = {
  whisk: Whisk,
  laptop: Laptop,
  stetho: Stethoscope,
  mic: Mic,
  pencil: Pencil,
  coin: Coin,
};
const KEY = 'mochee:guess';

/** "Mochee sẽ bốc món nào?" – khách đoán, xem tỉ lệ đoán của mọi người. Kết quả thật công bố ở tiệc. */
export default function GuessGame() {
  const [mine, setMine] = useState<GuessKey | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as GuessKey | null;
      if (saved && GUESS_ITEMS.some((g) => g.key === saved)) setMine(saved);
    } catch {
      /* bỏ qua */
    }
    fetch('/api/guess')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.counts && setCounts(d.counts))
      .catch(() => {});
  }, []);

  const total = useMemo(() => (counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0), [counts]);

  async function pick(key: GuessKey, target: HTMLElement) {
    if (mine || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Chưa ghi nhận được, bạn thử lại nhé.');
      setMine(key);
      setCounts(data.counts ?? null);
      confettiFrom(target, 50);
      try {
        localStorage.setItem(KEY, key);
      } catch {
        /* bỏ qua */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setSending(false);
    }
  }

  const showResults = !!mine && !!counts;

  return (
    <section className="card guess" id="doan" aria-labelledby="guess-title">
      <Duck className="card__sticker card__sticker--duck" />
      <p className="eyebrow">Trò chơi nhỏ</p>
      <h2 id="guess-title" className="card__title">
        Mochee sẽ bốc món nào?
      </h2>
      <p className="guess__lead">
        Tại tiệc, ba mẹ sẽ bày một mâm đồ chơi để Mochee tự chọn. Bạn đoán thử bé sẽ cầm món nào đầu tiên nhé – kết quả
        thật công bố ở bữa tiệc!
      </p>

      <ul className="guess__grid">
        {GUESS_ITEMS.map((g) => {
          const Icon = ICONS[g.key];
          const n = counts?.[g.key] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <li key={g.key}>
              <button
                type="button"
                className={`guess__item ${mine === g.key ? 'is-mine' : ''}`}
                onClick={(e) => pick(g.key, e.currentTarget)}
                disabled={!!mine || sending}
                aria-pressed={mine === g.key}
              >
                <Icon className="guess__icon" />
                <span className="guess__name">{g.item}</span>
                <span className="guess__dream">{g.dream}</span>
                {showResults && (
                  <span className="guess__bar" aria-label={`${pct}% khách đoán`}>
                    <span style={{ width: `${pct}%` }} />
                    <b>{pct}%</b>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}
      <p className="guess__note" aria-live="polite">
        {mine
          ? `Bạn đoán: ${GUESS_ITEMS.find((g) => g.key === mine)?.item}. ${total} lượt đoán tới giờ – hẹn bạn ở tiệc để xem ai đoán trúng!`
          : 'Bấm vào một món để đoán (mỗi người một lần).'}
      </p>
    </section>
  );
}

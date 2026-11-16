'use client';

import { useEffect, useId, useState } from 'react';
import { Dango } from './Bakery';
import { Duck, Icon } from './Decor';
import { confettiFrom } from '@/lib/confetti';
import { site } from '@/lib/site';
import ShareButton from './ShareButton';

type Saved = { name: string; guests: number };
const KEY = 'mochee:rsvp';

/** Form xác nhận tham dự: tên + số người (+ lời nhắn tuỳ chọn). */
export default function RsvpForm() {
  const id = useId();
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Saved | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (s?.name) {
          setSaved(s);
          setStatus('done');
        }
      }
    } catch {
      /* trình duyệt chặn localStorage – bỏ qua */
    }
    fetch('/api/rsvp')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setTotal(d.guests))
      .catch(() => {});
  }, []);

  const clampGuests = (n: number) => Math.min(20, Math.max(1, n));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Bạn cho gia đình biết tên với nhé.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, guests, note, website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Chưa ghi nhận được, bạn thử lại giúp nhé.');
      const s = { name: cleanName, guests };
      setSaved(s);
      setStatus('done');
      confettiFrom(document.getElementById('xac-nhan'));
      setTotal((t) => (t ?? 0) + guests);
      try {
        localStorage.setItem(KEY, JSON.stringify(s));
      } catch {
        /* bỏ qua */
      }
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, bạn thử lại giúp nhé.');
    }
  }

  return (
    <section className="card rsvp" id="xac-nhan" aria-labelledby="rsvp-title">
      <Dango className="card__sticker card__sticker--dango" />
      <p className="eyebrow">Giữ chỗ tại tiệm</p>
      <h2 id="rsvp-title" className="card__title">
        Xác nhận tham dự
      </h2>

      {status === 'done' && saved ? (
        <div className="rsvp__done" role="status">
          <Duck className="rsvp__duck" />
          <p className="rsvp__done-title">Đã giữ chỗ cho {saved.name}!</p>
          <p>
            Tiệm chuẩn bị <strong>{saved.guests} chỗ ngồi</strong>. Hẹn gặp lúc {site.partyTimeLabel},{' '}
            {site.partyDateLabel} tại {site.venue.hall}.
          </p>
          <ShareButton label="Rủ thêm bạn bè đến tiệc" />
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setStatus('idle');
              setName('');
              setNote('');
            }}
          >
            Xác nhận thêm cho người khác
          </button>
        </div>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <p className="form__lead">Cho ba mẹ Mochee biết bạn sẽ ghé để chuẩn bị bàn tiệc thật chu đáo nhé.</p>

          <div className="form__row">
          <div className="field">
            <label htmlFor={`${id}-name`}>Tên của bạn / gia đình</label>
            <input
              id={`${id}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              placeholder="Ví dụ: Gia đình cô Lan"
              required
              aria-invalid={!!error && !name.trim()}
            />
          </div>

          <div className="field">
            <span className="field__label" id={`${id}-guests-label`}>
              Số người tham dự
            </span>
            <div className="stepper" role="group" aria-labelledby={`${id}-guests-label`}>
              <button type="button" onClick={() => setGuests((g) => clampGuests(g - 1))} disabled={guests <= 1} aria-label="Bớt một người">
                <Icon name="minus" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(clampGuests(Number(e.target.value) || 1))}
                aria-labelledby={`${id}-guests-label`}
              />
              <button type="button" onClick={() => setGuests((g) => clampGuests(g + 1))} disabled={guests >= 20} aria-label="Thêm một người">
                <Icon name="plus" />
              </button>
              <span className="stepper__unit">người (tính cả bé nhỏ)</span>
            </div>
          </div>
          </div>

          <div className="field">
            <label htmlFor={`${id}-note`}>
              Lời nhắn cho ba mẹ Mochee <small>(không bắt buộc)</small>
            </label>
            <textarea
              id={`${id}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Cần ghế em bé, ăn chay, đến trễ một chút…"
            />
          </div>

          {/* ô bẫy bot – người thật không nhìn thấy */}
          <div className="trap" aria-hidden="true">
            <label>
              Website
              <input type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </label>
          </div>

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={status === 'sending'}>
            <Icon name="check" /> {status === 'sending' ? 'Đang giữ chỗ…' : 'Xác nhận tham dự'}
          </button>
        </form>
      )}

      {total !== null && total > 0 && (
        <p className="rsvp__total">
          Tiệm đã nhận giữ chỗ cho <strong>{total}</strong> vị khách.
        </p>
      )}
    </section>
  );
}

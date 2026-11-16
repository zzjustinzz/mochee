'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { PipingBag } from './Bakery';
import { Icon, Mochi } from './Decor';
import { confettiFrom } from '@/lib/confetti';
import { flavors, type FlavorKey } from '@/lib/flavors';

type Wish = { id: number; name: string; message: string; flavor: string; createdAt: string };
const NAME_KEY = 'mochee:name';
const MAX = 500;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Sổ lời chúc: form gửi + danh sách lời chúc mọi người để lại (lưu trong SQLite). */
export default function Wishes() {
  const id = useId();
  const [items, setItems] = useState<Wish[]>([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [flavor, setFlavor] = useState<FlavorKey>('butter');
  const [trap, setTrap] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [thanks, setThanks] = useState(false);

  const load = useCallback(async (before?: number) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/wishes${before ? `?before=${before}` : ''}`);
      if (!res.ok) throw new Error('load');
      const data = (await res.json()) as { items: Wish[]; total: number; nextCursor: number | null };
      setItems((prev) => {
        const seen = new Set(prev.map((w) => w.id));
        return before ? [...prev, ...data.items.filter((w) => !seen.has(w.id))] : data.items;
      });
      setTotal(data.total);
      setCursor(data.nextCursor);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    try {
      const n = localStorage.getItem(NAME_KEY);
      if (n) setName(n);
    } catch {
      /* bỏ qua */
    }
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    if (!cleanName) return setError('Bạn cho Mochee biết tên với nhé.');
    if (cleanMessage.length < 2) return setError('Bạn viết đôi lời chúc cho Mochee nhé.');
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, message: cleanMessage, flavor, website: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Chưa lưu được lời chúc, bạn thử lại giúp nhé.');
      if (data.item) {
        setItems((prev) => [data.item as Wish, ...prev]);
        setTotal((t) => t + 1);
      }
      setMessage('');
      setThanks(true);
      confettiFrom(document.querySelector('#loi-chuc .wishes__list-head'), 70);
      window.setTimeout(() => setThanks(false), 6000);
      try {
        localStorage.setItem(NAME_KEY, cleanName);
      } catch {
        /* bỏ qua */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, bạn thử lại giúp nhé.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card wishes" id="loi-chuc" aria-labelledby="wishes-title">
      <PipingBag className="card__sticker" />
      <p className="eyebrow">Sổ lưu bút của tiệm</p>
      <h2 id="wishes-title" className="card__title">
        Gửi lời chúc cho Mochee
      </h2>

      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor={`${id}-name`}>Tên của bạn</label>
          <input
            id={`${id}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoComplete="name"
            placeholder="Cô, chú, dì, bác…"
            required
          />
        </div>

        <div className="field">
          <label htmlFor={`${id}-msg`}>Lời chúc</label>
          <textarea
            id={`${id}-msg`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX}
            rows={3}
            placeholder="Chúc Mochee hay ăn chóng lớn, lúc nào cũng tròn xoe như bánh mochi…"
            required
          />
          <span className="field__count" aria-hidden="true">
            {message.length}/{MAX}
          </span>
        </div>

        <fieldset className="flavors">
          <legend>Chọn vị mochi cho tấm thiệp</legend>
          <div className="flavors__list">
            {flavors.map((f) => (
              <label key={f.key} className={`flavor ${flavor === f.key ? 'is-on' : ''}`}>
                <input type="radio" name={`${id}-flavor`} value={f.key} checked={flavor === f.key} onChange={() => setFlavor(f.key)} />
                <Mochi flavor={f.key} />
                <span>{f.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

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
        <p className="form__ok" role="status">
          {thanks ? 'Mochee đã nhận được lời chúc, cảm ơn bạn thật nhiều!' : ''}
        </p>

        <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
          <Icon name="send" /> {sending ? 'Đang gửi…' : 'Gửi lời chúc'}
        </button>
      </form>

      <div className="wishes__list-head">
        <h3>Lời chúc đã gửi</h3>
        {total > 0 && <span className="chip">{total} lời chúc</span>}
      </div>

      {items.length === 0 && !loading && !loadError && (
        <p className="wishes__empty">Chưa có lời chúc nào – bạn mở hàng cho tiệm nhé!</p>
      )}
      {loadError && (
        <p className="wishes__empty">
          Chưa tải được lời chúc.{' '}
          <button type="button" className="link-btn" onClick={() => load()}>
            Thử lại
          </button>
        </p>
      )}

      <ul className="wishes__list">
        {items.map((w) => (
          <li key={w.id} className={`wish wish--${w.flavor}`}>
            <Mochi className="wish__mochi" flavor={w.flavor} />
            <div className="wish__body">
              <p className="wish__meta">
                <strong>{w.name}</strong>
                <time dateTime={w.createdAt}>{timeAgo(w.createdAt)}</time>
              </p>
              <p className="wish__text">{w.message}</p>
            </div>
          </li>
        ))}
      </ul>

      {loading && <p className="wishes__empty">Đang mở sổ lưu bút…</p>}
      {cursor !== null && !loading && (
        <button type="button" className="btn btn--ghost btn--block" onClick={() => load(cursor)}>
          Xem thêm lời chúc
        </button>
      )}
    </section>
  );
}

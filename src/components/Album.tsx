'use client';

import { useMemo, useState } from 'react';
import { albumPhotos } from '@/lib/album';
import { site } from '@/lib/site';
import { Strawberry } from './Bakery';
import { Icon } from './Decor';
import { useLightbox } from './Lightbox';

const PAGE = 12;

/** Ảnh lấy thêm từ album Shotpik của bé (tải thẳng từ Shotpik, không chiếm dung lượng dự án). */
export default function Album() {
  const [shown, setShown] = useState(PAGE);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());
  const open = useLightbox();

  const usable = useMemo(() => albumPhotos.filter((p) => !broken.has(p.name)), [broken]);
  const visible = usable.slice(0, shown);
  const items = useMemo(
    () => usable.map((p) => ({ src: p.full, alt: `Ảnh ${p.name} trong album của Mochee`, remote: true })),
    [usable],
  );

  return (
    <section className="card album" id="album" aria-labelledby="album-title">
      <Strawberry className="card__sticker" />
      <p className="eyebrow">Tủ kính trưng bày</p>
      <h2 id="album-title" className="card__title">
        Album ảnh của Mochee
      </h2>
      <p className="album__lead">Thêm vài khoảnh khắc hậu trường trong buổi chụp ảnh sinh nhật. Bấm vào ảnh để xem lớn.</p>

      {visible.length > 0 && (
        <ul className="album__grid">
          {visible.map((p, i) => (
            <li key={p.name}>
              <button type="button" onClick={() => open(items, i)} aria-label={`Xem ảnh ${i + 1} trong album`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setBroken((prev) => new Set(prev).add(p.name))}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="album__actions">
        {shown < usable.length && (
          <button type="button" className="btn btn--ghost" onClick={() => setShown((n) => n + PAGE)}>
            <Icon name="photos" /> Xem thêm ảnh
          </button>
        )}
        <a className="btn btn--primary" href={site.albumUrl} target="_blank" rel="noopener noreferrer">
          Mở trọn bộ {site.albumTotal} ảnh
        </a>
      </div>
    </section>
  );
}

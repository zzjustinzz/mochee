'use client';

import { Fragment, useMemo, useRef } from 'react';
import { allPhotos, chapters, photoFull, photoThumb } from '@/lib/photos';
import BabyStage from './BabyStage';
import { Duck, Icon, Mochi, Sparkle } from './Decor';
import { useLightbox } from './Lightbox';

const pad = (n: number) => String(n).padStart(2, '0');

/** Hình trang trí đặt cạnh mỗi tấm ảnh, xoay vòng cho đỡ lặp. */
function Sticker({ i }: { i: number }) {
  switch (i % 5) {
    case 0:
      return <Duck className="sticker sticker--duck" />;
    case 1:
      return <Mochi className="sticker sticker--mochi" flavor="peach" />;
    case 2:
      return <Mochi className="sticker sticker--mochi sticker--low" flavor="taro" />;
    case 3:
      return <Mochi className="sticker sticker--mochi" flavor="matcha" />;
    default:
      return <Sparkle className="sticker sticker--spark" />;
  }
}

/** Cột trái: 20 tấm ảnh xếp dọc + quầy bánh có bé Mochee 3D chạy theo tiến trình cuộn. */
export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const openLightbox = useLightbox();

  const lightboxItems = useMemo(() => allPhotos.map((p) => ({ src: photoFull(p.id), alt: p.alt })), []);
  const offsets = useMemo(() => chapters.map((_, ci) => chapters.slice(0, ci).reduce((sum, c) => sum + c.photos.length, 0)), []);

  return (
    <section ref={sectionRef} className="journey" id="hanh-trinh" aria-labelledby="journey-title">
      <header className="journey__head">
        <p className="eyebrow">Thực đơn kỷ niệm</p>
        <h2 id="journey-title" className="journey__title">
          365 ngày lớn khôn của Mochee
        </h2>
        <p className="journey__lead">
          Cuộn xuống để lật từng trang ảnh. Trên quầy bánh, bé Mochee sẽ lật, trườn, bò, đứng rồi chập chững bước tới
          chiếc bánh sinh nhật đầu tiên.
        </p>
        <p className="journey__scroll" aria-hidden="true">
          <Icon name="arrow" /> Cuộn xuống
        </p>
        <Duck className="journey__head-duck" />
      </header>

      <ol ref={trackRef} className="journey__track">
        {chapters.map((chapter, ci) => (
          <Fragment key={chapter.key}>
            <li className="chapter">
              <span className="chapter__label">{chapter.label}</span>
              <h3 className="chapter__title">{chapter.title}</h3>
              <p className="chapter__note">{chapter.note}</p>
            </li>
            {chapter.photos.map((photo, pi) => {
              const i = offsets[ci] + pi;
              return (
                <li key={photo.id} className={`shot ${i % 2 ? 'shot--r' : 'shot--l'}`} data-shot>
                  <figure
                    className="photo"
                    style={{ '--ratio': (photo.w / photo.h).toFixed(4), '--tilt': `${i % 2 ? 1.6 : -1.6}deg` } as React.CSSProperties}
                  >
                    <button type="button" className="photo__btn" onClick={() => openLightbox(lightboxItems, i)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoThumb(photo.id)}
                        alt={photo.alt}
                        width={photo.w}
                        height={photo.h}
                        loading={i < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        style={{ backgroundColor: photo.color }}
                      />
                      <span className="visually-hidden"> – bấm để xem ảnh lớn</span>
                    </button>
                    <figcaption className="photo__tag">
                      No. {pad(i + 1)}
                      <span> / {allPhotos.length}</span>
                    </figcaption>
                  </figure>
                  <Sticker i={i} />
                </li>
              );
            })}
          </Fragment>
        ))}
      </ol>

      <div className="journey__end">
        <p className="journey__end-title">Mochee tới bánh sinh nhật rồi!</p>
        <p>Hẹn gặp cả nhà ở tiệm lúc 17:30, Chủ nhật 22 · 11 nhé.</p>
        <a className="btn btn--primary" href="#xac-nhan">
          Xác nhận tham dự
        </a>
      </div>

      <BabyStage sectionRef={sectionRef} trackRef={trackRef} />
    </section>
  );
}

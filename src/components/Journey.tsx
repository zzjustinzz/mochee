'use client';

import { Fragment, useMemo, useRef } from 'react';
import { allPhotos, chapters, photoFull, photoThumb } from '@/lib/photos';
import BabyStage from './BabyStage';
import { Bowl, Cupcake, Dango, Egg, Flour, Mitt, PipingBag, RollingPin, Spatula, Sprinkles, Strawberry, Whisk } from './Bakery';
import { Duck, Icon, Mochi } from './Decor';
import { useLightbox } from './Lightbox';

const pad = (n: number) => String(n).padStart(2, '0');

/** Mỗi tấm ảnh có 2 món đồ làm bánh "đứng gác" ở khoảng trống bên cạnh – xoay vòng cho đỡ lặp. */
const PROPS: [React.ComponentType<{ className?: string }>, string][][] = [
  [[Whisk, 'whisk'], [Duck, 'duck']],
  [[Cupcake, 'cupcake'], [Sprinkles, 'sprinkles']],
  [[Dango, 'dango'], [Egg, 'egg']],
  [[RollingPin, 'pin'], [Strawberry, 'berry']],
  [[PipingBag, 'piping'], [Duck, 'duck duck--small']],
  [[Bowl, 'bowl'], [Sprinkles, 'sprinkles']],
  [[Mitt, 'mitt'], [Egg, 'egg']],
  [[Flour, 'flour'], [Strawberry, 'berry']],
  [[Spatula, 'spatula'], [Duck, 'duck']],
];

function Props({ i }: { i: number }) {
  const [[A, a], [B, b]] = PROPS[i % PROPS.length];
  return (
    <span className="props" aria-hidden="true">
      <A className={`prop prop--top prop--${a}`} />
      <B className={`prop prop--bottom prop--${b}`} />
    </span>
  );
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
        {/* thanh treo dụng cụ trong bếp */}
        <div className="rail" aria-hidden="true">
          <span className="rail__bar" />
          <span className="rail__hook rail__hook--1"><Whisk /></span>
          <span className="rail__hook rail__hook--2"><Spatula /></span>
          <span className="rail__hook rail__hook--3"><Mitt /></span>
          <span className="rail__hook rail__hook--4"><Whisk /></span>
        </div>
        <p className="eyebrow">Bếp bánh của Mochee</p>
        <h2 id="journey-title" className="journey__title">
          365 ngày lớn khôn
        </h2>
        <p className="journey__lead">
          Cuộn xuống xem từng mẻ ảnh. Dưới quầy bánh, Mochee sẽ lật, trườn, bò, đứng rồi chập chững tới chiếc bánh sinh
          nhật đầu tiên.
        </p>
        <div className="journey__counter" aria-hidden="true">
          <Mochi flavor="peach" />
          <Mochi flavor="butter" />
          <Mochi flavor="matcha" />
          <Duck className="journey__counter-duck" />
        </div>
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
                    className={`photo ${photo.w > photo.h ? 'photo--wide' : ''}`}
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
                      Mẻ #{pad(i + 1)}
                      <span> / {allPhotos.length}</span>
                    </figcaption>
                  </figure>
                  <Props i={i} />
                </li>
              );
            })}
          </Fragment>
        ))}
      </ol>

      <div className="journey__end">
        <Cupcake className="journey__end-cake" />
        <p className="journey__end-title">Mochee tới bánh sinh nhật rồi!</p>
        <p>Hẹn cả nhà lúc 17:30, Chủ nhật 22 · 11 nhé.</p>
        <a className="btn btn--primary" href="#xac-nhan">
          Xác nhận tham dự
        </a>
      </div>

      <BabyStage sectionRef={sectionRef} trackRef={trackRef} />
    </section>
  );
}

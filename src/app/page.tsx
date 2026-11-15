import Album from '@/components/Album';
import Countdown from '@/components/Countdown';
import { Duck, Mochi, Sparkle } from '@/components/Decor';
import Intro from '@/components/Intro';
import Journey from '@/components/Journey';
import { LightboxProvider } from '@/components/Lightbox';
import PartyInfo from '@/components/PartyInfo';
import RsvpForm from '@/components/RsvpForm';
import Wishes from '@/components/Wishes';
import { site } from '@/lib/site';

export default function Page() {
  return (
    <LightboxProvider>
      <Intro />

      <main className="layout">
        {/* CỘT TRÁI – 20 tấm ảnh + bé Mochee 3D lớn dần theo tiến trình cuộn */}
        <Journey />

        {/* CỘT PHẢI – thông tin bữa tiệc thôi nôi */}
        <aside className="panel" aria-label="Thông tin tiệc thôi nôi">
          <header className="topbar">
            <a className="topbar__brand" href="#thiep">
              <Mochi flavor="butter" />
              <span>{site.shopName}</span>
            </a>
            <nav className="topbar__nav" aria-label="Đi nhanh tới">
              <a href="#tiec">Tiệc</a>
              <a href="#xac-nhan">Xác nhận</a>
              <a href="#loi-chuc">Lời chúc</a>
              <a href="#album">Album</a>
            </nav>
          </header>

          <div className="panel__a">
            <section className="hero" id="thiep" aria-labelledby="hero-title">
              <Sparkle className="hero__spark hero__spark--1" />
              <Sparkle className="hero__spark hero__spark--2" />
              <p className="eyebrow">Khai trương {site.birthLabel} · nay tròn 1 tuổi</p>

              <div className="hero__portrait">
                <picture>
                  <source srcSet="/mochee-face.webp" type="image/webp" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/mochee-face.jpg"
                    width={720}
                    height={720}
                    alt={`Cận cảnh bé ${site.nickname} cười tươi, đội băng đô nơ kem`}
                    fetchPriority="high"
                  />
                </picture>
                <span className="hero__badge" aria-hidden="true">
                  <b>1</b>
                  tuổi
                </span>
                <Duck className="hero__duck" />
              </div>

              <p className="hero__kicker">Trân trọng kính mời đến dự tiệc thôi nôi của</p>
              <h1 id="hero-title" className="hero__title">
                {site.nickname}
              </h1>
              <p className="hero__name">
                bé <strong>{site.babyFullName}</strong>
              </p>
              <p className="hero__invite">
                Chiếc bánh mochi ngọt ngào nhất của ba mẹ đã tròn một năm «ra lò». Sự hiện diện của cô chú, anh chị và
                các bạn nhỏ là món quà quý nhất dành cho bé {site.babyName} trong ngày vui này.
              </p>

              <Countdown />

              <div className="hero__cta">
                <a className="btn btn--primary" href="#xac-nhan">
                  Xác nhận tham dự
                </a>
                <a className="btn btn--ghost" href="#loi-chuc">
                  Gửi lời chúc
                </a>
              </div>
            </section>

            <PartyInfo />
          </div>

          <div className="panel__b">
            <RsvpForm />
            <Wishes />
            <Album />

            <footer className="footer">
              <div className="footer__ducks" aria-hidden="true">
                <Duck />
                <Duck />
                <Duck />
              </div>
              <p>
                Cảm ơn bạn đã ghé <strong>{site.shopName}</strong>.
              </p>
              <p>Thương gửi từ ba mẹ và bé {site.babyName}.</p>
            </footer>
          </div>
        </aside>
      </main>
    </LightboxProvider>
  );
}

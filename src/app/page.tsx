import Countdown from '@/components/Countdown';
import { CakeStand, Strawberry } from '@/components/Bakery';
import { Duck, Mochi, Sparkle } from '@/components/Decor';
import Intro from '@/components/Intro';
import Journey from '@/components/Journey';
import MusicButton from '@/components/MusicButton';
import ShareButton from '@/components/ShareButton';
import { LightboxProvider } from '@/components/Lightbox';
import PartyInfo from '@/components/PartyInfo';
import RsvpForm from '@/components/RsvpForm';
import Wishes from '@/components/Wishes';
import { site } from '@/lib/site';

const BUNTING = ['M', 'O', 'C', 'H', 'E', 'E', '', '1', '', 'T', 'U', 'Ổ', 'I'];

/** cờ ở giữa dây võng xuống thấp hơn hai đầu */
const sag = (i: number) => {
  const f = ((i - (BUNTING.length - 1) / 2) / ((BUNTING.length - 1) / 2)) * 0.7;
  return `${(26 * Math.sqrt(1 - f * f) - 18).toFixed(1)}px`;
};

export default function Page() {
  return (
    <LightboxProvider>
      <Intro />

      <main className="layout">
        {/* CỘT TRÁI – 20 tấm ảnh + bé Mochee 3D lớn dần theo tiến trình cuộn */}
        <Journey />

        {/* CỘT PHẢI – thông tin bữa tiệc sinh nhật */}
        <aside className="panel" aria-label="Thông tin tiệc sinh nhật">
          <header className="topbar">
            <a className="topbar__brand" href="#thiep">
              <Mochi flavor="butter" />
              <span>{site.shopName}</span>
            </a>
            <nav className="topbar__nav" aria-label="Đi nhanh tới">
              <a href="#tiec">Tiệc</a>
              <a href="#xac-nhan">Xác nhận</a>
              <a href="#loi-chuc">Lời chúc</a>
            </nav>
            <MusicButton />
          </header>

          <div className="panel__a">
            <section className="hero" id="thiep" aria-labelledby="hero-title">
              <ul className="bunting" aria-hidden="true">
                {BUNTING.map((c, i) => (
                  <li key={i} className={c ? undefined : 'is-blank'} style={{ marginTop: sag(i) }}>
                    {c}
                  </li>
                ))}
              </ul>

              <div className="hero__grid">
                <div className="hero__visual">
                  <Sparkle className="hero__spark hero__spark--1" />
                  <Sparkle className="hero__spark hero__spark--2" />
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
                  </div>
                  <CakeStand className="hero__stand" />
                  <Duck className="hero__duck" />
                  <Strawberry className="hero__berry" />
                  <Mochi className="hero__mochi" flavor="peach" />
                </div>

                <div className="hero__text">
                  <p className="eyebrow">Khai trương {site.birthLabel} · nay tròn 1 tuổi</p>
                  <p className="hero__kicker">Tiệc sinh nhật đầu tiên của</p>
                  <h1 id="hero-title" className="hero__title">
                    {site.nickname}
                  </h1>
                  <p className="hero__name">
                    bé <strong>{site.babyFullName}</strong>
                  </p>
                  <p className="hero__invite">
                    Chiếc bánh mochi ngọt ngào nhất của ba mẹ đã tròn một năm «ra lò». Ba mẹ thân mời cô chú, anh chị và
                    các bạn nhỏ đến chung vui ngày sinh nhật đầu tiên của bé {site.babyName}.
                  </p>
                  <div className="hero__cta">
                    <a className="btn btn--primary" href="#xac-nhan">
                      Xác nhận tham dự
                    </a>
                    <a className="btn btn--ghost" href="#loi-chuc">
                      Gửi lời chúc
                    </a>
                  </div>
                </div>
              </div>

              <Countdown />
            </section>

            <PartyInfo />
          </div>

          <div className="panel__b">
            <RsvpForm />
            <Wishes />

            <footer className="footer">
              <div className="footer__ducks" aria-hidden="true">
                <Duck />
                <Duck />
                <Duck />
                <Mochi flavor="peach" />
              </div>
              <p>
                Cảm ơn bạn đã ghé <strong>{site.shopName}</strong>.
              </p>
              <p>Thương gửi từ ba mẹ và bé {site.babyName}.</p>
              <div className="footer__share">
                <ShareButton />
              </div>
            </footer>
          </div>
        </aside>
      </main>
    </LightboxProvider>
  );
}

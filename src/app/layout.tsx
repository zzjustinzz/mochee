import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/baloo-2';
import '@fontsource-variable/quicksand';
import './globals.css';
import { site } from '@/lib/site';

const title = `Thôi nôi bé ${site.nickname} · ${site.partyTimeLabel} – 22.11.2026`;
const description = `${site.shopName} mở cửa mừng bé ${site.babyFullName} tròn 1 tuổi. Mời bạn ghé ${site.venue.name} (${site.venue.hall}) lúc ${site.partyTimeLabel}, ${site.partyDateLabel}.`;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'vi_VN',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: `Bé ${site.nickname} giữa vườn vịt con` }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
  robots: { index: false, follow: false }, // thiệp mời riêng tư – không cho Google lập chỉ mục
};

export const viewport: Viewport = {
  themeColor: '#ffd84a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {/* Không có JavaScript thì bỏ màn mở cửa để khách vẫn đọc được thiệp */}
        <noscript>
          <style>{'.intro{display:none!important}'}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}

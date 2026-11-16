import { links, site } from '@/lib/site';

/**
 * Bản đồ tĩnh ghép từ ô ảnh OpenStreetMap (thẻ <img>, không dùng iframe).
 * Lý do: iframe Google Maps bị chặn trong trình duyệt của Messenger/Zalo/Facebook
 * (lỗi net::ERR_BLOCKED_BY_RESPONSE). Ảnh thì luôn hiện được; bấm vào bản đồ sẽ mở Google Maps.
 */
const Z = 17;
const TILE = 256;

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  };
}

export default function VenueMap() {
  const { x: fx, y: fy } = tileXY(site.venue.lat, site.venue.lng, Z);
  const tx = Math.floor(fx);
  const ty = Math.floor(fy);
  const tiles: { key: string; src: string; left: number; top: number }[] = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      tiles.push({
        key: `${dx}:${dy}`,
        src: `https://tile.openstreetmap.org/${Z}/${tx + dx}/${ty + dy}.png`,
        left: Math.round((tx + dx - fx) * TILE),
        top: Math.round((ty + dy - fy) * TILE),
      });
    }
  }

  return (
    <div className="map">
      <a
        className="map__link"
        href={links.place}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Mở ${site.venue.name} trên Google Maps`}
      >
        <span className="map__tiles" aria-hidden="true">
          {tiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t.key} src={t.src} alt="" width={TILE} height={TILE} loading="lazy" decoding="async" style={{ left: t.left, top: t.top }} />
          ))}
        </span>
        <span className="map__pin" aria-hidden="true">
          <span className="map__label">
            <b>{site.venue.name}</b>
            {site.venue.hall}
          </span>
          <svg viewBox="0 0 48 60" width="48" height="60">
            <path d="M24 58C24 58 4 36 4 22a20 20 0 0 1 40 0c0 14-20 36-20 36z" fill="#ff9a3c" stroke="#5b3a1e" strokeWidth="3" />
            <circle cx="24" cy="22" r="11" fill="#fff6e2" stroke="#5b3a1e" strokeWidth="2.5" />
            <circle cx="20" cy="21" r="1.8" fill="#5b3a1e" />
            <circle cx="28" cy="21" r="1.8" fill="#5b3a1e" />
            <path d="M21.5 25.5c1.5 1.6 3.5 1.6 5 0" fill="none" stroke="#5b3a1e" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="map__open">Mở Google Maps ↗</span>
      </a>
      <span className="map__credit">
        ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          OpenStreetMap
        </a>
      </span>
    </div>
  );
}

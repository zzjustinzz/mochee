'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { links, site } from '@/lib/site';

/**
 * Bản đồ OpenStreetMap kéo/zoom được (Leaflet).
 *
 * Không dùng iframe vì Google Maps bị chặn trong trình duyệt của Messenger/Zalo/Facebook
 * (lỗi net::ERR_BLOCKED_BY_RESPONSE). Leaflet vẽ bản đồ bằng các ô ảnh nên luôn hiện được.
 *
 * - Lớp ảnh tĩnh (render sẵn từ server) hiện ngay, đồng thời là bản dự phòng nếu Leaflet lỗi.
 * - Leaflet chỉ được tải khi khách cuộn tới bản đồ.
 * - Để không "kẹt" khi cuộn trang: phải chạm/bấm vào bản đồ thì mới kéo và zoom bằng con lăn được.
 */
const Z = 17;
const TILE = 256;
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

const PIN_SVG = `<svg viewBox="0 0 48 60" width="48" height="60" aria-hidden="true">
  <path d="M24 58C24 58 4 36 4 22a20 20 0 0 1 40 0c0 14-20 36-20 36z" fill="#ff9a3c" stroke="#5b3a1e" stroke-width="3"/>
  <circle cx="24" cy="22" r="11" fill="#fff6e2" stroke="#5b3a1e" stroke-width="2.5"/>
  <circle cx="20" cy="21" r="1.8" fill="#5b3a1e"/><circle cx="28" cy="21" r="1.8" fill="#5b3a1e"/>
  <path d="M21.5 25.5c1.5 1.6 3.5 1.6 5 0" fill="none" stroke="#5b3a1e" stroke-width="1.8" stroke-linecap="round"/>
</svg>`;

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  };
}

/** Lớp ảnh tĩnh: hiện ngay khi trang tải, Leaflet sẵn sàng thì ẩn đi. */
function StaticTiles() {
  const { x: fx, y: fy } = tileXY(site.venue.lat, site.venue.lng, Z);
  const tx = Math.floor(fx);
  const ty = Math.floor(fy);
  const tiles = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      tiles.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${dx}:${dy}`}
          src={`https://tile.openstreetmap.org/${Z}/${tx + dx}/${ty + dy}.png`}
          alt=""
          width={TILE}
          height={TILE}
          loading="lazy"
          decoding="async"
          style={{ left: Math.round((tx + dx - fx) * TILE), top: Math.round((ty + dy - fy) * TILE) }}
        />,
      );
    }
  }
  return (
    <span className="map__tiles" aria-hidden="true">
      {tiles}
    </span>
  );
}

function PinLabel() {
  return (
    <span className="map__label">
      <b>{site.venue.name}</b>
      {site.venue.hall}
    </span>
  );
}

export default function VenueMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const activate = useRef<(() => void) | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = mapRef.current;
    if (!wrap || !el) return;

    let map: import('leaflet').Map | null = null;
    let cancelled = false;

    const init = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (cancelled) return;
        const center: [number, number] = [site.venue.lat, site.venue.lng];
        map = L.map(el, {
          center,
          zoom: Z,
          minZoom: 12,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: false,
          dragging: false, // bật khi khách chạm vào bản đồ
          scrollWheelZoom: false,
          touchZoom: false,
          tapHold: false,
        });
        L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
        L.control.zoom({ position: 'topright', zoomInTitle: 'Phóng to', zoomOutTitle: 'Thu nhỏ' }).addTo(map);
        L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution(ATTRIBUTION).addTo(map);

        const icon = L.divIcon({
          className: 'map__marker',
          html: `<span class="map__pin">${PIN_SVG}</span>`,
          iconSize: [48, 60],
          iconAnchor: [24, 58],
          popupAnchor: [0, -60],
        });
        const marker = L.marker(center, { icon, keyboard: false, title: site.venue.name }).addTo(map);
        marker.bindTooltip(`<b>${site.venue.name}</b><br/>${site.venue.hall}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -62],
          opacity: 1,
          className: 'map__tooltip',
        });

        const m = map;
        activate.current = () => {
          m.dragging.enable();
          m.scrollWheelZoom.enable();
          m.touchZoom.enable();
          setActive(true);
        };
        m.on('click', () => activate.current?.());
        // hạ ghim xuống dưới tâm một chút để nhãn tên tiệm không bị nút gợi ý che
        m.panBy([0, -45], { animate: false });
        m.whenReady(() => !cancelled && setReady(true));
      } catch (err) {
        console.warn('Không tải được bản đồ tương tác, dùng bản đồ ảnh.', err);
      }
    };

    // chỉ tải Leaflet khi bản đồ sắp lọt vào màn hình
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void init();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(wrap);

    // cuộn bản đồ ra khỏi màn hình thì khoá lại, tránh kẹt cuộn trang lần sau
    const lockIo = new IntersectionObserver((entries) => {
      if (map && entries.every((e) => !e.isIntersecting)) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.touchZoom.disable();
        setActive(false);
      }
    });
    lockIo.observe(wrap);

    return () => {
      cancelled = true;
      io.disconnect();
      lockIo.disconnect();
      map?.remove();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`map ${ready ? 'is-ready' : ''} ${active ? 'is-active' : ''}`}>
      {/* lớp ảnh tĩnh: hiện ngay + dự phòng */}
      <div className="map__static">
        <StaticTiles />
        <span className="map__static-pin" aria-hidden="true">
          <PinLabel />
          <span className="map__pin" dangerouslySetInnerHTML={{ __html: PIN_SVG }} />
        </span>
        <span className="map__credit">
          © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
        </span>
      </div>

      {/* bản đồ Leaflet */}
      <div ref={mapRef} className="map__live" role="region" aria-label={`Bản đồ đường tới ${site.venue.name}`} />

      {ready && !active && (
        <button type="button" className="map__hint" onClick={() => activate.current?.()}>
          Chạm để xem bản đồ
        </button>
      )}

      <a className="map__open" href={links.place} target="_blank" rel="noopener noreferrer">
        Mở Google Maps ↗
      </a>
    </div>
  );
}

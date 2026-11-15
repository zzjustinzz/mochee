/** Mọi thông tin của bữa tiệc nằm ở đây – sửa một chỗ, cả trang đổi theo. */
export const site = {
  shopName: 'Tiệm bánh Mochee',
  babyName: 'An Vy',
  babyFullName: 'Trần Đặng An Vy',
  nickname: 'Mochee',
  birthDate: '2025-11-23',
  birthLabel: '23 · 11 · 2025',

  /** 17:30 ngày 22/11/2026, giờ Việt Nam (UTC+7) */
  partyStart: '2026-11-22T17:30:00+07:00',
  partyEnd: '2026-11-22T21:00:00+07:00',
  partyTimeLabel: '17:30',
  partyDateLabel: 'Chủ nhật, 22 · 11 · 2026',

  venue: {
    name: 'Nhà hàng Hương Phố',
    hall: 'Sảnh Grand Ruby',
    address: 'A12 Đường Phan Văn Trị, Phường Hạnh Thông, TP. Hồ Chí Minh',
    lat: 10.8287013,
    lng: 106.6833645,
    placeId: 'ChIJ_a_RXPkodTERXMy4Lt5CiKo',
  },

  albumUrl: 'https://shotpik.com/albums/01a1ab50-02c2-7026-9d88-a53f11cb2517',
  albumTotal: 401,
} as const;

const mapQuery = `${site.venue.name}, A12 Phan Văn Trị, Hạnh Thông, Hồ Chí Minh`;

export const links = {
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&ll=${site.venue.lat},${site.venue.lng}&z=16&hl=vi&output=embed`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}&destination_place_id=${site.venue.placeId}`,
  googleCalendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent('Thôi nôi bé Mochee (An Vy)')}` +
    '&dates=20261122T103000Z/20261122T140000Z' +
    `&details=${encodeURIComponent('Tiệc thôi nôi bé Trần Đặng An Vy – ' + site.venue.hall)}` +
    `&location=${encodeURIComponent(`${site.venue.name}, ${site.venue.address}`)}`,
  ics: '/thoi-noi-mochee.ics',
};

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
    name: 'Nhà hàng The Chateau',
    hall: 'Sảnh Grand Ruby',
    address: '26 Đường Phan Văn Trị, Phường Hạnh Thông, TP. Hồ Chí Minh',
    lat: 10.8291893,
    lng: 106.6834101,
    placeId: 'ChIJ96hkpvAodTERpTQy4riT5O0',
  },

} as const;

const mapQuery = 'Nhà Hàng Tiệc Cưới The Chateau, 26 Phan Văn Trị, Hạnh Thông, Hồ Chí Minh';

export const links = {
  place: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}&query_place_id=${site.venue.placeId}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}&destination_place_id=${site.venue.placeId}`,
  googleCalendar:
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent('Sinh nhật 1 tuổi bé Mochee (An Vy)')}` +
    '&dates=20261122T103000Z/20261122T140000Z' +
    `&details=${encodeURIComponent('Tiệc sinh nhật đầu tiên của bé Trần Đặng An Vy – ' + site.venue.hall)}` +
    `&location=${encodeURIComponent(`${site.venue.name}, ${site.venue.address}`)}`,
  ics: '/sinh-nhat-mochee.ics',
};

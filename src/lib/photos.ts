export type Photo = {
  id: string;
  w: number;
  h: number;
  /** màu nền trong lúc ảnh đang tải */
  color: string;
  alt: string;
};

export type Chapter = {
  key: string;
  label: string;
  title: string;
  note: string;
  photos: Photo[];
};

const p = (id: string, w: number, h: number, color: string, alt: string): Photo => ({ id, w, h, color, alt });

/** 20 ảnh trong /public/photos, giữ đúng thứ tự tên file. */
export const chapters: Chapter[] = [
  {
    key: 'family',
    label: 'Mẻ bánh số 1',
    title: 'Cả nhà mình',
    note: 'Ba, mẹ và chiếc bánh mochi nhỏ xíu',
    photos: [
      p('joy_3603', 1286, 1800, '#87634a', 'Mochee đứng trên ghế hồng giữa ba và mẹ'),
      p('joy_3610', 1286, 1800, '#906f5a', 'Mochee cười tươi bên ba mẹ'),
      p('joy_3639', 1286, 1800, '#8d6d58', 'Mochee cười khanh khách với ba mẹ'),
      p('joy_3648', 1800, 1286, '#876c5b', 'Ba thơm má Mochee, mẹ cười bên cạnh'),
      p('joy_3650', 1800, 1286, '#8a6f5d', 'Ba mẹ cùng thơm má Mochee'),
      p('joy_3666', 1286, 1800, '#8b6d5c', 'Mochee vỗ tay cười với ba mẹ'),
      p('joy_3739', 1286, 1800, '#8d694f', 'Mochee nắm tay ba mẹ tập đứng'),
      p('joy_3754', 1286, 1800, '#745640', 'Cả nhà chơi bong bóng xà phòng'),
      p('joy_3782', 1286, 1800, '#7a5f47', 'Mẹ bế Mochee cài nơ'),
      p('joy_3801', 1286, 1800, '#6e5541', 'Ba bế Mochee'),
    ],
  },
  {
    key: 'bear',
    label: 'Mẻ bánh số 2',
    title: 'Gấu bông & cây nến số 1',
    note: 'Ngọt như kem, mềm như gấu',
    photos: [
      p('joy_3838', 1286, 1800, '#bb9b8c', 'Mochee đứng vịn ngựa gỗ bên cây nến và số 1'),
      p('joy_3853', 1286, 1800, '#b38f7c', 'Mochee mếu máo bên ngựa gỗ'),
      p('joy_3870', 1198, 1800, '#a9897a', 'Mochee ngồi trong lòng gấu bông, cầm xúc xắc'),
      p('joy_3892', 1286, 1800, '#bca09d', 'Mochee vỗ tay lè lưỡi trong lòng gấu bông'),
      p('joy_3901', 1286, 1800, '#b6948c', 'Mochee cười tít mắt bên gấu bông'),
    ],
  },
  {
    key: 'ducks',
    label: 'Mẻ bánh số 3',
    title: 'Vườn vịt con',
    note: 'Áo vàng, khăn ren và những người bạn mỏ cam',
    photos: [
      p('joy_3911', 1800, 1286, '#b0988a', 'Mochee áo vàng ngồi giữa vườn hoa và đàn vịt'),
      p('joy_3935', 1286, 1800, '#be9c89', 'Mochee ngồi ghế gỗ giữa các bạn vịt'),
      p('joy_3942', 1286, 1800, '#c0a192', 'Mochee sờ mỏ bạn vịt đội khăn hồng'),
      p('joy_3958', 1286, 1800, '#c09f8d', 'Mochee nựng bạn vịt'),
      p('joy_3976', 1286, 1800, '#bb9b87', 'Mochee đẩy xe đi chợ cùng bạn vịt'),
    ],
  },
];

export const allPhotos: Photo[] = chapters.flatMap((c) => c.photos);
export const photoThumb = (id: string) => `/photos/thumbs/${id}.webp`;
export const photoFull = (id: string) => `/photos/${id}.jpg`;

/** "Vị mochi" người gửi chọn cho lời chúc – quyết định màu của tấm thiệp. */
export const flavors = [
  { key: 'butter', label: 'Bơ sữa' },
  { key: 'peach', label: 'Đào' },
  { key: 'matcha', label: 'Trà xanh' },
  { key: 'taro', label: 'Khoai môn' },
] as const;

export type FlavorKey = (typeof flavors)[number]['key'];
export const isFlavor = (v: unknown): v is FlavorKey => flavors.some((f) => f.key === v);

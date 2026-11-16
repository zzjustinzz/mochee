/** Trò "Mochee sẽ bốc món nào?" – khách đoán món bé chọn trong mâm đồ chơi ở buổi tiệc. */
export const GUESS_ITEMS = [
  { key: 'whisk', item: 'Cây phới', dream: 'Thợ làm bánh' },
  { key: 'laptop', item: 'Máy tính', dream: 'Kỹ sư công nghệ' },
  { key: 'stetho', item: 'Ống nghe', dream: 'Bác sĩ' },
  { key: 'mic', item: 'Micro', dream: 'Ca sĩ' },
  { key: 'pencil', item: 'Bút chì', dream: 'Nhà văn' },
  { key: 'coin', item: 'Đồng vàng', dream: 'Doanh nhân' },
] as const;

export type GuessKey = (typeof GUESS_ITEMS)[number]['key'];
export const isGuessKey = (v: unknown): v is GuessKey => GUESS_ITEMS.some((g) => g.key === v);

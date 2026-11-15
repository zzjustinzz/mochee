/** Mốc bắt đầu (theo tiến trình cuộn 0 → 1) của từng chặng lớn khôn. */
export const MILESTONES = [
  { key: 'lat', label: 'Lật', from: 0 },
  { key: 'truon', label: 'Trườn', from: 0.17 },
  { key: 'bo', label: 'Bò', from: 0.38 },
  { key: 'dung', label: 'Đứng', from: 0.6 },
  { key: 'di', label: 'Đi', from: 0.8 },
] as const;

export const milestoneIndex = (p: number) => {
  let i = 0;
  MILESTONES.forEach((m, idx) => {
    if (p >= m.from) i = idx;
  });
  return i;
};

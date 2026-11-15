'use client';

import { useCallback, useEffect, useState } from 'react';

type Rsvp = { id: number; name: string; guests: number; note: string; createdAt: string };
type Wish = { id: number; name: string; message: string; flavor: string; createdAt: string };
type Data = { rsvps: Rsvp[]; wishes: Wish[]; ephemeral: boolean };

const KEY = 'mochee:admin-key';
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** Trang riêng cho ba mẹ: xem danh sách khách xác nhận, lời chúc; xoá mục spam; tải CSV. */
export default function AdminPage() {
  const [key, setKey] = useState('');
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (k: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-key': k } });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Không tải được dữ liệu.');
      setData(body as Data);
      try {
        sessionStorage.setItem(KEY, k);
      } catch {
        /* bỏ qua */
      }
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) {
        setKey(saved);
        load(saved);
      }
    } catch {
      /* bỏ qua */
    }
  }, [load]);

  async function remove(type: 'rsvp' | 'wish', id: number, label: string) {
    if (!window.confirm(`Xoá "${label}"? Thao tác này không hoàn tác được.`)) return;
    const res = await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ type, id }),
    });
    if (res.ok) load(key);
    else setError('Không xoá được, thử lại nhé.');
  }

  function downloadCsv() {
    if (!data) return;
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [
      ['Tên', 'Số người', 'Lời nhắn', 'Thời gian'],
      ...data.rsvps.map((r) => [r.name, r.guests, r.note, fmt(r.createdAt)]),
    ];
    // thêm BOM ở đầu để Excel hiển thị đúng tiếng Việt
    const csv = String.fromCharCode(0xfeff) + rows.map((r) => r.map(esc).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'khach-thoi-noi-mochee.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalGuests = data?.rsvps.reduce((sum, r) => sum + r.guests, 0) ?? 0;

  return (
    <main className="admin">
      <p className="eyebrow">Sau quầy</p>
      <h1>Sổ đặt bàn của tiệm Mochee</h1>

      <form
        className="admin__login"
        onSubmit={(e) => {
          e.preventDefault();
          load(key);
        }}
      >
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Mã quản trị (ADMIN_KEY)"
          aria-label="Mã quản trị"
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !key}>
          {busy ? 'Đang tải…' : data ? 'Tải lại' : 'Mở sổ'}
        </button>
      </form>

      {error && (
        <p className="admin__warn" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          {data.ephemeral && (
            <p className="admin__warn">
              Chưa kết nối Turso: dữ liệu đang nằm ở bộ nhớ tạm của Vercel và sẽ mất khi máy chủ khởi động lại. Hãy thêm
              TURSO_DATABASE_URL và TURSO_AUTH_TOKEN (xem README).
            </p>
          )}

          <div className="admin__stats">
            <p className="admin__stat">
              <b>{totalGuests}</b> khách sẽ đến
            </p>
            <p className="admin__stat">
              <b>{data.rsvps.length}</b> lượt xác nhận
            </p>
            <p className="admin__stat">
              <b>{data.wishes.length}</b> lời chúc
            </p>
          </div>

          <div className="admin__bar">
            <button type="button" className="btn btn--ghost" onClick={downloadCsv} disabled={!data.rsvps.length}>
              Tải danh sách khách (CSV)
            </button>
          </div>

          <h2>Khách xác nhận</h2>
          <div className="admin__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Số người</th>
                  <th>Lời nhắn</th>
                  <th>Lúc</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.rsvps.length === 0 && (
                  <tr>
                    <td colSpan={5}>Chưa có ai xác nhận.</td>
                  </tr>
                )}
                {data.rsvps.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="num">{r.guests}</td>
                    <td className="wrap">{r.note}</td>
                    <td>{fmt(r.createdAt)}</td>
                    <td>
                      <button type="button" className="admin__del" onClick={() => remove('rsvp', r.id, r.name)}>
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Lời chúc</h2>
          <div className="admin__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Lời chúc</th>
                  <th>Lúc</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.wishes.length === 0 && (
                  <tr>
                    <td colSpan={4}>Chưa có lời chúc.</td>
                  </tr>
                )}
                {data.wishes.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td className="wrap">{w.message}</td>
                    <td>{fmt(w.createdAt)}</td>
                    <td>
                      <button type="button" className="admin__del" onClick={() => remove('wish', w.id, w.name)}>
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

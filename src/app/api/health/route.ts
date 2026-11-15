import { db, dbInfo } from '@/lib/db';
import { json } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health – kiểm tra nhanh dữ liệu đang lưu ở đâu (không lộ token).
 *  mode = "turso"      -> đã nối Turso, dữ liệu được giữ lâu dài
 *  mode = "vercel-tmp" -> CHƯA nhận được biến Turso, dữ liệu sẽ mất khi Vercel khởi động lại
 */
export async function GET() {
  const info = dbInfo();
  try {
    const client = await db();
    const [r, w] = await Promise.all([
      client.execute('SELECT COUNT(*) AS n, COALESCE(SUM(guests), 0) AS g FROM rsvps'),
      client.execute('SELECT COUNT(*) AS n FROM wishes'),
    ]);
    return json({
      ok: true,
      ...info,
      rsvps: Number(r.rows[0]?.n ?? 0),
      guests: Number(r.rows[0]?.g ?? 0),
      wishes: Number(w.rows[0]?.n ?? 0),
      env: process.env.VERCEL_ENV ?? 'local',
    });
  } catch (err) {
    console.error('[health]', err);
    return json({ ok: false, ...info, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

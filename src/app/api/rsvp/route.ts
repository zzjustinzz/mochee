import { db } from '@/lib/db';
import { cleanText, fail, json, rateLimit, readJson } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/rsvp – chỉ trả tổng số (danh sách chi tiết nằm ở /admin). */
export async function GET() {
  try {
    const client = await db();
    const res = await client.execute('SELECT COUNT(*) AS families, COALESCE(SUM(guests), 0) AS guests FROM rsvps');
    return json({ families: Number(res.rows[0]?.families ?? 0), guests: Number(res.rows[0]?.guests ?? 0) });
  } catch (err) {
    console.error('[rsvp:GET]', err);
    return fail('Tiệm đang bận một chút, bạn thử lại sau nhé.', 500);
  }
}

/** POST /api/rsvp  { name, guests, note } */
export async function POST(req: Request) {
  if (!rateLimit(req, 'rsvp')) return fail('Bạn gửi hơi nhanh, chờ một phút rồi thử lại nhé.', 429);

  const body = await readJson(req);
  if (!body) return fail('Dữ liệu gửi lên không hợp lệ.');
  if (body.website) return json({ ok: true });

  const name = cleanText(body.name, 60);
  const note = cleanText(body.note, 200, true);
  const guests = Number(body.guests);

  if (name.length < 1) return fail('Bạn cho gia đình biết tên với nhé.');
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) return fail('Số người tham dự từ 1 đến 20 nhé.');

  try {
    const client = await db();
    const res = await client.execute({
      sql: 'INSERT INTO rsvps (name, guests, note, created_at) VALUES (?, ?, ?, ?)',
      args: [name, guests, note, new Date().toISOString()],
    });
    return json({ ok: true, id: Number(res.lastInsertRowid), name, guests }, 201);
  } catch (err) {
    console.error('[rsvp:POST]', err);
    return fail('Chưa ghi nhận được, bạn thử lại giúp nhé.', 500);
  }
}

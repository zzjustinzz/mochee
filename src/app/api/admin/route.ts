import { timingSafeEqual } from 'node:crypto';
import { db, isEphemeralDb } from '@/lib/db';
import { fail, json, rateLimit, readJson } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: Request): 'ok' | 'locked' | 'denied' {
  const expected = process.env.ADMIN_KEY?.trim();
  if (!expected) return 'locked';
  const given = req.headers.get('x-admin-key') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? 'ok' : 'denied';
}

function gate(req: Request): Response | null {
  if (!rateLimit(req, 'admin', 20)) return fail('Thử lại sau một phút nhé.', 429);
  const state = authorized(req);
  if (state === 'locked') return fail('Chưa đặt biến môi trường ADMIN_KEY nên trang quản trị đang khoá.', 503);
  if (state === 'denied') return fail('Sai mã quản trị.', 401);
  return null;
}

/** GET /api/admin – toàn bộ khách xác nhận + lời chúc (cần header x-admin-key). */
export async function GET(req: Request) {
  const blocked = gate(req);
  if (blocked) return blocked;
  try {
    const client = await db();
    const [rsvps, wishes] = await Promise.all([
      client.execute('SELECT id, name, guests, note, created_at FROM rsvps ORDER BY id DESC'),
      client.execute('SELECT id, name, message, flavor, created_at FROM wishes ORDER BY id DESC'),
    ]);
    return json({
      ephemeral: isEphemeralDb(),
      rsvps: rsvps.rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        guests: Number(r.guests),
        note: String(r.note),
        createdAt: String(r.created_at),
      })),
      wishes: wishes.rows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        message: String(r.message),
        flavor: String(r.flavor),
        createdAt: String(r.created_at),
      })),
    });
  } catch (err) {
    console.error('[admin:GET]', err);
    return fail('Không đọc được dữ liệu.', 500);
  }
}

/** DELETE /api/admin  { type: 'rsvp' | 'wish', id } */
export async function DELETE(req: Request) {
  const blocked = gate(req);
  if (blocked) return blocked;
  const body = await readJson(req);
  const id = Number(body?.id);
  const table = body?.type === 'rsvp' ? 'rsvps' : body?.type === 'wish' ? 'wishes' : null;
  if (!table || !Number.isInteger(id) || id < 1) return fail('Yêu cầu không hợp lệ.');
  try {
    const client = await db();
    const res = await client.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    return json({ ok: true, deleted: res.rowsAffected });
  } catch (err) {
    console.error('[admin:DELETE]', err);
    return fail('Không xoá được.', 500);
  }
}

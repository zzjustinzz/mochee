import { db } from '@/lib/db';
import { cleanText, fail, json, rateLimit, readJson } from '@/lib/guard';
import { isFlavor } from '@/lib/flavors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE = 8;

/** GET /api/wishes?before=<id>  – lời chúc mới nhất trước, phân trang theo id. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const before = Number(url.searchParams.get('before'));
    const cursor = Number.isInteger(before) && before > 0 ? before : Number.MAX_SAFE_INTEGER;

    const client = await db();
    const [list, count] = await Promise.all([
      client.execute({
        sql: 'SELECT id, name, message, flavor, created_at FROM wishes WHERE id < ? ORDER BY id DESC LIMIT ?',
        args: [cursor, PAGE + 1],
      }),
      client.execute('SELECT COUNT(*) AS total FROM wishes'),
    ]);

    const rows = list.rows.slice(0, PAGE).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      message: String(r.message),
      flavor: String(r.flavor),
      createdAt: String(r.created_at),
    }));

    return json({
      items: rows,
      total: Number(count.rows[0]?.total ?? 0),
      nextCursor: list.rows.length > PAGE ? rows[rows.length - 1].id : null,
    });
  } catch (err) {
    console.error('[wishes:GET]', err);
    return fail('Tiệm đang bận một chút, bạn thử lại sau nhé.', 500);
  }
}

/** POST /api/wishes  { name, message, flavor } */
export async function POST(req: Request) {
  if (!rateLimit(req, 'wish')) return fail('Bạn gửi hơi nhanh, chờ một phút rồi thử lại nhé.', 429);

  const body = await readJson(req);
  if (!body) return fail('Dữ liệu gửi lên không hợp lệ.');
  if (body.website) return json({ ok: true }); // bẫy bot: ô ẩn bị điền

  const name = cleanText(body.name, 60);
  const message = cleanText(body.message, 500, true);
  const flavor = isFlavor(body.flavor) ? body.flavor : 'butter';

  if (name.length < 1) return fail('Bạn cho Mochee biết tên với nhé.');
  if (message.length < 2) return fail('Bạn viết đôi lời chúc cho Mochee nhé.');

  try {
    const createdAt = new Date().toISOString();
    const client = await db();
    const res = await client.execute({
      sql: 'INSERT INTO wishes (name, message, flavor, created_at) VALUES (?, ?, ?, ?)',
      args: [name, message, flavor, createdAt],
    });
    return json({ ok: true, item: { id: Number(res.lastInsertRowid), name, message, flavor, createdAt } }, 201);
  } catch (err) {
    console.error('[wishes:POST]', err);
    return fail('Chưa lưu được lời chúc, bạn thử lại giúp nhé.', 500);
  }
}

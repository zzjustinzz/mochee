import { db } from '@/lib/db';
import { fail, json, rateLimit, readJson } from '@/lib/guard';
import { GUESS_ITEMS, isGuessKey } from '@/lib/guess';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function counts() {
  const client = await db();
  const res = await client.execute('SELECT item, COUNT(*) AS n FROM guesses GROUP BY item');
  const map = Object.fromEntries(GUESS_ITEMS.map((g) => [g.key, 0])) as Record<string, number>;
  for (const r of res.rows) if (String(r.item) in map) map[String(r.item)] = Number(r.n);
  return map;
}

/** GET /api/guess – số phiếu cho từng món */
export async function GET() {
  try {
    return json({ counts: await counts() });
  } catch (err) {
    console.error('[guess:GET]', err);
    return fail('Chưa tải được kết quả.', 500);
  }
}

/** POST /api/guess { item } */
export async function POST(req: Request) {
  if (!rateLimit(req, 'guess', 4)) return fail('Bạn đoán hơi nhanh, chờ một phút nhé.', 429);
  const body = await readJson(req);
  if (!body || !isGuessKey(body.item)) return fail('Món đồ không hợp lệ.');
  try {
    const client = await db();
    await client.execute({ sql: 'INSERT INTO guesses (item, created_at) VALUES (?, ?)', args: [body.item, new Date().toISOString()] });
    return json({ ok: true, counts: await counts() }, 201);
  } catch (err) {
    console.error('[guess:POST]', err);
    return fail('Chưa ghi nhận được, bạn thử lại nhé.', 500);
  }
}

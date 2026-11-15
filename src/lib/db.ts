import 'server-only';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Client } from '@libsql/client';

/**
 * SQLite qua libSQL:
 *  - Local:  file ./data/mochee.db (SQLite thuần, không cần cài gì thêm)
 *  - Vercel: Turso (SQLite chạy dạng dịch vụ) qua TURSO_DATABASE_URL / TURSO_AUTH_TOKEN
 *  - Vercel chưa cấu hình Turso: tạm ghi vào /tmp (MẤT khi function khởi động lại) – chỉ để xem thử.
 */

/**
 * Tìm biến môi trường của Turso. Khi gắn Turso từ Vercel Marketplace, Vercel có thể thêm tiền tố
 * (vd. STORAGE_TURSO_DATABASE_URL) nên ngoài tên chuẩn còn dò mọi biến kết thúc bằng TURSO_DATABASE_URL.
 */
function tursoEnv(): { url: string; token?: string; source: string } | null {
  const env = process.env;
  const exact = env.TURSO_DATABASE_URL?.trim();
  if (exact) return { url: exact, token: env.TURSO_AUTH_TOKEN?.trim() || undefined, source: 'TURSO_DATABASE_URL' };
  for (const key of Object.keys(env).sort()) {
    const m = key.match(/^(.*)TURSO_DATABASE_URL$/) ?? key.match(/^(.*)LIBSQL_URL$/);
    const url = env[key]?.trim();
    if (!m || !url) continue;
    const prefix = m[1];
    const token = (env[`${prefix}TURSO_AUTH_TOKEN`] ?? env[`${prefix}LIBSQL_AUTH_TOKEN`] ?? env.TURSO_AUTH_TOKEN)?.trim();
    return { url, token: token || undefined, source: key };
  }
  return null;
}

function resolve(): { url: string; token?: string; mode: DbMode; source: string } {
  const t = tursoEnv();
  if (t) return { ...t, mode: 'turso' };
  if (process.env.VERCEL) return { url: 'file:/tmp/mochee.db', mode: 'vercel-tmp', source: 'none' };
  const dir = path.join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  return { url: `file:${path.join(dir, 'mochee.db')}`, mode: 'local-file', source: 'data/mochee.db' };
}

export type DbMode = 'turso' | 'vercel-tmp' | 'local-file';

/** Đang lưu ở đâu – để trang /admin và /api/health báo cho chủ tiệm biết. */
export function dbInfo() {
  const r = resolve();
  let host = '';
  if (r.mode === 'turso') {
    try {
      host = new URL(r.url.replace(/^libsql:/, 'https:')).hostname;
    } catch {
      host = '(URL không hợp lệ)';
    }
  }
  return { mode: r.mode, envVar: r.source, host, hasToken: !!r.token };
}

export const isEphemeralDb = () => resolve().mode === 'vercel-tmp';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS rsvps (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     name       TEXT    NOT NULL,
     guests     INTEGER NOT NULL DEFAULT 1 CHECK (guests BETWEEN 1 AND 20),
     note       TEXT    NOT NULL DEFAULT '',
     created_at TEXT    NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS wishes (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     name       TEXT NOT NULL,
     message    TEXT NOT NULL,
     flavor     TEXT NOT NULL DEFAULT 'butter',
     created_at TEXT NOT NULL
   )`,
];

type Globals = { __mocheeDb?: Promise<Client> };
const g = globalThis as unknown as Globals;

async function connect(): Promise<Client> {
  const { url, token: authToken } = resolve();
  // File cục bộ cần binding native; Turso thì dùng client HTTP thuần JS (nhẹ, hợp serverless).
  const { createClient } = url.startsWith('file:')
    ? await import('@libsql/client')
    : await import('@libsql/client/web');
  const client = createClient({ url, authToken });
  await client.batch(SCHEMA, 'write');
  return client;
}

/** Lấy kết nối dùng chung (tự tạo bảng ở lần gọi đầu). */
export function db(): Promise<Client> {
  if (!g.__mocheeDb) {
    g.__mocheeDb = connect().catch((err) => {
      g.__mocheeDb = undefined; // lần sau thử lại
      throw err;
    });
  }
  return g.__mocheeDb;
}

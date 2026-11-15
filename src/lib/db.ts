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
function resolveUrl(): string {
  const remote = process.env.TURSO_DATABASE_URL?.trim();
  if (remote) return remote;
  if (process.env.VERCEL) return 'file:/tmp/mochee.db';
  const dir = path.join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  return `file:${path.join(dir, 'mochee.db')}`;
}

export const isEphemeralDb = () => !process.env.TURSO_DATABASE_URL?.trim() && !!process.env.VERCEL;

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
  const url = resolveUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;
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

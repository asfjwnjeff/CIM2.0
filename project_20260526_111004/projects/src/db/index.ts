import { drizzle } from 'drizzle-orm/sql-js';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import * as schema from './schema';

const DB_PATH = path.resolve(process.cwd(), 'data', 'cim.db');

// 定位 sql.js 的 WASM 文件（pnpm 目录结构）
function findWasmFile(): string {
  const pnpmDir = path.resolve(process.cwd(), 'node_modules', '.pnpm');
  const wasmPath = path.join('node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

  try {
    for (const entry of fs.readdirSync(pnpmDir)) {
      if (entry.startsWith('sql.js@')) {
        const full = path.join(pnpmDir, entry, wasmPath);
        if (fs.existsSync(full)) return full;
      }
    }
  } catch {}

  // fallback: flat node_modules
  const flat = path.resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  if (fs.existsSync(flat)) return flat;

  throw new Error('找不到 sql.js WASM 文件，请确保 sql.js 已安装');
}

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqlDb: SqlJsDatabase | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    locateFile: () => findWasmFile(),
  });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }

  dbInstance = drizzle(sqlDb, { schema });
  return dbInstance;
}

export function saveDb() {
  if (!sqlDb) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(intervalMs = 5000) {
  if (autoSaveTimer) return;
  autoSaveTimer = setInterval(saveDb, intervalMs);
}

export function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
}

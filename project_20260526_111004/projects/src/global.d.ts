declare module 'sql.js' {
  export class Database {
    constructor(data?: ArrayLike<number> | Buffer | null);
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): { columns: string[]; values: unknown[][] }[];
    export(): Uint8Array;
    close(): void;
  }
  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlJsStatic>;
  export interface SqlJsStatic {
    Database: typeof Database;
  }
}

// @types/node 20 predates node:sqlite. Declaring the subset we use avoids a
// dependency upgrade; drop this file once @types/node >= 22 is installed.
declare module 'node:sqlite' {
  export type SQLValue = null | number | bigint | string | Uint8Array

  export interface StatementSync {
    run(...params: SQLValue[]): { changes: number | bigint; lastInsertRowid: number | bigint }
    get(...params: SQLValue[]): Record<string, SQLValue> | undefined
    all(...params: SQLValue[]): Record<string, SQLValue>[]
  }

  export class DatabaseSync {
    constructor(path: string)
    exec(sql: string): void
    prepare(sql: string): StatementSync
    close(): void
  }
}

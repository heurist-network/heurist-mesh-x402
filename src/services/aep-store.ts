import { createRequire } from "node:module";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";
import type { AepEnrollmentStore, AepClientAssertionReplayStore, AepCommandIdempotencyStore, AepCommandIdempotencyRecord } from "@aep-foundation/service";

// PM2 runs Bun; npm start runs Node 22. Both provide native SQLite.
const loadSqlite = createRequire(__filename);
interface Database {
  exec(sql: string): void;
  prepare(sql: string): { get(...args: any[]): any; run(...args: any[]): { changes: number | bigint } };
  close(): void;
}

export function createAepStores(filename: string) {
  mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const sqlite = loadSqlite(process.versions.bun ? "bun:sqlite" : "node:sqlite");
  const db: Database = new (sqlite.DatabaseSync ?? sqlite.Database)(filename);
  chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS enrollments (id TEXT PRIMARY KEY, record TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS replays (subject TEXT, jti TEXT, expires INTEGER NOT NULL, PRIMARY KEY(subject,jti));
    CREATE TABLE IF NOT EXISTS commands (agent TEXT, key TEXT, command TEXT NOT NULL, hash TEXT NOT NULL, record TEXT, expires INTEGER NOT NULL, PRIMARY KEY(agent,key));`);
  const enrollmentStore: AepEnrollmentStore = {
    findEnrollment(id) {
      const row = db.prepare("SELECT record FROM enrollments WHERE id=?").get(id);
      return row ? JSON.parse(row.record) : undefined;
    },
    saveEnrollment(record) {
      db.prepare("INSERT OR REPLACE INTO enrollments VALUES (?,?)").run(record.agentDid, JSON.stringify(record));
      return record;
    },
  };
  const replayStore: AepClientAssertionReplayStore = {
    consumeReplay(record, now) {
      db.prepare("DELETE FROM replays WHERE expires<=?").run(now);
      return Number(db.prepare("INSERT OR IGNORE INTO replays VALUES (?,?,?)").run(record.sub, record.jti, record.expiresAt).changes) === 1;
    },
  };
  const commandIdempotencyStore: AepCommandIdempotencyStore = {
    async executeIdempotentCommand(input, execute) {
      db.prepare("DELETE FROM commands WHERE expires<=?").run(Date.now());
      const acquired = db.prepare("INSERT OR IGNORE INTO commands VALUES (?,?,?,?,NULL,?)")
        .run(input.agentDid, input.idempotencyKey, input.command, input.requestHash, Date.now() + 86_400_000);
      if (!Number(acquired.changes)) {
        const row = db.prepare("SELECT * FROM commands WHERE agent=? AND key=?").get(input.agentDid, input.idempotencyKey);
        if (!row.record || row.command !== input.command || row.hash !== input.requestHash) return { state: "conflict" };
        return { state: "replayed", record: JSON.parse(row.record) };
      }
      // Pending commands fail closed after a crash instead of executing twice.
      const response = await execute();
      const record: AepCommandIdempotencyRecord = {
        ...response, ...input, createdAt: new Date().toISOString(),
      };
      db.prepare("UPDATE commands SET record=? WHERE agent=? AND key=?")
        .run(JSON.stringify(record), input.agentDid, input.idempotencyKey);
      return { state: "created", response };
    },
  };
  return { enrollmentStore, replayStore, commandIdempotencyStore, close: () => db.close() };
}

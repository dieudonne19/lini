import { createHash, randomUUID } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { Pool } from "@neondatabase/serverless"
import { config } from "dotenv"

// Applies the pending migrations of prisma/migrations over Neon's WebSocket driver (port 443).
// `prisma migrate` needs port 5432, which some networks block. Each migration is recorded in
// _prisma_migrations with the same columns Prisma uses, so the history stays readable by Prisma.
// Creating a new migration still needs a database to compare with: generate its SQL offline with
// `prisma migrate diff --from-schema <old schema> --to-schema prisma/schema.prisma --script`.
config({ path: `.env.${process.env.NODE_ENV ?? "development"}`, quiet: true })

const connectionString = process.env.DIRECT_URL
if (!connectionString) throw new Error("DIRECT_URL is not set")

const migrationsDir = join(import.meta.dirname, "migrations")
const migrationNames = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const pool = new Pool({ connectionString })
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`)
  const { rows } = await pool.query<{ migration_name: string }>(
    `SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL`
  )
  const applied = new Set(rows.map((row) => row.migration_name))
  const pending = migrationNames.filter((name) => !applied.has(name))

  if (pending.length === 0) {
    console.log(
      `Nothing to apply: ${applied.size} migration(s) already applied.`
    )
  }
  for (const name of pending) {
    const sql = readFileSync(join(migrationsDir, name, "migration.sql"), "utf8")
    const checksum = createHash("sha256").update(sql).digest("hex")
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      await client.query(sql)
      await client.query(
        `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
         VALUES ($1, $2, now(), $3, 1)`,
        [randomUUID(), checksum, name]
      )
      await client.query("COMMIT")
      console.log(`Applied ${name}`)
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }
} finally {
  await pool.end()
}

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const DEFAULT_URL = "postgres://saasfood:saasfood@localhost:5432/saasfood";

function updatesDir() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "DB_UPDATES");
}

function maskUrl(url: string) {
  return url.replace(/:[^:@]+@/, ":***@");
}

/**
 * Filename-ledger migrator: apply each DB_UPDATES/*.sql once, recorded in schema_migrations.
 */
export async function runMigrations(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL ?? DEFAULT_URL;
  const sql = postgres(url, { max: 1 });

  try {
    console.log(`Migrating database (${maskUrl(url)})…`);

    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    const dir = updatesDir();
    const files = (await readdir(dir))
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    if (!files.length) {
      console.log(`No SQL files in ${dir}`);
      return;
    }

    const appliedRows = await sql<{ filename: string }[]>`
      SELECT filename FROM schema_migrations
    `;
    const applied = new Set(appliedRows.map((r) => r.filename));

    for (const filename of files) {
      if (applied.has(filename)) {
        console.log(`  skip  ${filename} (already applied)`);
        continue;
      }

      const body = await readFile(join(dir, filename), "utf8");
      console.log(`  apply ${filename}…`);

      try {
        await sql.begin(async (tx) => {
          await tx.unsafe(body);
          await tx`
            INSERT INTO schema_migrations (filename) VALUES (${filename})
          `;
        });
        console.log(`  done  ${filename}`);
      } catch (err) {
        console.error(`  FAIL  ${filename}`);
        throw err;
      }
    }

    console.log("Migrations complete.");
  } finally {
    await sql.end();
  }
}

async function main() {
  await runMigrations();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

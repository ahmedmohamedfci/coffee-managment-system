import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "postgres://saasfood:saasfood@localhost:5432/saasfood";

async function main() {
  const url = process.env.DATABASE_URL ?? DEFAULT_URL;
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");
  console.log(`Migrating database (${url.replace(/:[^:@]+@/, ":***@")})…`);
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

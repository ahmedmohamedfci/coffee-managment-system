import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const client = postgres(url, { max: 10 });
  return drizzle(client, { schema });
}

let singleton: Database | null = null;

export function getDb() {
  if (!singleton) singleton = createDb();
  return singleton;
}

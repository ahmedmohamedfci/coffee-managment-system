import { getDb as getDbClient, type Database } from "@saasfood/db";

export type { Database };

/** App-level DB accessor (singleton via `@saasfood/db`). Requires `DATABASE_URL`. */
export function getDb(): Database {
  return getDbClient();
}

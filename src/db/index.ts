import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getDatabaseUrl } from "@/lib/env";

export function getDb() {
  return drizzle(neon(getDatabaseUrl()), { schema });
}

export type Db = ReturnType<typeof getDb>;

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const url = process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "POSTGRES_URL no está configurada. Conecta Vercel Postgres (Neon) en el dashboard."
    );
  }
  return drizzle(neon(url), { schema });
}

export type Db = ReturnType<typeof getDb>;

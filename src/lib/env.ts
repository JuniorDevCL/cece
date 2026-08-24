/** URL de Neon/Vercel Postgres. Vercel expone DATABASE_URL al conectar Storage. */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está configurada. Conecta Neon en Vercel (Storage) o define DATABASE_URL en .env.local."
    );
  }
  return url;
}

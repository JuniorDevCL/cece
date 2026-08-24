import { seedIfEmpty } from "../src/lib/db-setup";

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.log("Sin DATABASE_URL — omitiendo seed en build.");
    return;
  }

  const result = await seedIfEmpty();
  if (result === "seeded") {
    console.log("Base inicializada con datos demo.");
  } else {
    console.log("Base ya tenía usuarios — seed omitido.");
  }
}

main().catch((error) => {
  console.warn(
    "Seed en build omitido — usa /api/setup?secret=... tras el deploy si hace falta:",
    error instanceof Error ? error.message : error
  );
});

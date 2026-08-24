import { createTablesIfNeeded, DEMO_PASSWORD, resetDemoData } from "../src/lib/db-setup";

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    throw new Error("Define DATABASE_URL antes de ejecutar el seed.");
  }

  console.log("Creando tablas si no existen…");
  await createTablesIfNeeded();

  console.log("Limpiando datos demo…");
  await resetDemoData();

  console.log("\nSeed completado.");
  console.log(`Contraseña demo para todos los usuarios: ${DEMO_PASSWORD}`);
  console.log("PF: carlos.pf@cece.club");
  console.log("Deportistas: lucia.vargas@cece.club, diego.rivas@cece.club, sofia.torres@cece.club");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

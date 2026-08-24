import { NextResponse } from "next/server";
import { resetDemoData, seedIfEmpty } from "@/lib/db-setup";

/** Inicializa la base en Vercel sin usar tu PC. Visita una vez tras el deploy. */
export async function GET(request: Request) {
  const secret = process.env.SETUP_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Falta SETUP_SECRET o AUTH_SECRET en Vercel." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== secret) {
    return NextResponse.json({ ok: false, error: "Secreto inválido." }, { status: 401 });
  }

  try {
    const force = searchParams.get("force") === "1";
    if (force) {
      await resetDemoData();
      return NextResponse.json({
        ok: true,
        status: "reset",
        message: "Datos demo restaurados.",
      });
    }

    const status = await seedIfEmpty();
    return NextResponse.json({
      ok: true,
      status,
      message:
        status === "seeded"
          ? "Tablas y usuarios demo creados. Ya puedes iniciar sesión."
          : "La base ya estaba lista. No se modificó nada.",
    });
  } catch (error) {
    console.error("[setup]", error);
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo conectar o inicializar la base. Revisa DATABASE_URL en Vercel.",
      },
      { status: 500 }
    );
  }
}

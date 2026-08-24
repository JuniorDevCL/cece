"use server";

import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { categories, users } from "@/db/schema";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function getCategoriesAction() {
  const db = getDb();
  const rows = await db.select().from(categories);
  return rows.map((row) => ({
    id: row.id,
    gender: row.gender as "masculino" | "femenino",
    ageGroup: row.ageGroup as
      | "sub-14"
      | "sub-16"
      | "sub-18"
      | "sub-20"
      | "todo-competidor",
    label: row.label,
  }));
}

export async function createAthleteAction(input: {
  name: string;
  email: string;
  password: string;
  categoryId: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("Solo el preparador puede crear deportistas");
  }

  const db = getDb();
  const email = input.email.trim().toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    throw new Error("Ya existe un usuario con ese email");
  }

  const passwordHash = await hash(input.password, 12);

  await db.insert(users).values({
    id: makeId("user-ath"),
    email,
    passwordHash,
    name: input.name.trim(),
    role: "deportista",
    categoryId: input.categoryId,
  });
}

export async function listAthletesAction(categoryId?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("No autorizado");
  }

  const db = getDb();
  const rows = categoryId
    ? await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          categoryId: users.categoryId,
        })
        .from(users)
        .where(
          and(eq(users.role, "deportista"), eq(users.categoryId, categoryId))
        )
    : await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          categoryId: users.categoryId,
        })
        .from(users)
        .where(eq(users.role, "deportista"));

  return rows;
}

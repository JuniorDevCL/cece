"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { exerciseCompletions } from "@/db/schema";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export async function getCompletionsForDateAction(date?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "deportista") {
    return [] as string[];
  }

  const db = getDb();
  const targetDate = date ?? todayIso();
  const rows = await db
    .select({ routineExerciseId: exerciseCompletions.routineExerciseId })
    .from(exerciseCompletions)
    .where(
      and(
        eq(exerciseCompletions.userId, session.user.id),
        eq(exerciseCompletions.completedDate, targetDate)
      )
    );

  return rows.map((row) => row.routineExerciseId);
}

export async function toggleCompletionAction(
  routineExerciseId: string,
  date?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "deportista") {
    throw new Error("No autorizado");
  }

  const db = getDb();
  const targetDate = date ?? todayIso();

  const [existing] = await db
    .select()
    .from(exerciseCompletions)
    .where(
      and(
        eq(exerciseCompletions.userId, session.user.id),
        eq(exerciseCompletions.routineExerciseId, routineExerciseId),
        eq(exerciseCompletions.completedDate, targetDate)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .delete(exerciseCompletions)
      .where(eq(exerciseCompletions.id, existing.id));
    return { completed: false };
  }

  await db.insert(exerciseCompletions).values({
    id: makeId("cmp"),
    userId: session.user.id,
    routineExerciseId,
    completedDate: targetDate,
  });

  return { completed: true };
}

export async function markAllCompletionsAction(
  routineExerciseIds: string[],
  date?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "deportista") {
    throw new Error("No autorizado");
  }

  for (const routineExerciseId of routineExerciseIds) {
    await toggleCompletionAction(routineExerciseId, date);
  }
}

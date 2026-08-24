"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { attendanceRecords } from "@/db/schema";
import type { RoutineDayNumber } from "@/lib/types";

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

export async function markAttendanceAction(input?: {
  date?: string;
  routineDay?: RoutineDayNumber;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "deportista") {
    throw new Error("Solo los deportistas pueden marcar asistencia");
  }

  const date = input?.date ?? todayIso();
  const routineDay = input?.routineDay;
  if (!routineDay) {
    throw new Error("Hoy no corresponde marcar asistencia de pesas");
  }

  const db = getDb();
  const existing = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.userId, session.user.id),
        eq(attendanceRecords.date, date)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { alreadyMarked: true as const, date };
  }

  await db.insert(attendanceRecords).values({
    id: makeId("att"),
    userId: session.user.id,
    date,
    routineDay,
    present: true,
  });

  return { alreadyMarked: false as const, date };
}

export async function getMyAttendanceAction(date?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "deportista") {
    return null;
  }

  const db = getDb();
  const targetDate = date ?? todayIso();
  const [record] = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.userId, session.user.id),
        eq(attendanceRecords.date, targetDate)
      )
    )
    .limit(1);

  return record ?? null;
}

export async function getCategoryAttendanceAction(
  categoryId: string,
  date: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("No autorizado");
  }

  const db = getDb();
  const { users } = await import("@/db/schema");

  const athletes = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.role, "deportista"), eq(users.categoryId, categoryId)));

  const records = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.date, date));

  const byUser = new Map(records.map((item) => [item.userId, item]));

  return athletes.map((athlete) => ({
    ...athlete,
    attendance: byUser.get(athlete.id) ?? null,
  }));
}

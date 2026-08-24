"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  exercises,
  routineAssignments,
  routineExercises,
  routines,
  trainingPeriods,
} from "@/db/schema";
import type {
  Exercise,
  PeriodType,
  Routine,
  RoutineAssignment,
  RoutineDayNumber,
  RoutineExercise,
  TrainingPeriod,
} from "@/lib/types";

const PERIOD_PRESENTATION: Record<
  PeriodType,
  { name: string; color: string }
> = {
  carga: { name: "Carga", color: "#ff161f" },
  descarga: { name: "Descarga", color: "#3d7bff" },
  transicion: { name: "Transición", color: "#f9e200" },
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function mapPeriod(row: typeof trainingPeriods.$inferSelect): TrainingPeriod {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    categoryId: row.categoryId,
    startDate: row.startDate,
    endDate: row.endDate,
    color: row.color,
  };
}

function mapRoutine(row: typeof routines.$inferSelect): Routine {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapExercise(row: typeof exercises.$inferSelect): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscleGroup,
    description: row.description,
    youtubeUrl: row.youtubeUrl,
  };
}

function mapRoutineExercise(
  row: typeof routineExercises.$inferSelect
): RoutineExercise {
  return {
    id: row.id,
    routineId: row.routineId,
    exerciseId: row.exerciseId,
    dayNumber: row.dayNumber as RoutineDayNumber,
    sets: row.sets,
    reps: row.reps,
    restSeconds: row.restSeconds,
    order: row.order,
  };
}

function mapAssignment(
  row: typeof routineAssignments.$inferSelect
): RoutineAssignment {
  return {
    id: row.id,
    routineId: row.routineId,
    periodId: row.periodId,
  };
}

export interface TrainingStatePayload {
  periods: TrainingPeriod[];
  routines: Routine[];
  routineExercises: RoutineExercise[];
  assignments: RoutineAssignment[];
  exercises: Exercise[];
}

export async function getTrainingState(): Promise<TrainingStatePayload> {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const db = getDb();
  const [periodRows, routineRows, reRows, assignmentRows, exerciseRows] =
    await Promise.all([
      db.select().from(trainingPeriods),
      db.select().from(routines),
      db.select().from(routineExercises),
      db.select().from(routineAssignments),
      db.select().from(exercises),
    ]);

  return {
    periods: periodRows.map(mapPeriod),
    routines: routineRows.map(mapRoutine),
    routineExercises: reRows.map(mapRoutineExercise),
    assignments: assignmentRows.map(mapAssignment),
    exercises: exerciseRows.map(mapExercise),
  };
}

export interface RoutineExerciseDraft {
  exerciseId: string;
  dayNumber: RoutineDayNumber;
  sets: number;
  reps: number;
  restSeconds: number;
}

export async function addRoutineAction(
  routine: Pick<Routine, "name" | "description">,
  items: RoutineExerciseDraft[]
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("Solo el preparador puede crear rutinas");
  }

  const db = getDb();
  const routineId = makeId("rut");

  await db.insert(routines).values({
    id: routineId,
    name: routine.name.trim(),
    description: routine.description.trim(),
    createdById: session.user.id,
  });

  const nextItems = items.map((item, index) => {
    const previousInDay = items
      .slice(0, index)
      .filter((value) => value.dayNumber === item.dayNumber).length;
    return {
      id: makeId("re"),
      routineId,
      exerciseId: item.exerciseId,
      dayNumber: item.dayNumber,
      sets: item.sets,
      reps: item.reps,
      restSeconds: item.restSeconds,
      order: previousInDay + 1,
    };
  });

  if (nextItems.length > 0) {
    await db.insert(routineExercises).values(nextItems);
  }
}

export async function addExerciseAction(exercise: {
  name: string;
  muscleGroup: string;
  description: string;
  youtubeUrl: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("Solo el preparador puede crear ejercicios");
  }

  const db = getDb();
  await db.insert(exercises).values({
    id: makeId("ex"),
    name: exercise.name.trim(),
    muscleGroup: exercise.muscleGroup.trim(),
    description: exercise.description.trim(),
    youtubeUrl: exercise.youtubeUrl.trim(),
  });
}

export async function createPlanAction(plan: {
  categoryId: string;
  startDate: string;
  endDate: string;
  type: PeriodType;
  routineId: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("Solo el preparador puede planificar");
  }

  const db = getDb();
  const periodId = makeId("per");
  const presentation = PERIOD_PRESENTATION[plan.type];

  await db.insert(trainingPeriods).values({
    id: periodId,
    name: presentation.name,
    type: plan.type,
    categoryId: plan.categoryId,
    startDate: plan.startDate,
    endDate: plan.endDate,
    color: presentation.color,
  });

  await db.insert(routineAssignments).values({
    id: makeId("asg"),
    routineId: plan.routineId,
    periodId,
  });
}

export async function deletePlanAction(periodId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "pf") {
    throw new Error("Solo el preparador puede eliminar planificaciones");
  }

  const db = getDb();
  await db.delete(routineAssignments).where(eq(routineAssignments.periodId, periodId));
  await db.delete(trainingPeriods).where(eq(trainingPeriods.id, periodId));
}

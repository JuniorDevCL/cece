/** Tipos del dominio — pensados para mapear 1:1 a tablas PostgreSQL. */

export type UserRole = "pf" | "deportista";

export type Gender = "masculino" | "femenino";

export type AgeGroup =
  | "sub-14"
  | "sub-16"
  | "sub-18"
  | "sub-20"
  | "todo-competidor";

export type PeriodType = "carga" | "descarga" | "transicion";
export type RoutineDayNumber = 1 | 2 | 3;

/** Categoría del club = género × grupo de edad */
export interface Category {
  id: string;
  gender: Gender;
  ageGroup: AgeGroup;
  /** Etiqueta legible, p.ej. "Sub-20 Femenino" */
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Solo aplica a deportistas */
  categoryId: string | null;
}

/** Catálogo de ejercicios reutilizables */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  createdById: string;
  createdAt: string;
}

/** Tabla puente: rutina ↔ ejercicio, agrupada en uno de los tres días. */
export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  dayNumber: RoutineDayNumber;
  sets: number;
  reps: number;
  restSeconds: number;
  order: number;
}

/** Bloque de carga fechado para una categoría concreta. */
export interface TrainingPeriod {
  id: string;
  name: string;
  type: PeriodType;
  categoryId: string;
  startDate: string;
  endDate: string;
  color: string;
}

/** Asignación 1:1 de la rutina que se ejecuta durante un bloque de carga. */
export interface RoutineAssignment {
  id: string;
  routineId: string;
  periodId: string;
}

/** Sesión persistida en localStorage tras el login mock */
export interface AuthSession {
  userId: string;
  role: UserRole;
  categoryId: string | null;
  name: string;
}

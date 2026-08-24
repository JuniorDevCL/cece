import type {
  Category,
  Exercise,
  Routine,
  RoutineAssignment,
  RoutineExercise,
  TrainingPeriod,
  User,
} from "./types";

/** Categorías del club: género × edad (10 combinaciones). */
export const categories: Category[] = [
  { id: "cat-m-s14", gender: "masculino", ageGroup: "sub-14", label: "Sub-14 Masculino" },
  { id: "cat-m-s16", gender: "masculino", ageGroup: "sub-16", label: "Sub-16 Masculino" },
  { id: "cat-m-s18", gender: "masculino", ageGroup: "sub-18", label: "Sub-18 Masculino" },
  { id: "cat-m-s20", gender: "masculino", ageGroup: "sub-20", label: "Sub-20 Masculino" },
  { id: "cat-m-tc", gender: "masculino", ageGroup: "todo-competidor", label: "Todo Competidor Masculino" },
  { id: "cat-f-s14", gender: "femenino", ageGroup: "sub-14", label: "Sub-14 Femenino" },
  { id: "cat-f-s16", gender: "femenino", ageGroup: "sub-16", label: "Sub-16 Femenino" },
  { id: "cat-f-s18", gender: "femenino", ageGroup: "sub-18", label: "Sub-18 Femenino" },
  { id: "cat-f-s20", gender: "femenino", ageGroup: "sub-20", label: "Sub-20 Femenino" },
  { id: "cat-f-tc", gender: "femenino", ageGroup: "todo-competidor", label: "Todo Competidor Femenino" },
];

export const users: User[] = [
  {
    id: "user-pf-1",
    name: "Carlos Mendoza",
    email: "carlos.pf@cece.club",
    role: "pf",
    categoryId: null,
  },
  {
    id: "user-ath-1",
    name: "Lucía Vargas",
    email: "lucia.vargas@cece.club",
    role: "deportista",
    categoryId: "cat-f-s20",
  },
  {
    id: "user-ath-2",
    name: "Diego Rivas",
    email: "diego.rivas@cece.club",
    role: "deportista",
    categoryId: "cat-m-s18",
  },
  {
    id: "user-ath-3",
    name: "Sofía Torres",
    email: "sofia.torres@cece.club",
    role: "deportista",
    categoryId: "cat-f-s16",
  },
];

export const exercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Sentadilla trasera",
    muscleGroup: "Piernas",
    description: "Sentadilla con barra alta, profundidad paralela.",
    youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
  },
  {
    id: "ex-2",
    name: "Peso muerto rumano",
    muscleGroup: "Cadena posterior",
    description: "Énfasis en isquiotibiales y glúteos.",
    youtubeUrl: "https://www.youtube.com/watch?v=jEy_czb3RKA",
  },
  {
    id: "ex-3",
    name: "Press banca",
    muscleGroup: "Empuje",
    description: "Press horizontal con barra.",
    youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
  },
  {
    id: "ex-4",
    name: "Dominadas asistidas",
    muscleGroup: "Tracción",
    description: "Tracción vertical controlada.",
    youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  },
  {
    id: "ex-5",
    name: "Salto pliométrico a cajón",
    muscleGroup: "Potencia",
    description: "Aterrizaje suave, énfasis en reactividad.",
    youtubeUrl: "https://www.youtube.com/watch?v=52r_Ul5k03g",
  },
  {
    id: "ex-6",
    name: "Core anti-rotación (Pallof)",
    muscleGroup: "Core",
    description: "Estabilidad del tronco frente a rotación.",
    youtubeUrl: "https://www.youtube.com/watch?v=AH_QZLm_0-s",
  },
  {
    id: "ex-7",
    name: "Zancadas caminando",
    muscleGroup: "Piernas",
    description: "Zancada alternada con control de rodilla.",
    youtubeUrl: "https://www.youtube.com/watch?v=L8fvypPrzzs",
  },
  {
    id: "ex-8",
    name: "Remo con mancuerna",
    muscleGroup: "Tracción",
    description: "Remo unilateral apoyado en banco.",
    youtubeUrl: "https://www.youtube.com/watch?v=roCP6wCXPqo",
  },
];

export const routines: Routine[] = [
  {
    id: "rut-1",
    name: "Fuerza A — Carga",
    description: "Sesión de fuerza máxima orientada a tren inferior y core.",
    createdById: "user-pf-1",
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "rut-2",
    name: "Potencia Voleibol",
    description: "Pliometría y empujes para salto y remate.",
    createdById: "user-pf-1",
    createdAt: "2026-01-08T10:00:00.000Z",
  },
  {
    id: "rut-3",
    name: "Descarga Activa",
    description: "Volumen moderado, foco en calidad de movimiento.",
    createdById: "user-pf-1",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
];

export const routineExercises: RoutineExercise[] = [
  // Fuerza A
  { id: "re-1", routineId: "rut-1", exerciseId: "ex-1", dayNumber: 1, sets: 4, reps: 6, restSeconds: 120, order: 1 },
  { id: "re-2", routineId: "rut-1", exerciseId: "ex-6", dayNumber: 1, sets: 3, reps: 10, restSeconds: 60, order: 2 },
  { id: "re-3", routineId: "rut-1", exerciseId: "ex-2", dayNumber: 2, sets: 3, reps: 8, restSeconds: 90, order: 1 },
  { id: "re-4", routineId: "rut-1", exerciseId: "ex-3", dayNumber: 3, sets: 4, reps: 6, restSeconds: 120, order: 1 },
  { id: "re-12", routineId: "rut-1", exerciseId: "ex-4", dayNumber: 2, sets: 3, reps: 10, restSeconds: 75, order: 2 },
  { id: "re-13", routineId: "rut-1", exerciseId: "ex-8", dayNumber: 3, sets: 3, reps: 10, restSeconds: 60, order: 2 },
  // Potencia
  { id: "re-5", routineId: "rut-2", exerciseId: "ex-5", dayNumber: 1, sets: 4, reps: 5, restSeconds: 90, order: 1 },
  { id: "re-6", routineId: "rut-2", exerciseId: "ex-7", dayNumber: 1, sets: 3, reps: 10, restSeconds: 75, order: 2 },
  { id: "re-7", routineId: "rut-2", exerciseId: "ex-4", dayNumber: 2, sets: 3, reps: 8, restSeconds: 90, order: 1 },
  { id: "re-14", routineId: "rut-2", exerciseId: "ex-1", dayNumber: 2, sets: 4, reps: 6, restSeconds: 120, order: 2 },
  { id: "re-8", routineId: "rut-2", exerciseId: "ex-8", dayNumber: 3, sets: 3, reps: 10, restSeconds: 75, order: 1 },
  { id: "re-15", routineId: "rut-2", exerciseId: "ex-6", dayNumber: 3, sets: 3, reps: 12, restSeconds: 60, order: 2 },
  // Descarga
  { id: "re-9", routineId: "rut-3", exerciseId: "ex-1", dayNumber: 1, sets: 3, reps: 10, restSeconds: 75, order: 1 },
  { id: "re-16", routineId: "rut-3", exerciseId: "ex-7", dayNumber: 1, sets: 3, reps: 12, restSeconds: 45, order: 2 },
  { id: "re-10", routineId: "rut-3", exerciseId: "ex-6", dayNumber: 2, sets: 3, reps: 12, restSeconds: 45, order: 1 },
  { id: "re-17", routineId: "rut-3", exerciseId: "ex-2", dayNumber: 2, sets: 3, reps: 10, restSeconds: 60, order: 2 },
  { id: "re-11", routineId: "rut-3", exerciseId: "ex-8", dayNumber: 3, sets: 3, reps: 12, restSeconds: 60, order: 1 },
  { id: "re-18", routineId: "rut-3", exerciseId: "ex-3", dayNumber: 3, sets: 3, reps: 10, restSeconds: 75, order: 2 },
];

/** Bloques de ejemplo. Cada uno pertenece a una única categoría. */
export const trainingPeriods: TrainingPeriod[] = [
  {
    id: "per-1",
    name: "Carga",
    type: "carga",
    categoryId: "cat-f-s20",
    startDate: "2026-01-01",
    endDate: "2026-03-15",
    color: "#ff161f",
  },
  {
    id: "per-2",
    name: "Descarga",
    type: "descarga",
    categoryId: "cat-f-s20",
    startDate: "2026-03-16",
    endDate: "2026-05-31",
    color: "#3d7bff",
  },
  {
    id: "per-3",
    name: "Carga competitiva",
    type: "carga",
    categoryId: "cat-f-s20",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    color: "#ff161f",
  },
  {
    id: "per-4",
    name: "Transición",
    type: "transicion",
    categoryId: "cat-m-s18",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    color: "#f9e200",
  },
  {
    id: "per-5",
    name: "Descarga",
    type: "descarga",
    categoryId: "cat-f-s16",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    color: "#3d7bff",
  },
  {
    id: "per-6",
    name: "Carga",
    type: "carga",
    categoryId: "cat-m-s14",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#ff161f",
  },
  {
    id: "per-7",
    name: "Carga",
    type: "carga",
    categoryId: "cat-m-s16",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#ff161f",
  },
  {
    id: "per-8",
    name: "Descarga",
    type: "descarga",
    categoryId: "cat-m-s20",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#3d7bff",
  },
  {
    id: "per-9",
    name: "Carga",
    type: "carga",
    categoryId: "cat-m-tc",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#ff161f",
  },
  {
    id: "per-10",
    name: "Transición",
    type: "transicion",
    categoryId: "cat-f-s14",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#f9e200",
  },
  {
    id: "per-11",
    name: "Carga",
    type: "carga",
    categoryId: "cat-f-s18",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#ff161f",
  },
  {
    id: "per-12",
    name: "Carga",
    type: "carga",
    categoryId: "cat-f-tc",
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    color: "#ff161f",
  },
];

/** Una rutina de tres días por cada bloque fechado. */
export const routineAssignments: RoutineAssignment[] = [
  { id: "asg-1", routineId: "rut-1", periodId: "per-1" },
  { id: "asg-2", routineId: "rut-3", periodId: "per-2" },
  { id: "asg-3", routineId: "rut-2", periodId: "per-3" },
  { id: "asg-4", routineId: "rut-2", periodId: "per-4" },
  { id: "asg-5", routineId: "rut-3", periodId: "per-5" },
  { id: "asg-6", routineId: "rut-1", periodId: "per-6" },
  { id: "asg-7", routineId: "rut-2", periodId: "per-7" },
  { id: "asg-8", routineId: "rut-3", periodId: "per-8" },
  { id: "asg-9", routineId: "rut-2", periodId: "per-9" },
  { id: "asg-10", routineId: "rut-3", periodId: "per-10" },
  { id: "asg-11", routineId: "rut-1", periodId: "per-11" },
  { id: "asg-12", routineId: "rut-2", periodId: "per-12" },
];

/* ─── Helpers de consulta (simulán JOINs) ─── */

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getRoutineById(id: string): Routine | undefined {
  return routines.find((r) => r.id === id);
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getPeriodById(id: string): TrainingPeriod | undefined {
  return trainingPeriods.find((p) => p.id === id);
}

export function getExercisesForRoutine(routineId: string) {
  return routineExercises
    .filter((re) => re.routineId === routineId)
    .sort((a, b) => a.dayNumber - b.dayNumber || a.order - b.order)
    .map((re) => ({
      ...re,
      exercise: getExerciseById(re.exerciseId)!,
    }));
}

export function getCurrentPeriod(
  categoryId: string,
  date: Date = new Date()
): TrainingPeriod | undefined {
  const iso = date.toISOString().slice(0, 10);
  return trainingPeriods.find(
    (p) =>
      p.categoryId === categoryId &&
      p.startDate <= iso &&
      p.endDate >= iso
  );
}

/** Rutina y día de pesas actual. Lunes, miércoles y viernes = días 1, 2 y 3. */
export function getTodaysRoutineForCategory(
  categoryId: string,
  date: Date = new Date()
) {
  const period = getCurrentPeriod(categoryId, date);
  if (!period) return null;

  const assignment = routineAssignments.find((a) => a.periodId === period.id);
  if (!assignment) return null;

  const routine = getRoutineById(assignment.routineId);
  if (!routine) return null;

  const routineDay = ({ 1: 1, 3: 2, 5: 3 } as const)[
    date.getDay() as 1 | 3 | 5
  ];
  return {
    period,
    assignment,
    routine,
    routineDay: routineDay ?? null,
    exercises: routineDay
      ? getExercisesForRoutine(routine.id).filter(
          (item) => item.dayNumber === routineDay
        )
      : [],
  };
}

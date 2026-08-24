"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  exercises as initialExercises,
  routineAssignments as initialAssignments,
  routineExercises as initialRoutineExercises,
  routines as initialRoutines,
  trainingPeriods as initialPeriods,
} from "@/lib/mockData";
import type {
  Routine,
  RoutineAssignment,
  RoutineDayNumber,
  RoutineExercise,
  PeriodType,
  TrainingPeriod,
} from "@/lib/types";

const STORAGE_KEY = "cece-training-data-v3";

interface TrainingState {
  periods: TrainingPeriod[];
  routines: Routine[];
  routineExercises: RoutineExercise[];
  assignments: RoutineAssignment[];
}

export interface RoutineExerciseDraft {
  exerciseId: string;
  dayNumber: RoutineDayNumber;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface TrainingPlanDraft {
  categoryId: string;
  startDate: string;
  endDate: string;
  type: PeriodType;
  routineId: string;
}

interface DataContextValue extends TrainingState {
  exercises: typeof initialExercises;
  addRoutine: (
    routine: Pick<Routine, "name" | "description">,
    items: RoutineExerciseDraft[],
    createdById: string
  ) => void;
  createPlan: (plan: TrainingPlanDraft) => void;
  deletePlan: (periodId: string) => void;
  resetData: () => void;
}

const initialState: TrainingState = {
  periods: initialPeriods,
  routines: initialRoutines,
  routineExercises: initialRoutineExercises,
  assignments: initialAssignments,
};

function loadTrainingState(): TrainingState {
  if (typeof window === "undefined") return initialState;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState;
  try {
    return JSON.parse(saved) as TrainingState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialState;
  }
}

const DataContext = createContext<DataContextValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PERIOD_PRESENTATION: Record<
  PeriodType,
  { name: string; color: string }
> = {
  carga: { name: "Carga", color: "#ff161f" },
  descarga: { name: "Descarga", color: "#3d7bff" },
  transicion: { name: "Transición", color: "#f9e200" },
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TrainingState>(loadTrainingState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addRoutine = useCallback(
    (
      routine: Pick<Routine, "name" | "description">,
      items: RoutineExerciseDraft[],
      createdById: string
    ) => {
      const routineId = makeId("rut");
      const nextRoutine: Routine = {
        ...routine,
        id: routineId,
        createdById,
        createdAt: new Date().toISOString(),
      };
      const nextItems = items.map((item, index): RoutineExercise => {
        const previousInDay = items
          .slice(0, index)
          .filter((value) => value.dayNumber === item.dayNumber).length;
        return {
          ...item,
          id: makeId("re"),
          routineId,
          order: previousInDay + 1,
        };
      });
      setState((current) => ({
        ...current,
        routines: [...current.routines, nextRoutine],
        routineExercises: [...current.routineExercises, ...nextItems],
      }));
    },
    []
  );

  const createPlan = useCallback(
    (plan: TrainingPlanDraft) => {
      const periodId = makeId("per");
      const presentation = PERIOD_PRESENTATION[plan.type];
      const period: TrainingPeriod = {
        id: periodId,
        name: presentation.name,
        type: plan.type,
        categoryId: plan.categoryId,
        startDate: plan.startDate,
        endDate: plan.endDate,
        color: presentation.color,
      };
      const assignment: RoutineAssignment = {
        id: makeId("asg"),
        routineId: plan.routineId,
        periodId,
      };
      setState((current) => ({
        ...current,
        periods: [...current.periods, period].sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        ),
        assignments: [...current.assignments, assignment],
      }));
    },
    []
  );

  const deletePlan = useCallback((periodId: string) => {
    setState((current) => ({
      ...current,
      periods: current.periods.filter((item) => item.id !== periodId),
      assignments: current.assignments.filter(
        (item) => item.periodId !== periodId
      ),
    }));
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      exercises: initialExercises,
      addRoutine,
      createPlan,
      deletePlan,
      resetData,
    }),
    [state, addRoutine, createPlan, deletePlan, resetData]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useTrainingData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useTrainingData debe usarse dentro de DataProvider");
  return context;
}

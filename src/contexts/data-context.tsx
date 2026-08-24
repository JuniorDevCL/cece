"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  addExerciseAction,
  addRoutineAction,
  createPlanAction,
  deletePlanAction,
  getTrainingState,
  type RoutineExerciseDraft,
  type TrainingStatePayload,
} from "@/lib/actions/training";
import type {
  PeriodType,
  Routine,
} from "@/lib/types";
import {
  exercises as fallbackExercises,
  routineAssignments as fallbackAssignments,
  routineExercises as fallbackRoutineExercises,
  routines as fallbackRoutines,
  trainingPeriods as fallbackPeriods,
} from "@/lib/mockData";

export type { RoutineExerciseDraft };

export interface TrainingPlanDraft {
  categoryId: string;
  startDate: string;
  endDate: string;
  type: PeriodType;
  routineId: string;
}

export interface ExerciseDraft {
  name: string;
  muscleGroup: string;
  description: string;
  youtubeUrl: string;
}

interface DataContextValue extends TrainingStatePayload {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addRoutine: (
    routine: Pick<Routine, "name" | "description">,
    items: RoutineExerciseDraft[]
  ) => Promise<void>;
  addExercise: (exercise: ExerciseDraft) => Promise<void>;
  createPlan: (plan: TrainingPlanDraft) => Promise<void>;
  deletePlan: (periodId: string) => Promise<void>;
}

const fallbackState: TrainingStatePayload = {
  periods: fallbackPeriods,
  routines: fallbackRoutines,
  routineExercises: fallbackRoutineExercises,
  assignments: fallbackAssignments,
  exercises: fallbackExercises,
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [state, setState] = useState<TrainingStatePayload>(fallbackState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrainingState();
      setState(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar los datos de entrenamiento"
      );
      setState(fallbackState);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }
    });

    getTrainingState()
      .then((data) => {
        if (!cancelled) setState(data);
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los datos de entrenamiento"
          );
          setState(fallbackState);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const addRoutine = useCallback(
    async (
      routine: Pick<Routine, "name" | "description">,
      items: RoutineExerciseDraft[]
    ) => {
      await addRoutineAction(routine, items);
      await refresh();
    },
    [refresh]
  );

  const addExercise = useCallback(
    async (exercise: ExerciseDraft) => {
      await addExerciseAction(exercise);
      await refresh();
    },
    [refresh]
  );

  const createPlan = useCallback(
    async (plan: TrainingPlanDraft) => {
      await createPlanAction(plan);
      await refresh();
    },
    [refresh]
  );

  const deletePlan = useCallback(
    async (periodId: string) => {
      await deletePlanAction(periodId);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      ...state,
      isLoading,
      error,
      refresh,
      addRoutine,
      addExercise,
      createPlan,
      deletePlan,
    }),
    [
      state,
      isLoading,
      error,
      refresh,
      addRoutine,
      addExercise,
      createPlan,
      deletePlan,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useTrainingData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useTrainingData debe usarse dentro de DataProvider");
  }
  return context;
}

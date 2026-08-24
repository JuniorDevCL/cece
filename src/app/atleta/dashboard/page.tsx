"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarX,
  Check,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Dumbbell,
  ExternalLink,
  Flame,
  LoaderCircle,
  PartyPopper,
  PlayCircle,
  Repeat2,
  TimerReset,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTrainingData } from "@/contexts/data-context";
import {
  getCompletionsForDateAction,
  toggleCompletionAction,
} from "@/lib/actions/completions";
import {
  getMyAttendanceAction,
  markAttendanceAction,
} from "@/lib/actions/attendance";
import { getCategoryById } from "@/lib/mockData";
import type { RoutineDayNumber } from "@/lib/types";
import { cn } from "@/lib/utils";
import { youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/youtube";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** Los tres días de pesas se ejecutan lunes, miércoles y viernes. */
const ROUTINE_DAY_BY_WEEKDAY: Partial<Record<number, RoutineDayNumber>> = {
  1: 1,
  3: 2,
  5: 3,
};

const ROUTINE_DAYS: RoutineDayNumber[] = [1, 2, 3];
const WEEKDAY_LABEL: Record<RoutineDayNumber, string> = {
  1: "Lunes",
  2: "Miércoles",
  3: "Viernes",
};

function toLocalIso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Próxima sesión de pesas a partir de una fecha (incluyéndola). */
function findNextSession(from: Date) {
  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(from);
    date.setDate(from.getDate() + offset);
    const routineDay = ROUTINE_DAY_BY_WEEKDAY[date.getDay()];
    if (routineDay) return { date, routineDay, isToday: offset === 0 };
  }
  return null;
}

export default function AtletaDashboardPage() {
  const { session } = useAuth();
  const { periods, routines, exercises, routineExercises, assignments } =
    useTrainingData();
  const today = useMemo(() => new Date(), []);
  const nextSession = useMemo(() => findNextSession(today), [today]);
  const todayRoutineDay = ROUTINE_DAY_BY_WEEKDAY[today.getDay()] ?? null;

  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<RoutineDayNumber>(
    nextSession?.routineDay ?? 1
  );
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const todayIso = toLocalIso(today);
  const category = session?.categoryId
    ? getCategoryById(session.categoryId)
    : undefined;
  const period = periods.find(
    (item) =>
      item.categoryId === category?.id &&
      item.startDate <= todayIso &&
      item.endDate >= todayIso
  );
  const assignment = assignments.find((item) => item.periodId === period?.id);
  const routine = routines.find((item) => item.id === assignment?.routineId);

  const routineItems = routine
    ? routineExercises
        .filter(
          (item) =>
            item.routineId === routine.id && item.dayNumber === selectedDay
        )
        .sort((a, b) => a.order - b.order)
    : [];
  const doneCount = routineItems.filter((item) =>
    completed.includes(item.id)
  ).length;
  const progress =
    routineItems.length > 0
      ? Math.round((doneCount / routineItems.length) * 100)
      : 0;
  const totalMinutes = Math.round(
    routineItems.reduce(
      (sum, item) => sum + item.sets * (item.reps * 4 + item.restSeconds),
      0
    ) / 60
  );
  const isTodaySession = selectedDay === todayRoutineDay;
  const activeItem = routineItems.find((item) => item.id === activeExerciseId);
  const activeExercise = activeItem
    ? exercises.find((value) => value.id === activeItem.exerciseId)
    : undefined;
  const activeEmbed = activeExercise
    ? youtubeEmbedUrl(activeExercise.youtubeUrl)
    : null;
  const activeWatch = activeExercise
    ? youtubeWatchUrl(activeExercise.youtubeUrl)
    : null;
  const activeDone = activeItem
    ? completed.includes(activeItem.id)
    : false;

  const weekPlan = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + offset);
    const dateIso = toLocalIso(date);
    const datePeriod = periods.find(
      (item) =>
        item.categoryId === category?.id &&
        item.startDate <= dateIso &&
        item.endDate >= dateIso
    );
    const hasPlan = assignments.some(
      (item) => item.periodId === datePeriod?.id
    );
    const routineDay = ROUTINE_DAY_BY_WEEKDAY[offset] ?? null;
    return {
      day: DAY_NAMES[offset].slice(0, 3),
      date: date.getDate(),
      isToday: offset === today.getDay(),
      routineDay,
      hasRoutine: Boolean(hasPlan && routineDay),
    };
  });

  useEffect(() => {
    void getCompletionsForDateAction(todayIso).then(setCompleted);
  }, [todayIso, selectedDay]);

  useEffect(() => {
    void getMyAttendanceAction(todayIso).then((record) => {
      setAttendanceMarked(Boolean(record?.present));
    });
  }, [todayIso]);

  async function toggleExercise(id: string) {
    const result = await toggleCompletionAction(id, todayIso);
    setCompleted((current) =>
      result.completed
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id)
    );
  }

  async function handleMarkAttendance() {
    if (!todayRoutineDay || !period) return;
    setAttendanceLoading(true);
    setAttendanceMessage("");
    try {
      const result = await markAttendanceAction({
        date: todayIso,
        routineDay: todayRoutineDay,
      });
      setAttendanceMarked(true);
      setAttendanceMessage(
        result.alreadyMarked
          ? "Ya habías marcado presente hoy."
          : "¡Presente registrado! Buen entrenamiento."
      );
    } catch (cause) {
      setAttendanceMessage(
        cause instanceof Error ? cause.message : "No se pudo marcar asistencia"
      );
    } finally {
      setAttendanceLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-muted-foreground">
            {today.toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Hola, {session?.name.split(" ")[0]}
          </h1>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-blue/35 px-3 py-1 text-xs font-semibold text-brand-sky ring-1 ring-brand-sky/30">
            {category?.label}
          </p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-red/15 ring-1 ring-brand-red/30">
          <Flame className="size-5 text-brand-red" />
        </div>
      </header>

      {period ? (
        <Card className="relative overflow-hidden border-0 bg-[linear-gradient(120deg,#002e8c_0%,#0a1735_58%,#1c0709_100%)] ring-1 ring-white/10">
          <span aria-hidden className="brand-grid absolute inset-0 opacity-50" />
          <span
            className="absolute inset-y-0 left-0 w-1.5"
            style={{ backgroundColor: period.color }}
          />
          <CardContent className="relative flex items-center justify-between gap-4 py-1">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>Periodo actual</Badge>
                <span className="text-xs text-white/60">
                  hasta el{" "}
                  {new Date(`${period.endDate}T12:00:00`).toLocaleDateString(
                    "es-CL",
                    { day: "numeric", month: "short" }
                  )}
                </span>
              </div>
              <p className="font-heading text-2xl font-extrabold">
                {period.name}
              </p>
              <p className="mt-1 text-sm text-white/65">
                Mantén la constancia y respeta los descansos.
              </p>
            </div>
            <Trophy className="size-10 shrink-0 text-brand-yellow sm:size-14" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-start gap-3">
            <CalendarX className="mt-0.5 size-5 shrink-0 text-brand-red" />
            <div>
              <p className="font-semibold">Sin planificación activa</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tu preparador todavía no asignó un bloque de carga a{" "}
                {category?.label} para esta fecha.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {period && todayRoutineDay && (
        <Card className="border-brand-yellow/20 bg-brand-yellow/8">
          <CardContent className="flex flex-col gap-4 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-yellow ring-1 ring-brand-yellow/30">
                <ClipboardCheck className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Asistencia a preparación física</p>
                <p className="text-sm text-muted-foreground">
                  Hoy toca Día {todayRoutineDay} ({WEEKDAY_LABEL[todayRoutineDay]}).
                  Marca presente al llegar a la sesión.
                </p>
                {attendanceMessage && (
                  <p className="mt-2 text-xs text-brand-yellow">{attendanceMessage}</p>
                )}
              </div>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={attendanceMarked || attendanceLoading}
              onClick={() => void handleMarkAttendance()}
            >
              {attendanceLoading ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Guardando…
                </>
              ) : attendanceMarked ? (
                <>
                  <Check /> Presente registrado
                </>
              ) : (
                <>
                  <ClipboardCheck /> Marcar presente
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {routine && (
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-yellow">
                <Dumbbell className="size-4" />
                {isTodaySession ? "Rutina de hoy" : "Próxima sesión"}
              </div>
              {routineItems.length > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {doneCount}/{routineItems.length} completados
                </span>
              )}
            </div>
            <CardTitle className="font-heading text-xl font-extrabold sm:text-2xl">
              {routine.name}
            </CardTitle>
            <CardDescription>
              {isTodaySession
                ? routine.description
                : `Hoy toca descanso. Tu próxima sesión es el ${
                    nextSession
                      ? `${DAY_NAMES[nextSession.date.getDay()].toLowerCase()} ${nextSession.date.getDate()}`
                      : "próximo día de pesas"
                  }.`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {ROUTINE_DAYS.map((day) => {
                const active = selectedDay === day;
                const count = routineExercises.filter(
                  (item) =>
                    item.routineId === routine.id && item.dayNumber === day
                ).length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition-colors",
                      active
                        ? "border-brand-yellow bg-brand-yellow/12"
                        : "border-white/8 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-sm font-bold",
                        active ? "text-brand-yellow" : "text-foreground"
                      )}
                    >
                      Día {day}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {WEEKDAY_LABEL[day]}
                      {day === todayRoutineDay && " · hoy"}
                    </span>
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      {count} ejercicios
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                {
                  icon: Clock3,
                  value: `${totalMinutes} min`,
                  label: "Duración",
                  accent: "#3d7bff",
                },
                {
                  icon: Dumbbell,
                  value: routineItems.length,
                  label: "Ejercicios",
                  accent: "#f9e200",
                },
                {
                  icon: Flame,
                  value: period?.type === "descarga" ? "Media" : "Alta",
                  label: "Intensidad",
                  accent: "#ff161f",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 p-3 text-center ring-1 ring-white/5"
                >
                  <stat.icon
                    className="mx-auto mb-1.5 size-4"
                    style={{ color: stat.accent }}
                  />
                  <p className="text-sm font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progreso del día</span>
                <span className="font-bold text-brand-yellow">{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-red via-[#ff8a00] to-brand-yellow transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {routineItems.map((item, index) => {
                const exercise = exercises.find(
                  (value) => value.id === item.exerciseId
                );
                const done = completed.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:p-4",
                      done
                        ? "border-brand-yellow/40 bg-brand-yellow/10"
                        : "border-white/8 bg-white/5 hover:border-brand-sky/40 hover:bg-white/8"
                    )}
                    onClick={() => setActiveExerciseId(item.id)}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                        done
                          ? "border-brand-yellow bg-brand-yellow text-[#08122e]"
                          : "border-brand-sky/30 bg-brand-blue/40 text-brand-sky"
                      )}
                    >
                      {done ? <Check className="size-4" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate font-semibold",
                          done && "text-muted-foreground line-through"
                        )}
                      >
                        {exercise?.name}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Repeat2 className="size-3" />
                          {item.sets} series × {item.reps} reps
                        </span>
                        <span className="flex items-center gap-1">
                          <TimerReset className="size-3" />
                          {item.restSeconds}s descanso
                        </span>
                        {exercise?.youtubeUrl && (
                          <span className="flex items-center gap-1 text-brand-sky">
                            <PlayCircle className="size-3" />
                            Video
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>

            <Dialog
              open={Boolean(activeExerciseId)}
              onOpenChange={(open) => {
                if (!open) setActiveExerciseId(null);
              }}
            >
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{activeExercise?.name}</DialogTitle>
                  <DialogDescription>
                    {activeExercise?.description ||
                      "Revisa la técnica antes de ejecutar el ejercicio."}
                  </DialogDescription>
                </DialogHeader>

                {activeItem && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                      {activeItem.sets} series × {activeItem.reps} reps
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                      {activeItem.restSeconds}s descanso
                    </span>
                    {activeExercise?.muscleGroup && (
                      <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                        {activeExercise.muscleGroup}
                      </span>
                    )}
                  </div>
                )}

                {activeEmbed ? (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
                    <div className="aspect-video">
                      <iframe
                        src={activeEmbed}
                        title={`Video de ${activeExercise?.name}`}
                        className="size-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
                    Este ejercicio todavía no tiene video de referencia.
                  </p>
                )}

                <DialogFooter className="sm:justify-between">
                  {activeWatch ? (
                    <Button variant="outline" asChild>
                      <a href={activeWatch} target="_blank" rel="noreferrer">
                        <ExternalLink /> Abrir en YouTube
                      </a>
                    </Button>
                  ) : (
                    <span />
                  )}
                  {activeItem && (
                    <Button
                      onClick={() => {
                        void toggleExercise(activeItem.id).then(() =>
                          setActiveExerciseId(null)
                        );
                      }}
                    >
                      <Check />
                      {activeDone ? "Desmarcar" : "Marcar completado"}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {progress === 100 && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-brand-yellow p-4 text-[#08122e]">
                <PartyPopper className="size-5 shrink-0" />
                <p className="text-sm font-bold">
                  ¡Día {selectedDay} completado! Buen trabajo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-brand-sky" />
            <CardTitle>Esta semana</CardTitle>
          </div>
          <CardDescription>
            Los días de pesas son lunes, miércoles y viernes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5">
            {weekPlan.map((day) => (
              <div
                key={day.day}
                className={cn(
                  "flex min-h-20 flex-col items-center justify-center rounded-xl border text-center transition-colors",
                  day.isToday
                    ? "border-brand-yellow bg-brand-yellow/12"
                    : "border-white/5 bg-white/5"
                )}
              >
                <span className="text-[10px] uppercase text-muted-foreground">
                  {day.day}
                </span>
                <span className="my-1 text-sm font-bold">{day.date}</span>
                {day.routineDay && (
                  <span className="mb-1 text-[9px] font-semibold text-muted-foreground">
                    Día {day.routineDay}
                  </span>
                )}
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    day.hasRoutine ? "bg-brand-red" : "bg-white/15"
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {routineItems.length > 0 && progress < 100 && (
        <Button
          size="lg"
          className="h-12 w-full sm:hidden"
          onClick={() =>
            void Promise.all(
              routineItems
                .filter((item) => !completed.includes(item.id))
                .map((item) => toggleCompletionAction(item.id, todayIso))
            ).then(() => getCompletionsForDateAction(todayIso).then(setCompleted))
          }
        >
          <Check /> Marcar día {selectedDay} completo
        </Button>
      )}
    </div>
  );
}

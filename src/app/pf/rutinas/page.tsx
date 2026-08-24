"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Dumbbell,
  Layers3,
  Plus,
  Repeat2,
  Trash2,
} from "lucide-react";
import {
  type RoutineExerciseDraft,
  useTrainingData,
} from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import type { RoutineDayNumber } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAY_ACCENTS = ["#ff161f", "#f9e200", "#3d7bff"];

function emptyItem(dayNumber: RoutineDayNumber): RoutineExerciseDraft {
  return {
    exerciseId: "",
    dayNumber,
    sets: 3,
    reps: 10,
    restSeconds: 60,
  };
}

function initialDays(): RoutineExerciseDraft[][] {
  return [
    [emptyItem(1)],
    [emptyItem(2)],
    [emptyItem(3)],
  ];
}

export default function PFRutinasPage() {
  const { session } = useAuth();
  const { exercises, routines, routineExercises, addRoutine } =
    useTrainingData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<RoutineExerciseDraft[][]>(initialDays);
  const [savedMessage, setSavedMessage] = useState("");

  function updateItem(
    dayIndex: number,
    itemIndex: number,
    field: keyof RoutineExerciseDraft,
    value: string
  ) {
    setDays((current) =>
      current.map((day, currentDay) =>
        currentDay === dayIndex
          ? day.map((item, currentItem) =>
              currentItem === itemIndex
                ? {
                    ...item,
                    [field]:
                      field === "exerciseId"
                        ? value
                        : Math.max(1, Number(value)),
                  }
                : item
            )
          : day
      )
    );
  }

  function addExercise(dayIndex: number) {
    setDays((current) =>
      current.map((day, index) =>
        index === dayIndex
          ? [...day, emptyItem((dayIndex + 1) as RoutineDayNumber)]
          : day
      )
    );
  }

  function removeExercise(dayIndex: number, itemIndex: number) {
    setDays((current) =>
      current.map((day, index) =>
        index === dayIndex
          ? day.filter((_, currentItem) => currentItem !== itemIndex)
          : day
      )
    );
  }

  function saveRoutine(event: React.FormEvent) {
    event.preventDefault();
    const items = days.flat();
    if (
      !name.trim() ||
      days.some((day) => day.length === 0) ||
      items.some((item) => !item.exerciseId)
    )
      return;
    addRoutine(
      { name: name.trim(), description: description.trim() },
      items,
      session?.userId ?? "user-pf-1"
    );
    setSavedMessage(`“${name.trim()}” se guardó con sus tres días.`);
    setName("");
    setDescription("");
    setDays(initialDays());
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-brand-red" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
            Biblioteca de fuerza
          </p>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Rutinas de tres días
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada rutina contiene exactamente tres días de pesas con ejercicios independientes.
        </p>
      </header>

      <div className="grid items-start gap-6 2xl:grid-cols-[minmax(36rem,1.2fr)_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nueva rutina</CardTitle>
            <CardDescription>
              Define el objetivo y completa los tres días antes de guardar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={saveRoutine}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="routine-name">Nombre</Label>
                  <Input
                    id="routine-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Fuerza general Sub-20"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="routine-description">Objetivo</Label>
                  <Input
                    id="routine-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Ej. Desarrollo de fuerza máxima"
                  />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {days.map((items, dayIndex) => {
                  const dayNumber = (dayIndex + 1) as RoutineDayNumber;
                  return (
                    <section
                      key={dayNumber}
                      className="overflow-hidden rounded-xl border bg-white/5"
                    >
                      <div
                        className="flex items-center justify-between border-b p-3"
                        style={{
                          borderTop: `3px solid ${DAY_ACCENTS[dayIndex]}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            className="size-4"
                            style={{ color: DAY_ACCENTS[dayIndex] }}
                          />
                          <div>
                            <p className="text-sm font-bold">Día {dayNumber}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {items.length} ejercicio{items.length !== 1 && "s"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Agregar ejercicio al día ${dayNumber}`}
                          onClick={() => addExercise(dayIndex)}
                        >
                          <Plus />
                        </Button>
                      </div>

                      <div className="space-y-3 p-3">
                        {items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="rounded-lg border bg-background/40 p-3"
                          >
                            <div className="mb-3 flex gap-2">
                              <span
                                className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor: DAY_ACCENTS[dayIndex],
                                  color:
                                    dayIndex === 1 ? "#08122e" : undefined,
                                }}
                              >
                                {itemIndex + 1}
                              </span>
                              <Select
                                value={item.exerciseId}
                                onValueChange={(value) =>
                                  updateItem(
                                    dayIndex,
                                    itemIndex,
                                    "exerciseId",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="min-w-0 flex-1">
                                  <SelectValue placeholder="Ejercicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercises.map((exercise) => (
                                    <SelectItem
                                      key={exercise.id}
                                      value={exercise.id}
                                    >
                                      {exercise.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Quitar ejercicio"
                                  onClick={() =>
                                    removeExercise(dayIndex, itemIndex)
                                  }
                                >
                                  <Trash2 />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { key: "sets", label: "Series" },
                                { key: "reps", label: "Reps" },
                                { key: "restSeconds", label: "Pausa" },
                              ].map((field) => (
                                <div key={field.key} className="grid gap-1">
                                  <Label className="text-[10px] text-muted-foreground">
                                    {field.label}
                                  </Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={
                                      item[
                                        field.key as keyof RoutineExerciseDraft
                                      ]
                                    }
                                    onChange={(event) =>
                                      updateItem(
                                        dayIndex,
                                        itemIndex,
                                        field.key as keyof RoutineExerciseDraft,
                                        event.target.value
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => addExercise(dayIndex)}
                        >
                          <Plus /> Agregar ejercicio
                        </Button>
                      </div>
                    </section>
                  );
                })}
              </div>

              {savedMessage && (
                <p className="rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-sm text-brand-yellow">
                  {savedMessage}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Dumbbell /> Guardar rutina de 3 días
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Rutinas disponibles</h2>
              <p className="text-sm text-muted-foreground">
                {routines.length} rutinas para asignar
              </p>
            </div>
            <Badge variant="secondary">{exercises.length} ejercicios base</Badge>
          </div>

          {[...routines].reverse().map((routine) => {
            const items = routineExercises.filter(
              (item) => item.routineId === routine.id
            );
            const totalSets = items.reduce((sum, item) => sum + item.sets, 0);
            const duration = Math.max(
              15,
              Math.round(
                items.reduce(
                  (sum, item) =>
                    sum + item.sets * (item.reps * 4 + item.restSeconds),
                  0
                ) / 60
              )
            );
            return (
              <Card key={routine.id}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand-yellow/12 text-brand-yellow ring-1 ring-brand-yellow/25">
                      <Dumbbell className="size-4" />
                    </div>
                    <Badge>3 días</Badge>
                  </div>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>
                    {routine.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[
                      {
                        icon: Layers3,
                        value: items.length,
                        label: "ejercicios",
                      },
                      { icon: Repeat2, value: totalSets, label: "series" },
                      { icon: Clock3, value: `${duration}m`, label: "total" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-white/5 p-2 text-center ring-1 ring-white/5"
                      >
                        <stat.icon className="mx-auto mb-1 size-3.5 text-brand-yellow" />
                        <p className="text-sm font-semibold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map((dayNumber, index) => {
                      const dayItems = items
                        .filter((item) => item.dayNumber === dayNumber)
                        .sort((a, b) => a.order - b.order);
                      return (
                        <div
                          key={dayNumber}
                          className="rounded-lg border bg-white/5 p-2"
                          style={{
                            borderTopColor: DAY_ACCENTS[index],
                            borderTopWidth: 2,
                          }}
                        >
                          <p className="text-xs font-bold">Día {dayNumber}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {dayItems.length} ejercicios
                          </p>
                          <div className="mt-2 flex -space-x-1">
                            {dayItems.slice(0, 4).map((item) => (
                              <span
                                key={item.id}
                                title={
                                  exercises.find(
                                    (exercise) =>
                                      exercise.id === item.exerciseId
                                  )?.name
                                }
                                className="size-5 rounded-full border-2 border-card"
                                style={{
                                  backgroundColor: DAY_ACCENTS[index],
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

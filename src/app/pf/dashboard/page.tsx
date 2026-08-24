"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Check,
  Dumbbell,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { es } from "date-fns/locale";
import { useTrainingData } from "@/contexts/data-context";
import { categories } from "@/lib/mockData";
import type { PeriodType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERIOD_TYPES: {
  value: PeriodType;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: "carga",
    label: "Carga",
    description: "Mayor volumen e intensidad de trabajo.",
    color: "#ff161f",
  },
  {
    value: "descarga",
    label: "Descarga",
    description: "Reduce la fatiga y prioriza la recuperación.",
    color: "#3d7bff",
  },
  {
    value: "transicion",
    label: "Transición",
    description: "Adaptación entre dos fases de entrenamiento.",
    color: "#f9e200",
  },
];

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value: string) {
  return parseDate(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toLocalIso(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function PFDashboardPage() {
  const {
    periods,
    routines,
    routineExercises,
    assignments,
    createPlan,
    deletePlan,
  } = useTrainingData();
  const [categoryId, setCategoryId] = useState("cat-f-s20");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState({
    startDate: "",
    endDate: "",
    type: "" as PeriodType | "",
    routineId: "",
  });

  const category = categories.find((item) => item.id === categoryId)!;
  const categoryPeriods = periods.filter(
    (item) => item.categoryId === categoryId
  );
  const periodIds = new Set(categoryPeriods.map((item) => item.id));
  const categoryAssignments = assignments.filter((item) =>
    periodIds.has(item.periodId)
  );
  const selectedIso = toLocalIso(selectedDate);
  const selectedPeriod = categoryPeriods.find(
    (item) => item.startDate <= selectedIso && item.endDate >= selectedIso
  );
  const selectedAssignment = assignments.find(
    (item) => item.periodId === selectedPeriod?.id
  );
  const selectedRoutine = routines.find(
    (item) => item.id === selectedAssignment?.routineId
  );
  const hasOverlap =
    plan.startDate !== "" &&
    plan.endDate !== "" &&
    categoryPeriods.some(
      (item) =>
        plan.startDate <= item.endDate && plan.endDate >= item.startDate
    );

  const periodModifiers = useMemo(
    () =>
      Object.fromEntries(
        categoryPeriods.map((period) => [
          period.id,
          { from: parseDate(period.startDate), to: parseDate(period.endDate) },
        ])
      ),
    [categoryPeriods]
  );
  const periodModifierStyles = useMemo(
    () =>
      Object.fromEntries(
        categoryPeriods.map((period) => [
          period.id,
          {
            boxShadow: `inset 0 -3px 0 ${period.color}`,
            borderRadius: "0.5rem",
          },
        ])
      ),
    [categoryPeriods]
  );

  function openPlanner() {
    setStep(1);
    setPlan({ startDate: "", endDate: "", type: "", routineId: "" });
    setDialogOpen(true);
  }

  function savePlan() {
    if (
      !plan.startDate ||
      !plan.endDate ||
      !plan.type ||
      !plan.routineId ||
      hasOverlap
    )
      return;
    createPlan({ ...plan, type: plan.type, categoryId });
    setDialogOpen(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-brand-yellow" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
              Planificación por categoría
            </p>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Calendario de cargas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analiza y planifica cada categoría de forma independiente.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="min-w-64">
            <Label className="sr-only">Categoría analizada</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                setCategoryId(value);
                setSelectedDate(new Date());
              }}
            >
              <SelectTrigger className="h-10 w-full bg-card">
                <UsersRound className="text-brand-sky" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10" onClick={openPlanner}>
                <Plus />
                Planificar carga
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Planificar para {category.label}</DialogTitle>
                <DialogDescription>
                  Sigue el orden: fechas, tipo de periodo y rutina.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2">
                {["Fechas", "Tipo", "Rutina"].map((label, index) => {
                  const number = index + 1;
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2 text-xs",
                        step === number
                          ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
                          : step > number
                            ? "border-brand-sky/30 text-brand-sky"
                            : "text-muted-foreground"
                      )}
                    >
                      <span className="flex size-5 items-center justify-center rounded-full border text-[10px] font-bold">
                        {step > number ? <Check className="size-3" /> : number}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>

              <div className="min-h-64 py-2">
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold">1. Asigna las fechas</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Define el inicio y término del bloque.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="plan-start">Desde</Label>
                        <Input
                          id="plan-start"
                          type="date"
                          value={plan.startDate}
                          onChange={(event) =>
                            setPlan((value) => ({
                              ...value,
                              startDate: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="plan-end">Hasta</Label>
                        <Input
                          id="plan-end"
                          type="date"
                          min={plan.startDate}
                          value={plan.endDate}
                          onChange={(event) =>
                            setPlan((value) => ({
                              ...value,
                              endDate: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    {hasOverlap && (
                      <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 p-3 text-sm text-brand-red">
                        Estas fechas se superponen con otro bloque de la categoría.
                      </p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">2. Define el tipo</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        El tipo determina el objetivo y color del bloque.
                      </p>
                    </div>
                    {PERIOD_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setPlan((value) => ({ ...value, type: type.value }))
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                          plan.type === type.value
                            ? "border-brand-yellow bg-brand-yellow/10"
                            : "bg-white/5 hover:border-white/20"
                        )}
                      >
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="flex-1">
                          <span className="block font-semibold">{type.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.description}
                          </span>
                        </span>
                        {plan.type === type.value && (
                          <Check className="size-4 text-brand-yellow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">3. Selecciona la rutina</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Todas las rutinas incluyen tres días de pesas.
                      </p>
                    </div>
                    {routines.map((routine) => {
                      const items = routineExercises.filter(
                        (item) => item.routineId === routine.id
                      );
                      return (
                        <button
                          key={routine.id}
                          type="button"
                          onClick={() =>
                            setPlan((value) => ({
                              ...value,
                              routineId: routine.id,
                            }))
                          }
                          className={cn(
                            "w-full rounded-xl border p-4 text-left transition-colors",
                            plan.routineId === routine.id
                              ? "border-brand-yellow bg-brand-yellow/10"
                              : "bg-white/5 hover:border-white/20"
                          )}
                        >
                          <span className="flex items-start gap-3">
                            <Dumbbell className="mt-0.5 size-4 text-brand-yellow" />
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">
                                {routine.name}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                Día 1: {items.filter((i) => i.dayNumber === 1).length} ·
                                Día 2: {items.filter((i) => i.dayNumber === 2).length} ·
                                Día 3: {items.filter((i) => i.dayNumber === 3).length} ejercicios
                              </span>
                            </span>
                            {plan.routineId === routine.id && (
                              <Check className="size-4 text-brand-yellow" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-row justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => setStep((value) => value - 1)}
                >
                  <ArrowLeft /> Atrás
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    disabled={
                      (step === 1 &&
                        (!plan.startDate ||
                          !plan.endDate ||
                          plan.endDate < plan.startDate ||
                          hasOverlap)) ||
                      (step === 2 && !plan.type)
                    }
                    onClick={() => setStep((value) => value + 1)}
                  >
                    Continuar <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!plan.routineId}
                    onClick={savePlan}
                  >
                    <Check /> Guardar planificación
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="border-brand-sky/20 bg-brand-blue/15">
        <CardContent className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-sky">
              Analizando
            </p>
            <p className="mt-1 text-lg font-bold">{category.label}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{categoryPeriods.length} bloques</Badge>
            <Badge variant="outline">
              {categoryAssignments.length} rutinas asignadas
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(20rem,0.8fr)_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de {category.label}</CardTitle>
            <CardDescription>
              Solo muestra la planificación de la categoría seleccionada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              locale={es}
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              defaultMonth={selectedDate}
              modifiers={periodModifiers}
              modifiersStyles={periodModifierStyles}
              className="mx-auto w-full [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(11)]"
            />
            <div className="mt-4 rounded-xl border bg-white/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {selectedDate.toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              {selectedPeriod ? (
                <div className="mt-3 flex items-start gap-3">
                  <span
                    className="mt-1 size-3 rounded-full"
                    style={{ backgroundColor: selectedPeriod.color }}
                  />
                  <div>
                    <p className="font-semibold">{selectedPeriod.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoutine?.name ?? "Sin rutina"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay carga planificada para esta fecha.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloques de la categoría</CardTitle>
            <CardDescription>
              Fechas, tipo y rutina aplicada en cada bloque.
            </CardDescription>
            <CardAction>
              <Button size="sm" onClick={openPlanner}>
                <Plus /> Planificar
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryPeriods.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <CalendarRange className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">Sin planificación</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea el primer bloque para esta categoría.
                </p>
                <Button className="mt-4" size="sm" onClick={openPlanner}>
                  <Plus /> Crear bloque
                </Button>
              </div>
            )}
            {categoryPeriods.map((period) => {
              const assignment = assignments.find(
                (item) => item.periodId === period.id
              );
              const routine = routines.find(
                (item) => item.id === assignment?.routineId
              );
              return (
                <div
                  key={period.id}
                  className="relative overflow-hidden rounded-xl border bg-white/5 p-4"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{ backgroundColor: period.color }}
                  />
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{period.name}</p>
                        <Badge variant="secondary">3 días de pesas</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDate(period.startDate)} — {formatDate(period.endDate)}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Dumbbell className="size-4 text-brand-yellow" />
                        <span>{routine?.name ?? "Rutina no disponible"}</span>
                      </div>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Eliminar planificación"
                      onClick={() => deletePlan(period.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

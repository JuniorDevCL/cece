"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, UsersRound } from "lucide-react";
import { getCategoryAttendanceAction } from "@/lib/actions/attendance";
import { getCategoriesAction } from "@/lib/actions/users";
import type { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function todayIso() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function PFAsistenciaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof getCategoryAttendanceAction>>
  >([]);

  useEffect(() => {
    void getCategoriesAction().then((items) => {
      setCategories(items);
      if (items[0]) setCategoryId(items[0].id);
    });
  }, []);

  useEffect(() => {
    if (!categoryId || !date) return;
    void getCategoryAttendanceAction(categoryId, date).then(setRows);
  }, [categoryId, date]);

  const presentCount = useMemo(
    () => rows.filter((row) => row.attendance?.present).length,
    [rows]
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-brand-yellow" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-yellow">
            Control de asistencia
          </p>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Asistencia a preparación física
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa quién marcó presente en cada sesión de pesas.
        </p>
      </header>

      <Card className="border-brand-sky/20 bg-brand-blue/15">
        <CardContent className="grid gap-4 py-1 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label className="mb-2 block">Categoría</Label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="att-date" className="mb-2 block">
              Fecha
            </Label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 text-center ring-1 ring-white/10">
            <p className="text-xs text-muted-foreground">Presentes</p>
            <p className="text-2xl font-extrabold text-brand-yellow">
              {presentCount}/{rows.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-brand-sky" />
            <CardTitle>Listado del día</CardTitle>
          </div>
          <CardDescription>
            Los deportistas marcan presente desde su panel en los días de pesas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay deportistas registrados en esta categoría.
            </p>
          )}
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-blue/30 text-brand-sky">
                  <UsersRound className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </div>
              </div>
              <Badge
                variant={row.attendance?.present ? "default" : "secondary"}
                className={
                  row.attendance?.present
                    ? "bg-brand-yellow text-[#08122e]"
                    : undefined
                }
              >
                {row.attendance?.present
                  ? `Presente · Día ${row.attendance.routineDay}`
                  : "Sin marcar"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

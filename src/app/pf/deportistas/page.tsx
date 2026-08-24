"use client";

import { useEffect, useState } from "react";
import { Check, Plus, UserRound } from "lucide-react";
import {
  createAthleteAction,
  getCategoriesAction,
  listAthletesAction,
} from "@/lib/actions/users";
import type { Category } from "@/lib/types";
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

export default function PFDeportistasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [athletes, setAthletes] = useState<
    Awaited<ReturnType<typeof listAthletesAction>>
  >([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCategoriesAction(), listAthletesAction()])
      .then(([cats, list]) => {
        if (cancelled) return;
        setCategories(cats);
        setAthletes(list);
        if (cats[0]) setCategoryId(cats[0].id);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await createAthleteAction({ name, email, password, categoryId });
      setMessage(`Cuenta creada para ${name.trim()}.`);
      setName("");
      setEmail("");
      setPassword("");
      const list = await listAthletesAction();
      setAthletes(list);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la cuenta");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-brand-sky" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sky">
            Gestión de cuentas
          </p>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Deportistas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea un login individual para cada deportista del club.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(24rem,0.9fr)_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nueva cuenta</CardTitle>
            <CardDescription>
              El deportista entrará con su email y contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="ath-name">Nombre completo</Label>
                <Input
                  id="ath-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ath-email">Email</Label>
                <Input
                  id="ath-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ath-password">Contraseña inicial</Label>
                <Input
                  id="ath-password"
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ath-category">Categoría</Label>
                <select
                  id="ath-category"
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
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

              {message && (
                <p className="flex items-center gap-2 rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-sm text-brand-yellow">
                  <Check className="size-4" />
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full sm:w-auto">
                <Plus /> Crear deportista
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Cuentas registradas</h2>
            <p className="text-sm text-muted-foreground">
              {athletes.length} deportistas con acceso propio
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {athletes.map((athlete) => {
              const category = categories.find(
                (item) => item.id === athlete.categoryId
              );
              return (
                <Card key={athlete.id}>
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-full bg-brand-blue/30 text-brand-sky">
                        <UserRound className="size-4" />
                      </span>
                      <Badge variant="outline">{category?.label ?? "Sin categoría"}</Badge>
                    </div>
                    <CardTitle className="text-base">{athlete.name}</CardTitle>
                    <CardDescription>{athlete.email}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { categories, users } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LoginMode = "pf" | "deportista";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsPF, loginAsAthlete } = useAuth();
  const [mode, setMode] = useState<LoginMode>("pf");
  const [categoryId, setCategoryId] = useState<string>("");

  const pfUser = useMemo(() => users.find((user) => user.role === "pf")!, []);

  const athleteForCategory = useMemo(() => {
    if (!categoryId) return null;
    return (
      users.find(
        (user) => user.role === "deportista" && user.categoryId === categoryId
      ) ?? null
    );
  }, [categoryId]);

  function handleEnter() {
    if (mode === "pf") {
      loginAsPF(pfUser.id, pfUser.name);
      router.push("/pf/dashboard");
      return;
    }

    if (!categoryId) return;

    loginAsAthlete(
      athleteForCategory?.id ?? `guest-${categoryId}`,
      athleteForCategory?.name ?? "Deportista",
      categoryId
    );
    router.push("/atleta/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(150deg,#002e8c_0%,#050d22_55%,#1a0508_100%)]"
        />
        <div aria-hidden className="brand-grid absolute inset-0 opacity-60" />
        <div
          aria-hidden
          className="absolute -right-24 top-1/3 size-[28rem] rounded-full bg-brand-red/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-20 bottom-0 size-80 rounded-full bg-brand-yellow/20 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-3">
          <span className="h-1 w-10 rounded-full bg-brand-yellow" />
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-yellow">
            Club Excelsior
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-start">
          <BrandLogo size={132} priority className="mb-8" />
          <h1 className="max-w-md font-heading text-5xl font-extrabold leading-[1.05] tracking-tight">
            Preparación física
            <span className="block text-brand-yellow">de alto nivel</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-white/70">
            Planifica periodos, diseña rutinas y lleva a cada categoría del club
            al máximo rendimiento en la cancha.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          {[
            { value: "10", label: "Categorías" },
            { value: "3", label: "Periodos" },
            { value: "100%", label: "Seguimiento" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <p className="font-heading text-2xl font-bold text-brand-yellow">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-white/60">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,226,0,0.12),_transparent_55%)] lg:hidden"
        />

        <div className="relative z-10 mb-8 flex flex-col items-center text-center lg:hidden">
          <BrandLogo size={92} priority />
          <h1 className="mt-4 font-heading text-2xl font-extrabold tracking-tight">
            EXCELSIOR
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preparación física · Voleibol
          </p>
        </div>

        <Card className="relative z-10 w-full max-w-md border-0 ring-1 ring-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Selecciona tu perfil para entrar al panel correspondiente.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { value: "pf" as const, label: "Preparador", icon: Dumbbell },
                {
                  value: "deportista" as const,
                  label: "Deportista",
                  icon: UserRound,
                },
              ].map((option) => {
                const active = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all",
                      active
                        ? "border-brand-yellow bg-brand-yellow/10 text-foreground"
                        : "border-border bg-muted/20 text-muted-foreground hover:border-brand-sky/60 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full transition-colors",
                        active
                          ? "bg-brand-yellow text-[#08122e]"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <option.icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {mode === "pf" ? (
              <div className="flex items-center gap-3 rounded-xl border border-brand-sky/25 bg-brand-blue/25 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{pfUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Administrador de rutinas y periodos
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Tu categoría</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="h-12 w-full">
                    <SelectValue placeholder="Selecciona categoría…" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="w-[var(--radix-select-trigger-width)]"
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="min-h-4 text-xs text-muted-foreground">
                  {athleteForCategory
                    ? `Entrarás como ${athleteForCategory.name}`
                    : categoryId
                      ? "Sin deportista demo en esta categoría: entrarás como invitado."
                      : ""}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              size="lg"
              className="h-12 w-full text-base font-semibold"
              disabled={mode === "deportista" && !categoryId}
              onClick={handleEnter}
            >
              Entrar al panel
              <ArrowRight />
            </Button>
          </CardFooter>
        </Card>

        <p className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
          Maqueta funcional · datos simulados
        </p>
      </section>
    </div>
  );
}

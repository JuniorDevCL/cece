"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, LoaderCircle, ShieldCheck } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        if (result.error === "Configuration") {
          setError(
            "Error de configuración en el servidor. Revisa AUTH_SECRET y AUTH_URL en Vercel, y que la base Neon tenga tablas (npm run db:seed)."
          );
        } else {
          setError("Email o contraseña incorrectos.");
        }
        return;
      }

      router.refresh();
      router.push("/");
    } catch {
      setLoading(false);
      setError(
        "No se pudo conectar con el login. Revisa AUTH_SECRET y AUTH_URL en Vercel."
      );
    }
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
            Cada deportista tiene su cuenta. El preparador planifica cargas y
            revisa asistencia desde la nube.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          {[
            { value: "10", label: "Categorías" },
            { value: "3", label: "Días de pesas" },
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
              Ingresa con tu cuenta de preparador o deportista.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-brand-sky/25 bg-brand-blue/25 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">Acceso seguro</p>
                  <p className="text-xs text-muted-foreground">
                    Datos guardados en Vercel Postgres
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@cece.club"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="rounded-lg border border-brand-red/30 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
                  {error}
                </p>
              )}

              <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
                  <Dumbbell className="size-3.5 text-brand-yellow" />
                  Cuentas demo (tras ejecutar seed)
                </p>
                <p>PF: carlos.pf@cece.club</p>
                <p>Deportista: lucia.vargas@cece.club</p>
                <p className="mt-1 text-brand-yellow">Contraseña: excelsior2026</p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                size="lg"
                className={cn("h-12 w-full text-base font-semibold")}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Entrando…
                  </>
                ) : (
                  <>
                    Entrar al panel
                    <ArrowRight />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
    </div>
  );
}

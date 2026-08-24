"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Dumbbell,
  LogOut,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTrainingData } from "@/contexts/data-context";
import { getCategoryById } from "@/lib/mockData";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navByRole = {
  pf: [
    { href: "/pf/dashboard", label: "Planificación", icon: CalendarDays },
    { href: "/pf/rutinas", label: "Rutinas", icon: ClipboardList },
    { href: "/pf/ejercicios", label: "Ejercicios", icon: Dumbbell },
  ],
  deportista: [
    { href: "/atleta/dashboard", label: "Mi entrenamiento", icon: Dumbbell },
  ],
} satisfies Record<
  UserRole,
  { href: string; label: string; icon: typeof CalendarDays }[]
>;

export function AppShell({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();
  const { resetData } = useTrainingData();
  const nav = navByRole[role];
  const category = session?.categoryId
    ? getCategoryById(session.categoryId)
    : undefined;

  useEffect(() => {
    if (!isLoading && (!session || session.role !== role)) {
      router.replace("/login");
    }
  }, [isLoading, role, router, session]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (isLoading || !session || session.role !== role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <BrandLogo size={64} className="animate-pulse" />
        <p className="text-sm text-muted-foreground">Cargando sesión…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-sidebar lg:flex">
        <div className="relative flex h-24 items-center gap-3 px-6">
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-brand-yellow/60 via-brand-red/40 to-transparent"
          />
          <BrandLogo size={44} priority />
          <div className="leading-tight">
            <p className="font-heading text-base font-extrabold tracking-tight">
              EXCELSIOR
            </p>
            <p className="text-[11px] text-muted-foreground">
              Preparación física
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-yellow text-[#08122e]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow/15 text-brand-yellow">
              {role === "pf" ? (
                <Dumbbell className="size-4" />
              ) : (
                <UserRound className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{session.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {role === "pf" ? "Preparador Físico" : category?.label}
              </p>
            </div>
          </div>
          {role === "pf" && (
            <Button
              variant="ghost"
              className="mb-1 w-full justify-start text-muted-foreground"
              onClick={resetData}
            >
              <RotateCcw />
              Restaurar datos demo
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-brand-red"
            onClick={handleLogout}
          >
            <LogOut />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-background/85 px-4 backdrop-blur-md lg:hidden">
        <Link href={nav[0].href} className="flex items-center gap-2.5">
          <BrandLogo size={34} priority />
          <span className="font-heading text-base font-extrabold tracking-tight">
            EXCELSIOR
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="secondary" className="max-w-36 truncate">
              {category.label}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar sesión"
            onClick={handleLogout}
          >
            <LogOut />
          </Button>
        </div>
      </header>

      <main className="pb-24 lg:ml-64 lg:pb-0">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid gap-1 border-t border-white/5 bg-background/95 p-2 backdrop-blur-md lg:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
      >
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors",
                active
                  ? "bg-brand-yellow/15 text-brand-yellow"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

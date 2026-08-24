"use client";

import { signOut, useSession } from "next-auth/react";
import { useMemo } from "react";
import type { AuthSession } from "@/lib/types";

export function useAuth() {
  const { data: session, status } = useSession();

  const mappedSession = useMemo<AuthSession | null>(() => {
    if (!session?.user?.id) return null;
    return {
      userId: session.user.id,
      name: session.user.name ?? "Usuario",
      role: session.user.role,
      categoryId: session.user.categoryId,
    };
  }, [session]);

  return {
    session: mappedSession,
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/login" }),
  };
}

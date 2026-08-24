"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  clearSession,
  loadSession,
  saveSession,
  subscribeToSession,
} from "@/lib/auth-storage";
import type { AuthSession, UserRole } from "@/lib/types";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  loginAsPF: (userId: string, name: string) => void;
  loginAsAthlete: (
    userId: string,
    name: string,
    categoryId: string
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToSession,
    loadSession,
    () => null
  );

  const persist = useCallback((next: AuthSession) => {
    saveSession(next);
  }, []);

  const loginAsPF = useCallback(
    (userId: string, name: string) => {
      persist({ userId, name, role: "pf", categoryId: null });
    },
    [persist]
  );

  const loginAsAthlete = useCallback(
    (userId: string, name: string, categoryId: string) => {
      persist({
        userId,
        name,
        role: "deportista" satisfies UserRole,
        categoryId,
      });
    },
    [persist]
  );

  const logout = useCallback(() => {
    clearSession();
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading: false,
      loginAsPF,
      loginAsAthlete,
      logout,
    }),
    [session, loginAsPF, loginAsAthlete, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}

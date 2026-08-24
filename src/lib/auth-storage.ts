import type { AuthSession } from "./types";

export const AUTH_STORAGE_KEY = "cece-auth-session";
const AUTH_CHANGE_EVENT = "cece-auth-change";

let cachedRaw: string | null | undefined;
let cachedSession: AuthSession | null = null;

export function saveSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  cachedRaw = undefined;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = JSON.parse(raw) as AuthSession;
    return cachedSession;
  } catch {
    cachedSession = null;
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  cachedRaw = undefined;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeToSession(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

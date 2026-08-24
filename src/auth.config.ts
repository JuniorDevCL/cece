import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;

      if (path.startsWith("/login")) return true;
      if (path === "/") return isLoggedIn;

      return isLoggedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

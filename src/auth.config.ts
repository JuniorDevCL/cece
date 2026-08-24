import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;

      if (path.startsWith("/login")) return true;
      if (path === "/") return isLoggedIn;

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user);

  if (pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const target =
      session!.user.role === "pf" ? "/pf/dashboard" : "/atleta/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) {
      const target =
        session!.user.role === "pf" ? "/pf/dashboard" : "/atleta/dashboard";
      return NextResponse.redirect(new URL(target, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/pf") && session!.user.role !== "pf") {
    return NextResponse.redirect(new URL("/atleta/dashboard", req.url));
  }

  if (pathname.startsWith("/atleta") && session!.user.role !== "deportista") {
    return NextResponse.redirect(new URL("/pf/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/pf/:path*",
    "/atleta/:path*",
  ],
};

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  // TEMPORARY DEBUG — remove after fixing
  console.log("MIDDLEWARE DEBUG", {
    pathname,
    isLoggedIn,
    userRole,
    auth: JSON.stringify(req.auth),
    cookies: req.cookies.getAll().map(c => c.name),
  });

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole === "CORPORATE")
      return NextResponse.redirect(new URL("/corporate", req.url));
  }

  if (pathname.startsWith("/corporate")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole !== "CORPORATE")
      return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(
      new URL(userRole === "CORPORATE" ? "/corporate" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/corporate/:path*", "/login", "/register"],
};
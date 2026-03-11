import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;
  const userRole = (token as any)?.role;

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole === "CORPORATE") return NextResponse.redirect(new URL("/corporate", req.url));
  }

  if (pathname.startsWith("/corporate")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (userRole !== "CORPORATE") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(userRole === "CORPORATE" ? "/corporate" : "/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/corporate/:path*", "/login", "/register"],
};
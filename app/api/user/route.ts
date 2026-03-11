// app/api/user/route.ts
// Returns the currently logged-in user's id + role.
// Called by the Chrome extension (cross-origin) to get userId before crediting tokens.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age":       "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const user = session.user as any;

    return NextResponse.json(
      {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error("[/api/user]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
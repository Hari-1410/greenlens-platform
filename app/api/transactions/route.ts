// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept ?userId= from client-side polling (must still match the session user
  // to prevent IDOR — any mismatch falls back to the session user's id).
  const sessionUserId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get("userId");
  const userId = queryUserId === sessionUserId ? sessionUserId : sessionUserId;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    // ✅ FIX: Wrap in { transactions } so DashboardClient's
    //         `tJson.transactions ?? []` resolves correctly.
    //         Previously the route returned a bare array, making
    //         `tJson.transactions` always undefined → always [].
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error("[/api/transactions GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
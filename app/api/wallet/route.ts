// app/api/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept ?userId= from the dashboard poller but always verify it
  // matches the authenticated session to prevent IDOR.
  const sessionUserId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get("userId");
  const userId = queryUserId === sessionUserId ? sessionUserId : sessionUserId;

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    // ✅ Return a consistent { wallet } shape so DashboardClient's
    //    `wJson.wallet ?? wJson` unwrapping works reliably on slow
    //    networks where partial / cached responses may arrive.
    return NextResponse.json({
      wallet: wallet ?? { tokenBalance: 0, moneyEquivalent: 0 },
    });
  } catch (err) {
    console.error("[/api/wallet GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
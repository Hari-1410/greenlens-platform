export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as any).role !== "CORPORATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const purchases = await prisma.purchase.findMany({
      select: { price: true, sustainabilityScore: true, tokensEarned: true },
    });

    const carbonSaved = purchases.reduce((s, p) => s + p.price * 0.002 * (p.sustainabilityScore / 100), 0);
    const totalTokens = purchases.reduce((s, p) => s + p.tokensEarned, 0);

    return NextResponse.json({
      totalUsers,
      totalGreenPurchases: purchases.length,
      totalTokensEarned: totalTokens,
      carbonSaved: parseFloat(carbonSaved.toFixed(2)),
      monetaryValueReturned: (totalTokens * 0.1).toFixed(2),
      reportDate: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

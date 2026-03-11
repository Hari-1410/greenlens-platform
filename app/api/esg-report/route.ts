import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "CORPORATE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, purchaseAgg, walletAgg] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.purchase.aggregate({
      _count: { id: true },
      _sum: { tokensEarned: true, price: true, sustainabilityScore: true },
    }),
    prisma.wallet.aggregate({ _sum: { tokenBalance: true } }),
  ]);

  const purchases = await prisma.purchase.findMany({
    select: { price: true, sustainabilityScore: true },
  });
  const carbonSaved = purchases.reduce((s, p) => s + p.price * 0.002 * (p.sustainabilityScore / 100), 0);

  return NextResponse.json({
    totalUsers,
    totalGreenPurchases: purchaseAgg._count.id,
    totalTokensEarned: purchaseAgg._sum.tokensEarned ?? 0,
    carbonSaved: parseFloat(carbonSaved.toFixed(2)),
    monetaryValueReturned: ((purchaseAgg._sum.tokensEarned ?? 0) * 0.1).toFixed(2),
    reportDate: new Date().toISOString(),
  });
}
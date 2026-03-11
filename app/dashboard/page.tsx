// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role === "CORPORATE") redirect("/corporate");

  const userId = (session.user as any).id;

  const [wallet, purchases, transactions] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.purchase.findMany({ where: { userId }, orderBy: { purchaseDate: "desc" }, take: 20 }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { timestamp: "desc" }, take: 20 }),
  ]);

  const carbonSaved = purchases.reduce(
    (sum, p) => sum + p.price * 0.002 * (p.sustainabilityScore / 100), 0
  );

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const mp    = purchases.filter(p => {
      const pd = new Date(p.purchaseDate);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    });
    const tokens = mp.reduce((s, p) => s + p.tokensEarned, 0);
    const carbon = mp.reduce((s, p) => s + p.price * 0.002 * (p.sustainabilityScore / 100), 0);
    return { month: label, tokens, carbon: parseFloat(carbon.toFixed(3)) };
  });

  // Real streak: count consecutive calendar days going back from today
  const days = [...new Set(purchases.map(p => p.purchaseDate.toISOString().split("T")[0]))]
    .sort((a, b) => b.localeCompare(a));
  let streakDays = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d    = new Date(day);
    const diff = Math.round((cursor.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 1) break;
    streakDays++;
    cursor = d;
  }

  return (
    <DashboardClient
      userId={userId}
      user={{ name: session.user.name || "User", email: session.user.email || "" }}
      wallet={wallet
        ? { tokenBalance: wallet.tokenBalance, moneyEquivalent: wallet.moneyEquivalent }
        : { tokenBalance: 0, moneyEquivalent: 0 }
      }
      purchases={purchases.map(p => ({
        id: p.id,
        userId: p.userId,
        productName: p.productName,
        price: p.price,
        sustainabilityScore: p.sustainabilityScore,
        tokensEarned: p.tokensEarned,
        externalId: p.externalId,
        purchaseDate: p.purchaseDate.toISOString(),
      }))}
      transactions={transactions.map(t => ({
        id: t.id,
        userId: t.userId,
        type: t.type,
        tokens: t.tokens,
        moneyValue: t.moneyValue,
        description: t.description,
        timestamp: t.timestamp.toISOString(),
      }))}
      carbonSaved={carbonSaved}
      streakDays={streakDays}
      monthlyData={monthlyData}
    />
  );
}
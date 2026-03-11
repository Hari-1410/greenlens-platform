import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

/**
 * Calculates the current green-purchase streak in days.
 * A "streak" counts how many consecutive calendar days (going backwards
 * from today) the user made at least one eco purchase.
 */
function calcStreakDays(purchases: { purchaseDate: Date }[]): number {
  if (purchases.length === 0) return 0;

  // Build a Set of unique date strings "YYYY-MM-DD" for fast lookup
  const purchaseDays = new Set(
    purchases.map(p => p.purchaseDate.toISOString().split("T")[0])
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];

    if (purchaseDays.has(key)) {
      streak++;
    } else if (i > 0) {
      // Allow a 1-day gap for today (in case no purchase yet today)
      break;
    }
  }

  return streak;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role === "CORPORATE") redirect("/corporate");

  const userId = (session.user as any).id;

  const [wallet, purchases, transactions] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.purchase.findMany({
      where: { userId },
      orderBy: { purchaseDate: "desc" },
      take: 50,
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 20,
    }),
  ]);

  const carbonSaved = purchases.reduce(
    (sum, p) => sum + p.price * 0.002 * (p.sustainabilityScore / 100),
    0
  );

  // Real streak: consecutive calendar days with at least one eco purchase
  const streakDays = calcStreakDays(purchases);

  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const monthPurchases = purchases.filter(p => {
      const pd = new Date(p.purchaseDate);
      return (
        pd.getMonth() === d.getMonth() &&
        pd.getFullYear() === d.getFullYear()
      );
    });
    const tokens = monthPurchases.reduce((s, p) => s + p.tokensEarned, 0);
    const carbon = monthPurchases.reduce(
      (s, p) => s + p.price * 0.002 * (p.sustainabilityScore / 100),
      0
    );
    return { month: label, tokens, carbon: parseFloat(carbon.toFixed(3)) };
  });

  return (
    <DashboardClient
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
      }}
      wallet={
        wallet
          ? { tokenBalance: wallet.tokenBalance, moneyEquivalent: wallet.moneyEquivalent }
          : { tokenBalance: 0, moneyEquivalent: 0 }
      }
      purchases={purchases.map(p => ({
        ...p,
        purchaseDate: p.purchaseDate.toISOString(),
      }))}
      transactions={transactions.map(t => ({
        ...t,
        timestamp: t.timestamp.toISOString(),
      }))}
      carbonSaved={carbonSaved}
      streakDays={streakDays}
      monthlyData={monthlyData}
    />
  );
}
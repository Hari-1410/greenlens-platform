import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CorporateClient } from "@/components/corporate/CorporateClient";

export const dynamic = "force-dynamic";

export default async function CorporatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "CORPORATE") redirect("/dashboard");

  const [totalUsers, purchaseAgg, walletAgg, recentPurchases] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.purchase.aggregate({
      _count: { id: true },
      _sum: { tokensEarned: true, price: true, sustainabilityScore: true },
    }),
    prisma.wallet.aggregate({ _sum: { tokenBalance: true } }),
    prisma.purchase.findMany({
      orderBy: { purchaseDate: "desc" },
      take: 100,
      select: { price: true, sustainabilityScore: true, tokensEarned: true, purchaseDate: true, productName: true },
    }),
  ]);

  const totalGreenPurchases = purchaseAgg._count.id;
  const totalTokens = purchaseAgg._sum.tokensEarned || 0;
  const carbonSaved = recentPurchases.reduce((s, p) => s + p.price * 0.002 * (p.sustainabilityScore / 100), 0);

  const categories: Record<string, number> = {};
  recentPurchases.forEach(p => {
    const name = p.productName.toLowerCase();
    const cat =
      name.includes("organic") ? "Food & Organic" :
      name.includes("bamboo") || name.includes("cotton") ? "Eco Materials" :
      name.includes("solar") || name.includes("led") || name.includes("energy") ? "Energy Efficient" :
      name.includes("recycle") || name.includes("compost") ? "Recycled" :
      "Other Eco";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));

  const now = new Date();
  const monthlyChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const monthPurchases = recentPurchases.filter(p => {
      const pd = new Date(p.purchaseDate);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    });
    return {
      month: label,
      purchases: monthPurchases.length,
      tokens: monthPurchases.reduce((s, p) => s + p.tokensEarned, 0),
    };
  });

  return (
    <CorporateClient
      user={{ name: session.user.name || "Corporate", email: session.user.email || "" }}
      stats={{ totalUsers, totalGreenPurchases, totalTokens, carbonSaved: parseFloat(carbonSaved.toFixed(2)) }}
      monthlyData={monthlyChartData}
      categoryData={categoryData}
    />
  );
}

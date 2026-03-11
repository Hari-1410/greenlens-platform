import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcTokens, tokensToMoney } from "@/lib/tokens";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  userId: z.string().optional(),
  productName: z.string().min(1),
  price: z.number().positive(),
  sustainabilityScore: z.number().min(0).max(100),
  tokensEarned: z.number().min(0).optional(),
  externalId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = schema.parse(body);
    const userId = (session?.user as any)?.id || data.userId;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (data.externalId) {
      const existing = await prisma.purchase.findUnique({ where: { externalId: data.externalId } });
      if (existing) return NextResponse.json({ error: "Duplicate purchase", purchase: existing }, { status: 409 });
    }
    const tokens = data.tokensEarned ?? calcTokens(data.sustainabilityScore);
    const moneyValue = tokensToMoney(tokens);
    const [purchase] = await prisma.([
      prisma.purchase.create({ data: { userId, productName: data.productName, price: data.price, sustainabilityScore: data.sustainabilityScore, tokensEarned: tokens, externalId: data.externalId } }),
      prisma.wallet.upsert({ where: { userId }, update: { tokenBalance: { increment: tokens }, moneyEquivalent: { increment: moneyValue }, lastUpdated: new Date() }, create: { userId, tokenBalance: tokens, moneyEquivalent: moneyValue } }),
      prisma.transaction.create({ data: { userId, type: "EARN", tokens, moneyValue, description: Eco purchase:  } }),
    ]);
    return NextResponse.json({ success: true, tokensEarned: tokens, moneyValue, purchase });
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: err.errors }, { status: 400 });
    console.error("Purchase error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const purchases = await prisma.purchase.findMany({ where: { userId: (session.user as any).id }, orderBy: { purchaseDate: "desc" }, take: 50 });
  return NextResponse.json(purchases);
}

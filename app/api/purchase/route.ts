// app/api/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcTokens, tokensToMoney } from "@/lib/tokens";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ── CORS: Chrome extension runs on amazon.* domains ──────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age":       "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const schema = z.object({
  userId:              z.string().optional(),
  productName:         z.string().min(1),
  price:               z.number().min(0),
  sustainabilityScore: z.number().min(0).max(100),
  tokensEarned:        z.number().min(0).optional(),
  externalId:          z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body    = await req.json();
    const data    = schema.parse(body);

    const userId = (session?.user as any)?.id || data.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Idempotency: same externalId = already credited, return 409 silently
    if (data.externalId) {
      const existing = await prisma.purchase.findUnique({
        where: { externalId: data.externalId },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Already credited", tokensEarned: existing.tokensEarned },
          { status: 409, headers: CORS_HEADERS }
        );
      }
    }

    const tokens     = data.tokensEarned ?? calcTokens(data.sustainabilityScore);
    const moneyValue = tokensToMoney(tokens);

    const [purchase] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          userId,
          productName:         data.productName,
          price:               data.price,
          sustainabilityScore: data.sustainabilityScore,
          tokensEarned:        tokens,
          externalId:          data.externalId,
        },
      }),
      prisma.wallet.upsert({
        where:  { userId },
        update: {
          tokenBalance:    { increment: tokens },
          moneyEquivalent: { increment: moneyValue },
          lastUpdated:     new Date(),
        },
        create: {
          userId,
          tokenBalance:    tokens,
          moneyEquivalent: moneyValue,
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type:        "EARN",
          tokens,
          moneyValue,
          description: `Eco cart: ${data.productName.slice(0, 60)}`,
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, purchaseId: purchase.id, tokensEarned: tokens, moneyValue },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[/api/purchase POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const purchases = await prisma.purchase.findMany({
      where:   { userId },
      orderBy: { purchaseDate: "desc" },   // ← correct field name from schema
      take:    50,
    });
    return NextResponse.json({ purchases }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("[/api/purchase GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
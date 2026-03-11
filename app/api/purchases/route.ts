// app/api/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcTokens, tokensToMoney } from "@/lib/tokens";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age":       "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MIN_PRICE_INR     = 100;  // ₹100 minimum product price
const WEEKLY_TOKEN_CAP  = 200;  // max tokens earnable in any rolling 7-day window
const DAILY_ASIN_HOURS  = 24;   // same ASIN cannot be credited twice within this window

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

    // ── Rule 1: Minimum product price ─────────────────────────────────────────
    if (data.price < MIN_PRICE_INR) {
      return NextResponse.json(
        {
          error:   "min_price",
          message: `Product must cost at least ₹${MIN_PRICE_INR} to earn tokens`,
        },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    // ── Rule 2: Duplicate ASIN within 24 hours ────────────────────────────────
    // externalId format: `${asin}-cart-${YYYYMMDD}` or `${asin}-order-${YYYYMMDD}`
    // Extract ASIN prefix (10 uppercase alphanumeric chars) and check recency.
    if (data.externalId) {
      const asinMatch = data.externalId.match(/^([A-Z0-9]{8,12})-/);
      if (asinMatch) {
        const asinPrefix  = asinMatch[1];
        const windowStart = new Date(Date.now() - DAILY_ASIN_HOURS * 60 * 60 * 1000);
        const recentSameAsin = await prisma.purchase.findFirst({
          where: {
            userId,
            externalId:   { startsWith: asinPrefix },
            purchaseDate: { gte: windowStart },
          },
        });
        if (recentSameAsin) {
          return NextResponse.json(
            {
              error:   "duplicate_asin",
              message: "You already earned tokens for this product today. Come back tomorrow!",
            },
            { status: 409, headers: CORS_HEADERS }
          );
        }
      }

      // Exact externalId match — legacy idempotency guard
      const exactMatch = await prisma.purchase.findUnique({
        where: { externalId: data.externalId },
      });
      if (exactMatch) {
        return NextResponse.json(
          {
            error:        "duplicate_asin",
            message:      "Already credited for this product today",
            tokensEarned: exactMatch.tokensEarned,
          },
          { status: 409, headers: CORS_HEADERS }
        );
      }
    }

    // ── Rule 3: Weekly token cap (rolling 7 days) ─────────────────────────────
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type:      "EARN",
        timestamp: { gte: weekStart },
      },
      _sum: { tokens: true },
    });
    const weeklyEarned = weeklyAgg._sum.tokens ?? 0;

    if (weeklyEarned >= WEEKLY_TOKEN_CAP) {
      return NextResponse.json(
        {
          error:          "weekly_cap",
          message:        `Weekly limit of ${WEEKLY_TOKEN_CAP} tokens reached. Resets in ${daysUntilReset(weekStart)} day(s)!`,
          weeklyEarned,
          weeklyTokenCap: WEEKLY_TOKEN_CAP,
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // Clamp tokens so we never exceed the cap even partially
    const tokensWanted  = data.tokensEarned ?? calcTokens(data.sustainabilityScore);
    const tokens        = Math.min(tokensWanted, WEEKLY_TOKEN_CAP - weeklyEarned);
    const moneyValue    = tokensToMoney(tokens);

    if (tokens === 0) {
      return NextResponse.json(
        {
          error:          "weekly_cap",
          message:        `Weekly limit of ${WEEKLY_TOKEN_CAP} tokens reached.`,
          weeklyEarned,
          weeklyTokenCap: WEEKLY_TOKEN_CAP,
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    // ── All checks passed — write Purchase + Wallet + Transaction atomically ──
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
          description: `Eco purchase: ${data.productName.slice(0, 60)}`,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success:        true,
        purchaseId:     purchase.id,
        tokensEarned:   tokens,
        moneyValue,
        weeklyEarned:   weeklyEarned + tokens,
        weeklyTokenCap: WEEKLY_TOKEN_CAP,
      },
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
      orderBy: { purchaseDate: "desc" },
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

// ── Helper ────────────────────────────────────────────────────────────────────
function daysUntilReset(weekStart: Date): number {
  const resetAt = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const diff    = resetAt.getTime() - Date.now();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

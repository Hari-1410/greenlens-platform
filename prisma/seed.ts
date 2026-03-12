import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Must match lib/tokens.ts calcTokens exactly
function calcTokens(score: number): number {
  if (score >= 90) return 20;
  if (score >= 80) return 15;
  if (score >= 60) return 10;
  if (score >= 40) return 5;
  return 0;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Demo user
  const userHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@greenlens.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@greenlens.app",
      passwordHash: userHash,
      role: "USER",
    },
  });

  // Sample purchases — scores now spread across tiers so tokens vary realistically
  const samplePurchases = [
    { productName: "Organic India Tulsi Green Tea 100 Bags",   price: 299, sustainabilityScore: 94 }, // 20 tokens
    { productName: "Bamboo Toothbrush Set Pack of 4",          price: 349, sustainabilityScore: 87 }, // 15 tokens
    { productName: "Khadi Natural Herbal Shampoo 200ml",       price: 245, sustainabilityScore: 82 }, // 15 tokens
    { productName: "Recycled Cotton Tote Bag Organic",         price: 199, sustainabilityScore: 74 }, // 10 tokens
    { productName: "Solar LED Garden Lights Set",              price: 599, sustainabilityScore: 91 }, // 20 tokens
    { productName: "Compostable Garbage Bags 30L",             price: 279, sustainabilityScore: 67 }, // 10 tokens
    { productName: "Beeswax Food Wraps Reusable Set",          price: 449, sustainabilityScore: 83 }, // 15 tokens
    { productName: "Stainless Steel Water Bottle 750ml",       price: 399, sustainabilityScore: 78 }, // 10 tokens
    { productName: "Jute Shopping Bag Natural Fiber",          price: 149, sustainabilityScore: 62 }, // 10 tokens
    { productName: "Recycled Paper Notebook Set of 3",         price: 259, sustainabilityScore: 55 }, //  5 tokens
  ].map(p => ({ ...p, tokensEarned: calcTokens(p.sustainabilityScore) }));

  const totalSeededTokens = samplePurchases.reduce((s, p) => s + p.tokensEarned, 0);

  await prisma.wallet.upsert({
    where:  { userId: user.id },
    update: {},
    create: { userId: user.id, tokenBalance: totalSeededTokens, moneyEquivalent: totalSeededTokens * 0.1 },
  });

  for (let i = 0; i < samplePurchases.length; i++) {
    const p = samplePurchases[i];
    const daysAgo = (i + 1) * 4;
    await prisma.purchase.create({
      data: {
        userId: user.id,
        ...p,
        purchaseDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type:        "EARN",
        tokens:      p.tokensEarned,
        moneyValue:  p.tokensEarned * 0.1,
        description: `Eco purchase: ${p.productName.slice(0, 50)}`,
        timestamp:   new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Demo corporate user
  const corpHash = await bcrypt.hash("password123", 12);
  const corp = await prisma.user.upsert({
    where: { email: "corp@greenlens.app" },
    update: {},
    create: {
      name: "EcoVentures Ltd",
      email: "corp@greenlens.app",
      passwordHash: corpHash,
      role: "CORPORATE",
    },
  });

  await prisma.corporate.upsert({
    where:  { contactEmail: "corp@greenlens.app" },
    update: {},
    create: {
      companyName:      "EcoVentures Ltd",
      contactEmail:     "corp@greenlens.app",
      subscriptionPlan: "pro",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Seeded ${samplePurchases.length} purchases, ${totalSeededTokens} total tokens`);
  console.log("   Demo user: demo@greenlens.app / password123");
  console.log("   Corporate: corp@greenlens.app / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
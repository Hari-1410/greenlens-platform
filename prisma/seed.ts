import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // Create wallet
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, tokenBalance: 157, moneyEquivalent: 15.7 },
  });

  // Sample purchases
  const samplePurchases = [
    { productName: "Organic India Tulsi Green Tea 100 Bags", price: 299, sustainabilityScore: 92, tokensEarned: 20 },
    { productName: "Bamboo Toothbrush Set Pack of 4", price: 349, sustainabilityScore: 88, tokensEarned: 20 },
    { productName: "Khadi Natural Herbal Shampoo 200ml", price: 245, sustainabilityScore: 85, tokensEarned: 20 },
    { productName: "Recycled Cotton Tote Bag Organic", price: 199, sustainabilityScore: 78, tokensEarned: 12 },
    { productName: "Solar LED Garden Lights Set", price: 599, sustainabilityScore: 89, tokensEarned: 20 },
    { productName: "Compostable Garbage Bags 30L", price: 279, sustainabilityScore: 87, tokensEarned: 20 },
    { productName: "Beeswax Food Wraps Reusable Set", price: 449, sustainabilityScore: 90, tokensEarned: 20 },
    { productName: "Stainless Steel Water Bottle 750ml", price: 399, sustainabilityScore: 86, tokensEarned: 20 },
  ];

  for (let i = 0; i < samplePurchases.length; i++) {
    const p = samplePurchases[i];
    const daysAgo = (i + 1) * 5;
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
        type: "EARN",
        tokens: p.tokensEarned,
        moneyValue: p.tokensEarned * 0.1,
        description: `Eco purchase: ${p.productName.slice(0, 50)}`,
        timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
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
    where: { contactEmail: "corp@greenlens.app" },
    update: {},
    create: {
      companyName: "EcoVentures Ltd",
      contactEmail: "corp@greenlens.app",
      subscriptionPlan: "pro",
    },
  });

  console.log("✅ Seed complete!");
  console.log("   Demo user: demo@greenlens.app / password123");
  console.log("   Corporate: corp@greenlens.app / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

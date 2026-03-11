import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const purchases = await prisma.purchase.findMany({ where: { userId: (session.user as any).id }, orderBy: { purchaseDate: "desc" }, take: 50 });
  return NextResponse.json(purchases);
}

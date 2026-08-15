import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { QuoteStatus } from "@prisma/client";


export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as QuoteStatus | null;

    const where = status ? { status } : {};

    const quotations = await db.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Admin quotations GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

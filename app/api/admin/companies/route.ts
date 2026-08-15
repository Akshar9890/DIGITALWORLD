import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CompanyStatus } from "@prisma/client";


export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as CompanyStatus | null;

    const where = status ? { status } : {};

    const companies = await db.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedTier: true,
      },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Admin companies GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

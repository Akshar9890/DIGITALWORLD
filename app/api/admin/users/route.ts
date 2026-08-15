import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";


export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        adminSubRole: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            quotations: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

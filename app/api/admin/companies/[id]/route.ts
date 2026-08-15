import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { CompanyStatus } from "@prisma/client";


export const dynamic = "force-dynamic";
const updateCompanySchema = z.object({
  status: z.nativeEnum(CompanyStatus),
  rejectionReason: z.string().optional(),
  assignedTierId: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const company = await db.company.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        assignedTier: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Admin company GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateCompanySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", issues: result.error.issues }, { status: 400 });
    }

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { status, rejectionReason, assignedTierId } = result.data;

    const company = await db.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === "rejected" ? rejectionReason : null,
          approvedAt: status === "approved" ? new Date() : null,
          approvedByUserId: status === "approved" ? session.user.id : null,
          assignedTierId: assignedTierId ?? existing.assignedTierId,
        },
      });

      // Update user role based on company status
      const userRole = status === "approved" ? "wholesale_approved" : "wholesale_pending";
      await tx.user.update({
        where: { id: existing.userId },
        data: { role: userRole },
      });

      return updated;
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Admin company PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

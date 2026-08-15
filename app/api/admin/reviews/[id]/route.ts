import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ReviewStatus } from "@prisma/client";


export const dynamic = "force-dynamic";
const updateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

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
    const result = updateReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data", issues: result.error.issues }, { status: 400 });
    }

    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const review = await db.review.update({
      where: { id },
      data: { status: result.data.status },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Admin review PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

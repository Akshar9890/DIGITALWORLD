export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const wholesaleSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact Name is required"),
  contactEmail: z.string().email("Valid Contact Email ID is required"),
  contactPhone: z.string().min(10, "Valid 10-digit Phone Number is required"),
  gstin: z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val.length === 15, "GSTIN must be exactly 15 characters")
    .refine(
      (val) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z0-9A-Z]{2}$/.test(val),
      "Invalid GSTIN format. Expected 15 characters e.g. 24AEHPT8655H1Z0"
    ),
  businessType: z.string().min(1, "Please select a business type"),
  expectedVolume: z.string().min(1, "Please select expected volume"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian pincode"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const result = wholesaleSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid form data";
      return NextResponse.json({ error: errorMsg, issues: result.error.issues }, { status: 400 });
    }

    const data = result.data;
    let userId = session?.user?.id;

    // Find or create user account based on contactEmail
    if (!userId) {
      let user = await db.user.findUnique({
        where: { email: data.contactEmail.toLowerCase() },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email: data.contactEmail.toLowerCase(),
            name: data.contactName,
            phone: data.contactPhone,
            role: "wholesale_pending",
          },
        });
      }
      userId = user.id;
    }

    // Check if company application already exists for this user
    const existingCompany = await db.company.findUnique({
      where: { userId },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "A wholesale application has already been submitted for this account." },
        { status: 400 }
      );
    }

    // Check if GSTIN is already registered by another company
    const existingGstin = await db.company.findUnique({
      where: { gstin: data.gstin },
    });

    if (existingGstin) {
      return NextResponse.json({ error: "This GSTIN is already registered." }, { status: 400 });
    }

    // Create Company and update user contact info & role in a transaction
    await db.$transaction(async (tx) => {
      await tx.company.create({
        data: {
          userId,
          companyName: data.companyName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          gstin: data.gstin,
          businessType: data.businessType,
          expectedVolume: data.expectedVolume,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          status: "pending",
        },
      });

      // Update User email, phone, name and set role to wholesale_pending
      await tx.user.update({
        where: { id: userId },
        data: {
          name: data.contactName,
          phone: data.contactPhone,
          role: session?.user?.role === "admin" ? session.user.role : "wholesale_pending",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wholesale application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * create-admin.ts
 * Run: npx tsx prisma/create-admin.ts
 *
 * Creates / resets the admin account:
 *   Email:    admin@digitalworld.com
 *   Password: DW@Admin2026!
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@digitalworld.com";
  const password = "DW@Admin2026!";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "admin",
      adminSubRole: "SUPER_ADMIN",
      name: "DigitalWorld Admin",
    },
    create: {
      name: "DigitalWorld Admin",
      email,
      passwordHash,
      role: "admin",
      adminSubRole: "SUPER_ADMIN",
    },
  });

  console.log("\n✅ Admin account ready!");
  console.log("──────────────────────────────");
  console.log(`  📧 Email   : ${email}`);
  console.log(`  🔑 Password: ${password}`);
  console.log(`  🆔 User ID : ${user.id}`);
  console.log("──────────────────────────────");
  console.log("  👉 Login at: http://localhost:3000/login");
  console.log("  👉 Admin  at: http://localhost:3000/admin\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Failed:", e);
    prisma.$disconnect();
    process.exit(1);
  });

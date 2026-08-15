/**
 * Prisma Seed Script — DigitalWorld
 *
 * Seeds:
 *  - 3 Categories
 *  - 7 Pricing Tiers (LOCKED pricing from spec freeze)
 *  - 1 Product (Heat Aerosol Fire Extinguishing Device)
 *  - ProductPrice rows for all tiers
 *  - 1 ShippingRule (₹150/kg, ₹80 min, ₹5000 free threshold)
 *  - 1 Admin user
 *
 * Run: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DigitalWorld database...\n");

  // ── 1. Categories ──────────────────────────────────────────────────────────
  console.log("📂 Creating categories...");

  const fireSuppression = await prisma.category.upsert({
    where: { slug: "fire-suppression" },
    update: {},
    create: {
      name: "Fire Suppression",
      slug: "fire-suppression",
      description:
        "Automatic heat aerosol fire extinguishing devices for electrical panels, cabinets, and enclosures.",
      image: "/products/category-fire.jpg",
      sortOrder: 1,
    },
  });

  const safetyGear = await prisma.category.upsert({
    where: { slug: "safety-gear" },
    update: {},
    create: {
      name: "Safety Gear",
      slug: "safety-gear",
      description:
        "Personal protective equipment for industrial and construction environments.",
      image: "/products/category-safety.jpg",
      sortOrder: 2,
    },
  });

  const industrialTech = await prisma.category.upsert({
    where: { slug: "industrial-tech" },
    update: {},
    create: {
      name: "Industrial Tech",
      slug: "industrial-tech",
      description:
        "Sensors, automation nodes, and structural monitoring equipment.",
      image: "/products/category-tech.jpg",
      sortOrder: 3,
    },
  });

  console.log(
    `   ✓ Created: ${fireSuppression.name}, ${safetyGear.name}, ${industrialTech.name}`
  );

  // ── 2. Quantity Pricing Tiers ─────────────────────────────────────────────
  console.log("\n💰 Creating quantity pricing tiers...");

  // Same tiers are used by the product page, cart, instant quotation and checkout.
  const tierDefinitions = [
    { id: "tier-retail", name: "1–9 PCS",        minQty: 1,    maxQty: 9,    isRetail: true },
    { id: "tier-10",     name: "10–49 PCS",      minQty: 10,   maxQty: 49,   isRetail: false },
    { id: "tier-50",     name: "50–99 PCS",      minQty: 50,   maxQty: 99,   isRetail: false },
    { id: "tier-100",    name: "100–499 PCS",     minQty: 100,  maxQty: 499,  isRetail: false },
    { id: "tier-500",    name: "500+ PCS",       minQty: 500,  maxQty: null, isRetail: false },
  ];

  const tiers = await Promise.all(
    tierDefinitions.map((t, i) =>
      prisma.pricingTier.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          minQty: t.minQty,
          maxQty: t.maxQty,
          isRetail: t.isRetail,
          sortOrder: i + 1,
        },
        create: { ...t, sortOrder: i + 1 },
      })
    )
  );

  console.log(`   ✓ Created ${tiers.length} pricing tiers`);

  // ── 3. Product — Heat Aerosol Fire Extinguishing Device ───────────────────
  console.log("\n📦 Creating product: Heat Aerosol Fire Extinguishing Device...");

  const product = await prisma.product.upsert({
    where: { slug: "heat-aerosol-fire-extinguishing-device" },
    update: {},
    create: {
      name: "Heat Aerosol Fire Extinguishing Device",
      slug: "heat-aerosol-fire-extinguishing-device",
      categoryId: fireSuppression.id,
      shortDesc:
        "Automatic DIN Rail / Adhesive mount aerosol fire suppressor. Activates at open flame or 170°C. Colorless, odorless, clean discharge. 10-year service life.",
      description: `
The Heat Aerosol Fire Extinguishing Device is a compact, automatic fire suppressor
designed for electrical panels, MCB boxes, control panels, battery cabinets, server
enclosures, and vehicle engine bays.

No human intervention required — the device activates automatically when it detects
an open flame or when ambient temperature reaches 170°C.

The discharged aerosol is colorless, odorless, clean, and harmless to electronics
and people — leaving zero residue after discharge.

Two mounting options:
- DIN Rail Mounting (snap directly onto standard DIN rail)
- 3M Adhesive Mounting (clean, peel, press — adheres to any flat surface)

Where it can be used:
✅ Electrical panels & MCB distribution boards
✅ Switchgear & control panels
✅ Battery cabinets & UPS rooms
✅ Server racks & equipment enclosures
✅ Generator set panels
✅ Vehicle engine bays & industrial machinery
✅ Solar inverter cabinets
      `.trim(),
      specs: {
        model_qrr: {
          label: "Model (Adhesive/DIN)",
          value: "QRR0.01G/S",
        },
        model_qrro: {
          label: "Model (DIN Rail)",
          value: "QRRO-10",
        },
        operating_temp: {
          label: "Operating Temperature Range",
          value: "-50°C to +90°C",
        },
        service_life: {
          label: "Service Life",
          value: "10 years",
        },
        extinguishing_density: {
          label: "Extinguishing Density",
          value: "100 g/m³",
        },
        protection_space: {
          label: "Protection Space (QRRO-10)",
          value: "0.1 m³ / Volume ≥60 g/m³",
        },
        surface_temp_casing: {
          label: "Surface Temperature of Casing",
          value: "≤200°C",
        },
        thermal_clearance: {
          label: "Thermal Clearance",
          value: "0.3m ≤75°C | 0.12m ≤200°C | 0.05m ≤400°C",
        },
        oxidizer_content: {
          label: "Oxidizer & Content",
          value: "Sr(NO₂)₂ 60% / KNO₃ 20%",
        },
        activation_trigger: {
          label: "Activation Trigger",
          value: "Open flame or 170°C ambient temperature",
        },
        discharge_type: {
          label: "Discharge",
          value: "Colorless, Odorless, Clean, Harmless — Zero residue",
        },
        mounting: {
          label: "Mounting Options",
          value: "DIN Rail Mounting / 3M Adhesive Mounting",
        },
        dimensions_width: {
          label: "Width (DIN body)",
          value: '3.03 in (77mm)',
        },
        dimensions_depth: {
          label: "Depth (DIN body)",
          value: '1.46 in (37mm)',
        },
        nozzle_height: {
          label: "Spray Nozzle Height",
          value: '2.44 in (62mm)',
        },
        nozzle_width: {
          label: "Spray Nozzle Width",
          value: '0.75 in (19mm)',
        },
        wire_length: {
          label: "Wire Length",
          value: '5.12 in (130mm)',
        },
        mfg_date: {
          label: "Manufacturing Date",
          value: "2026/04",
        },
        relative_humidity: {
          label: "Relative Humidity",
          value: "≤95%",
        },
      },
      hsnCode: "8424",
      weightGrams: 280,
      images: [
        "/images/products/heat-aerosol-1.jpg",
        "/images/products/heat-aerosol-2.jpg",
        "/images/products/heat-aerosol-3.jpg",
        "/images/products/heat-aerosol-4.jpg",
      ],
      datasheetUrl: null,
      videoUrl: null,
      whatsappMsg: "Hi, I'm interested in the Heat Aerosol Fire Extinguishing Device. Can you give me more details?",
      isActive: true,
      isFeatured: true,
      stockStatus: "in_stock",
      metaTitle: "Heat Aerosol Fire Extinguishing Device | DigitalWorld Industrial",
      metaDescription:
        "Automatic aerosol fire suppressor for electrical panels, MCB boxes, server enclosures. DIN Rail & 3M Adhesive mounting. 10-year life. Buy wholesale from DigitalWorld.",
    },
  });

  console.log(`   ✓ Created product: ${product.name}`);

  // ── 4. Product Prices (OFFICIAL pricing) ────────────────────────────────────
  console.log("\n💲 Creating product prices...");

  const pricingData = [
    { tierId: "tier-retail", pricePerUnit: 300 },  // 1–9 PCS: ₹300
    { tierId: "tier-10",     pricePerUnit: 275 },  // 10–49 PCS: ₹275
    { tierId: "tier-50",     pricePerUnit: 225 },  // 50–99 PCS: ₹225
    { tierId: "tier-100",    pricePerUnit: 200 },  // 100–499 PCS: ₹200
    { tierId: "tier-500",    pricePerUnit: 165 },  // 500+ PCS: ₹165
  ];

  for (const { tierId, pricePerUnit } of pricingData) {
    await prisma.productPrice.upsert({
      where: {
        productId_tierId: { productId: product.id, tierId },
      },
      update: { pricePerUnit },
      create: { productId: product.id, tierId, pricePerUnit },
    });
  }

  await prisma.productPrice.deleteMany({
    where: {
      productId: product.id,
      tierId: { in: ["tier-1000", "tier-5000"] },
    },
  });

  console.log(`   ✓ Created ${pricingData.length} price rows`);

  // ── 5. Shipping Rule ──────────────────────────────────────────────────────
  console.log("\n🚚 Creating shipping rule...");

  await prisma.shippingRule.upsert({
    where: { id: "default-shipping" },
    update: {},
    create: {
      id: "default-shipping",
      ratePerKg: 150,          // ₹150/kg — LOCKED
      minCharge: 80,           // ₹80 minimum
      freeThresholdValue: 5000, // Free shipping for B2C orders ≥ ₹5000
      gstRate: 0.18,           // 18% GST on shipping
      notes: "Default India-wide shipping rate. Admin can override per order.",
      isActive: true,
    },
  });

  console.log("   ✓ Created shipping rule: ₹150/kg, ₹80 min, free ≥₹5000");

  // ── 6. Admin User ─────────────────────────────────────────────────────────
  console.log("\n👤 Creating admin user...");

  const adminPassword = "Admin@DigitalWorld2024!"; // TODO: Change in production!
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@digitalworld.com" },
    update: {},
    create: {
      name: "DigitalWorld Admin",
      email: "admin@digitalworld.com",
      passwordHash,
      role: "admin",
      adminSubRole: "SUPER_ADMIN",
    },
  });

  console.log("   ✓ Admin user created");
  console.log("   📧 Email: admin@digitalworld.com");
  console.log("   🔑 Password: Admin@DigitalWorld2024!");
  console.log("   ⚠️  CHANGE PASSWORD BEFORE PRODUCTION DEPLOYMENT!\n");

  console.log("✅ Database seeded successfully!\n");
  console.log("=".repeat(50));
  console.log("TODO items remaining:");
  console.log("  1. Confirm HSN code 8424 with your CA");
  console.log("  2. Add GSTIN to .env.local");
  console.log("  3. Add registered state to .env.local");
  console.log("  4. Set actual product weight in grams");
  console.log("  5. Upload product images to /public/products/fire-suppressor/");
  console.log("  6. Upload datasheet PDF");
  console.log("  7. Add WhatsApp number to .env.local");
  console.log("=".repeat(50));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

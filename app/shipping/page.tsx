import { Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <Truck size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Shipping Policy</h1>
          <p className="mt-2 text-body-technical text-slate-gray">Last updated: August 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="page-container max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-body-technical text-tertiary hover:underline mb-8">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="bento-card p-8 md:p-12 flex flex-col gap-6 text-body-technical text-on-surface-variant leading-relaxed">
            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">1. Shipping Coverage</h2>
              <p>
                DigitalWorld Industrial ships to all serviceable pin codes across India via our
                courier partners. We currently do not offer international shipping. Delivery
                availability to remote or restricted areas may be subject to additional transit
                time and charges.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">2. Shipping Charges</h2>
              <p>Shipping charges are calculated based on the following factors:</p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>Combined weight of items in your order</li>
                <li>Delivery pin code and zone (local, zonal, or national)</li>
                <li>Order value (free shipping may apply for orders above a threshold, as displayed at checkout)</li>
              </ul>
              <p className="mt-3">
                Exact shipping charges are displayed at checkout before you confirm your order.
                For wholesale (B2B) orders, shipping charges are included in the quotation.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">3. Processing Time</h2>
              <p>
                Orders are typically processed within 1–2 business days after payment confirmation.
                Orders placed on weekends or public holidays will be processed on the next business
                day. During high-demand periods, processing may take up to 3 business days.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">4. Delivery Timelines</h2>
              <p>Estimated delivery timelines after dispatch:</p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li><strong>Metro cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune):</strong> 2–4 business days</li>
                <li><strong>Tier-1 cities:</strong> 3–5 business days</li>
                <li><strong>Tier-2 and Tier-3 cities:</strong> 5–7 business days</li>
                <li><strong>Remote / rural areas:</strong> 7–10 business days</li>
              </ul>
              <p className="mt-3">
                These timelines are estimates and not guaranteed. Actual delivery times may vary
                due to courier delays, weather conditions, or unforeseen circumstances.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">5. Order Tracking</h2>
              <p>
                Once your order is dispatched, you will receive an email and/or SMS with the
                tracking number and courier partner details. You can track your shipment using
                the courier partner&apos;s website or app. You can also view order status from
                your{" "}
                <Link href="/account/orders" className="text-tertiary hover:underline">
                  account dashboard
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">6. Delivery Confirmation</h2>
              <p>
                All shipments require proof of delivery. The courier partner will obtain a
                delivery confirmation (signature, OTP, or photo proof) at the time of delivery.
                If you are unavailable at the time of delivery, the courier may attempt
                re-delivery or leave the package at a nearby collection point as per the
                courier partner&apos;s policy.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">7. Damaged or Missing Items</h2>
              <p>
                Please inspect your package upon delivery. If the package appears damaged or
                tampered with, do not accept it and contact us immediately. If you receive a
                damaged or incorrect item, report it within 48 hours of delivery by contacting
                our support team with your order number and photos of the damage.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">8. Wholesale / B2B Shipments</h2>
              <p>
                Wholesale orders may be shipped via freight carriers for bulk quantities.
                Shipping terms (FOB, CIF, or delivered) are specified in the individual
                quotation. Large or heavy shipments may require special handling and will
                be coordinated with your designated receiving personnel.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">9. Contact</h2>
              <p>
                For shipping-related queries, please contact us at{" "}
                <span className="text-tertiary">
                  {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "digitalworld9890@gmail.com"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

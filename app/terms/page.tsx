import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <FileText size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Terms of Service</h1>
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
              <h2 className="font-headline-sm text-on-surface mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the DigitalWorld Industrial website (digitalworldindustrial.com)
                and its associated services, you agree to be bound by these Terms of Service. If you
                do not agree to these terms, please do not use our website or services.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">2. Products and Services</h2>
              <p>
                DigitalWorld Industrial distributes heat aerosol fire suppression devices and related
                safety equipment. All product descriptions, specifications, images, and pricing on
                this website are for informational purposes. We reserve the right to modify product
                specifications, pricing, and availability without prior notice.
              </p>
              <p className="mt-3">
                Product images are for illustration only and may differ from the actual product.
                Technical specifications are provided by the manufacturer and are subject to change.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">3. Pricing and Payment</h2>
              <p>
                All prices displayed on this website are in Indian Rupees (INR) and are inclusive of
                applicable GST unless otherwise stated. Shipping charges are calculated at checkout
                based on weight, dimensions, and delivery location.
              </p>
              <p className="mt-3">
                We accept payments via UPI, credit/debit cards, netbanking, and other methods
                facilitated by our payment gateway partner (Razorpay). Payment is required in full
                before order processing and dispatch.
              </p>
              <p className="mt-3">
                Wholesale/B2B pricing is available only to approved wholesale account holders and
                is subject to tier-based volume discounts as outlined in the applicable quotation.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">4. Orders and Acceptance</h2>
              <p>
                Placing an order on our website constitutes an offer to purchase the selected
                products. An order is not accepted until we send you an order confirmation email.
                We reserve the right to refuse or cancel any order for any reason, including
                product unavailability, pricing errors, or suspected fraudulent activity.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">5. Wholesale Accounts (B2B)</h2>
              <p>
                Wholesale accounts are subject to approval by DigitalWorld Industrial. Approval
                criteria include valid GSTIN, business type, and expected order volume. Approved
                wholesale accounts receive tier-based pricing, GST invoicing, and priority support.
              </p>
              <p className="mt-3">
                Wholesale account holders are responsible for maintaining accurate business
                information. DigitalWorld Industrial reserves the right to revoke wholesale
                privileges if business information is found to be inaccurate or if account
                activity violates these terms.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">6. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, product
                descriptions, and software, is the property of DigitalWorld Industrial or its
                content suppliers and is protected by Indian copyright and trademark laws.
                You may not reproduce, distribute, or create derivative works without our
                express written permission.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">7. Limitation of Liability</h2>
              <p>
                DigitalWorld Industrial shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising from your use of our website or products.
                Our total liability shall not exceed the amount paid by you for the specific product
                giving rise to the claim.
              </p>
              <p className="mt-3">
                Fire suppression devices are critical safety equipment. Installation must be carried
                out by qualified professionals in accordance with the product datasheet and applicable
                fire safety regulations. DigitalWorld Industrial is not liable for damages resulting
                from improper installation, misuse, or unauthorized modification of products.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">8. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws
                of India. Any disputes arising from these terms shall be subject to the exclusive
                jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to update these Terms of Service at any time. Changes will
                be posted on this page with an updated revision date. Continued use of the website
                after changes constitutes acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">10. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at{" "}
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

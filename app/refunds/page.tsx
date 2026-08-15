import { RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RefundsPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <RotateCcw size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Refunds & Cancellations</h1>
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
              <h2 className="font-headline-sm text-on-surface mb-3">1. Order Cancellation</h2>
              <p>
                You may cancel your order within 2 hours of placing it, provided it has not
                already been dispatched. To cancel, contact our support team with your order
                number. Once an order has been dispatched, it cannot be cancelled and will need
                to follow the return process instead.
              </p>
              <p className="mt-3">
                Wholesale (B2B) orders may be subject to different cancellation terms as specified
                in the individual quotation or purchase agreement.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">2. Returns</h2>
              <p>
                We accept returns within 7 days of delivery under the following conditions:
              </p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>The product is unused, undamaged, and in its original packaging</li>
                <li>All labels, tags, and accessories are intact</li>
                <li>The return request is initiated within 7 days of delivery</li>
              </ul>
              <p className="mt-3">
                <strong>The following items are not eligible for return:</strong>
              </p>
              <ul className="mt-2 ml-6 list-disc flex flex-col gap-1">
                <li>Products that have been installed, activated, or used in any way</li>
                <li>Products with removed or damaged original packaging</li>
                <li>Custom-configured or special-order items</li>
                <li>Products damaged due to misuse, negligence, or unauthorized modification</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">3. Return Process</h2>
              <p>To initiate a return:</p>
              <ul className="mt-3 ml-6 list-decimal flex flex-col gap-1">
                <li>Contact our support team at{" "}
                  <span className="text-tertiary">
                    {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "digitalworld9890@gmail.com"}
                  </span>{" "}
                  with your order number and reason for return
                </li>
                <li>Our team will review your request and provide a Return Merchandise Authorization (RMA) number if approved</li>
                <li>Pack the product securely in its original packaging and include the RMA number on the outside of the package</li>
                <li>Ship the product to the address provided by our support team</li>
                <li>Once we receive and inspect the returned product, your refund will be processed</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">4. Refunds</h2>
              <p>
                Refunds are processed within 5–7 business days after we receive and inspect the
                returned product. Refunds are issued to the original payment method:
              </p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li><strong>Credit/Debit Card:</strong> Refund credited to card within 7–10 business days</li>
                <li><strong>UPI:</strong> Refund credited within 3–5 business days</li>
                <li><strong>Netbanking:</strong> Refund credited within 5–7 business days</li>
              </ul>
              <p className="mt-3">
                Shipping charges are non-refundable unless the return is due to a defective or
                incorrect product sent by DigitalWorld Industrial.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">5. Damaged or Defective Products</h2>
              <p>
                If you receive a damaged or defective product, contact us within 48 hours of
                delivery with your order number and photographs of the damage. We will arrange
                for a replacement or full refund at no additional cost to you. Do not attempt to
                install or use a damaged product.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">6. Incorrect Products</h2>
              <p>
                If you receive a product that does not match your order, please contact us
                within 48 hours. We will arrange for the correct product to be sent and the
                incorrect item to be collected at no cost to you.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">7. Wholesale / B2B Returns</h2>
              <p>
                Wholesale returns are handled on a case-by-case basis. Bulk orders may have
                different return terms as specified in the purchase agreement. Defective products
                in wholesale orders are eligible for replacement or credit as per the warranty
                terms applicable to the product.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">8. Cancellation by DigitalWorld</h2>
              <p>
                We reserve the right to cancel an order if:
              </p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>The product is out of stock or discontinued</li>
                <li>A pricing or listing error is identified</li>
                <li>We suspect fraudulent activity</li>
                <li>The order cannot be fulfilled due to logistical constraints</li>
              </ul>
              <p className="mt-3">
                In such cases, a full refund will be issued to your original payment method.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">9. Contact</h2>
              <p>
                For refund, return, or cancellation queries, please contact us at{" "}
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

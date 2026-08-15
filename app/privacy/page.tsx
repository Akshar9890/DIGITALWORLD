import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <Shield size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              Legal
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Privacy Policy</h1>
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
              <h2 className="font-headline-sm text-on-surface mb-3">1. Information We Collect</h2>
              <p>
                When you use the DigitalWorld Industrial website, we may collect the following
                types of personal information:
              </p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>Name, email address, and phone number when you create an account or place an order</li>
                <li>Billing and shipping addresses for order fulfillment</li>
                <li>Company name and GSTIN for wholesale (B2B) accounts</li>
                <li>Payment information (processed securely through our payment gateway; we do not store card details)</li>
                <li>Device and browser information for website analytics and security</li>
                <li>Communication records when you contact our support team</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">2. How We Use Your Information</h2>
              <p>We use your personal information for the following purposes:</p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>Processing and fulfilling your orders, including payment processing and shipping</li>
                <li>Creating and managing your account (retail or wholesale)</li>
                <li>Communicating order status, quotations, and support responses</li>
                <li>Evaluating wholesale (B2B) account applications</li>
                <li>Generating GST-compliant invoices for your orders</li>
                <li>Improving our website, products, and services</li>
                <li>Sending promotional communications (only with your consent; you may unsubscribe at any time)</li>
                <li>Detecting and preventing fraud or unauthorized access</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">3. Information Sharing</h2>
              <p>
                We do not sell your personal information to third parties. We may share your
                information with:
              </p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>
                  <strong>Payment processors</strong> (Razorpay) — to securely process your transactions
                </li>
                <li>
                  <strong>Shipping partners</strong> — to deliver your orders (name, address, phone number)
                </li>
                <li>
                  <strong>Cloud service providers</strong> — for website hosting and data storage
                </li>
                <li>
                  <strong>Analytics providers</strong> — to understand website usage patterns (anonymized data)
                </li>
                <li>
                  <strong>Law enforcement</strong> — when required by applicable Indian law or legal process
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal
                information, including SSL encryption for data in transit, encrypted password
                storage (bcrypt), and access controls on our internal systems. However, no
                method of electronic transmission or storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">5. Cookies and Tracking</h2>
              <p>
                Our website uses essential cookies for session management and authentication.
                We also use analytics cookies to understand how visitors interact with our
                website. You can control cookie preferences through your browser settings.
                Essential cookies are required for the website to function properly.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or
                as needed to provide you services. Order and invoice data is retained for a
                minimum of 7 years as required by Indian tax and accounting regulations. You
                may request deletion of your account data by contacting us.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">7. Your Rights</h2>
              <p>Under applicable Indian data protection laws, you have the right to:</p>
              <ul className="mt-3 ml-6 list-disc flex flex-col gap-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal data (subject to legal retention requirements)</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Withdraw consent for data processing where applicable</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible
                for the privacy practices or content of these external sites. We encourage
                you to review the privacy policies of any third-party websites you visit.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">9. Children&apos;s Privacy</h2>
              <p>
                Our website is not intended for use by individuals under the age of 18. We do
                not knowingly collect personal information from children. If we become aware
                that we have collected data from a child, we will take steps to delete it
                promptly.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted
                on this page with an updated revision date. We encourage you to review this
                policy periodically.
              </p>
            </div>

            <div>
              <h2 className="font-headline-sm text-on-surface mb-3">11. Contact Us</h2>
              <p>
                For questions about this Privacy Policy or to exercise your data rights,
                please contact us at{" "}
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

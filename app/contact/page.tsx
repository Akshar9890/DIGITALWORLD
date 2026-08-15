"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number").optional().or(z.literal("")),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to send message");
      }

      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 industrial-grid opacity-30" />

      {/* Hero */}
      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-container/30 bg-primary-container/10 px-3 py-1 mb-6">
            <Mail size={14} className="text-primary-container" />
            <span className="font-label-caps text-[10px] tracking-widest text-primary-container uppercase">
              Get In Touch
            </span>
          </div>
          <h1 className="font-headline-lg text-on-surface mb-4">Contact Us</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Have a question about our products, need a custom quotation, or want to discuss a
            bulk deployment? Our team is ready to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="page-container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bento-card p-6">
                <h3 className="font-headline-sm text-on-surface mb-6">Contact Information</h3>
                <ul className="flex flex-col gap-5">
                  <li className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary-container">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-body-technical font-bold text-on-surface">Office Address</p>
                      <p className="text-body-technical text-slate-gray mt-1">
                        {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "Mumbai, Maharashtra, India"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary-container">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-body-technical font-bold text-on-surface">Phone</p>
                      <p className="text-body-technical text-slate-gray mt-1">
                        {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91 70436 33303"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/15 text-primary-container">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-body-technical font-bold text-on-surface">Email</p>
                      <p className="text-body-technical text-slate-gray mt-1">
                        {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "digitalworld9890@gmail.com"}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bento-card p-6">
                <h3 className="font-headline-sm text-on-surface mb-3">Business Hours</h3>
                <ul className="flex flex-col gap-2 text-body-technical text-on-surface-variant">
                  <li className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="text-on-surface">9:00 AM – 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-on-surface">10:00 AM – 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-slate-gray">Closed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-8 bento-card p-8">
              <h3 className="font-headline-sm text-on-surface mb-6">Send Us a Message</h3>

              {isSuccess ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success/20">
                    <CheckCircle2 size={32} className="text-status-success" />
                  </div>
                  <h4 className="font-headline-sm text-on-surface">Message Sent Successfully</h4>
                  <p className="text-body-technical text-slate-gray max-w-md">
                    Thank you for reaching out. Our team will review your message and respond within
                    1-2 business days.
                  </p>
                  <Button variant="secondary" onClick={() => setIsSuccess(false)}>
                    SEND ANOTHER MESSAGE
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">Full Name</label>
                      <input
                        {...register("name")}
                        className={`input-field ${errors.name ? "border-status-error" : ""}`}
                        placeholder="Your name"
                      />
                      {errors.name && <span className="input-error">{errors.name.message}</span>}
                    </div>
                    <div>
                      <label className="input-label">Email Address</label>
                      <input
                        {...register("email")}
                        type="email"
                        className={`input-field ${errors.email ? "border-status-error" : ""}`}
                        placeholder="you@company.com"
                      />
                      {errors.email && <span className="input-error">{errors.email.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="input-label">Phone (Optional)</label>
                      <input
                        {...register("phone")}
                        className={`input-field ${errors.phone ? "border-status-error" : ""}`}
                        placeholder="+91 70436 33303"
                      />
                      {errors.phone && <span className="input-error">{errors.phone.message}</span>}
                    </div>
                    <div>
                      <label className="input-label">Subject</label>
                      <select
                        {...register("subject")}
                        className={`input-field bg-surface-container ${errors.subject ? "border-status-error" : ""}`}
                      >
                        <option value="">Select a topic...</option>
                        <option value="product_enquiry">Product Enquiry</option>
                        <option value="bulk_order">Bulk / Wholesale Order</option>
                        <option value="technical_support">Technical Support</option>
                        <option value="partnership">Business Partnership</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.subject && <span className="input-error">{errors.subject.message}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Message</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      className={`input-field resize-none ${errors.message ? "border-status-error" : ""}`}
                      placeholder="Tell us about your requirements..."
                    />
                    {errors.message && <span className="input-error">{errors.message.message}</span>}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-control bg-error-container/20 border border-status-error/30 px-4 py-3 text-sm text-status-error">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full md:w-auto" isLoading={isSubmitting}>
                    <Send size={16} /> SEND MESSAGE
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

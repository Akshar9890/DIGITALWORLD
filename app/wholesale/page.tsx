"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Shield, Building, FileText, CheckCircle2, User, Phone, Mail } from "lucide-react";
import { isValidGSTIN, isValidPincode, isValidPhone } from "@/lib/utils";

const wholesaleSchema = z.object({
  companyName: z.string().min(2, "Company Name is required"),
  contactName: z.string().min(2, "Contact Person Name is required"),
  contactEmail: z.string().email("Valid Contact Email ID is required"),
  contactPhone: z.string().refine((val) => isValidPhone(val), "Enter a valid 10-digit mobile phone number"),
  gstin: z
    .string()
    .min(15, "GSTIN must be 15 characters")
    .max(15, "GSTIN must be 15 characters")
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => isValidGSTIN(val), {
      message: "Invalid GSTIN. Format: 24AEHPT8655H1Z0 (2-digit state code + PAN + 1 check digit)",
    }),
  businessType: z.string().min(1, "Select a business type"),
  expectedVolume: z.string().min(1, "Select expected volume"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().refine((val) => isValidPincode(val), "Enter a valid 6-digit pincode (e.g. 390021)"),
});

type WholesaleForm = z.infer<typeof wholesaleSchema>;

export default function WholesalePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WholesaleForm>({
    resolver: zodResolver(wholesaleSchema),
  });

  // Pre-fill fields from logged-in session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setValue("contactName", session.user.name);
      if (session.user.email) setValue("contactEmail", session.user.email);
    }
  }, [session, setValue]);

  const onSubmit = async (data: WholesaleForm) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/wholesale/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "An error occurred during submission.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setSubmitError("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="page-container py-20 flex justify-center">
        <div className="h-10 w-10 animate-spin border-4 border-tertiary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If already applied/pending
  if (session?.user?.role === "wholesale_pending") {
    return (
      <div className="page-container py-20 max-w-2xl mx-auto text-center">
        <div className="bento-card p-12 flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-tertiary/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-tertiary" />
          </div>
          <h1 className="font-headline-md text-white">Application Received</h1>
          <p className="text-body-lg text-on-surface-variant">
            Your wholesale application is currently under review by our team. We will notify you via email once approved.
          </p>
          <Link href="/catalog">
            <Button>BROWSE CATALOG</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If already approved
  if (session?.user?.role === "wholesale_approved") {
    return (
      <div className="page-container py-20 max-w-2xl mx-auto text-center">
        <div className="bento-card p-12 flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-status-success/20 flex items-center justify-center">
            <Shield size={32} className="text-status-success" />
          </div>
          <h1 className="font-headline-md text-white">Welcome Partner</h1>
          <p className="text-body-lg text-on-surface-variant">
            Your wholesale account is active. You have access to exclusive bulk pricing.
          </p>
          <div className="flex gap-4">
            <Link href="/catalog">
              <Button>ORDER NOW</Button>
            </Link>
            <Link href="/account/quotes">
              <Button variant="secondary">MY QUOTES</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="page-container py-20 max-w-2xl mx-auto text-center">
        <div className="bento-card p-12 flex flex-col items-center gap-6 animate-fade-in-up">
          <div className="h-16 w-16 rounded-full bg-status-success/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-status-success" />
          </div>
          <h1 className="font-headline-md text-white">Application Submitted Successfully</h1>
          <p className="text-body-lg text-on-surface-variant">
            Thank you for applying to become a DigitalWorld wholesale partner. Our team will review your business details, contact email, phone number, and GSTIN shortly.
          </p>
          <Link href="/catalog">
            <Button>BROWSE CATALOG</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <section className="bg-surface-charcoal border-b border-outline-variant/20 pt-20 pb-12">
        <div className="page-container max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 w-max mb-6">
            <Shield size={14} className="text-tertiary" />
            <span className="font-label-caps text-[10px] tracking-widest text-tertiary uppercase">
              B2B Partner Program
            </span>
          </div>
          <h1 className="font-headline-lg text-white mb-4">Apply for a Wholesale Account</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Get exclusive access to multi-tier volume pricing, dedicated support, and automated PDF quotations for large-scale industrial projects.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 page-container max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Benefits sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bento-card p-6 border-tertiary/20 bg-surface-container-low/50">
              <h3 className="font-headline-sm text-tertiary mb-6 flex items-center gap-2">
                <Building size={20} /> Partner Benefits
              </h3>
              
              <ul className="flex flex-col gap-6">
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-tertiary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-tertiary">1</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-sm text-white mb-1">Volume Tier Pricing</h4>
                    <p className="text-body-technical text-slate-gray">Access up to 50% discounts based on order quantity. Pricing tiers are strictly locked for partners.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-tertiary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-tertiary">2</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-sm text-white mb-1">Automated PDF Quotes</h4>
                    <p className="text-body-technical text-slate-gray">Generate instant formal quotations with shipping estimates and GST calculations to present to your clients.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-tertiary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="font-bold text-tertiary">3</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-sm text-white mb-1">Priority Fulfillment</h4>
                    <p className="text-body-technical text-slate-gray">Wholesale orders are prioritized in our warehouse queue and dispatched via premium freight partners.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {!session && (
              <div className="bento-card p-6 border-primary-container/20">
                <h4 className="font-headline-sm text-sm text-white mb-2">Already have an account?</h4>
                <p className="text-body-technical text-slate-gray mb-4">Sign in to check your application status or access partner pricing.</p>
                <Link href="/login?callbackUrl=/wholesale">
                  <Button variant="secondary" className="w-full">SIGN IN</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="lg:col-span-8 bento-card p-8 md:p-12">
            <div className="mb-8 border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline-md text-white flex items-center gap-2">
                <FileText size={24} className="text-tertiary" /> Business Details
              </h2>
              <p className="text-body-technical text-slate-gray mt-2">
                All fields are required. Enter your official contact email ID and phone number so our admin team can reach you.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              
              {/* Contact Information Inputs (ALWAYS VISIBLE & REQUIRED) */}
              <div className="p-5 rounded-xl bg-surface-container border border-tertiary/20 flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase text-tertiary flex items-center gap-2">
                  <User size={16} /> Applicant Contact Information (Required for Admin Data)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Contact Person Name *</label>
                    <input
                      {...register("contactName")}
                      className={`input-field text-sm ${errors.contactName ? 'border-status-error' : ''}`}
                      placeholder="e.g. Rahul Sharma"
                    />
                    {errors.contactName && <span className="input-error">{errors.contactName.message}</span>}
                  </div>

                  <div>
                    <label className="input-label">Contact Email ID *</label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("contactEmail")}
                        className={`input-field text-sm pl-9 ${errors.contactEmail ? 'border-status-error' : ''}`}
                        placeholder="email@example.com"
                      />
                      <Mail size={16} className="absolute left-3 top-3 text-slate-gray" />
                    </div>
                    {errors.contactEmail && <span className="input-error">{errors.contactEmail.message}</span>}
                  </div>

                  <div>
                    <label className="input-label">Contact Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("contactPhone")}
                        className={`input-field text-sm pl-9 ${errors.contactPhone ? 'border-status-error' : ''}`}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      <Phone size={16} className="absolute left-3 top-3 text-slate-gray" />
                    </div>
                    {errors.contactPhone && <span className="input-error">{errors.contactPhone.message}</span>}
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Company Name *</label>
                  <input 
                    {...register("companyName")}
                    className={`input-field ${errors.companyName ? 'border-status-error' : ''}`}
                    placeholder="Enter legal business name"
                  />
                  {errors.companyName && <span className="input-error">{errors.companyName.message}</span>}
                </div>

                <div>
                  <label className="input-label">GSTIN *</label>
                  <input 
                    {...register("gstin")}
                    onChange={(e) => setValue("gstin", e.target.value.toUpperCase())}
                    className={`input-field uppercase ${errors.gstin ? 'border-status-error' : ''}`}
                    placeholder="e.g. 24AEHPT8655H1Z0"
                    maxLength={15}
                  />
                  {errors.gstin && <span className="input-error">{errors.gstin.message}</span>}
                  {!errors.gstin && (
                    <p className="text-xs text-slate-gray mt-1">15-character Goods & Services Tax Identification Number</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">Business Type *</label>
                  <select 
                    {...register("businessType")}
                    className={`input-field bg-surface-container ${errors.businessType ? 'border-status-error' : ''}`}
                  >
                    <option value="">Select type...</option>
                    <option value="distributor">Distributor / Wholesaler</option>
                    <option value="contractor">Electrical/Fire Contractor</option>
                    <option value="facility_manager">Facility Management</option>
                    <option value="end_user">Industrial End-User</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && <span className="input-error">{errors.businessType.message}</span>}
                </div>

                <div>
                  <label className="input-label">Expected Volume (Annual) *</label>
                  <select 
                    {...register("expectedVolume")}
                    className={`input-field bg-surface-container ${errors.expectedVolume ? 'border-status-error' : ''}`}
                  >
                    <option value="">Select volume...</option>
                    <option value="10-49">10 - 49 units</option>
                    <option value="50-99">50 - 99 units</option>
                    <option value="100-499">100 - 499 units</option>
                    <option value="500-999">500 - 999 units</option>
                    <option value="1000+">1,000+ units</option>
                  </select>
                  {errors.expectedVolume && <span className="input-error">{errors.expectedVolume.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="input-label">City *</label>
                  <input 
                    {...register("city")}
                    className={`input-field ${errors.city ? 'border-status-error' : ''}`}
                    placeholder="e.g. Vadodara"
                  />
                  {errors.city && <span className="input-error">{errors.city.message}</span>}
                </div>
                
                <div className="md:col-span-1">
                  <label className="input-label">State *</label>
                  <input 
                    {...register("state")}
                    className={`input-field ${errors.state ? 'border-status-error' : ''}`}
                    placeholder="e.g. Gujarat"
                  />
                  {errors.state && <span className="input-error">{errors.state.message}</span>}
                </div>

                <div className="md:col-span-1">
                  <label className="input-label">Pincode *</label>
                  <input 
                    {...register("pincode")}
                    maxLength={6}
                    className={`input-field ${errors.pincode ? 'border-status-error' : ''}`}
                    placeholder="390021"
                  />
                  {errors.pincode && <span className="input-error">{errors.pincode.message}</span>}
                </div>
              </div>

              {submitError && (
                <div className="bg-error-container/20 border border-status-error/30 text-status-error px-4 py-3 rounded-control text-sm">
                  ⚠️ {submitError}
                </div>
              )}

              <div className="pt-6 border-t border-outline-variant/20">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-tertiary text-on-tertiary hover:bg-tertiary-fixed font-bold glow-amber shadow-lg shadow-tertiary/20"
                  isLoading={isSubmitting}
                >
                  SUBMIT APPLICATION
                </Button>
                <p className="text-center text-xs text-slate-gray mt-4">
                  By submitting this application, you agree to our B2B Terms of Service.
                </p>
              </div>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}

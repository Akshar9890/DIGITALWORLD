"use client";



import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatINR } from "@/lib/utils";
import { getCourierCharge, getGSTAmount } from "@/lib/shipping";
import { Button } from "@/components/ui/Button";
import { PincodeInput, type PincodeResult } from "@/components/ui/PincodeInput";
import { Shield, CreditCard, Lock, MapPin } from "lucide-react";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit phone required"),
  email: z.string().email("Valid email required"),
  street: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit pincode required"),
  gstin: z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pincode, setPincode] = useState("");

  const { data: cart, isLoading, isFetched } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    staleTime: 0, // always fetch fresh on mount
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      email: session?.user?.email || "",
      fullName: session?.user?.name || "",
    }
  });

  // Auto-fill city + state when pincode resolves
  const handlePincodeResolved = (result: PincodeResult) => {
    setValue("city", result.city, { shouldValidate: true });
    setValue("state", result.state, { shouldValidate: true });
    setValue("pincode", result.pincode, { shouldValidate: true });
  };

  const handlePincodeChange = (val: string) => {
    setPincode(val);
    setValue("pincode", val, { shouldValidate: val.length === 6 });
  };

  // Fetch active admin shipping rules
  const { data: shippingRules } = useQuery({
    queryKey: ["shipping-rules"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-rules");
      if (!res.ok) return undefined;
      return res.json();
    },
  });

  const subtotal = cart?.subtotal || 0;
  const totalQuantity = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 1;
  const totalWeight = cart?.items?.reduce((acc: number, item: any) => acc + (item.product?.weightGrams || 280) * item.quantity, 0) || 280;

  // Courier charge calculated using active admin rates
  const courier = getCourierCharge(totalWeight, totalQuantity, shippingRules);
  const shipping = courier.amount;
  const gstAmount = getGSTAmount(subtotal);
  const total = subtotal + shipping + gstAmount;

  const onCheckout = async (data: AddressForm) => {
    setIsProcessing(true);

    try {
      // 1. Create Razorpay order on server
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: data }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // 2. Load Razorpay checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "DigitalWorld Industrial Safety",
        description: `Order ${orderData.orderNumber}`,
        image: "/logo-icon.png",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          shipping_address: `${data.street}, ${data.city}, ${data.state} - ${data.pincode}`,
        },
        theme: { color: "#B32418" },
        // ── Enable UPI, Card, Netbanking, Wallet ──────────────────────────────
        config: {
          display: {
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
              other: {
                name: "Pay via Card / Netbanking",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.utib", "block.other"],
            preferences: { show_default_blocks: false },
          },
        },

        // ── Handler fires AFTER successful payment ──────────────────────
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 3. Verify signature on server and mark order as captured
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // 4. Redirect to success page
            window.location.href = `/checkout/success?orderId=${verifyData.orderId}`;
          } catch (err) {
            console.error("Payment verify error:", err);
            alert("Payment received but verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isLoading || !isFetched) {
    return (
      <div className="page-container py-20 flex justify-center">
        <div className="h-10 w-10 animate-spin border-4 border-primary-container border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="page-container py-12 md:py-20">
      <h1 className="font-headline-lg text-white mb-8 flex items-center gap-4">
        <Lock size={32} className="text-status-success" /> Secure Checkout
      </h1>

      <form onSubmit={handleSubmit(onCheckout)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Shipping Form */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bento-card p-6 md:p-8">
            <h2 className="font-headline-sm text-white mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-tertiary" /> Shipping Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="input-label">Full Name</label>
                <input {...register("fullName")} className={`input-field ${errors.fullName ? 'border-status-error' : ''}`} />
                {errors.fullName && <span className="input-error">{errors.fullName.message}</span>}
              </div>

              <div>
                <label className="input-label">Email</label>
                <input type="email" {...register("email")} className={`input-field ${errors.email ? 'border-status-error' : ''}`} />
                {errors.email && <span className="input-error">{errors.email.message}</span>}
              </div>
              
              <div>
                <label className="input-label">Phone</label>
                <input {...register("phone")} className={`input-field ${errors.phone ? 'border-status-error' : ''}`} placeholder="10-digit mobile" />
                {errors.phone && <span className="input-error">{errors.phone.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Street Address</label>
                <input {...register("street")} className={`input-field ${errors.street ? 'border-status-error' : ''}`} placeholder="House no, street, area, landmark" />
                {errors.street && <span className="input-error">{errors.street.message}</span>}
              </div>

              {/* Pincode with auto-fill */}
              <div>
                <PincodeInput
                  label="Pincode"
                  required
                  value={pincode}
                  onChange={handlePincodeChange}
                  onResolved={handlePincodeResolved}
                  error={errors.pincode?.message}
                  placeholder="Enter 6-digit pincode"
                />
              </div>

              <div>
                <label className="input-label">City</label>
                <input
                  {...register("city")}
                  className={`input-field ${errors.city ? 'border-status-error' : ''}`}
                  placeholder="Auto-filled from pincode"
                />
                {errors.city && <span className="input-error">{errors.city.message}</span>}
              </div>

              <div>
                <label className="input-label">State</label>
                <input
                  {...register("state")}
                  className={`input-field ${errors.state ? 'border-status-error' : ''}`}
                  placeholder="Auto-filled from pincode"
                />
                {errors.state && <span className="input-error">{errors.state.message}</span>}
              </div>

              <div>
                <label className="input-label">GSTIN (Optional)</label>
                <input {...register("gstin")} placeholder="For B2B input credit" className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bento-card p-6 sticky top-24">
            <h2 className="font-headline-sm text-white mb-6 pb-4 border-b border-outline-variant/20">Order Summary</h2>
            
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
              {cart.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-slate-gray">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm text-white">{formatINR(item.subtotal)}</span>
                </div>
              ))}
            </div>
            
            <hr className="border-outline-variant/20 mb-6" />

            <div className="flex flex-col gap-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-white font-medium">{formatINR(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-white">{formatINR(shipping)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-on-surface-variant">GST (18%)</span>
                <span className="text-white">{formatINR(gstAmount)}</span>
              </div>
            </div>
            
            <hr className="border-outline-variant/20 mb-6" />
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-headline-sm text-white">Total</span>
              <span className="font-headline-lg-mobile text-white">{formatINR(total)}</span>
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full gap-2 font-bold tracking-wide glow-red"
              isLoading={isProcessing}
            >
              <CreditCard size={18} /> PAY {formatINR(total)}
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-gray">
              <Shield size={14} className="text-status-success" />
              100% Secure Payment powered by Razorpay
            </div>
          </div>
        </div>
      </form>
      
      {/* Razorpay Script Loading */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}

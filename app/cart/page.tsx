"use client";



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/lib/utils";
import { getCourierCharge, getGSTAmount } from "@/lib/shipping";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Shield, FileText, CheckCircle2, Truck, LogIn } from "lucide-react";

type CartItemData = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    stockStatus: string;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tierName: string;
};

type CartData = {
  items: CartItemData[];
  subtotal: number;
  totalWeightGrams: number;
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch Cart
  const { data: cart, isLoading } = useQuery<CartData>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
  });

  // Update Item Quantity
  const updateItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    },
  });

  // Remove Item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cart-updated"));
      }
    },
  });

  // Fetch active admin shipping rules
  const { data: shippingRules } = useQuery({
    queryKey: ["shipping-rules"],
    queryFn: async () => {
      const res = await fetch("/api/shipping-rules");
      if (!res.ok) return undefined;
      return res.json();
    },
  });

  const handleUpdateQty = (productId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    updateItemMutation.mutate({ productId, quantity: newQty });
  };

  const handleDirectQuantityUpdate = (productId: string, value: string) => {
    const quantity = Number.parseInt(value, 10);
    if (Number.isFinite(quantity) && quantity >= 1) {
      updateItemMutation.mutate({ productId, quantity });
    }
  };

  const handleRemove = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  if (isLoading) {
    return (
      <div className="page-container py-20 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin border-4 border-primary-container border-t-transparent rounded-full mb-4" />
        <p className="text-slate-gray text-sm">Loading your cart...</p>
      </div>
    );
  }


  const isEmpty = !cart || cart.items.length === 0;

  const totalQuantity = cart?.items.reduce((acc, i) => acc + i.quantity, 0) || 0;
  const gstAmount = cart ? getGSTAmount(cart.subtotal) : 0;
  const courier = cart ? getCourierCharge(cart.totalWeightGrams, totalQuantity, shippingRules) : { amount: 0, isFree: true, isBulk: false };
  const grandTotal = cart ? cart.subtotal + gstAmount + courier.amount : 0;

  return (
    <div className="page-container py-12 md:py-20 min-h-[70vh]">
      <h1 className="font-headline-lg text-white mb-8 flex items-center gap-4">
        <ShoppingCart size={32} className="text-primary-container" /> Your Cart
      </h1>

      {isEmpty ? (
        <div className="bento-card p-12 flex flex-col items-center justify-center text-center gap-6">
          <div className="h-20 w-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <ShoppingCart size={32} className="text-slate-gray" />
          </div>
          <h2 className="font-headline-sm text-white">Your cart is empty</h2>
          <p className="text-body-technical text-on-surface-variant max-w-md">
            Looks like you haven&apos;t added anything to your cart yet. Browse our selection of industrial safety products to get started.
          </p>
          <Link href="/products">
            <Button size="lg" className="mt-4">BROWSE PRODUCTS</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.items.map((item) => {
              const imageSrc = item.product.images[0] || "/images/products/heat-aerosol-1.jpg";
              return (
                <div key={item.id} className="bento-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                  
                  {/* Real Product Image */}
                  <Link href={`/products/${item.product.slug}`} className="shrink-0 relative w-full sm:w-32 aspect-square rounded-xl bg-surface-container-high overflow-hidden border border-outline-variant/30 flex items-center justify-center group">
                    <Image
                      src={imageSrc}
                      alt={item.product.name}
                      width={160}
                      height={160}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-headline-sm text-white hover:text-tertiary transition-colors line-clamp-2 mb-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <span className="inline-block badge-wholesale mb-3">
                          {item.tierName} Pricing
                        </span>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <span className="font-headline-sm text-white block">{formatINR(item.subtotal)}</span>
                        <span className="text-xs text-slate-gray">{formatINR(item.unitPrice)} / unit</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Control */}
                      <div className="flex items-center rounded-control border border-outline-variant/50 bg-surface-container-high overflow-hidden h-11 w-36 shadow-inner shadow-black/20">
                        <button 
                          onClick={() => handleUpdateQty(item.product.id, item.quantity, -1)}
                          disabled={updateItemMutation.isPending}
                          className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          aria-label={`Quantity for ${item.product.name}`}
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={item.quantity}
                          disabled={updateItemMutation.isPending}
                          onChange={(e) => handleDirectQuantityUpdate(item.product.id, e.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          className="h-full min-w-0 flex-1 appearance-none border-x border-outline-variant/40 bg-transparent text-center text-base font-bold tabular-nums text-white outline-none focus:bg-surface-container-highest disabled:opacity-50"
                        />
                        <button 
                          onClick={() => handleUpdateQty(item.product.id, item.quantity, 1)}
                          disabled={updateItemMutation.isPending}
                          className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemove(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-status-error hover:text-error-container p-2 disabled:opacity-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {/* Mobile price display */}
                    <div className="sm:hidden text-right mt-4 pt-4 border-t border-outline-variant/10">
                      <span className="font-headline-sm text-white block">{formatINR(item.subtotal)}</span>
                      <span className="text-xs text-slate-gray">{formatINR(item.unitPrice)} / unit</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Order Summary Side Panel */}
          <div className="lg:col-span-4">
            <div className="bento-card p-6 sticky top-24">
              <h2 className="font-headline-sm text-white mb-6 pb-4 border-b border-outline-variant/20">Order Summary</h2>
              
              <div className="flex flex-col gap-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal ({totalQuantity} pcs)</span>
                  <AnimatedCounter value={cart.subtotal} className="text-white font-medium" />
                </div>
                
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (18%)</span>
                  <AnimatedCounter value={gstAmount} className="text-white" />
                </div>
                
                <div className="flex justify-between items-start gap-2">
                  <span className="text-on-surface-variant">Shipping ({cart.totalWeightGrams / 1000} kg)</span>
                  {courier.isBulk ? (
                    <span className="text-tertiary text-xs font-bold text-right">
                      Bulk Order (Shipping quoted by team)
                    </span>
                  ) : courier.amount > 0 ? (
                    <AnimatedCounter value={courier.amount} className="text-white" />
                  ) : (
                    <span className="text-status-success font-bold">FREE</span>
                  )}
                </div>
              </div>

              {/* Bulk shipping note */}
              {courier.isBulk && (
                <div className="mb-6 p-3 rounded-lg bg-tertiary/10 border border-tertiary/30 text-xs text-tertiary flex items-start gap-2">
                  <Truck size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Bulk order shipping charges (over 50 pcs) will be calculated and quoted directly by our logistics team after order placement.
                  </span>
                </div>
              )}
              
              <hr className="border-outline-variant/20 mb-6" />
              
              <div className="flex justify-between items-end mb-8">
                <span className="font-headline-sm text-white">ESTIMATED TOTAL</span>
                <AnimatedCounter value={grandTotal} className="font-headline-md text-primary-container text-2xl" />
              </div>
              
              <div className="flex flex-col gap-3">
                {session?.user ? (
                  <Link href="/checkout">
                    <Button size="lg" className="w-full gap-2 font-bold tracking-wide shadow-lg shadow-primary-container/20">
                      PROCEED TO CHECKOUT <ArrowRight size={18} />
                    </Button>
                  </Link>
                ) : (
                  <button
                    onClick={() => router.push("/login?callbackUrl=/checkout")}
                    className="btn-primary w-full gap-2 font-bold tracking-wide shadow-lg shadow-primary-container/20 flex items-center justify-center"
                  >
                    <LogIn size={18} /> SIGN IN TO CHECKOUT
                  </button>
                )}
                
                <Link href="/quotation">
                  <Button variant="secondary" className="w-full border-tertiary text-tertiary hover:bg-tertiary/10">
                    GET INSTANT QUOTATION
                  </Button>
                </Link>
              </div>
              
              <p className="text-center text-xs text-slate-gray mt-6 flex items-center justify-center gap-1">
                <Shield size={13} className="text-status-success" /> Secure 18% GST Invoice & SSL Encrypted Checkout
              </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

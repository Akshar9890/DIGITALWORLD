# DigitalWorld — Payments & Checkout Security

DigitalWorld integrates **Razorpay** for payment processing across UPI, Debit/Credit Cards, Netbanking, and Corporate Wallets.

---

## 1. Checkout Sequence

1. **Order Creation:** Client sends cart items to `POST /api/checkout`.
2. **Server-Side Validation:** Server computes subtotal, GST, and shipping using authoritative engines (`resolvePrice`, `computeInvoiceTotals`).
3. **Razorpay Order Creation:** Server invokes `razorpay.orders.create({ amount: grandTotalInPaise })`.
4. **Client Modal:** Razorpay Standard Checkout modal opens on client.
5. **HMAC Verification:** Post-payment, webhook and callback endpoints verify cryptographic signatures before order fulfillment.

---

## 2. Cryptographic HMAC SHA-256 Signature Verification

**Location:** `app/api/payment/verify/route.ts`

To prevent man-in-the-middle tampering, the signature is computed and verified using constant-time comparisons (`crypto.timingSafeEqual`):

```typescript
const generatedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex");

const isAuthentic = crypto.timingSafeEqual(
  Buffer.from(generatedSignature, "utf-8"),
  Buffer.from(razorpay_signature, "utf-8")
);

if (!isAuthentic) {
  throw new Error("Cryptographic Signature Mismatch — Payment Rejected");
}
```

---

## 3. Webhook Handling & Idempotency

**Location:** `app/api/webhooks/payment/razorpay/route.ts`

- Validates `x-razorpay-signature` with `RAZORPAY_WEBHOOK_SECRET`.
- Handles `payment.captured`, `order.paid`, and `payment.failed` events.
- Employs database transactions to guarantee idempotency and avoid duplicate fulfillment.

# DigitalWorld — Multi-Carrier Logistics & Shipping Engine

DigitalWorld features an extensible shipping layer supporting **Shiprocket**, **Delhivery Direct**, and **Manual/Offline Courier Dispatch**.

---

## 1. Multi-Carrier Brokerage & Provider Architecture

**Location:** `lib/shipping/`

```typescript
export class ShippingRegistry {
  private static providers: Map<string, ShippingProvider> = new Map();

  public static register(name: string, provider: ShippingProvider) {
    this.providers.set(name.toLowerCase(), provider);
  }

  public static async getBestRates(
    pickupPincode: string,
    deliveryPincode: string,
    weightGrams: number,
    cod: boolean
  ): Promise<CourierOption[]> {
    const activeProviders = Array.from(this.providers.values());
    const ratePromises = activeProviders.map((p) =>
      p.getRates(pickupPincode, deliveryPincode, weightGrams, cod).catch(() => [])
    );
    const results = await Promise.all(ratePromises);
    return results.flat().sort((a, b) => a.rate - b.rate || a.etdDays - b.etdDays);
  }
}
```

---

## 2. Volumetric Weight Calculation

For carton dimensions $L \times W \times H$ in centimeters and actual weight $W_{\text{actual}}$ in kilograms:

```text
Volumetric Weight (kg) = (Length * Width * Height) / 5000
Chargeable Weight (kg) = MAX(Actual Weight, Volumetric Weight)
```

---

## 3. 19-State Shipment Status Normalization State Machine

```mermaid
stateDiagram-v2
    [*] --> ORDER_PLACED: Checkout Completed
    ORDER_PLACED --> PAYMENT_CONFIRMED: Razorpay Captured
    PAYMENT_CONFIRMED --> PROCESSING: Warehouse Picklist
    PROCESSING --> PACKED: Barcode Scanned
    PACKED --> SHIPMENT_CREATED: AWB Assigned
    SHIPMENT_CREATED --> PICKUP_SCHEDULED: Manifest Generated
    PICKUP_SCHEDULED --> PICKED_UP: Courier Scan
    PICKED_UP --> IN_TRANSIT: Line Haul Transit
    IN_TRANSIT --> REACHED_DESTINATION: Destination Hub Scan
    REACHED_DESTINATION --> OUT_FOR_DELIVERY: Assigned to Courier Agent
    OUT_FOR_DELIVERY --> DELIVERED: OTP / Signature Verified
    DELIVERED --> [*]

    OUT_FOR_DELIVERY --> NDR: Delivery Attempt Failed
    NDR --> OUT_FOR_DELIVERY: Re-attempt Scheduled
    NDR --> RTO_INITIATED: Max Retries Exceeded
    RTO_INITIATED --> RTO_IN_TRANSIT: Reverse Line Haul
    RTO_IN_TRANSIT --> RTO_DELIVERED: Returned to Warehouse
    RTO_DELIVERED --> [*]

    IN_TRANSIT --> DELAYED: Weather/Logistics Delay
    DELAYED --> IN_TRANSIT: Transit Resumed
    IN_TRANSIT --> LOST: Insurance Claim
    IN_TRANSIT --> DAMAGED: Exception Flagged
```

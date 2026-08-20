import { ShippingProvider } from "./provider.interface";
import {
  CourierOption,
  CheckServiceabilityParams,
  CreateShipmentParams,
  ShipmentResult,
  TrackingResponse,
  ShipmentStatus,
} from "./types";

interface PincodeLocation {
  district?: string;
  state?: string;
  isGujarat?: boolean;
  isValid?: boolean;
}

async function lookupPincode(pincode: string): Promise<PincodeLocation> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { isValid: false };
    const data = await res.json();
    if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return {
        district: po.District,
        state: po.State,
        isGujarat: po.State?.toLowerCase() === "gujarat",
        isValid: true,
      };
    }
  } catch (err) {
    // Graceful silent fallback to prefix heuristic
  }

  // Fallback heuristic based on PIN code leading digits
  const isGujarat = pincode.startsWith("36") || pincode.startsWith("37") || pincode.startsWith("38") || pincode.startsWith("39");
  return { isGujarat, isValid: true };
}

export class ManualCourierProvider implements ShippingProvider {
  readonly providerKey = "manual";
  readonly providerName = "Manual Courier";

  async getCouriers(): Promise<CourierOption[]> {
    return [
      {
        id: "courier_dtdc",
        name: "DTDC Express",
        code: "DTDC",
        freightCharge: 120,
        totalCharge: 120,
        estimatedDays: 3,
        isServiceable: true,
      },
      {
        id: "courier_bluedart",
        name: "Blue Dart Express",
        code: "BLUEDART",
        freightCharge: 180,
        totalCharge: 180,
        estimatedDays: 2,
        isServiceable: true,
      },
      {
        id: "courier_delhivery",
        name: "Delhivery Logistics",
        code: "DELHIVERY",
        freightCharge: 100,
        totalCharge: 100,
        estimatedDays: 4,
        isServiceable: true,
      },
      {
        id: "courier_anjani",
        name: "Shree Anjani Courier",
        code: "ANJANI",
        freightCharge: 80,
        totalCharge: 80,
        estimatedDays: 2,
        isServiceable: true,
      },
      {
        id: "courier_speedpost",
        name: "India Post (Speed Post)",
        code: "SPEEDPOST",
        freightCharge: 70,
        totalCharge: 70,
        estimatedDays: 4,
        isServiceable: true,
      },
      {
        id: "courier_tirupati",
        name: "Shree Tirupati Courier",
        code: "TIRUPATI",
        freightCharge: 80,
        totalCharge: 80,
        estimatedDays: 3,
        isServiceable: true,
      },
      {
        id: "courier_professional",
        name: "The Professional Couriers",
        code: "PROFESSIONAL",
        freightCharge: 90,
        totalCharge: 90,
        estimatedDays: 3,
        isServiceable: true,
      },
    ];
  }

  async checkServiceability(
    params: CheckServiceabilityParams
  ): Promise<CourierOption[]> {
    const loc = await lookupPincode(params.deliveryPincode);
    const isLocalGujarat = loc.isGujarat;

    // Calculate volumetric weight: (L * W * H) / 5000 in kg -> convert to grams
    const lengthCm = params.lengthCm ?? 15;
    const widthCm = params.widthCm ?? 10;
    const heightCm = params.heightCm ?? 10;
    const volumetricGrams = Math.round(((lengthCm * widthCm * heightCm) / 5000) * 1000);
    const chargeableWeightGrams = Math.max(params.weightGrams, volumetricGrams);
    const weightKg = Math.max(0.5, Math.ceil(chargeableWeightGrams / 500) * 0.5); // per 500g slab

    const baseCouriers = [
      {
        id: "courier_dtdc",
        name: "DTDC Express",
        code: "DTDC",
        baseRate: isLocalGujarat ? 70 : 120,
        perKgExtra: isLocalGujarat ? 40 : 60,
        minDays: isLocalGujarat ? 1 : 2,
        maxDays: isLocalGujarat ? 2 : 4,
      },
      {
        id: "courier_bluedart",
        name: "Blue Dart Express",
        code: "BLUEDART",
        baseRate: isLocalGujarat ? 120 : 180,
        perKgExtra: isLocalGujarat ? 60 : 90,
        minDays: 1,
        maxDays: isLocalGujarat ? 2 : 3,
      },
      {
        id: "courier_delhivery",
        name: "Delhivery Logistics",
        code: "DELHIVERY",
        baseRate: isLocalGujarat ? 60 : 100,
        perKgExtra: isLocalGujarat ? 35 : 50,
        minDays: isLocalGujarat ? 2 : 3,
        maxDays: isLocalGujarat ? 3 : 5,
      },
      {
        id: "courier_anjani",
        name: "Shree Anjani Courier",
        code: "ANJANI",
        baseRate: isLocalGujarat ? 50 : 80,
        perKgExtra: isLocalGujarat ? 30 : 45,
        minDays: isLocalGujarat ? 1 : 2,
        maxDays: isLocalGujarat ? 2 : 4,
      },
      {
        id: "courier_speedpost",
        name: "India Post (Speed Post)",
        code: "SPEEDPOST",
        baseRate: isLocalGujarat ? 45 : 70,
        perKgExtra: isLocalGujarat ? 25 : 35,
        minDays: isLocalGujarat ? 2 : 3,
        maxDays: isLocalGujarat ? 3 : 6,
      },
      {
        id: "courier_tirupati",
        name: "Shree Tirupati Courier",
        code: "TIRUPATI",
        baseRate: isLocalGujarat ? 50 : 80,
        perKgExtra: isLocalGujarat ? 30 : 45,
        minDays: isLocalGujarat ? 1 : 2,
        maxDays: isLocalGujarat ? 2 : 4,
      },
      {
        id: "courier_professional",
        name: "The Professional Couriers",
        code: "PROFESSIONAL",
        baseRate: isLocalGujarat ? 60 : 90,
        perKgExtra: isLocalGujarat ? 35 : 50,
        minDays: isLocalGujarat ? 2 : 3,
        maxDays: isLocalGujarat ? 3 : 5,
      },
    ];

    return baseCouriers.map((c) => {
      const extraWeightKg = Math.max(0, weightKg - 0.5);
      const extraCharge = Math.ceil(extraWeightKg) * c.perKgExtra;
      const freight = c.baseRate + extraCharge;
      const gst = Math.round(freight * 0.18);
      const totalCharge = freight + gst;

      return {
        id: c.id,
        name: c.name,
        code: c.code,
        freightCharge: freight,
        totalCharge,
        estimatedDays: c.maxDays,
        minDays: c.minDays,
        maxDays: c.maxDays,
        isServiceable: true,
      };
    });
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const courierName = params.courierName || "DTDC Express";
    const courierCode = params.courierCode || "DTDC";
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    
    // Courier-specific AWB prefixes
    let awbNumber = `DW${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    let trackingUrl = `https://track.digitalworld.in/?awb=${awbNumber}`;

    if (courierCode === "DTDC") {
      awbNumber = `D${randomDigits}`;
      trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp?tracking_no=${awbNumber}`;
    } else if (courierCode === "BLUEDART") {
      awbNumber = `BD${randomDigits}`;
      trackingUrl = `https://www.bluedart.com/tracking?track=${awbNumber}`;
    } else if (courierCode === "DELHIVERY") {
      awbNumber = `DEL${randomDigits}`;
      trackingUrl = `https://www.delhivery.com/track/package/${awbNumber}`;
    } else if (courierCode === "ANJANI") {
      awbNumber = `ANJ${randomDigits}`;
      trackingUrl = `https://shreeanjani.co.in/`;
    } else if (courierCode === "SPEEDPOST") {
      awbNumber = `EE${randomDigits}IN`;
      trackingUrl = `https://www.indiapost.gov.in/_layouts/15/dpt.cept.trackconsignment/tracking.aspx`;
    } else if (courierCode === "TIRUPATI") {
      awbNumber = `TIR${randomDigits}`;
      trackingUrl = `https://www.shreetirupaticourier.net/`;
    }

    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    return {
      success: true,
      provider: this.providerKey,
      providerShipmentId: `MNL-SHIP-${Date.now()}`,
      courierName,
      courierCode,
      awbNumber,
      trackingUrl,
      estimatedDeliveryDate: estDate,
      pickupDate: new Date(),
    };
  }

  async assignCourier(
    providerShipmentId: string,
    courierId: string
  ): Promise<{ success: boolean; awbNumber?: string; labelUrl?: string; error?: string }> {
    const awbNumber = `DW${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      awbNumber,
    };
  }

  async generateAWB(
    providerShipmentId: string
  ): Promise<{ success: boolean; awbNumber?: string; error?: string }> {
    return {
      success: true,
      awbNumber: `DW${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }

  async requestPickup(
    providerShipmentId: string
  ): Promise<{ success: boolean; pickupDate?: Date; error?: string }> {
    return {
      success: true,
      pickupDate: new Date(),
    };
  }

  async getTracking(awbNumber: string): Promise<TrackingResponse> {
    return {
      success: true,
      awbNumber,
      courierName: "Manual Courier",
      currentStatus: ShipmentStatus.SHIPMENT_CREATED,
      events: [],
    };
  }

  async cancelShipment(
    providerShipmentId: string,
    awbNumber?: string
  ): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async generateLabel(
    providerShipmentId: string
  ): Promise<{ success: boolean; labelUrl?: string; error?: string }> {
    return { success: true };
  }
}


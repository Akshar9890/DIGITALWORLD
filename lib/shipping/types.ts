import { ShipmentStatus } from "@prisma/client";
export { ShipmentStatus };

export interface CourierOption {
  id: string; // provider specific ID or code
  name: string; // e.g. "Delhivery", "DTDC Express", "Blue Dart Surface"
  code: string; // e.g. "delhivery_surface"
  freightCharge: number;
  codCharges?: number;
  totalCharge: number;
  estimatedDays: number;
  minDays?: number;
  maxDays?: number;
  isServiceable: boolean;
  isCodAvailable?: boolean;
}

export interface CheckServiceabilityParams {
  pickupPincode: string;
  deliveryPincode: string;
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  isCod?: boolean;
  orderValue?: number;
}

export interface ShippingOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  hsnCode?: string;
}

export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pickupPincode?: string;
  items: ShippingOrderItem[];
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  orderValue: number;
  courierId?: string;
  courierName?: string;
  courierCode?: string;
  isCod?: boolean;
}

export interface ShipmentResult {
  success: boolean;
  provider: string; // "shiprocket" | "delhivery" | "manual"
  providerShipmentId?: string;
  courierName: string;
  courierCode?: string;
  awbNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  manifestUrl?: string;
  estimatedDeliveryDate?: Date;
  pickupDate?: Date;
  error?: string;
}

export interface TrackingEventData {
  externalStatus?: string;
  internalStatus: ShipmentStatus;
  location?: string;
  description?: string;
  timestamp: Date;
  rawPayload?: any;
}

export interface TrackingResponse {
  success: boolean;
  awbNumber: string;
  courierName: string;
  currentStatus: ShipmentStatus;
  estimatedDeliveryDate?: Date;
  events: TrackingEventData[];
  raw?: any;
  error?: string;
}

import {
  CourierOption,
  CheckServiceabilityParams,
  CreateShipmentParams,
  ShipmentResult,
  TrackingResponse,
} from "./types";

export interface ShippingProvider {
  /** Provider identifier e.g. "shiprocket", "delhivery", "manual" */
  readonly providerKey: string;
  readonly providerName: string;

  /** Fetch available couriers supported by this provider */
  getCouriers(): Promise<CourierOption[]>;

  /** Check serviceability, rates, and estimated delivery days */
  checkServiceability(params: CheckServiceabilityParams): Promise<CourierOption[]>;

  /** Create shipment & assign courier */
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;

  /** Assign specific courier to an existing shipment order */
  assignCourier(
    providerShipmentId: string,
    courierId: string
  ): Promise<{ success: boolean; awbNumber?: string; labelUrl?: string; error?: string }>;

  /** Generate AWB tracking number */
  generateAWB(
    providerShipmentId: string
  ): Promise<{ success: boolean; awbNumber?: string; error?: string }>;

  /** Request courier pickup */
  requestPickup(
    providerShipmentId: string
  ): Promise<{ success: boolean; pickupDate?: Date; error?: string }>;

  /** Get live tracking details by AWB */
  getTracking(awbNumber: string): Promise<TrackingResponse>;

  /** Cancel shipment */
  cancelShipment(
    providerShipmentId: string,
    awbNumber?: string
  ): Promise<{ success: boolean; error?: string }>;

  /** Generate shipping label PDF */
  generateLabel(
    providerShipmentId: string
  ): Promise<{ success: boolean; labelUrl?: string; error?: string }>;
}

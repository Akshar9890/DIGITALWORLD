import { ShippingProvider } from "./provider.interface";
import {
  CourierOption,
  CheckServiceabilityParams,
  CreateShipmentParams,
  ShipmentResult,
  TrackingResponse,
} from "./types";
import { ShipmentStatus } from "@prisma/client";
import { normalizeShipmentStatus } from "./status-normalizer";

export class DelhiveryProvider implements ShippingProvider {
  readonly providerKey = "delhivery";
  readonly providerName = "Delhivery Direct";

  async getCouriers(): Promise<CourierOption[]> {
    return [
      {
        id: "delhivery_surface",
        name: "Delhivery Surface Express",
        code: "DELHIVERY_SURFACE",
        freightCharge: 110,
        totalCharge: 110,
        estimatedDays: 3,
        isServiceable: true,
      },
      {
        id: "delhivery_air",
        name: "Delhivery Air Priority",
        code: "DELHIVERY_AIR",
        freightCharge: 165,
        totalCharge: 165,
        estimatedDays: 2,
        isServiceable: true,
      },
    ];
  }

  async checkServiceability(
    params: CheckServiceabilityParams
  ): Promise<CourierOption[]> {
    const couriers = await this.getCouriers();
    return couriers.map((c) => ({
      ...c,
      minDays: Math.max(1, c.estimatedDays - 1),
      maxDays: c.estimatedDays + 2,
    }));
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const awbNumber = `DLV${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    return {
      success: true,
      provider: this.providerKey,
      providerShipmentId: `DLV-SHIP-${Date.now()}`,
      courierName: params.courierName || "Delhivery Direct",
      courierCode: params.courierCode || "DELHIVERY",
      awbNumber,
      trackingUrl: `https://www.delhivery.com/track/package/${awbNumber}`,
      estimatedDeliveryDate: estDate,
      pickupDate: new Date(),
    };
  }

  async assignCourier(
    providerShipmentId: string,
    courierId: string
  ): Promise<{ success: boolean; awbNumber?: string; labelUrl?: string; error?: string }> {
    return {
      success: true,
      awbNumber: `DLV${Date.now()}`,
    };
  }

  async generateAWB(
    providerShipmentId: string
  ): Promise<{ success: boolean; awbNumber?: string; error?: string }> {
    return {
      success: true,
      awbNumber: `DLV${Date.now()}`,
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
      courierName: "Delhivery Direct",
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

/**
 * lib/shiprocket/couriers.ts — Serviceability Check & AWB Assignment
 */

import { shiprocketRequest } from "./client";
import { CourierOption } from "../shipping/types";

export interface ShiprocketServiceabilityParams {
  pickupPincode: string;
  deliveryPincode: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  orderValue?: number;
  isCod?: boolean;
}

export interface AssignAWBParams {
  shipmentId: number | string;
  courierId?: number | string;
}

export interface AssignAWBResult {
  success: boolean;
  awbCode?: string;
  courierName?: string;
  courierId?: number;
  appliedWeight?: number;
  routingCode?: string;
  error?: string;
}

export async function checkShiprocketServiceability(
  params: ShiprocketServiceabilityParams
): Promise<{ success: boolean; couriers: CourierOption[]; error?: string }> {
  const weightKg = Math.max(0.1, Number((params.weightGrams / 1000).toFixed(2)));

  const queryParams: Record<string, string | number> = {
    pickup_postcode: params.pickupPincode,
    delivery_postcode: params.deliveryPincode,
    weight: weightKg,
    cod: params.isCod ? 1 : 0,
  };

  if (params.orderValue) {
    queryParams.declared_value = params.orderValue;
  }

  const res = await shiprocketRequest({
    method: "GET",
    endpoint: "/courier/serviceability/",
    params: queryParams,
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      couriers: [],
      error: res.error || "Failed to fetch Shiprocket serviceability",
    };
  }

  const companies = res.data.data?.available_courier_companies || [];

  const couriers: CourierOption[] = companies.map((c: any) => {
    const freight = Math.round(Number(c.rate || c.freight_charge || 0));
    const gst = Math.round(freight * 0.18);
    const total = freight + gst;
    const estDays = parseInt(c.estimated_delivery_days || "3", 10);

    return {
      id: String(c.courier_company_id),
      name: c.courier_name,
      code: c.courier_name.replace(/\s+/g, "_").toUpperCase(),
      freightCharge: freight,
      totalCharge: total,
      estimatedDays: estDays,
      minDays: Math.max(1, estDays - 1),
      maxDays: estDays + 1,
      isServiceable: true,
    };
  });

  return {
    success: true,
    couriers,
  };
}

export async function assignShiprocketAWB(
  params: AssignAWBParams
): Promise<AssignAWBResult> {
  const payload: any = {
    shipment_id: params.shipmentId,
  };

  if (params.courierId) {
    payload.courier_id = params.courierId;
  }

  const res = await shiprocketRequest({
    method: "POST",
    endpoint: "/courier/assign/awb",
    body: payload,
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to assign AWB via Shiprocket",
    };
  }

  const awbData = res.data.response?.data;
  const awbCode = awbData?.awb_code || res.data.awb_code;
  const courierName = awbData?.courier_name || res.data.courier_name;
  const courierId = awbData?.courier_company_id || res.data.courier_company_id;

  if (!awbCode) {
    return {
      success: false,
      error: res.data.message || "Shiprocket did not return an AWB code",
    };
  }

  return {
    success: true,
    awbCode,
    courierName,
    courierId,
    appliedWeight: awbData?.applied_weight,
    routingCode: awbData?.routing_code,
  };
}

/**
 * lib/shiprocket/pickup.ts — Pickup Scheduling in Shiprocket
 */

import { shiprocketRequest } from "./client";

export interface SchedulePickupParams {
  shipmentId: number | string | (number | string)[];
  pickupDate?: string[]; // ["YYYY-MM-DD"]
}

export interface SchedulePickupResult {
  success: boolean;
  pickupToken?: string;
  expectedDate?: string;
  error?: string;
}

export async function scheduleShiprocketPickup(
  params: SchedulePickupParams
): Promise<SchedulePickupResult> {
  const shipmentIds = Array.isArray(params.shipmentId)
    ? params.shipmentId
    : [params.shipmentId];

  const payload: any = {
    shipment_id: shipmentIds,
  };

  if (params.pickupDate && params.pickupDate.length > 0) {
    payload.pickup_date = params.pickupDate;
  }

  const res = await shiprocketRequest({
    method: "POST",
    endpoint: "/courier/generate/pickup",
    body: payload,
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to schedule pickup with Shiprocket",
    };
  }

  const responseData = res.data.response;

  return {
    success: true,
    pickupToken: responseData?.pickup_token_number || res.data.pickup_token_number,
    expectedDate: responseData?.expected_pickup_date || res.data.expected_pickup_date,
  };
}

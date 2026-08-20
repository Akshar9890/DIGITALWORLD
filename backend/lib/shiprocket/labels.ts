/**
 * lib/shiprocket/labels.ts — Shipping Label & Manifest Generation in Shiprocket
 */

import { shiprocketRequest } from "./client";

export async function generateShiprocketLabel(
  shipmentId: number | string | (number | string)[]
): Promise<{ success: boolean; labelUrl?: string; labelCreated?: number; error?: string }> {
  const shipmentIds = Array.isArray(shipmentId) ? shipmentId : [shipmentId];

  const res = await shiprocketRequest({
    method: "POST",
    endpoint: "/courier/generate/label",
    body: { shipment_id: shipmentIds },
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to generate label from Shiprocket",
    };
  }

  return {
    success: true,
    labelUrl: res.data.label_url,
    labelCreated: res.data.label_created,
  };
}

export async function generateShiprocketManifest(
  shipmentId: number | string | (number | string)[]
): Promise<{ success: boolean; manifestUrl?: string; error?: string }> {
  const shipmentIds = Array.isArray(shipmentId) ? shipmentId : [shipmentId];

  const res = await shiprocketRequest({
    method: "POST",
    endpoint: "/manifests/generate",
    body: { shipment_id: shipmentIds },
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to generate manifest from Shiprocket",
    };
  }

  return {
    success: true,
    manifestUrl: res.data.manifest_url,
  };
}

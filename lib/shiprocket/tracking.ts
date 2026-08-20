/**
 * lib/shiprocket/tracking.ts — AWB Tracking & Status Normalization
 */

import { shiprocketRequest } from "./client";
import { ShipmentStatus, TrackingEventData } from "../shipping/types";

export function normalizeShiprocketStatus(rawStatus: string | number): ShipmentStatus {
  const statusStr = String(rawStatus).toUpperCase().trim();

  // Shiprocket status mappings
  if (statusStr.includes("DELIVERED") && !statusStr.includes("RTO") && !statusStr.includes("OUT")) {
    return ShipmentStatus.DELIVERED;
  }
  if (statusStr.includes("OUT FOR DELIVERY") || statusStr.includes("OUT_FOR_DELIVERY")) {
    return ShipmentStatus.OUT_FOR_DELIVERY;
  }
  if (statusStr.includes("REACHED AT DESTINATION") || statusStr.includes("REACHED_DESTINATION")) {
    return ShipmentStatus.REACHED_DESTINATION;
  }
  if (statusStr.includes("IN TRANSIT") || statusStr.includes("IN_TRANSIT") || statusStr.includes("SHIPPED")) {
    return ShipmentStatus.IN_TRANSIT;
  }
  if (statusStr.includes("PICKED UP") || statusStr.includes("PICKED_UP")) {
    return ShipmentStatus.PICKED_UP;
  }
  if (statusStr.includes("PICKUP SCHEDULED") || statusStr.includes("PICKUP_SCHEDULED") || statusStr.includes("PICKUP_RESCHEDULED")) {
    return ShipmentStatus.PICKUP_SCHEDULED;
  }
  if (statusStr.includes("AWB ASSIGNED") || statusStr.includes("AWB_ASSIGNED") || statusStr.includes("MANIFEST") || statusStr.includes("NEW")) {
    return ShipmentStatus.SHIPMENT_CREATED;
  }
  if (statusStr.includes("RTO DELIVERED")) {
    return ShipmentStatus.RTO_DELIVERED;
  }
  if (statusStr.includes("RTO IN TRANSIT")) {
    return ShipmentStatus.RTO_IN_TRANSIT;
  }
  if (statusStr.includes("RTO INITIATED") || statusStr.includes("RTO_INITIATED") || statusStr.includes("RTO")) {
    return ShipmentStatus.RTO_INITIATED;
  }
  if (statusStr.includes("UNDELIVERED") || statusStr.includes("NDR") || statusStr.includes("DELIVERY ATTEMPTED")) {
    return ShipmentStatus.NDR;
  }
  if (statusStr.includes("DELAYED") || statusStr.includes("EXCEPTION")) {
    return ShipmentStatus.DELAYED;
  }
  if (statusStr.includes("CANCELLED") || statusStr.includes("CANCELED")) {
    return ShipmentStatus.CANCELLED;
  }

  return ShipmentStatus.IN_TRANSIT;
}

export async function getShiprocketTrackingByAWB(awb: string): Promise<{
  success: boolean;
  currentStatus?: ShipmentStatus;
  rawStatus?: string;
  courierName?: string;
  estimatedDeliveryDate?: Date;
  events: TrackingEventData[];
  error?: string;
}> {
  const res = await shiprocketRequest({
    method: "GET",
    endpoint: `/courier/track/awb/${encodeURIComponent(awb)}`,
  });

  if (!res.success || !res.data) {
    return {
      success: false,
      events: [],
      error: res.error || "Failed to fetch tracking details from Shiprocket",
    };
  }

  const trackData = res.data.tracking_data;
  if (!trackData) {
    return {
      success: false,
      events: [],
      error: "No tracking data available for this AWB",
    };
  }

  const rawStatus = trackData.current_status || "AWB_ASSIGNED";
  const currentStatus = normalizeShiprocketStatus(rawStatus);
  const courierName = trackData.courier_name || "Shiprocket Partner";

  let estimatedDeliveryDate: Date | undefined;
  if (trackData.etd) {
    estimatedDeliveryDate = new Date(trackData.etd);
  }

  const scans = trackData.shipment_track_activities || trackData.scans || [];
  const events: TrackingEventData[] = scans.map((s: any) => ({
    externalStatus: s.activity || s.status || rawStatus,
    internalStatus: normalizeShiprocketStatus(s.activity || s.status || rawStatus),
    location: s.location || "Logistics Hub",
    description: s["sr-status-label"] || s.activity || s.status || "Status updated",
    timestamp: s.date ? new Date(s.date) : new Date(),
    rawPayload: s,
  }));

  return {
    success: true,
    currentStatus,
    rawStatus,
    courierName,
    estimatedDeliveryDate,
    events,
  };
}

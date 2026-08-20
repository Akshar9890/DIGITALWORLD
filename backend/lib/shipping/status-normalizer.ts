import { ShipmentStatus } from "./types";

/**
 * Normalizes external courier status strings to standard internal ShipmentStatus enum.
 */
export function normalizeShipmentStatus(externalStatus?: string | null): ShipmentStatus {
  if (!externalStatus) return ShipmentStatus.SHIPMENT_CREATED;

  const status = externalStatus.trim().toUpperCase();

  // Delivered
  if (
    status.includes("DELIVERED") ||
    status === "DLVD" ||
    status === "COMPLETED" ||
    status === "FULFILLED"
  ) {
    return ShipmentStatus.DELIVERED;
  }

  // Out for delivery
  if (
    status.includes("OUT FOR DELIVERY") ||
    status.includes("OUT FOR DEL") ||
    status === "OFD" ||
    status === "DISPATCHED FOR DELIVERY"
  ) {
    return ShipmentStatus.OUT_FOR_DELIVERY;
  }

  // Delivery Attempted
  if (
    status.includes("ATTEMPTED") ||
    status.includes("UNDELIVERED") ||
    status.includes("UN-DELIVERED")
  ) {
    return ShipmentStatus.NDR;
  }

  // In Transit / Reached Destination
  if (status.includes("REACHED") || status.includes("DESTINATION HUB")) {
    return ShipmentStatus.REACHED_DESTINATION;
  }
  if (
    status.includes("IN TRANSIT") ||
    status.includes("TRANSIT") ||
    status.includes("SHIPPED") ||
    status.includes("IN-TRANSIT") ||
    status === "IT"
  ) {
    return ShipmentStatus.IN_TRANSIT;
  }

  // Picked up
  if (
    status.includes("PICKED UP") ||
    status.includes("PICKUP DONE") ||
    status === "PICKED_UP" ||
    status === "PU"
  ) {
    return ShipmentStatus.PICKED_UP;
  }

  // Pickup Scheduled
  if (
    status.includes("PICKUP SCHEDULED") ||
    status.includes("PICKUP ASSIGNED") ||
    status.includes("READY FOR PICKUP")
  ) {
    return ShipmentStatus.PICKUP_SCHEDULED;
  }

  // Packed / Order Processing
  if (status.includes("PACKED") || status.includes("MANIFESTED")) {
    return ShipmentStatus.PACKED;
  }

  // NDR (Non Delivery Report)
  if (status.includes("NDR") || status.includes("NON DELIVERY")) {
    return ShipmentStatus.NDR;
  }

  // RTO (Return To Origin)
  if (status.includes("RTO DELIVERED")) return ShipmentStatus.RTO_DELIVERED;
  if (status.includes("RTO IN TRANSIT") || status.includes("RTO TRANSIT"))
    return ShipmentStatus.RTO_IN_TRANSIT;
  if (status.includes("RTO") || status.includes("RETURN TO ORIGIN"))
    return ShipmentStatus.RTO_INITIATED;

  // Cancelled / Lost / Damaged
  if (status.includes("CANCELLED") || status.includes("CANCELED"))
    return ShipmentStatus.CANCELLED;
  if (status.includes("LOST")) return ShipmentStatus.LOST;
  if (status.includes("DAMAGED")) return ShipmentStatus.DAMAGED;
  if (status.includes("DELAYED") || status.includes("DELAY"))
    return ShipmentStatus.DELAYED;

  return ShipmentStatus.SHIPMENT_CREATED;
}

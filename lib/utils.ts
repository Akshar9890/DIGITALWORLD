/**
 * lib/utils.ts — Shared utility functions
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a sequential document number */
export function generateDocNumber(
  prefix: string,
  sequence: number
): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}

/** Generate a random session token for guest cart */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node fallback
  return require("crypto").randomBytes(32).toString("hex");
}

/** Validate Indian GSTIN format */
export function isValidGSTIN(gstin: string): boolean {
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
}

/** Validate Indian pincode */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

/** Validate Indian phone number */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/[^0-9]/g, ""));
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
}

/** Format date for display */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format date with time */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Sleep utility */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Convert slug to title */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Safe JSON parse */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/** Format INR amounts (Indian grouping) — re-exported from lib/tax for convenience */
export { formatINR, formatINRCompact, amountToWords } from "./tax";

/**
 * Generate the next quotation number for the current year.
 * Format: DW-QT-2026-0001
 */
export function generateQuotationNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `DW-QT-${year}-${String(sequence).padStart(4, "0")}`;
}

/** Calculate estimated delivery date range (3-5 business days) */
export function getEstimatedDeliveryRange(orderDate: Date | string): {
  minDate: string;
  maxDate: string;
  displayText: string;
} {
  const base = new Date(orderDate);
  const minDateObj = new Date(base);
  minDateObj.setDate(minDateObj.getDate() + 3);

  const maxDateObj = new Date(base);
  maxDateObj.setDate(maxDateObj.getDate() + 5);

  const formatOpt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const minStr = minDateObj.toLocaleDateString("en-IN", formatOpt);
  const maxStr = maxDateObj.toLocaleDateString("en-IN", formatOpt);

  return {
    minDate: minStr,
    maxDate: maxStr,
    displayText: `${minStr} – ${maxStr} (3–5 Business Days)`,
  };
}


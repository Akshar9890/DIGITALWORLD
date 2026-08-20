"use client";

/**
 * PincodeInput — India pincode auto-lookup component.
 *
 * Uses the free India Post API (no API key needed):
 *   https://api.postalpincode.in/pincode/{pincode}
 *
 * On valid 6-digit pincode → auto-fills city, state, and area/locality.
 */

import { useState, useCallback } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export interface PincodeResult {
  pincode: string;
  city: string;
  state: string;
  area: string; // first locality/area name
  allAreas: string[]; // all locality names in the pincode
}

interface PincodeInputProps {
  value: string;
  onChange: (val: string) => void;
  onResolved?: (result: PincodeResult) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

type LookupStatus = "idle" | "loading" | "success" | "error";

export function PincodeInput({
  value,
  onChange,
  onResolved,
  error,
  className = "",
  placeholder = "6-digit pincode",
  label = "Pincode",
  required = false,
}: PincodeInputProps) {
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [resolvedInfo, setResolvedInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lookup = useCallback(
    async (pincode: string) => {
      if (!/^[1-9][0-9]{5}$/.test(pincode)) {
        setStatus("idle");
        setResolvedInfo(null);
        return;
      }

      setStatus("loading");
      setErrorMsg(null);
      setResolvedInfo(null);

      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
        const data = await res.json();

        if (
          data &&
          data[0]?.Status === "Success" &&
          data[0]?.PostOffice?.length > 0
        ) {
          const postOffices: any[] = data[0].PostOffice;
          const first = postOffices[0];
          const city = first.Division || first.District || first.Block || "";
          const state = first.State || "";
          const allAreas = postOffices.map((p: any) => p.Name);
          const area = allAreas[0] || "";

          const result: PincodeResult = { pincode, city, state, area, allAreas };
          setResolvedInfo(`${city}, ${state}`);
          setStatus("success");
          onResolved?.(result);
        } else {
          setErrorMsg("Pincode not found. Please check and try again.");
          setStatus("error");
        }
      } catch {
        setErrorMsg("Could not verify pincode. Check your connection.");
        setStatus("error");
      }
    },
    [onResolved]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(val);
    if (val.length === 6) {
      lookup(val);
    } else {
      setStatus("idle");
      setResolvedInfo(null);
      setErrorMsg(null);
    }
  };

  const hasError = !!error || status === "error";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="input-label">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Pin icon */}
        <MapPin
          size={15}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            status === "success"
              ? "text-status-success"
              : hasError
              ? "text-status-error"
              : "text-slate-gray"
          }`}
        />

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input-field pl-9 pr-9 ${
            hasError
              ? "border-status-error focus:border-status-error"
              : status === "success"
              ? "border-status-success/50 focus:border-status-success"
              : ""
          } ${className}`}
        />

        {/* Right icon — spinner / check / error */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {status === "loading" && (
            <Loader2 size={15} className="animate-spin text-slate-gray" />
          )}
          {status === "success" && (
            <CheckCircle2 size={15} className="text-status-success" />
          )}
          {status === "error" && (
            <AlertCircle size={15} className="text-status-error" />
          )}
        </div>
      </div>

      {/* Resolved location info */}
      {status === "success" && resolvedInfo && (
        <p className="text-xs text-status-success flex items-center gap-1 mt-0.5">
          <MapPin size={11} />
          {resolvedInfo}
        </p>
      )}

      {/* Error messages — validation error takes precedence */}
      {error && (
        <p className="text-xs text-status-error mt-0.5">{error}</p>
      )}
      {!error && status === "error" && errorMsg && (
        <p className="text-xs text-status-error mt-0.5">{errorMsg}</p>
      )}
    </div>
  );
}

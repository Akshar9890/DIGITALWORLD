"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={cn(
            "peer w-full bg-surface-container border border-outline-variant/30",
            "text-on-surface placeholder:text-transparent",
            "rounded-control px-4 pt-5 pb-2 text-body-md",
            "focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50",
            "transition-colors duration-200",
            error && "border-status-error focus:border-status-error focus:ring-status-error/50",
            className
          )}
          placeholder={label}
          {...props}
        />
        <label
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            "text-slate-gray font-body-technical",
            (isFocused || hasValue || props.value)
              ? "top-1.5 text-[10px] tracking-wider text-tertiary"
              : "top-1/2 -translate-y-1/2 text-body-md"
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-body-technical text-status-error">{error}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

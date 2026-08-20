"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  formatAsCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  formatAsCurrency = true,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const start = previousValueRef.current;
    const end = value;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const updateValue = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        previousValueRef.current = end;
      }
    };

    requestAnimationFrame(updateValue);
  }, [value]);

  const formatted = formatAsCurrency
    ? formatINR(displayValue)
    : `${prefix}${displayValue.toLocaleString("en-IN")}${suffix}`;

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ opacity: 0.8, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0.8, y: 4 }}
        transition={{ duration: 0.2 }}
        className={`inline-block font-mono tracking-tight ${className}`}
      >
        {formatted}
      </motion.span>
    </AnimatePresence>
  );
}

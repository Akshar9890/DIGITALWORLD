"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState<"default" | "cta" | "product">("default");

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 350 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on mobile/touch and when prefers-reduced-motion is active
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest("a, button, [role='button'], input, select, [data-cursor]");
      if (interactiveEl) {
        setIsHovered(true);
        const cursorAttr = interactiveEl.getAttribute("data-cursor");
        if (cursorAttr === "cta" || interactiveEl.classList.contains("btn-primary")) {
          setHoverType("cta");
        } else if (cursorAttr === "product" || interactiveEl.closest(".product-card")) {
          setHoverType("product");
        } else {
          setHoverType("default");
        }
      } else {
        setIsHovered(false);
        setHoverType("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Glow Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-primary-container/40 pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? (hoverType === "cta" ? 48 : 38) : 24,
          height: isHovered ? (hoverType === "cta" ? 48 : 38) : 24,
          backgroundColor: isHovered
            ? hoverType === "cta"
              ? "rgba(179, 36, 24, 0.15)"
              : "rgba(242, 169, 59, 0.1)"
            : "rgba(179, 36, 24, 0.05)",
          borderColor: isHovered
            ? hoverType === "cta"
              ? "#B32418"
              : "#F2A93B"
            : "rgba(179, 36, 24, 0.3)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />

      {/* Inner Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full bg-primary-container pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 6 : 4,
          height: isHovered ? 6 : 4,
          backgroundColor: hoverType === "cta" ? "#F2A93B" : "#B32418",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

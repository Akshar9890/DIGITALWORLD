"use client";

import { motion, useSpring, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteLoadingBar() {
  const pathname = usePathname();
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    progress.set(0.6);

    const timer1 = setTimeout(() => progress.set(0.85), 200);
    const timer2 = setTimeout(() => {
      progress.set(1);
      setTimeout(() => {
        setVisible(false);
        progress.set(0);
      }, 300);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, progress]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[2px]">
      <motion.div
        className="h-full bg-gradient-to-r from-primary-container via-tertiary to-primary-container origin-left shadow-[0_0_8px_rgba(179,36,24,0.5)]"
        style={{ scaleX }}
      />
    </div>
  );
}

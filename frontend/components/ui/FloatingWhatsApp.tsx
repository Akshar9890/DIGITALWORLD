"use client";

import { MessageCircle, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingWhatsApp() {
  const whatsappNumber = "917043633303"; // Official WhatsApp number
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello DIGITALWORLD, I need technical information / quotation for Heat Aerosol Fire Suppression devices."
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
    >
      {/* Floating Badge */}
      <div className="hidden sm:flex items-center gap-2 rounded-full border border-status-success/30 bg-surface-charcoal/90 px-3 py-1.5 backdrop-blur-md shadow-lg text-[11px] font-label-caps text-on-surface">
        <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
        <span className="text-slate-gray">ENGINEERING ASSISTANT:</span>
        <span className="text-status-success font-bold">ONLINE</span>
      </div>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-status-success text-white shadow-xl hover:bg-[#166337] transition-all hover:scale-105"
        title="Chat with Technical Sales on WhatsApp"
        data-cursor="cta"
      >
        {/* Subtle Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-status-success/40 animate-ping opacity-75 pointer-events-none" />

        <MessageCircle size={26} className="relative z-10" />
      </a>
    </motion.div>
  );
}

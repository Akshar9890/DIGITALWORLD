"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 border-outline-variant text-white hover:bg-surface-container-high"
    >
      <Printer size={16} /> PRINT / SAVE PDF
    </button>
  );
}

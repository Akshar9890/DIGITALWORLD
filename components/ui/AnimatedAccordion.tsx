"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  tag?: string;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function AnimatedAccordion({
  items,
  allowMultiple = false,
  className = "",
}: AnimatedAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || ""]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`bento-card overflow-hidden transition-colors border ${
              isOpen
                ? "border-tertiary/40 bg-surface-container-high/60"
                : "border-outline-variant/20 hover:border-outline-variant/40"
            }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between p-5 text-left font-headline-sm text-on-surface hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3 pr-4">
                {item.tag && (
                  <span className="font-label-caps text-[10px] uppercase tracking-widest text-tertiary border border-tertiary/30 bg-tertiary/10 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                )}
                <span>{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 text-slate-gray"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="border-t border-outline-variant/20 px-5 pb-5 pt-3 text-body-technical text-on-surface-variant leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

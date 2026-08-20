"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { inr, type Product } from "@/lib/products-data";
import { useRef } from "react";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-3xl glass sheen transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-secondary">
          {img && (
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
            />
          )}
          <span className="absolute left-4 top-4 rounded-full glass-soft px-3 py-1.5 label-caps">
            {product.model}
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 p-7">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl">{product.name}</h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">{product.tagline}</p>
            <p className="mt-4 font-mono text-sm text-primary">
              {inr(product.basePrice)}
              <span className="ml-2 text-muted-foreground line-through">{inr(product.mrp)}</span>
            </p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

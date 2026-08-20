"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  X,
  Package,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  Flame,
  ChevronRight,
} from "lucide-react";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/catalog", label: "Catalog", icon: Flame },
  { href: "/#applications", label: "Applications", icon: null },
  { href: "/#how-it-works", label: "How It Works", icon: null },
  { href: "/#technical", label: "Technical", icon: null },
  { href: "/#reviews", label: "Reviews", icon: null },
  { href: "/#faq", label: "FAQ", icon: null },
];

export function MobileBottomSheet({ isOpen, onClose }: MobileBottomSheetProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] rounded-t-3xl bg-surface-charcoal border-t border-outline-variant/30 shadow-2xl md:hidden overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-slate-gray/40" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-outline-variant/20">
              <span className="font-headline-sm text-lg text-white">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <X size={20} className="text-slate-gray" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={onClose}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                        isActive
                          ? "bg-primary-container/15 text-white"
                          : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="text-sm font-medium">{link.label}</span>
                      <ChevronRight size={16} className="text-slate-gray" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 pb-4 border-t border-outline-variant/20 pt-4">
              <Link
                href="/quotation"
                onClick={onClose}
                className="btn-primary w-full gap-2 py-3 text-sm"
              >
                <FileText size={18} />
                GET INSTANT QUOTATION
              </Link>
            </div>

            {/* Account Section */}
            <div className="px-6 pb-6 border-t border-outline-variant/20 pt-4">
              {session ? (
                <div className="flex flex-col gap-2">
                  <div className="px-2 pb-2">
                    <p className="text-sm text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-slate-gray truncate">{session.user.email}</p>
                  </div>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <Package size={18} /> My Orders
                  </Link>
                  <Link
                    href="/account/quotes"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    <FileText size={18} /> My Quotations
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-status-error hover:bg-error-container/20 transition-colors"
                    >
                      <Settings size={18} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); onClose(); }}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-gray hover:bg-surface-container transition-colors mt-1"
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="flex-1" onClick={onClose}>
                    <button className="btn-secondary w-full py-2.5 text-xs">SIGN IN</button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={onClose}>
                    <button className="btn-primary w-full py-2.5 text-xs">REGISTER</button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

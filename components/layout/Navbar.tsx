"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  Package,
  Shield,
  FileText,
  Settings,
  LogOut,
  Search,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MobileBottomSheet } from "@/components/ui/MobileBottomSheet";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const isAdmin = session?.user?.role === "admin";
  const isWholesale = session?.user?.role === "wholesale_approved";

  useEffect(() => {
    let isMounted = true;
    async function updateCartCount() {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          const totalItems = data.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          if (isMounted) setCartCount(totalItems);
        } else {
          if (isMounted) setCartCount(0);
        }
      } catch {
        if (isMounted) setCartCount(0);
      }
    }

    updateCartCount();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("focus", handleCartUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("focus", handleCartUpdate);
    };
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/#applications", label: "Applications" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#technical", label: "Technical Docs" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col">
      {/* Top Bar with Phone & Support */}
      <div className="bg-[#111214] border-b border-outline-variant/20 py-1.5 px-4 text-xs font-body-technical text-slate-gray">
        <div className="page-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <a href="tel:+917043633303" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={13} className="text-primary-container" />
              <span>+91 70436 33303</span>
            </a>
            <a href="mailto:digitalworld9890@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail size={13} className="text-primary-container" />
              <span>digitalworld9890@gmail.com</span>
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-tertiary">
            <span>⚡ Direct Wholesale &amp; Industrial Fire Protection Platform</span>
            <span>|</span>
            <span>18% GST Tax Invoice Included</span>
          </div>
        </div>
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-outline-variant/30 bg-surface-charcoal/90 backdrop-blur-xl shadow-2xl py-0"
            : "border-b border-outline-variant/15 bg-background/80 backdrop-blur-md py-1"
        }`}
      >
        <div className="page-container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="group flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-white shadow-lg shadow-primary-container/20 group-hover:bg-[#920503] transition-colors"
            >
              <Shield size={24} className="text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-xl leading-tight tracking-tight text-white group-hover:text-primary transition-colors font-bold">
                DIGITALWORLD
              </span>
              <span className="text-[10px] font-label-caps tracking-[0.2em] text-primary flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
                FIRE PROTECTION PLATFORM
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    if (link.href === "/" && pathname === "/") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`relative py-1 text-xs font-label-caps tracking-wider uppercase transition-colors ${
                    isActive
                      ? "text-white font-bold"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-container rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Search */}
            <Link
              href="/catalog"
              className="p-2 text-slate-gray hover:text-white transition-colors rounded-full hover:bg-surface-container"
              title="Search Catalog"
            >
              <Search size={18} />
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-on-surface-variant hover:text-white transition-colors rounded-full hover:bg-surface-container"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-white shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Profile / Login */}
            {status === "loading" ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-surface-container" />
            ) : session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high border border-outline-variant/30 hover:border-tertiary transition-colors"
                >
                  <UserIcon size={18} className="text-on-surface" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-3 w-60 rounded-card border border-outline-variant/30 bg-surface-charcoal/95 shadow-2xl backdrop-blur-xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-outline-variant/20">
                        <p className="font-headline-sm text-sm text-white truncate">{session.user.name}</p>
                        <p className="text-body-technical text-xs text-slate-gray truncate">{session.user.email}</p>
                        {isWholesale && (
                          <span className="badge-wholesale mt-2 block w-max text-[10px]">B2B Approved</span>
                        )}
                        {isAdmin && (
                          <span className="badge-error mt-2 block w-max text-[10px]">Admin: {session.user.adminSubRole}</span>
                        )}
                      </div>
                      <div className="p-2 text-xs">
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2.5 rounded-control px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Package size={15} /> My Orders
                        </Link>
                        <Link
                          href="/account/quotes"
                          className="flex items-center gap-2.5 rounded-control px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FileText size={15} /> My Quotations
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 rounded-control px-3 py-2 text-status-error hover:bg-error-container/20 transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <Settings size={15} /> Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="p-2 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="text-xs font-label-caps tracking-widest text-on-surface-variant hover:text-white transition-colors">
                SIGN IN
              </Link>
            )}

            {/* Primary CTA: GET QUOTATION */}
            <Link href="/quotation">
              <MagneticButton className="btn-primary gap-2 px-4 py-2.5 text-xs tracking-wider shadow-lg shadow-primary-container/20">
                <FileText size={14} />
                <span>B2B QUOTE</span>
                <ChevronRight size={13} />
              </MagneticButton>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/cart" className="relative p-2 text-on-surface-variant">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-on-surface focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <MobileBottomSheet isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </motion.header>
    </div>
  );
}

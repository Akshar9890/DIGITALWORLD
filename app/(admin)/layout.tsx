"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Users,
  FileText,
  Star,
  Settings,
  Shield,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/companies", label: "B2B Companies", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-charcoal border-r border-outline-variant/20 flex flex-col sticky top-16 h-[calc(100vh-64px)]">
        <div className="p-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2 text-tertiary">
            <Shield size={20} />
            <span className="font-label-caps text-xs tracking-widest">Admin Panel</span>
          </div>
          {session?.user && (
            <p className="text-xs text-slate-gray mt-2 truncate">{session.user.email}</p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-control text-sm transition-colors ${
                  isActive
                    ? "bg-primary-container/15 text-primary-container border-l-2 border-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-outline-variant/20">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-gray hover:text-white transition-colors px-3 py-2"
          >
            <ChevronLeft size={14} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, Package, FileText, Settings, User } from "lucide-react";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const role = session.user.role;
  const isB2B = role === "wholesale_approved";

  return (
    <div className="w-full min-h-screen bg-surface-charcoal">
      <div className="page-container py-12">
        <h1 className="font-headline-lg text-white mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bento-card overflow-hidden">
              <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center font-headline-sm text-white">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-white text-sm">{session.user.name}</span>
                    <span className="text-xs text-slate-gray">{session.user.email}</span>
                  </div>
                </div>
                {isB2B && (
                  <div className="mt-4 badge-wholesale text-center w-full justify-center">
                    B2B Partner
                  </div>
                )}
              </div>
              
              <nav className="flex flex-col p-2">
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-gray hover:bg-surface-container hover:text-white transition-colors">
                  <User size={18} /> Dashboard
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-gray hover:bg-surface-container hover:text-white transition-colors">
                  <Package size={18} /> Order History
                </Link>
                <Link href="/account/quotes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-gray hover:bg-surface-container hover:text-white transition-colors">
                  <FileText size={18} /> My Quotations
                </Link>
                <Link href="/account/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-gray hover:bg-surface-container hover:text-white transition-colors">
                  <Settings size={18} /> Account Settings
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}

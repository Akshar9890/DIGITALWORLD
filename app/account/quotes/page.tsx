export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Download, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";

export default async function QuotesPage() {
  const session = await auth();

  const isAdmin = session?.user?.role === "admin";
  const isWholesale = session?.user?.role === "wholesale_approved";

  const quotations = await db.quotation.findMany({
    where: isAdmin ? {} : { userId: session?.user?.id ?? "never" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <h2 className="font-headline-md text-white">My Instant Quotations</h2>
        <Link href="/quotation" className="btn-primary text-sm py-2 px-4">
          Create New Quotation
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="bento-card p-12 text-center flex flex-col items-center justify-center">
          <FileText size={48} className="text-slate-gray mb-4" />
          <h3 className="font-headline-sm text-white mb-2">No quotations found</h3>
          <p className="text-body-technical text-on-surface-variant max-w-sm mb-6">
            Generate a professional instant quotation for any product and quantity — it only
            takes a few seconds.
          </p>
          <Link href="/quotation">
            <span className="btn-primary">GET INSTANT QUOTATION</span>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container rounded-control overflow-hidden border border-outline-variant/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Quotation No</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Date</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Product</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Qty</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Status</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray">Grand Total</th>
                <th className="p-4 text-xs font-label-caps uppercase text-slate-gray text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                  <td className="p-4">
                    <Link href={`/quotation/${q.id}`} className="text-sm text-tertiary font-medium hover:underline">
                      {q.quotationNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-slate-gray">
                    {q.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-4 text-sm text-white max-w-[220px] truncate">{q.productName}</td>
                  <td className="p-4 text-sm text-slate-gray">{q.quantity} PCS</td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      q.status === "converted" || q.status === "accepted"
                        ? "bg-status-success/20 text-status-success"
                        : q.status === "expired"
                        ? "bg-status-error/20 text-status-error"
                        : "bg-tertiary/20 text-tertiary"
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-white">{formatINR(Number(q.grandTotal))}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a
                        href={`/api/quotation/${q.id}/pdf?download=1`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-white transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </a>
                      <Link
                        href={`/quotation/${q.id}`}
                        className="inline-flex items-center gap-1 text-sm text-tertiary hover:text-white transition-colors"
                        title="View quotation"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(isWholesale || isAdmin) && (
        <p className="text-xs text-slate-gray">
          All quotations use the same pricing engine as the cart and checkout — the quoted
          amount is always what you pay.
        </p>
      )}
    </div>
  );
}

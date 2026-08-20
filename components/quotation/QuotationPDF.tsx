/**
 * components/quotation/QuotationPDF.tsx — Server-only react-pdf document
 * Used by /api/quotation/[id]/pdf to render the professional quotation PDF.
 *
 * NOTE: standard PDF fonts do not include the ₹ glyph, so amounts use "Rs".
 */

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export type QuotationPDFData = {
  id: string;
  quotationNumber: string;
  createdAt: Date;
  validUntil: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName?: string | null;
  gstin?: string | null;
  deliveryAddress?: string | null;
  pincode: string;
  state?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  standardPrice: number;
  appliedTierName: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  courierCharge: number;
  grandTotal: number;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1F2937",
    padding: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 3,
    borderBottomColor: "#B32418",
    paddingBottom: 14,
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: "flex-end",
  },
  qrCode: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  brand: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#B32418",
  },
  brandSub: {
    fontSize: 8.5,
    color: "#6B6E73",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B32418",
    textAlign: "right",
  },
  meta: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 8,
  },
  metaCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  metaLabel: {
    fontSize: 7.5,
    color: "#6B6E73",
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#6B6E73",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  preparedFor: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  preparedLine: {
    fontSize: 9.5,
    color: "#374151",
    marginBottom: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2B2B2E",
  },
  tableHeadCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    fontSize: 9.5,
    padding: 8,
    color: "#111827",
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.4, textAlign: "right" },
  discountBox: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F2A93B",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  discountTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 3,
  },
  discountLine: {
    fontSize: 9,
    color: "#92400E",
  },
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totals: {
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 9.5,
    color: "#6B6E73",
  },
  totalValue: {
    fontSize: 9.5,
    color: "#111827",
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    backgroundColor: "#B32418",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  grandLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  grandValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  terms: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6B6E73",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 8,
    color: "#6B6E73",
    lineHeight: 1.5,
  },
});

const fmt = (n: number) =>
  "Rs " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export function QuotationPDF({ data }: { data: QuotationPDFData }) {
  const gstPct = Math.round(data.gstRate * 100);
  return (
    <Document
      title={`DIGITALWORLD — ${data.quotationNumber}`}
      author="DIGITALWORLD"
      subject="Instant Quotation"
      creator="DIGITALWORLD"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>DIGITALWORLD</Text>
            <Text style={styles.brandSub}>Fire Safety &amp; Protection Solutions</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={styles.qrContainer}>
              <Image 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${encodeURIComponent(`https://digitalworld.in/quotation/${data.id}`)}`} 
                style={styles.qrCode} 
              />
              <Text style={{ fontSize: 6, color: "#6B6E73", textAlign: "center" }}>Scan to view</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
              <Text style={styles.docTitle}>INSTANT QUOTATION</Text>
              <Text style={{ fontSize: 8, color: "#6B6E73", marginTop: 2 }}>
                {data.quotationNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Quotation No</Text>
            <Text style={styles.metaValue}>{data.quotationNumber}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {data.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Valid Until</Text>
            <Text style={styles.metaValue}>
              {data.validUntil.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </Text>
          </View>
        </View>

        {/* Prepared For */}
        <Text style={styles.sectionTitle}>Prepared For</Text>
        <View style={styles.preparedFor}>
          <Text style={[styles.preparedLine, { fontSize: 11, fontWeight: "bold", marginBottom: 4 }]}>
            {data.customerName}
          </Text>
          {data.companyName && (
            <Text style={styles.preparedLine}>Company: {data.companyName}</Text>
          )}
          {data.gstin && (
            <Text style={styles.preparedLine}>GSTIN: {data.gstin}</Text>
          )}
          <Text style={styles.preparedLine}>Mobile: {data.customerPhone}</Text>
          <Text style={styles.preparedLine}>Email: {data.customerEmail}</Text>
          {data.deliveryAddress && (
            <Text style={styles.preparedLine}>Address: {data.deliveryAddress}</Text>
          )}
          <Text style={styles.preparedLine}>
            Delivery Pincode: {data.pincode}
            {data.state ? ` • ${data.state}` : ""}
          </Text>
        </View>

        {/* Product Table */}
        <Text style={styles.sectionTitle}>Products &amp; Pricing</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeadCell, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeadCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeadCell, styles.colUnit]}>Unit Price</Text>
            <Text style={[styles.tableHeadCell, styles.colAmount]}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colProduct]}>{data.productName}</Text>
            <Text style={[styles.tableCell, styles.colQty]}>{data.quantity} PCS</Text>
            <Text style={[styles.tableCell, styles.colUnit]}>{fmt(data.unitPrice)}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>{fmt(data.subtotal)}</Text>
          </View>
        </View>

        {/* Quantity Discount Applied */}
        <View style={styles.discountBox}>
          <Text style={styles.discountTitle}>Quantity Discount Applied: {data.appliedTierName}</Text>
          <Text style={styles.discountLine}>
            Standard Price: {fmt(data.standardPrice)}/PCS   •   Applied Price: {fmt(data.unitPrice)}/PCS
            {data.standardPrice > data.unitPrice
              ? `   •   You save ${fmt(data.standardPrice - data.unitPrice)}/PCS`
              : ""}
          </Text>
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Product Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(data.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GST ({gstPct}%)</Text>
              <Text style={styles.totalValue}>{fmt(data.gstAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping Charge</Text>
              <Text style={styles.totalValue}>
                {data.courierCharge > 0 ? fmt(data.courierCharge) : "FREE"}
              </Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandValue}>{fmt(data.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>Terms &amp; Conditions</Text>
          <Text style={styles.termsText}>
            • This quotation is valid for 30 days from the date of issue.
            {"\n"}• Prices are exclusive of GST. GST of {gstPct}% is applied as shown above.
            {"\n"}• Shipping charges are estimates and may vary by delivery pincode. Final charges are confirmed at checkout.
            {"\n"}• This is an indicative quotation, not an invoice. The final amount is confirmed at checkout.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

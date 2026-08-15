import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export type InvoicePDFItem = {
  id: string;
  productName: string;
  hsnCode?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type InvoicePDFData = {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: Date;

  sellerName: string;
  sellerGstin: string;
  sellerAddress: string;
  sellerState: string;

  buyerName: string;
  buyerEmail: string;
  buyerGstin?: string | null;
  shippingAddress: string;
  buyerState: string;

  paymentMethod?: string | null;
  paymentId?: string | null;

  items: InvoicePDFItem[];

  isSameState: boolean;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGST: number;
  shippingValue: number;
  grandTotal: number;
  amountInWords: string;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1F2937",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 3,
    borderBottomColor: "#10B981",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
    color: "#10B981",
  },
  brandSub: {
    fontSize: 8,
    color: "#6B6E73",
    marginTop: 2,
  },
  docTitleWrap: {
    alignItems: "flex-end",
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  docNumber: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 2,
  },
  paidBadge: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  boxTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#6B6E73",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  boxText: {
    fontSize: 8.5,
    color: "#1F2937",
    lineHeight: 1.4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
  },
  tableHeadCell: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#FFFFFF",
    padding: 6,
    textTransform: "uppercase",
  },
  tableCell: {
    fontSize: 8.5,
    padding: 6,
    color: "#111827",
  },
  colNo: { width: "6%", textAlign: "center" },
  colItem: { width: "44%" },
  colHsn: { width: "12%", textAlign: "center" },
  colQty: { width: "8%", textAlign: "center" },
  colRate: { width: "14%", textAlign: "right" },
  colTotal: { width: "16%", textAlign: "right" },

  totalsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  amountWordsBox: {
    flex: 1,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 8.5,
    color: "#6B6E73",
  },
  totalValue: {
    fontSize: 8.5,
    color: "#111827",
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    backgroundColor: "#10B981",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  grandLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  grandValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  signSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 7.5,
    color: "#6B6E73",
    lineHeight: 1.4,
  },
  stampBox: {
    alignItems: "center",
  },
  stampText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 20,
  },
});

const fmt = (n: number) =>
  "Rs " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  return (
    <Document
      title={`TAX INVOICE — ${data.invoiceNumber}`}
      author="DIGITALWORLD"
      subject="GST Tax Invoice"
      creator="DIGITALWORLD"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>DIGITALWORLD</Text>
            <Text style={styles.brandSub}>Industrial Fire Tech • GST Registered</Text>
          </View>
          <View style={styles.docTitleWrap}>
            <Text style={styles.docTitle}>TAX INVOICE</Text>
            <Text style={styles.docNumber}>{data.invoiceNumber}</Text>
            <Text style={styles.paidBadge}>✓ PAYMENT RECEIVED (PAID)</Text>
          </View>
        </View>

        {/* Addresses & Invoice Details Grid */}
        <View style={styles.grid}>
          {/* Seller Box */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Seller / Billed From</Text>
            <Text style={[styles.boxText, { fontWeight: "bold" }]}>{data.sellerName}</Text>
            <Text style={styles.boxText}>{data.sellerAddress}</Text>
            <Text style={styles.boxText}>State: {data.sellerState}</Text>
            <Text style={[styles.boxText, { fontWeight: "bold", marginTop: 4 }]}>
              GSTIN: {data.sellerGstin}
            </Text>
          </View>

          {/* Buyer Box */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Billed To / Shipping Address</Text>
            <Text style={[styles.boxText, { fontWeight: "bold" }]}>{data.buyerName}</Text>
            <Text style={styles.boxText}>{data.shippingAddress}</Text>
            <Text style={styles.boxText}>State: {data.buyerState}</Text>
            <Text style={styles.boxText}>Email: {data.buyerEmail}</Text>
            {data.buyerGstin && (
              <Text style={[styles.boxText, { fontWeight: "bold", marginTop: 2 }]}>
                GSTIN: {data.buyerGstin}
              </Text>
            )}
          </View>

          {/* Metadata Box */}
          <View style={[styles.box, { flex: 0.8 }]}>
            <Text style={styles.boxTitle}>Invoice Details</Text>
            <Text style={styles.boxText}>
              <Text style={{ fontWeight: "bold" }}>Date: </Text>
              {data.issuedAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.boxText}>
              <Text style={{ fontWeight: "bold" }}>Order #: </Text>
              {data.orderNumber}
            </Text>
            {data.paymentMethod && (
              <Text style={styles.boxText}>
                <Text style={{ fontWeight: "bold" }}>Payment: </Text>
                {data.paymentMethod.toUpperCase()}
              </Text>
            )}
            {data.paymentId && (
              <Text style={{ fontSize: 7, color: "#6B6E73", marginTop: 2 }}>
                Txn ID: {data.paymentId}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeadCell, styles.colNo]}>#</Text>
            <Text style={[styles.tableHeadCell, styles.colItem]}>Item Description</Text>
            <Text style={[styles.tableHeadCell, styles.colHsn]}>HSN/SAC</Text>
            <Text style={[styles.tableHeadCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeadCell, styles.colRate]}>Unit Price</Text>
            <Text style={[styles.tableHeadCell, styles.colTotal]}>Taxable Value</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo]}>{idx + 1}</Text>
              <Text style={[styles.tableCell, styles.colItem]}>{item.productName}</Text>
              <Text style={[styles.tableCell, styles.colHsn]}>{item.hsnCode || "8424"}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{fmt(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals & Tax Breakdown */}
        <View style={styles.totalsWrap}>
          {/* Amount in words */}
          <View style={styles.amountWordsBox}>
            <Text style={styles.boxTitle}>Amount Chargeable (in words)</Text>
            <Text style={[styles.boxText, { fontWeight: "bold", fontSize: 9 }]}>
              {data.amountInWords}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#6B6E73", marginTop: 8 }}>
              • Place of Supply: {data.buyerState}
              {"\n"}• Tax Code: {data.isSameState ? "CGST + SGST (Intra-State)" : "IGST (Inter-State)"}
            </Text>
          </View>

          {/* Totals Breakdown */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Taxable Amount</Text>
              <Text style={styles.totalValue}>{fmt(data.taxableValue)}</Text>
            </View>

            {data.isSameState ? (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST ({Math.round(data.cgstRate * 100)}%)</Text>
                  <Text style={styles.totalValue}>{fmt(data.cgstAmount)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST ({Math.round(data.sgstRate * 100)}%)</Text>
                  <Text style={styles.totalValue}>{fmt(data.sgstAmount)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST ({Math.round(data.igstRate * 100)}%)</Text>
                <Text style={styles.totalValue}>{fmt(data.igstAmount)}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping / Courier</Text>
              <Text style={styles.totalValue}>
                {data.shippingValue > 0 ? fmt(data.shippingValue) : "FREE"}
              </Text>
            </View>

            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL INVOICE AMOUNT</Text>
              <Text style={styles.grandValue}>{fmt(data.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Footer & Authorized Signatory */}
        <View style={styles.signSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerText}>
              This is a computer-generated GST Tax Invoice. No signature required.
              {"\n"}Thank you for doing business with DIGITALWORLD Industrial Fire Tech!
            </Text>
          </View>
          <View style={styles.stampBox}>
            <Text style={{ fontSize: 8, color: "#6B6E73" }}>For DIGITALWORLD Industrial Fire Tech</Text>
            <Text style={styles.stampText}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

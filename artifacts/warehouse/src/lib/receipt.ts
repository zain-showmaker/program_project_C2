import jsPDF from "jspdf";

export interface ReceiptLine {
  category: string;
  model: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  receiptNumber: string;
  soldAt: string | Date;
  customerName?: string | null;
  lines: ReceiptLine[];
}

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function downloadReceipt(data: ReceiptData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text("PC Warehouse Pro", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Sales Receipt", pageW - margin, y, { align: "right" });
  y += 28;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Receipt #`, margin, y);
  doc.text(`Date`, margin + 220, y);
  if (data.customerName) doc.text(`Customer`, margin + 380, y);
  y += 14;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(data.receiptNumber, margin, y);
  doc.text(new Date(data.soldAt).toLocaleString(), margin + 220, y);
  if (data.customerName) doc.text(data.customerName, margin + 380, y);
  doc.setFont("helvetica", "normal");
  y += 30;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y - 14, pageW - margin * 2, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("ITEM", margin + 8, y);
  doc.text("CATEGORY", margin + 270, y);
  doc.text("QTY", margin + 360, y);
  doc.text("UNIT", margin + 410, y);
  doc.text("TOTAL", pageW - margin - 8, y, { align: "right" });
  y += 22;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);

  let subtotal = 0;
  for (const line of data.lines) {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    const modelLines = doc.splitTextToSize(line.model, 240) as string[];
    doc.text(modelLines, margin + 8, y);
    doc.text(line.category, margin + 270, y);
    doc.text(String(line.quantity), margin + 360, y);
    doc.text(fmt(line.unitPrice), margin + 410, y);
    doc.text(fmt(line.total), pageW - margin - 8, y, { align: "right" });
    subtotal += line.total;
    y += Math.max(18, modelLines.length * 14);
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y - 4, pageW - margin, y - 4);
  }

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", pageW - margin - 120, y);
  doc.text(fmt(subtotal), pageW - margin - 8, y, { align: "right" });

  y += 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for your business.", margin, y);

  doc.save(`receipt-${data.receiptNumber}.pdf`);
}

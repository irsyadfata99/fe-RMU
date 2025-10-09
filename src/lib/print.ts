// src/lib/print.ts

/**
 * Print invoice (Dot Matrix for KREDIT)
 */
export function printInvoice(invoiceUrl: string) {
  const printWindow = window.open(invoiceUrl, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Print thermal receipt (for TUNAI)
 */
export function printThermalReceipt(receiptUrl: string) {
  const printWindow = window.open(receiptUrl, "_blank");
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Generate print-friendly HTML
 */
export function generatePrintHTML(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}

/**
 * Open print dialog
 */
export function openPrintDialog() {
  window.print();
}

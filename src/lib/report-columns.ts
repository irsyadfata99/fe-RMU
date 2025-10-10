// src/lib/report-columns.ts
/**
 * Reusable column configurations for common report fields
 * These are plain objects that can be spread into your columns array
 */

export const commonColumns = {
  // Transaction columns
  invoiceNumber: {
    key: "invoiceNumber",
    header: "No. Faktur",
    width: "150px",
  },

  date: {
    key: "date",
    header: "Tanggal",
    width: "110px",
  },

  transactionDate: {
    key: "transactionDate",
    header: "Tanggal",
    width: "150px",
  },

  // Amount columns
  totalAmount: {
    key: "totalAmount",
    header: "Total",
    format: "currency" as const,
    align: "right" as const,
    width: "150px",
  },

  paidAmount: {
    key: "paidAmount",
    header: "Dibayar",
    format: "currency" as const,
    align: "right" as const,
    width: "140px",
  },

  remainingDebt: {
    key: "remainingDebt",
    header: "Sisa",
    format: "currency" as const,
    align: "right" as const,
    width: "130px",
  },

  // Status columns
  status: {
    key: "status",
    header: "Status",
    format: "badge" as const,
    width: "110px",
  },

  paymentStatus: {
    key: "paymentStatus",
    header: "Status Bayar",
    format: "badge" as const,
    width: "120px",
  },

  // Quantity columns
  quantity: {
    key: "quantity",
    header: "Qty",
    format: "number" as const,
    align: "center" as const,
    width: "80px",
  },

  totalQuantity: {
    key: "totalQuantity",
    header: "Terjual",
    format: "number" as const,
    align: "center" as const,
    width: "100px",
  },

  // Count columns
  totalTransactions: {
    key: "totalTransactions",
    header: "Transaksi",
    format: "number" as const,
    align: "center" as const,
    width: "100px",
  },

  // Person columns
  supplierName: {
    key: "supplierName",
    header: "Supplier",
    width: "200px",
  },

  memberName: {
    key: "memberName",
    header: "Member",
    width: "180px",
  },

  fullName: {
    key: "fullName",
    header: "Nama",
    width: "200px",
  },

  // Product columns
  productName: {
    key: "productName",
    header: "Nama Produk",
    width: "250px",
  },

  sku: {
    key: "sku",
    header: "SKU",
    width: "120px",
  },

  category: {
    key: "category",
    header: "Kategori",
    width: "150px",
  },

  // Other common columns
  description: {
    key: "description",
    header: "Deskripsi",
    width: "250px",
  },

  notes: {
    key: "notes",
    header: "Catatan",
    width: "200px",
  },
};

/**
 * Helper function to calculate statistics from numeric field
 *
 * @example
 * const stats = calculateStats(data, 'totalAmount');
 * console.log(stats.total, stats.count, stats.average);
 */
export function calculateStats<T extends Record<string, number>>(
  data: T[],
  field: keyof T
) {
  if (!data || data.length === 0) {
    return { total: 0, count: 0, average: 0 };
  }

  const total = data.reduce((sum, item) => sum + (item[field] || 0), 0);

  return {
    total,
    count: data.length,
    average: total / data.length,
  };
}

/**
 * Helper to create rank column (for top-N reports)
 */
export const rankColumn = {
  key: "rank",
  header: "#",
  width: "60px",
  align: "center" as const,
};

/**
 * Helper to create ID columns
 */
export const idColumns = {
  uniqueId: {
    key: "uniqueId",
    header: "ID",
    width: "120px",
  },

  memberCode: {
    key: "memberCode",
    header: "ID Member",
    width: "120px",
  },
};

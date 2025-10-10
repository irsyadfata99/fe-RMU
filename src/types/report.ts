// src/types/report.ts
// Complete type definitions for all reports

// ============================================
// GENERIC TYPES
// ============================================

export interface ReportFilters {
  page?: number;
  limit?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReportResponse<T> {
  success: boolean;
  message: string;
  data:
    | T[]
    | {
        data: T[];
        pagination: ReportPagination;
      };
}

// ============================================
// DASHBOARD SUMMARY
// ============================================

export interface DashboardSummary {
  sales: {
    totalTransactions: number;
    totalRevenue: number;
    tunaiRevenue: number;
    kreditRevenue: number;
  };
  purchases: {
    totalPurchases: number;
    totalSpending: number;
  };
  debts: {
    totalDebt: number;
    pendingCount: number;
  };
  receivables: {
    totalReceivable: number;
    pendingCount: number;
  };
  points: {
    totalEarned: number;
    totalRedeemed: number;
    totalExpired: number;
  };
  products: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
  };
  members: {
    totalMembers: number;
    activeMembers: number;
    totalPoints: number;
  };
  returns: {
    purchaseReturns: number;
    salesReturns: number;
    totalReturns: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

// ============================================
// BARANG RETURN
// ============================================

export interface ReturnReport {
  type: "Purchase Return" | "Sales Return";
  returnNumber: string;
  returnDate: string;
  referenceNumber: string;
  supplierCode?: string;
  supplierName?: string;
  memberCode?: string;
  memberName?: string;
  totalAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  refundMethod?: string;
  itemCount: number;
}

export interface ReturnFilters extends ReportFilters {
  type?: "purchase" | "sales";
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

// ============================================
// BARANG PALING LAKU
// ============================================

export interface BestSellingReport {
  rank: number;
  sku: string;
  productName: string;
  category: string;
  unit: string;
  sellingPrice: number;
  totalQuantity: number;
  totalTransactions: number;
  totalRevenue: number;
  avgPerTransaction: number;
}

export interface BestSellingFilters extends ReportFilters {
  categoryId?: string;
}

// ============================================
// TRANSAKSI HARIAN
// ============================================

export interface DailyTransactionReport {
  date: string;
  dayName: string;
  totalTransactions: number;
  totalRevenue: number;
  tunaiCount: number;
  tunaiRevenue: number;
  kreditCount: number;
  kreditRevenue: number;
  avgPerTransaction: number;
}

// ============================================
// TRANSAKSI BULANAN
// ============================================

export interface MonthlyTransactionReport {
  month: number;
  monthName: string;
  year: number;
  totalTransactions: number;
  totalRevenue: number;
  tunaiCount: number;
  kreditCount: number;
  avgPerTransaction: number;
}

export interface MonthlyFilters
  extends Omit<ReportFilters, "startDate" | "endDate"> {
  year?: number;
}

// ============================================
// TRANSAKSI PER MEMBER
// ============================================

export interface MemberTransactionReport {
  uniqueId: string;
  fullName: string;
  regionCode: string;
  regionName: string;
  whatsapp: string;
  totalTransactions: number;
  totalSpending: number;
  totalDebt: number;
  totalPoints: number;
  isActive: string;
  avgPerTransaction: number;
}

export interface MemberTransactionFilters extends ReportFilters {
  regionCode?: string;
}

// ============================================
// JENIS PEMBELIAN
// ============================================

export interface PurchaseReport {
  invoiceNumber: string;
  purchaseDate: string;
  supplierCode: string;
  supplierName: string;
  purchaseType: "TUNAI" | "KREDIT" | "KONSINYASI";
  totalAmount: number;
  paidAmount: number;
  remainingDebt: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
  dueDate: string;
  inputBy: string;
}

export interface PurchaseFilters extends ReportFilters {
  purchaseType?: "TUNAI" | "KREDIT" | "KONSINYASI";
  supplierId?: string;
}

// ============================================
// HUTANG SUPPLIER
// ============================================

export interface SupplierDebtReport {
  invoiceNumber: string;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "PENDING" | "PARTIAL" | "PAID";
  isOverdue: string;
  daysOverdue: number;
  paymentProgress: number;
}

export interface DebtFilters extends ReportFilters {
  status?: "PENDING" | "PARTIAL" | "PAID";
  overdue?: boolean;
  supplierId?: string;
}

// ============================================
// PIUTANG MEMBER
// ============================================

export interface MemberDebtReport {
  invoiceNumber: string;
  memberCode: string;
  memberName: string;
  regionCode: string;
  regionName: string;
  whatsapp: string;
  address: string;
  saleDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "PENDING" | "PARTIAL" | "PAID";
  isOverdue: string;
  daysOverdue: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  paymentProgress: number;
}

export interface ReceivableFilters extends ReportFilters {
  status?: "PENDING" | "PARTIAL" | "PAID";
  overdue?: boolean;
  memberId?: string;
  regionCode?: string;
}

// ============================================
// BONUS POINT
// ============================================

export interface PointReport {
  transactionDate: string;
  memberCode: string;
  memberName: string;
  regionName: string;
  type: "EARN" | "REDEEM" | "ADJUSTMENT" | "EXPIRED";
  points: number;
  pointsBefore: number;
  pointsAfter: number;
  currentPoints: number;
  description: string;
  invoiceNumber: string;
  transactionAmount: number;
  expiryDate: string;
  daysUntilExpiry: string;
  isExpired: string;
}

export interface PointFilters extends ReportFilters {
  memberId?: string;
  regionCode?: string;
  type?: "EARN" | "REDEEM" | "ADJUSTMENT" | "EXPIRED";
}

// ============================================
// EXPORT TYPES
// ============================================

export type ExportFilters = Omit<ReportFilters, "page" | "limit">;

export interface ExportOptions {
  filename?: string;
  format?: "xlsx" | "csv";
}

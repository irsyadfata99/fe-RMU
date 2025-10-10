// src/types/debt.ts
// Types untuk Hutang Supplier & Piutang Member

// ============================================
// SUPPLIER DEBT (Hutang ke Supplier)
// ============================================

export interface SupplierDebt {
  id: string;
  supplierId: string;
  purchaseId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields (dari backend)
  isOverdue?: boolean;
  daysOverdue?: number;
  paymentPercentage?: string;
  // Relations
  supplier?: {
    id: string;
    code: string;
    name: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
  };
  purchase?: {
    id: string;
    invoiceNumber: string;
    purchaseDate: string;
    totalAmount: number;
  };
}

export interface SupplierDebtSummary {
  supplier: {
    id: string;
    code: string;
    name: string;
    totalDebt: number;
  };
  debts: SupplierDebt[];
  summary: {
    totalDebts: number;
    totalAmount: number;
    overdueDebts: number;
  };
}

export interface PaySupplierDebtRequest {
  amount: number;
  paymentMethod?: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";
  notes?: string;
}

export interface SupplierDebtStats {
  total: string;
  overdue: number;
}

// ============================================
// MEMBER DEBT (Piutang dari Member)
// ============================================

export interface DebtPayment {
  id: string;
  memberDebtId: string;
  memberId: string;
  userId: string;
  amount: number;
  paymentMethod: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDebt {
  id: string;
  memberId: string;
  saleId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields (dari backend)
  isOverdue?: boolean;
  daysOverdue?: number;
  paymentPercentage?: string;
  // Relations
  member?: {
    id: string;
    uniqueId: string;
    fullName: string;
    whatsapp?: string;
    regionCode: string;
    regionName: string;
  };
  sale?: {
    id: string;
    invoiceNumber: string;
    saleDate: string;
    finalAmount: number;
  };
  payments?: DebtPayment[];
}

export interface MemberDebtSummary {
  member: {
    id: string;
    uniqueId: string;
    fullName: string;
    totalDebt: number;
  };
  debts: MemberDebt[];
  summary: {
    totalDebts: number;
    totalAmount: number;
    overdueDebts: number;
  };
}

export interface PayMemberDebtRequest {
  amount: number;
  paymentMethod?: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT";
  notes?: string;
}

export interface PayMemberDebtResponse {
  payment: DebtPayment;
  debt: MemberDebt;
}

export interface MemberDebtStats {
  total: string;
  overdue: number;
}

// ============================================
// DEBT STATISTICS (Combined)
// ============================================

export interface DebtStats {
  memberDebts: MemberDebtStats;
  supplierDebts: SupplierDebtStats;
}

// ============================================
// DEBT FILTERS
// ============================================

export interface DebtFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  overdue?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Specific to member debts
  memberId?: string;
  regionCode?: string;
  // Specific to supplier debts
  supplierId?: string;
}

// ============================================
// EXPORT FILTERS (untuk Excel export)
// ============================================

export type DebtExportFilters = Omit<DebtFilters, "page" | "limit">;

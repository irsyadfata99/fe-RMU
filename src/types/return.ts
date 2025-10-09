import { Product, Supplier, Member, User } from "./index";
// ============================================
// ENUMS & TYPES
// ============================================
export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RefundMethod = "CASH" | "DEBT_DEDUCTION" | "STORE_CREDIT";
// ============================================
// PURCHASE RETURN TYPES
// ============================================
export interface PurchaseReturnItem {
  id: string;
  purchaseReturnId: string;
  productId: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  product?: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };
}
export interface PurchaseReturn {
  id: string;
  purchaseId: string;
  supplierId: string;
  userId: string;
  returnNumber: string;
  returnDate: string;
  totalAmount: number;
  reason: string;
  status: ReturnStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  items?: PurchaseReturnItem[];
  supplier?: {
    id: string;
    code: string;
    name: string;
    phone?: string;
    address?: string;
  };
  purchase?: {
    id: string;
    invoiceNumber: string;
    purchaseDate: string;
  };
  user?: {
    id: string;
    name: string;
    username: string;
  };
}
export interface CreatePurchaseReturnRequest {
  purchaseId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  reason: string;
  notes?: string;
}
// ============================================
// SALES RETURN TYPES
// ============================================
export interface SalesReturnItem {
  id: string;
  salesReturnId: string;
  productId: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  // Relations
  product?: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };
}
export interface SalesReturn {
  id: string;
  saleId: string;
  memberId?: string;
  userId: string;
  returnNumber: string;
  returnDate: string;
  totalAmount: number;
  reason: string;
  status: ReturnStatus;
  refundMethod: RefundMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  items?: SalesReturnItem[];
  member?: {
    id: string;
    uniqueId: string;
    fullName: string;
    whatsapp: string;
  };
  sale?: {
    id: string;
    invoiceNumber: string;
    saleDate: string;
    saleType: "TUNAI" | "KREDIT";
  };
  user?: {
    id: string;
    name: string;
    username: string;
  };
}
export interface CreateSalesReturnRequest {
  saleId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  reason: string;
  refundMethod?: RefundMethod;
  notes?: string;
}
// ============================================
// RETURN STATISTICS
// ============================================
export interface ReturnStats {
  purchaseReturns: {
    total: number;
    pending: number;
    totalAmount: string;
  };
  salesReturns: {
    total: number;
    pending: number;
    totalAmount: string;
  };
}
// ============================================
// FILTER & QUERY PARAMS
// ============================================
export interface ReturnQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReturnStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
export interface PurchaseReturnQueryParams extends ReturnQueryParams {
  supplierId?: string;
}
export interface SalesReturnQueryParams extends ReturnQueryParams {
  memberId?: string;
}
// ============================================
// APPROVAL/REJECTION
// ============================================
export interface ApproveReturnRequest {
  notes?: string;
}
export interface RejectReturnRequest {
  notes: string;
}

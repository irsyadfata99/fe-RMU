// src/types/index.ts
import type { ColumnDef } from "@tanstack/react-table";

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  ADMIN = "ADMIN",
  KASIR = "KASIR",
}

export enum Gender {
  MALE = "Laki-laki",
  FEMALE = "Perempuan",
}

export enum TransactionType {
  CASH = "CASH",
  CREDIT = "CREDIT",
}

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
}

// REMOVED OLD DUPLICATE StockMovementType - using the one below instead

export enum ProductType {
  CASH = "Tunai",
  INSTALLMENT = "Beli Putus",
  CONSIGNMENT = "Konsinyasi",
}

export type PurchaseType = "TUNAI" | "KREDIT" | "KONSINYASI";

export enum StockStatus {
  NORMAL = "Normal",
  LOW = "Hampir Habis",
  OVER = "Over Stock",
  EMPTY = "Habis",
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export type StockMovementType =
  | "IN"
  | "OUT"
  | "ADJUSTMENT"
  | "RETURN_IN"
  | "RETURN_OUT";

export type StockReferenceType = "PURCHASE" | "SALE" | "ADJUSTMENT" | "RETURN";

export type AdjustmentType =
  | "DAMAGED"
  | "EXPIRED"
  | "LOST"
  | "LEAKED"
  | "REPACK"
  | "FOUND"
  | "OTHER";

export type AdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED";
// ============================================
// REGION & CONSTANTS
// ============================================

export interface Region {
  code: string;
  name: string;
}

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ============================================
// MEMBER (ANGGOTA)
// ============================================

export interface Member {
  id: string;
  uniqueId: string;
  nik: string;
  fullName: string;
  address: string;
  regionCode: string;
  regionName: string;
  whatsapp: string;
  gender: Gender;
  totalDebt: number;
  totalTransactions: number;
  monthlySpending: number;
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRegistration {
  nik: string;
  fullName: string;
  address: string;
  regionCode: string;
  whatsapp: string;
  gender: Gender;
}

export interface MemberSearchResult {
  member: Member;
}

// ============================================
// CATEGORY
// ============================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SUPPLIER
// ============================================

export interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  totalDebt: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PRODUCT (BARANG)
// ============================================

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  supplierId: string;
  productType: ProductType;
  purchaseType: PurchaseType;
  invoiceNo?: string;
  expiryDate?: string;
  description?: string;
  purchasePrice: number;
  sellingPriceGeneral: number;
  sellingPriceMember: number;
  sellingPrice: number; // Alias untuk compatibility
  points: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  stockStatus: StockStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Nested objects (dari JOIN backend)
  category?: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
    code: string;
  };
  // Alternative flat properties
  categoryName?: string;
  supplierName?: string;
}

export interface CreateProductRequest {
  barcode: string;
  name: string;
  categoryId: string;
  supplierId: string;
  productType: ProductType;
  purchaseType: PurchaseType;
  invoiceNo?: string;
  expiryDate?: string;
  description?: string;
  purchasePrice: number;
  sellingPriceGeneral: number;
  sellingPriceMember: number;
  points: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// ============================================
// TRANSACTION (TRANSAKSI)
// ============================================

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  memberId?: string;
  saleDate: string; // ✅ Backend: saleDate
  saleType: "TUNAI" | "KREDIT"; // ✅ Backend: TUNAI/KREDIT
  totalAmount: number;
  discountAmount: number;
  finalAmount: number; // ✅ Backend: finalAmount (bukan total)
  dpAmount: number;
  remainingDebt: number;
  paymentReceived: number;
  changeAmount: number;
  dueDate?: string;
  status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
  notes?: string;
  items: TransactionItem[]; // ✅ Dari include
  member?: {
    // ✅ Dari include
    id: string;
    uniqueId: string;
    fullName: string;
  };
  user?: {
    // ✅ Dari include
    id: string;
    name: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  memberId?: string;
  transactionType: TransactionType;
  items: {
    productId: string;
    quantity: number;
  }[];
  discount?: number;
  paidAmount?: number;
  notes?: string;
}

// ============================================
// RECEIVABLE (PIUTANG) - Member ke Koperasi
// ============================================

export interface Receivable {
  id: string;
  transactionId: string;
  memberId: string;
  memberName: string;
  memberUniqueId: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivablePayment {
  receivableId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}

// ============================================
// PAYABLE (HUTANG) - Koperasi ke Supplier
// ============================================

export interface Payable {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayablePayment {
  payableId: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}

// ============================================
// STOCK MOVEMENT & ADJUSTMENT
// ============================================

export interface StockMovementRecord {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: StockReferenceType;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface StockAdjustmentRecord {
  id: string;
  productId: string;
  userId: string;
  adjustmentNumber: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  adjustmentDate: string;
  notes?: string;
  approvedBy?: string;
  status: AdjustmentStatus;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    stock: number;
  };
  user?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
}

export interface CreateAdjustmentRequest {
  productId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalMovements: number;
  pendingAdjustments: number;
}

// Aliases for backward compatibility
export type StockMovement = StockMovementRecord;
export type StockAdjustment = StockAdjustmentRecord;

// ============================================
// RETURN (RETUR BARANG)
// ============================================

export interface ProductReturn {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface SupplierReturn {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STOCK OPNAME
// ============================================

export interface StockOpname {
  id: string;
  productId: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// ============================================
// POINTS
// ============================================

export interface PointSetting {
  id: string;
  minPurchase: number;
  pointsPerAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointHistory {
  id: string;
  memberId: string;
  memberName: string;
  transactionId: string;
  points: number;
  type: "EARNED" | "REDEEMED";
  description: string;
  createdAt: string;
}

// ============================================
// CREDIT SETTINGS
// ============================================

export interface CreditSetting {
  id: string;
  maxCreditLimit: number;
  maxCreditDays: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export interface DashboardMetrics {
  todayTransactions: number;
  todayRevenue: number;
  todayReceivables: number;
  todayPayables: number;
  fastMovingStock: number;
  slowMovingStock: number;
  overStock: number;
  lowStock: number;
}

// ============================================
// REPORTS
// ============================================

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  productId?: string;
  categoryId?: string;
  supplierId?: string;
}

export interface DailyReport {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  cashTransactions: number;
  creditTransactions: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface MemberReport {
  memberId: string;
  memberName: string;
  memberUniqueId: string;
  totalTransactions: number;
  totalSpending: number;
  totalDebt: number;
  totalPoints: number;
}

export interface BestSellerReport {
  productId: string;
  productName: string;
  categoryName: string;
  totalSold: number;
  totalRevenue: number;
}

// ============================================
// USER LOGS (ACTIVITY)
// ============================================

export interface UserLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}

// ============================================
// PURCHASE (PEMBELIAN / BARANG MASUK)
// ============================================

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string; // Dari JOIN
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  expDate?: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  userId: string;
  invoiceNumber: string;
  purchaseDate: string;
  purchaseType: PurchaseType;
  totalAmount: number;
  paidAmount: number;
  remainingDebt: number;
  dueDate?: string;
  status: PurchaseStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  items?: PurchaseItem[];
  supplier?: {
    id: string;
    code: string;
    name: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
  };
  debt?: {
    id: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  };
}

export interface CreatePurchaseRequest {
  supplierId: string;
  supplierInvoiceNumber?: string;
  purchaseType: PurchaseType;
  items: {
    productId: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    expDate?: string;
  }[];
  paidAmount?: number;
  dueDate?: string;
  notes?: string;
}

export interface PurchaseStats {
  totalPurchases: number;
  totalSpending: string;
  tunaiPurchases: number;
  kreditPurchases: number;
  konsinyasiPurchases: number;
  pendingDebts: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// TABLE & FORM TYPES
// ============================================

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: string;
  isLoading?: boolean;
  pagination?: boolean;
}

export interface FormFieldError {
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

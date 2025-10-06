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

export enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  RETURN = "RETURN",
  ADJUSTMENT = "ADJUSTMENT",
}

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
  uniqueId: string; // BDG-001
  nik: string;
  fullName: string;
  address: string;
  regionCode: string;
  regionName: string;
  whatsapp: string;
  gender: Gender;
  totalDebt: number; // Total hutang ke koperasi
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
  name: string;
  address: string;
  phone: string;
  email?: string;
  totalDebt: number; // Total hutang koperasi ke supplier
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
  name: string;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  purchasePrice: number; // Harga beli
  sellingPrice: number; // Harga jual
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string; // pcs, kg, liter, dll
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TRANSACTION (TRANSAKSI)
// ============================================

export interface TransactionItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Harga saat transaksi
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  memberId?: string;
  memberName?: string;
  memberUniqueId?: string;
  cashierId: string;
  cashierName: string;
  transactionType: TransactionType;
  paymentStatus: PaymentStatus;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  pointsEarned: number;
  notes?: string;
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
// STOCK MOVEMENT
// ============================================

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

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
  minPurchase: number; // Minimal pembelian untuk dapat poin
  pointsPerAmount: number; // Poin per jumlah rupiah
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
  maxCreditLimit: number; // Limit kredit maksimal per member
  maxCreditDays: number; // Maksimal hari kredit
  interestRate: number; // Bunga per bulan (%)
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
  columns: ColumnDef<T>[]; // Ganti any dengan ColumnDef<T>
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

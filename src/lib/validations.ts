// src/lib/validations.ts
import { z } from "zod";
import { Gender, TransactionType, UserRole } from "@/types";
import { ProductType, PurchaseType } from "@/types";

// ============================================
// MEMBER VALIDATIONS
// ============================================

export const memberRegistrationSchema = z.object({
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit").regex(/^\d+$/, "NIK hanya boleh angka"),
  fullName: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter").max(255, "Alamat maksimal 255 karakter"),
  regionCode: z.string().min(1, "Pilih wilayah"),
  whatsapp: z.string().regex(/^08\d{8,11}$/, "Format nomor WhatsApp tidak valid (contoh: 081234567890)"),
  gender: z.nativeEnum(Gender, {
    message: "Pilih jenis kelamin",
  }),
});

export type MemberRegistrationForm = z.infer<typeof memberRegistrationSchema>;

// ============================================
// AUTH VALIDATIONS
// ============================================

export const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginForm = z.infer<typeof loginSchema>;

// ============================================
// PRODUCT VALIDATIONS
// ============================================

export const productSchema = z.object({
  // Kolom Kiri
  categoryId: z.string().min(1, "Pilih kategori"),
  name: z.string().min(3, "Nama barang minimal 3 karakter").max(100, "Nama barang maksimal 100 karakter"),
  productType: z.nativeEnum(ProductType, { message: "Pilih jenis barang" }),
  expiryDate: z.string().optional(),
  minStock: z.number().min(0, "Stok minimum tidak boleh negatif"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional(),
  sellingPriceGeneral: z.number().min(0, "Harga jual umum harus lebih dari 0"),
  sellingPriceMember: z.number().min(0, "Harga jual anggota harus lebih dari 0"),
  points: z.number().min(0, "Point tidak boleh negatif"),
  unit: z.string().min(1, "Satuan harus diisi"),

  // Kolom Kanan
  supplierId: z.string().min(1, "Pilih supplier"),
  barcode: z.string().min(3, "Barcode minimal 3 karakter").max(50, "Barcode maksimal 50 karakter"),
  purchaseType: z.nativeEnum(PurchaseType, { message: "Pilih jenis pembelian" }),
  invoiceNo: z.string().max(50, "Invoice maksimal 50 karakter").optional(),
  maxStock: z.number().min(0, "Stok maksimum tidak boleh negatif"),
  purchasePrice: z.number().min(0, "Harga beli harus lebih dari 0"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
});

export type ProductForm = z.infer<typeof productSchema>;

// ============================================
// CATEGORY VALIDATIONS
// ============================================

export const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter").max(50, "Nama kategori maksimal 50 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional(),
});

export type CategoryForm = z.infer<typeof categorySchema>;

// ============================================
// SUPPLIER VALIDATIONS
// ============================================

export const supplierSchema = z.object({
  name: z.string().min(3, "Nama supplier minimal 3 karakter").max(100, "Nama supplier maksimal 100 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter").max(255, "Alamat maksimal 255 karakter"),
  phone: z.string().regex(/^08\d{8,11}$/, "Format nomor telepon tidak valid"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
});

export type SupplierForm = z.infer<typeof supplierSchema>;

// ============================================
// TRANSACTION VALIDATIONS
// ============================================

export const transactionItemSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
});

export const transactionSchema = z.object({
  memberId: z.string().optional(),
  transactionType: z.nativeEnum(TransactionType),
  items: z.array(transactionItemSchema).min(1, "Minimal 1 produk"),
  discount: z.number().min(0, "Diskon tidak boleh negatif").optional(),
  paidAmount: z.number().min(0, "Jumlah bayar tidak boleh negatif").optional(),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

export type TransactionForm = z.infer<typeof transactionSchema>;

// ============================================
// USER VALIDATIONS
// ============================================

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().email("Format email tidak valid"),
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.nativeEnum(UserRole),
});

export type UserForm = z.infer<typeof userSchema>;

// ============================================
// PAYMENT VALIDATIONS
// ============================================

export const paymentSchema = z.object({
  amount: z.number().min(1, "Jumlah pembayaran harus lebih dari 0"),
  paymentDate: z.string().min(1, "Tanggal pembayaran harus diisi"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

export type PaymentForm = z.infer<typeof paymentSchema>;

// ============================================
// STOCK OPNAME VALIDATIONS
// ============================================

export const stockOpnameSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  physicalStock: z.number().min(0, "Stok fisik tidak boleh negatif"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

export type StockOpnameForm = z.infer<typeof stockOpnameSchema>;

// ============================================
// RETURN VALIDATIONS
// ============================================

export const returnSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(255, "Alasan maksimal 255 karakter"),
});

export type ReturnForm = z.infer<typeof returnSchema>;

// ============================================
// SETTINGS VALIDATIONS
// ============================================

export const pointSettingSchema = z.object({
  minPurchase: z.number().min(0, "Minimal pembelian tidak boleh negatif"),
  pointsPerAmount: z.number().min(0, "Poin per jumlah tidak boleh negatif"),
});

export type PointSettingForm = z.infer<typeof pointSettingSchema>;

export const creditSettingSchema = z.object({
  maxCreditLimit: z.number().min(0, "Limit kredit tidak boleh negatif"),
  maxCreditDays: z.number().min(1, "Minimal 1 hari"),
  interestRate: z.number().min(0, "Bunga tidak boleh negatif").max(100, "Bunga maksimal 100%"),
});

export type CreditSettingForm = z.infer<typeof creditSettingSchema>;

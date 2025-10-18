// src/lib/validations.ts
import { z } from "zod";
import {
  Gender,
  TransactionType,
  UserRole,
  ProductType,
  // AdjustmentType adalah type union, bukan enum
  type AdjustmentType,
} from "@/types";

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
  categoryId: z.string().min(1, "Pilih kategori"),
  name: z.string().min(3, "Nama produk minimal 3 karakter").max(100, "Nama produk maksimal 100 karakter"),
  productType: z.nativeEnum(ProductType, {
    message: "Pilih jenis produk",
  }),
  expiryDate: z.string().optional(),
  minStock: z.number().min(0, "Stok minimum tidak boleh negatif"),
  maxStock: z.number().min(0, "Stok maksimum tidak boleh negatif").optional(),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
  sellingPriceGeneral: z.number().min(0, "Harga jual umum tidak boleh negatif"),
  sellingPriceMember: z.number().min(0, "Harga jual member tidak boleh negatif"),
  points: z.number().min(0, "Point tidak boleh negatif"),
  unit: z.string().min(1, "Satuan harus diisi").max(20, "Satuan maksimal 20 karakter"),
  supplierId: z.string().min(1, "Pilih supplier").optional(),
  barcode: z.string().max(50, "Barcode maksimal 50 karakter").optional(),
  purchaseType: z.enum(["TUNAI", "KREDIT", "KONSINYASI"], {
    message: "Pilih jenis pembelian",
  }),
  invoiceNo: z.string().max(50, "Nomor invoice maksimal 50 karakter").optional(),
  purchasePrice: z.number().min(0, "Harga beli tidak boleh negatif"),
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
  contactPerson: z.string().min(3, "Nama kontak minimal 3 karakter").max(100, "Nama kontak maksimal 100 karakter").optional().or(z.literal("")),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional().or(z.literal("")),
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
// PURCHASE VALIDATIONS
// ============================================

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  purchasePrice: z.number().min(0, "Harga beli tidak boleh negatif"),
  sellingPrice: z.number().min(0, "Harga jual tidak boleh negatif"),
  expDate: z.string().optional(),
});

export const purchaseSchema = z
  .object({
    supplierId: z.string().min(1, "Pilih supplier"),
    supplierInvoiceNumber: z.string().max(50, "Nomor invoice maksimal 50 karakter").optional(),
    purchaseType: z.enum(["TUNAI", "KREDIT", "KONSINYASI"], {
      message: "Pilih jenis pembelian",
    }),
    items: z.array(purchaseItemSchema).min(1, "Minimal 1 produk harus diisi"),
    paidAmount: z.number().min(0, "Jumlah bayar tidak boleh negatif").optional(),
    dueDate: z.string().optional(),
    notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  })
  .refine(
    (data) => {
      // Jika KREDIT, harus ada dueDate
      if (data.purchaseType === "KREDIT" && !data.dueDate) {
        return false;
      }
      return true;
    },
    {
      message: "Jatuh tempo harus diisi untuk pembelian kredit",
      path: ["dueDate"],
    }
  )
  .refine(
    (data) => {
      // Validasi paidAmount tidak boleh lebih dari total
      if (data.paidAmount) {
        const total = data.items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
        return data.paidAmount <= total;
      }
      return true;
    },
    {
      message: "Pembayaran tidak boleh lebih dari total pembelian",
      path: ["paidAmount"],
    }
  );

export type PurchaseFormData = z.infer<typeof purchaseSchema>;

export const purchasePaymentSchema = z.object({
  amount: z.number().min(1, "Jumlah pembayaran harus lebih dari 0"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

export type PurchasePaymentForm = z.infer<typeof purchasePaymentSchema>;

// ============================================
// STOCK ADJUSTMENT VALIDATIONS
// ============================================

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  // Gunakan z.enum untuk type union, bukan z.nativeEnum
  adjustmentType: z.enum(["DAMAGED", "EXPIRED", "LOST", "LEAKED", "REPACK", "FOUND", "OTHER"], {
    message: "Pilih jenis adjustment",
  }),
  quantity: z
    .number()
    .refine((val) => val !== 0, {
      message: "Jumlah tidak boleh 0",
    })
    .refine((val) => Math.abs(val) >= 1, {
      message: "Jumlah minimal 1",
    }),
  reason: z.string().min(10, "Alasan minimal 10 karakter").max(500, "Alasan maksimal 500 karakter"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

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

// ============================================
// HELPER LABELS
// ============================================

// Helper: Adjustment Type Labels
export const ADJUSTMENT_TYPE_LABELS: Record<AdjustmentType, string> = {
  DAMAGED: "Rusak",
  EXPIRED: "Kadaluarsa",
  LOST: "Hilang",
  LEAKED: "Bocor",
  REPACK: "Packing Ulang",
  FOUND: "Ketemu",
  OTHER: "Lainnya",
};

// Helper: Stock Movement Type Labels
export const STOCK_MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "Masuk",
  OUT: "Keluar",
  ADJUSTMENT: "Penyesuaian",
  RETURN_IN: "Retur Masuk",
  RETURN_OUT: "Retur Keluar",
};

// Helper: Purchase Type Labels
export const PURCHASE_TYPE_LABELS: Record<string, string> = {
  TUNAI: "Tunai",
  KREDIT: "Kredit",
  KONSINYASI: "Konsinyasi",
  Cash: "Cash",
  Hutang: "Hutang",
};

// Helper: Purchase Status Labels
export const PURCHASE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  PARTIAL: "Sebagian",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
};

// src/mocks/data-products.ts
import { Category, Supplier } from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Makanan Ringan",
    description: "Snack, keripik, dan makanan ringan lainnya",
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "cat-2",
    name: "Minuman",
    description: "Minuman kemasan, soft drink, air mineral",
    isActive: true,
    createdAt: "2024-01-16T00:00:00Z",
    updatedAt: "2024-01-16T00:00:00Z",
  },
  {
    id: "cat-3",
    name: "Sembako",
    description: "Beras, gula, minyak, dan kebutuhan pokok",
    isActive: true,
    createdAt: "2024-01-17T00:00:00Z",
    updatedAt: "2024-01-17T00:00:00Z",
  },
  {
    id: "cat-4",
    name: "Mie Instan",
    description: "Berbagai jenis mie instan",
    isActive: true,
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
  {
    id: "cat-5",
    name: "Bumbu Dapur",
    description: "Bumbu masak, rempah, dan penyedap",
    isActive: true,
    createdAt: "2024-01-19T00:00:00Z",
    updatedAt: "2024-01-19T00:00:00Z",
  },
  {
    id: "cat-6",
    name: "Produk Susu",
    description: "Susu, yogurt, keju, dan produk olahan susu",
    isActive: true,
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "cat-7",
    name: "Perawatan Tubuh",
    description: "Sabun, shampo, pasta gigi, dll",
    isActive: true,
    createdAt: "2024-01-21T00:00:00Z",
    updatedAt: "2024-01-21T00:00:00Z",
  },
  {
    id: "cat-8",
    name: "Alat Tulis",
    description: "Pulpen, buku tulis, penggaris, dll",
    isActive: true,
    createdAt: "2024-01-22T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "PT. Indofood Distributor",
    address: "Jl. Industri Raya No. 45, Bandung",
    phone: "0227654321",
    email: "sales@indofood-dist.com",
    totalDebt: 15_500_000,
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "sup-2",
    name: "CV. Berkah Jaya",
    address: "Jl. Raya Cimahi No. 123, Cimahi",
    phone: "0228765432",
    email: "berkah.jaya@gmail.com",
    totalDebt: 8_750_000,
    isActive: true,
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-09-28T00:00:00Z",
  },
  {
    id: "sup-3",
    name: "Toko Grosir Maju Sejahtera",
    address: "Jl. Pasar Baru No. 67, Bandung",
    phone: "0229876543",
    email: "",
    totalDebt: 0,
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-09-30T00:00:00Z",
  },
  {
    id: "sup-4",
    name: "PT. Wings Distributor Bandung",
    address: "Jl. Soekarno Hatta No. 234, Bandung",
    phone: "0221234567",
    email: "wings.bandung@distributor.com",
    totalDebt: 12_300_000,
    isActive: true,
    createdAt: "2024-01-18T00:00:00Z",
    updatedAt: "2024-10-02T00:00:00Z",
  },
  {
    id: "sup-5",
    name: "CV. Sumber Rejeki",
    address: "Jl. Cibaduyut No. 89, Bandung",
    phone: "0223456789",
    email: "sumberrejeki@yahoo.com",
    totalDebt: 5_200_000,
    isActive: true,
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-09-25T00:00:00Z",
  },
  {
    id: "sup-6",
    name: "Toko Grosir Cahaya",
    address: "Jl. Buah Batu No. 156, Bandung",
    phone: "0224567890",
    email: "",
    totalDebt: 0,
    isActive: true,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "sup-7",
    name: "PT. Mayora Distributor",
    address: "Jl. Bypass Cikampek, Purwakarta",
    phone: "0265123456",
    email: "mayora.dist@email.com",
    totalDebt: 0,
    isActive: false,
    createdAt: "2024-02-05T00:00:00Z",
    updatedAt: "2024-08-15T00:00:00Z",
  },
];

export function generateCategoryId(): string {
  const maxId = Math.max(...mockCategories.map((c) => parseInt(c.id.split("-")[1])));
  return `cat-${maxId + 1}`;
}

export function generateSupplierId(): string {
  const maxId = Math.max(...mockSuppliers.map((s) => parseInt(s.id.split("-")[1])));
  return `sup-${maxId + 1}`;
}

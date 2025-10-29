// src/config/navigation.ts
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  PlusCircle,
  List,
  Tag,
  Truck,
  ClipboardList,
  History,
  CreditCard,
  Receipt,
  RotateCcw,
  TrendingUp,
  Calendar,
  UserCog,
  Building,
  Gift,
  Sliders,
  DollarSign,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: string[];
}

export interface NavCategory {
  category: string;
  roles: string[];
  items: NavItem[];
}

export const NAVIGATION: NavCategory[] = [
  {
    category: "BARANG",
    roles: ["ADMIN", "KASIR"],
    items: [
      {
        label: "Daftar Produk",
        href: "/dashboard/barang",
        icon: List,
        roles: ["ADMIN", "KASIR"],
      },
      {
        label: "Tambah Produk",
        href: "/dashboard/barang/tambah",
        icon: PlusCircle,
        roles: ["ADMIN"],
      },
      {
        label: "Kategori",
        href: "/dashboard/barang/kategori",
        icon: Tag,
        roles: ["ADMIN"],
      },
      {
        label: "Supplier",
        href: "/dashboard/barang/supplier",
        icon: Truck,
        roles: ["ADMIN"],
      },
      {
        label: "Stok Opname",
        href: "/dashboard/barang/stok-opname",
        icon: ClipboardList,
        roles: ["ADMIN"],
      },
      {
        label: "Riwayat Stok",
        href: "/dashboard/barang/riwayat-stok",
        icon: History,
        roles: ["ADMIN", "KASIR"],
      },
    ],
  },
  {
    category: "TRANSAKSI",
    roles: ["ADMIN", "KASIR"],
    items: [
      {
        label: "POS / Kasir",
        href: "/dashboard/transaksi/pos",
        icon: ShoppingCart,
        roles: ["ADMIN", "KASIR"],
        badge: "HOT",
      },
      {
        label: "Riwayat Penjualan",
        href: "/dashboard/transaksi/penjualan",
        icon: Receipt,
        roles: ["ADMIN", "KASIR"],
      },
      {
        label: "Piutang Member",
        href: "/dashboard/management/piutang",
        icon: DollarSign,
        roles: ["ADMIN", "KASIR"],
      },
      {
        label: "Input Pembelian",
        href: "/dashboard/transaksi/pembelian",
        icon: Package,
        roles: ["ADMIN"],
      },
      {
        label: "Riwayat Pembelian",
        href: "/dashboard/transaksi/pembelian/riwayat",
        icon: History,
        roles: ["ADMIN"],
      },
      {
        label: "Return Penjualan",
        href: "/dashboard/transaksi/return/penjualan",
        icon: RotateCcw,
        roles: ["ADMIN"],
      },
      {
        label: "Return Pembelian",
        href: "/dashboard/transaksi/return/pembelian",
        icon: RotateCcw,
        roles: ["ADMIN"],
      },
      {
        label: "Riwayat Return",
        href: "/dashboard/transaksi/return/riwayat",
        icon: List,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    category: "LAPORAN",
    roles: ["ADMIN"],
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN"],
      },
      {
        label: "Barang Return",
        href: "/dashboard/laporan/barang-return",
        icon: RotateCcw,
        roles: ["ADMIN"],
      },
      {
        label: "Barang Paling Laku",
        href: "/dashboard/laporan/barang-paling-laku",
        icon: TrendingUp,
        roles: ["ADMIN"],
      },
      {
        label: "Transaksi Harian",
        href: "/dashboard/laporan/transaksi-harian",
        icon: Calendar,
        roles: ["ADMIN"],
      },
      {
        label: "Transaksi Bulanan",
        href: "/dashboard/laporan/transaksi-bulanan",
        icon: Calendar,
        roles: ["ADMIN"],
      },
      {
        label: "Transaksi per Member",
        href: "/dashboard/laporan/transaksi-per-member",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Jenis Pembelian",
        href: "/dashboard/laporan/jenis-pembelian",
        icon: Package,
        roles: ["ADMIN"],
      },
      {
        label: "Hutang Supplier",
        href: "/dashboard/laporan/hutang-supplier",
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Piutang Member",
        href: "/dashboard/laporan/piutang-member",
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Bonus Point",
        href: "/dashboard/laporan/bonus-point",
        icon: Gift,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    category: "MANAGEMENT",
    roles: ["ADMIN"],
    items: [
      {
        label: "Daftar Member",
        href: "/dashboard/management/member",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Kelola Piutang",
        href: "/dashboard/management/piutang",
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Kelola Hutang",
        href: "/dashboard/management/hutang",
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Kelola Point",
        href: "/dashboard/management/point",
        icon: Gift,
        roles: ["ADMIN"],
      },
    ],
  },
];

export function getNavigationByRole(userRole: string): NavCategory[] {
  return NAVIGATION.map((category) => ({
    ...category,
    items: category.items.filter((item) => !item.roles || item.roles.includes(userRole)),
  })).filter((category) => category.roles.includes(userRole));
}

// src/components/layout/sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  History,
  LogOut,
  FolderTree,
  Store,
  Truck,
  RotateCcw,
  ArrowLeftRight,
  ClipboardList,
  Receipt,
  CreditCard,
  Wallet,
  PackageOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  DollarSign,
  PieChart,
  FileBarChart,
  Coins,
  Boxes,
  UserCog,
  Shield,
  UserCircle,
  Gift,
} from "lucide-react";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.KASIR],
  },
  {
    title: "BARANG",
    icon: Package,
    roles: [UserRole.ADMIN],
    children: [
      {
        title: "Input Kategori Barang",
        href: "/dashboard/products/categories",
        icon: FolderTree,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Input Barang",
        href: "/dashboard/products",
        icon: Package,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Input Supplier",
        href: "/dashboard/suppliers",
        icon: Truck,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Return Barang",
        href: "/dashboard/products/returns",
        icon: RotateCcw,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Retur ke Supplier",
        href: "/dashboard/suppliers/returns",
        icon: ArrowLeftRight,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Stock Opname",
        href: "/dashboard/products/stock-opname",
        icon: ClipboardList,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: "TRANSAKSI",
    icon: ShoppingCart,
    roles: [UserRole.ADMIN, UserRole.KASIR],
    children: [
      {
        title: "Transaksi Produk",
        href: "/dashboard/transactions",
        icon: Receipt,
        roles: [UserRole.ADMIN, UserRole.KASIR],
      },
      {
        title: "Transaksi Piutang Member",
        href: "/dashboard/receivables",
        icon: CreditCard,
        roles: [UserRole.ADMIN, UserRole.KASIR],
      },
      {
        title: "Pembayaran Hutang Supplier",
        href: "/dashboard/payables",
        icon: Wallet,
        roles: [UserRole.ADMIN, UserRole.KASIR],
      },
      {
        title: "Stok Barang",
        href: "/dashboard/products/stock",
        icon: PackageOpen,
        roles: [UserRole.ADMIN, UserRole.KASIR],
      },
    ],
  },
  {
    title: "LAPORAN",
    icon: FileText,
    roles: [UserRole.ADMIN],
    children: [
      {
        title: "Laporan Barang Retur",
        href: "/dashboard/reports/product-returns",
        icon: RotateCcw,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Barang Paling Laku",
        href: "/dashboard/reports/best-sellers",
        icon: TrendingUp,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Transaksi Harian",
        href: "/dashboard/reports/daily",
        icon: Calendar,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Transaksi Bulanan",
        href: "/dashboard/reports/monthly",
        icon: BarChart3,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Transaksi per Member",
        href: "/dashboard/reports/member-transactions",
        icon: Users,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Jenis Pembelian",
        href: "/dashboard/reports/purchase-types",
        icon: PieChart,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Hutang",
        href: "/dashboard/reports/payables",
        icon: DollarSign,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Piutang",
        href: "/dashboard/reports/receivables",
        icon: CreditCard,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Bonus Point",
        href: "/dashboard/reports/points",
        icon: Gift,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Laporan Stock Opname",
        href: "/dashboard/reports/stock-opname",
        icon: FileBarChart,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: "MANAGEMENT USER DAN ANGGOTA",
    icon: Users,
    roles: [UserRole.ADMIN],
    children: [
      {
        title: "Seluruh User",
        href: "/dashboard/users",
        icon: UserCog,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Kasir",
        href: "/dashboard/users/cashiers",
        icon: Shield,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Anggota",
        href: "/dashboard/members",
        icon: Users,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Pengaturan Point",
        href: "/dashboard/settings/points",
        icon: Coins,
        roles: [UserRole.ADMIN],
      },
      {
        title: "Pengaturan Kredit",
        href: "/dashboard/settings/credit",
        icon: CreditCard,
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    title: "RIWAYAT USER",
    icon: History,
    roles: [UserRole.ADMIN],
    children: [
      {
        title: "Log Aktivitas",
        href: "/dashboard/logs",
        icon: History,
        roles: [UserRole.ADMIN],
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    if (!user) return [];

    return items
      .filter((item) => item.roles.includes(user.role))
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children) : undefined,
      }));
  };

  const filteredMenu = filterMenuByRole(menuItems);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Koperasi POS</span>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredMenu.map((item, index) => (
            <div key={index}>
              {item.href ? (
                // Single Menu Item
                <Link href={item.href}>
                  <Button variant={pathname === item.href ? "secondary" : "ghost"} className={cn("w-full justify-start", pathname === item.href && "bg-accent")}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              ) : (
                // Menu Group
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.title}</p>
                  </div>
                  {item.children?.map((child, childIndex) => (
                    <Link key={childIndex} href={child.href || "#"}>
                      <Button variant={pathname === child.href ? "secondary" : "ghost"} className={cn("w-full justify-start text-sm", pathname === child.href && "bg-accent")} size="sm">
                        <child.icon className="mr-2 h-4 w-4" />
                        {child.title}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <Separator />

      {/* User Profile & Logout */}
      <div className="p-4 space-y-2">
        <Link href="/dashboard/profile">
          <Button variant="ghost" className="w-full justify-start">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </Link>
        <Link href="/logout">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}

// src/app/(dashboard)/laporan/dashboard/page.tsx
"use client";

import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportStats } from "@/components/laporan/report-stats";
import { ReportFilters } from "@/components/laporan/report-filters";
import { useState } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Gift,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSummary {
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

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data, isLoading } = useSWR<{ data: DashboardSummary }>(
    `/reports/summary?startDate=${filters.startDate}&endDate=${filters.endDate}`,
    async (url: string) => {
      const response = await apiClient.get(url);
      return response.data;
    }
  );

  const summary = data?.data;

  const handleFilterChange = (newFilters: any) => {
    setFilters({
      startDate: newFilters.startDate || "",
      endDate: newFilters.endDate || "",
    });
  };

  const handleReset = () => {
    setFilters({ startDate: "", endDate: "" });
  };

  if (isLoading) {
    return (
      <ReportLayout>
        <ReportHeader
          title="Dashboard Laporan"
          description="Ringkasan semua laporan koperasi"
          icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </ReportLayout>
    );
  }

  const salesStats = [
    {
      title: "Total Transaksi",
      value: summary?.sales.totalTransactions || 0,
      format: "number" as const,
      icon: ShoppingCart,
      description: "Total penjualan",
    },
    {
      title: "Total Pendapatan",
      value: summary?.sales.totalRevenue || 0,
      format: "currency" as const,
      icon: TrendingUp,
      description: "Revenue keseluruhan",
    },
    {
      title: "Penjualan Tunai",
      value: summary?.sales.tunaiRevenue || 0,
      format: "currency" as const,
      icon: TrendingUp,
      description: "Cash sales",
    },
    {
      title: "Penjualan Kredit",
      value: summary?.sales.kreditRevenue || 0,
      format: "currency" as const,
      icon: TrendingUp,
      description: "Credit sales",
    },
  ];

  const purchaseStats = [
    {
      title: "Total Pembelian",
      value: summary?.purchases.totalPurchases || 0,
      format: "number" as const,
      icon: ShoppingCart,
      description: "Transaksi pembelian",
    },
    {
      title: "Total Pengeluaran",
      value: summary?.purchases.totalSpending || 0,
      format: "currency" as const,
      icon: ArrowDownCircle,
      description: "Total spending",
    },
  ];

  const debtStats = [
    {
      title: "Hutang Supplier",
      value: summary?.debts.totalDebt || 0,
      format: "currency" as const,
      icon: ArrowDownCircle,
      description: `${summary?.debts.pendingCount || 0} pending`,
    },
    {
      title: "Piutang Member",
      value: summary?.receivables.totalReceivable || 0,
      format: "currency" as const,
      icon: ArrowUpCircle,
      description: `${summary?.receivables.pendingCount || 0} pending`,
    },
  ];

  const pointStats = [
    {
      title: "Point Earned",
      value: summary?.points.totalEarned || 0,
      format: "number" as const,
      icon: Gift,
      description: "Total point didapat",
    },
    {
      title: "Point Redeemed",
      value: summary?.points.totalRedeemed || 0,
      format: "number" as const,
      icon: Gift,
      description: "Point ditukar",
    },
    {
      title: "Point Expired",
      value: summary?.points.totalExpired || 0,
      format: "number" as const,
      icon: Gift,
      description: "Point kadaluarsa",
    },
  ];

  const productStats = [
    {
      title: "Total Produk",
      value: summary?.products.totalProducts || 0,
      format: "number" as const,
      icon: Package,
      description: "Produk aktif",
    },
    {
      title: "Stok Habis",
      value: summary?.products.outOfStock || 0,
      format: "number" as const,
      icon: Package,
      description: "Perlu restock",
    },
    {
      title: "Stok Menipis",
      value: summary?.products.lowStock || 0,
      format: "number" as const,
      icon: Package,
      description: "Di bawah minimum",
    },
  ];

  const memberStats = [
    {
      title: "Total Member",
      value: summary?.members.totalMembers || 0,
      format: "number" as const,
      icon: Users,
      description: "Semua anggota",
    },
    {
      title: "Member Aktif",
      value: summary?.members.activeMembers || 0,
      format: "number" as const,
      icon: Users,
      description: "Anggota aktif",
    },
    {
      title: "Total Point Member",
      value: summary?.members.totalPoints || 0,
      format: "number" as const,
      icon: Gift,
      description: "Akumulasi point",
    },
  ];

  const returnStats = [
    {
      title: "Purchase Return",
      value: summary?.returns.purchaseReturns || 0,
      format: "number" as const,
      icon: RotateCcw,
      description: "Retur pembelian",
    },
    {
      title: "Sales Return",
      value: summary?.returns.salesReturns || 0,
      format: "number" as const,
      icon: RotateCcw,
      description: "Retur penjualan",
    },
  ];

  return (
    <ReportLayout>
      <ReportHeader
        title="Dashboard Laporan"
        description="Ringkasan semua laporan koperasi"
        icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
      />

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showSearch={false}
      />

      {summary?.period && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Periode: <strong>{summary.period.startDate}</strong> s/d{" "}
              <strong>{summary.period.endDate}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">📊 Penjualan</h2>
          <ReportStats stats={salesStats} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">🛒 Pembelian</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {purchaseStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stat.format === "currency"
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(Number(stat.value))
                        : Number(stat.value).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">💰 Hutang & Piutang</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {debtStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(Number(stat.value))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">🎁 Bonus Point</h2>
          <ReportStats stats={pointStats} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">📦 Produk</h2>
          <ReportStats stats={productStats} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">👥 Member</h2>
          <ReportStats stats={memberStats} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">🔄 Return</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {returnStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Number(stat.value).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ReportLayout>
  );
}

// src/app/dashboard/management/points/page.tsx
"use client";

import { useState } from "react";
import { usePointTransactions, usePointActions, usePointSettings } from "@/hooks/usePoints";
import { PointTransactionTable } from "@/components/point/point-transaction-table";
import { PointFilter } from "@/components/point/point-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, Gift, TrendingUp, Settings } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import { PointTransactionFilters } from "@/types/point";

export default function PointsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PointTransactionFilters>({
    page: 1,
    limit: 20,
  });

  const { transactions, pagination, isLoading, mutate } = usePointTransactions({
    ...filters,
    search: search || undefined,
    page,
  });
  const { settings, isLoading: settingsLoading } = usePointSettings();
  const { exportToExcel, isLoading: isSubmitting } = usePointActions();

  const handleFilter = (newFilters: PointTransactionFilters) => {
    setFilters({ ...newFilters, page: 1, limit: 20 });
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 20 });
    setSearch("");
    setPage(1);
  };

  const handleExport = async () => {
    await exportToExcel({
      search: search || undefined,
      ...filters,
    });
  };

  // Calculate stats from transactions
  const stats = {
    totalEarned: transactions.filter((t) => t.type === "EARN").reduce((sum, t) => sum + t.points, 0),
    totalRedeemed: Math.abs(transactions.filter((t) => t.type === "REDEEM").reduce((sum, t) => sum + t.points, 0)),
    totalExpired: Math.abs(transactions.filter((t) => t.type === "EXPIRED").reduce((sum, t) => sum + t.points, 0)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Point Member</h1>
          <p className="text-muted-foreground">Pantau transaksi point dan kelola sistem point</p>
        </div>
        {/* {user?.role === "ADMIN" && (
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Pengaturan Point
          </Button>
        )} */}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Point Didapat (EARN)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Dari transaksi penjualan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Point Ditukar (REDEEM)</CardTitle>
            <Gift className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-{stats.totalRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ditukar menjadi diskon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Point Kadaluarsa</CardTitle>
            <Settings className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.totalExpired.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Otomatis expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Point Settings Info */}
      {!settingsLoading && settings && settings.pointEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pengaturan Point Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Mode Sistem</p>
                <p className="font-medium">{settings.pointSystemMode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Point per Jumlah</p>
                <p className="font-medium">1 point / Rp {settings.pointPerAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Min. Transaksi</p>
                <p className="font-medium">Rp {settings.minTransactionForPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Masa Aktif Point</p>
                <p className="font-medium">{settings.pointExpiryMonths} bulan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <PointFilter onFilter={handleFilter} onReset={handleReset} />

      {/* Search & Export */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari nama member atau ID member..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Button onClick={handleExport} disabled={isSubmitting} className="gap-2">
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <PointTransactionTable transactions={transactions} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {transactions.length} dari {pagination.total} data
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// src/app/(protected)/dashboard/page.tsx

"use client";

import { useDashboardMetrics } from "@/hooks/useDashboard";
import { MetricCard } from "@/components/shared/metric-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { metrics, isLoading, isError, refresh } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Gagal memuat data dashboard. Silakan coba lagi.</AlertDescription>
        <Button variant="outline" size="sm" onClick={() => refresh()} className="mt-2">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview metrik koperasi hari ini</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1 */}
        <MetricCard title="Jumlah Transaksi Hari Ini" value={formatNumber(metrics?.todayTransactions || 0)} variant="default" />

        <MetricCard title="Total Rupiah Transaksi Hari Ini" value={formatCurrency(metrics?.todayRevenue || 0)} variant="success" />

        <MetricCard title="Total Piutang Hari Ini" value={formatCurrency(metrics?.todayReceivables || 0)} variant="warning" />

        <MetricCard title="Total Hutang Hari Ini" value={formatCurrency(metrics?.todayPayables || 0)} variant="danger" />

        {/* Row 2 */}
        <MetricCard title="Stok Fast Moving" value={formatNumber(metrics?.fastMovingStock || 0)} variant="success" />

        <MetricCard title="Stok Slow Moving" value={formatNumber(metrics?.slowMovingStock || 0)} variant="warning" />

        <MetricCard title="Stok Over-Stok" value={formatNumber(metrics?.overStock || 0)} variant="danger" />

        <MetricCard title="Stok Hampir Habis" value={formatNumber(metrics?.lowStock || 0)} variant="warning" />
      </div>

      {/* Additional Info */}
      <Alert>
        <AlertDescription>Data diperbarui secara otomatis setiap 30 detik. Klik tombol Refresh untuk memperbarui manual.</AlertDescription>
      </Alert>
    </div>
  );
}

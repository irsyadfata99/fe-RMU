// src/app/dashboard/page.tsx
"use client";

import { useDashboardMetrics } from "@/hooks/useDashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { metrics, isLoading, isError } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Gagal memuat data dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Selamat datang di sistem Point of Sale Koperasi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Transaksi Hari Ini"
          value={metrics.todayTransactions}
          icon={ShoppingCart}
          variant="default"
          suffix="transaksi"
        />
        <StatsCard
          title="Pendapatan Hari Ini"
          value={metrics.todayRevenue}
          icon={TrendingUp}
          variant="success"
          prefix="Rp"
          isCurrency
        />
        <StatsCard
          title="Piutang Tertunda"
          value={metrics.todayReceivables}
          icon={TrendingDown}
          variant="warning"
          prefix="Rp"
          isCurrency
        />
        <StatsCard
          title="Hutang Tertunda"
          value={metrics.todayPayables}
          icon={AlertTriangle}
          variant="danger"
          prefix="Rp"
          isCurrency
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Status Stok</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-7">
            {/* Revenue Chart */}
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Transaksi Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Fast Moving Stock"
              value={metrics.fastMovingStock}
              icon={TrendingUp}
              variant="success"
              suffix="produk"
            />
            <StatsCard
              title="Slow Moving Stock"
              value={metrics.slowMovingStock}
              icon={TrendingDown}
              variant="warning"
              suffix="produk"
            />
            <StatsCard
              title="Over Stock"
              value={metrics.overStock}
              icon={Package}
              variant="default"
              suffix="produk"
            />
            <StatsCard
              title="Stok Menipis"
              value={metrics.lowStock}
              icon={AlertTriangle}
              variant="danger"
              suffix="produk"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

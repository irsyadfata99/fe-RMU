// src/app/dashboard/laporan/transaksi-harian/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportStats } from "@/components/laporan/report-stats";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { Calendar, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import {
  DailyTransactionReport,
  ReportFilters as ReportFiltersType,
} from "@/types/report";

export default function TransaksiHarianPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    page: 1,
    limit: 50,
  });

  // Fetch report data
  const { data, pagination, isLoading } = useReport<DailyTransactionReport>({
    endpoint: "/reports/daily-transactions",
    ...filters,
  });

  // Export functionality
  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/daily-transactions",
    filename: "Laporan_Transaksi_Harian",
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: ReportFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = () => {
    const { page, limit, ...exportFilters } = filters;
    exportReport(exportFilters);
  };

  // Calculate summary stats with proper typing
  const totalTransactions = data.reduce(
    (sum: number, item: DailyTransactionReport) => sum + item.totalTransactions,
    0
  );
  const totalRevenue = data.reduce(
    (sum: number, item: DailyTransactionReport) => sum + item.totalRevenue,
    0
  );
  const tunaiRevenue = data.reduce(
    (sum: number, item: DailyTransactionReport) => sum + item.tunaiRevenue,
    0
  );
  const avgPerDay = data.length > 0 ? totalRevenue / data.length : 0;

  // Stats cards
  const stats = [
    {
      title: "Total Transaksi",
      value: totalTransactions,
      description: `Dalam ${data.length} hari`,
      icon: ShoppingCart,
      format: "number" as const,
    },
    {
      title: "Total Pendapatan",
      value: totalRevenue,
      description: "Total penjualan",
      icon: DollarSign,
      format: "currency" as const,
    },
    {
      title: "Pendapatan Tunai",
      value: tunaiRevenue,
      description: `${
        totalRevenue > 0 ? ((tunaiRevenue / totalRevenue) * 100).toFixed(1) : 0
      }% dari total`,
      icon: TrendingUp,
      format: "currency" as const,
    },
    {
      title: "Rata-rata per Hari",
      value: avgPerDay,
      description: "Pendapatan harian",
      icon: Calendar,
      format: "currency" as const,
    },
  ];

  // Table columns
  const columns: ReportColumn<DailyTransactionReport>[] = [
    {
      key: "date",
      header: "Tanggal",
      width: "120px",
    },
    {
      key: "dayName",
      header: "Hari",
      width: "100px",
    },
    {
      key: "totalTransactions",
      header: "Transaksi",
      format: "number",
      width: "100px",
      align: "center",
    },
    {
      key: "totalRevenue",
      header: "Total Pendapatan",
      format: "currency",
      align: "right",
      width: "150px",
    },
    {
      key: "tunaiCount",
      header: "Tunai (Qty)",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "tunaiRevenue",
      header: "Tunai (Rp)",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "kreditCount",
      header: "Kredit (Qty)",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "kreditRevenue",
      header: "Kredit (Rp)",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "avgPerTransaction",
      header: "Rata-rata",
      format: "currency",
      align: "right",
      width: "130px",
    },
  ];

  return (
    <ReportLayout>
      {/* Header */}
      <ReportHeader
        title="Laporan Transaksi Harian"
        description="Laporan transaksi penjualan per hari"
        icon={<Calendar className="h-6 w-6 text-primary" />}
      />

      {/* Stats */}
      {!isLoading && data.length > 0 && <ReportStats stats={stats} />}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            showSearch={false}
            showDateRange={true}
          />
        </div>

        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      {/* Table */}
      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada transaksi dalam periode yang dipilih"
      />
    </ReportLayout>
  );
}

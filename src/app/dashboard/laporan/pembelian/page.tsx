// src/app/dashboard/laporan/jenis-pembelian/page.tsx
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
import { ShoppingBag, DollarSign, TrendingUp, Calendar } from "lucide-react";
import {
  PurchaseReport,
  ReportFilters as ReportFiltersType,
} from "@/types/report";

// ✨ Import helper columns (optional - makes code cleaner)
import { commonColumns } from "@/lib/report-columns";

export default function JenisPembelianPage() {
  const [filters, setFilters] = useState<ReportFiltersType>({
    page: 1,
    limit: 50,
  });

  const { data, pagination, isLoading } = useReport<PurchaseReport>({
    endpoint: "/reports/purchases",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/purchases",
    filename: "Laporan_Jenis_Pembelian",
  });

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, limit, ...exportFilters } = filters;
    exportReport(exportFilters);
  };

  // Calculate stats with proper typing
  const totalAmount = data.reduce(
    (sum: number, item: PurchaseReport) => sum + item.totalAmount,
    0
  );
  const totalPaid = data.reduce(
    (sum: number, item: PurchaseReport) => sum + item.paidAmount,
    0
  );
  const totalDebt = data.reduce(
    (sum: number, item: PurchaseReport) => sum + item.remainingDebt,
    0
  );
  const average = data.length > 0 ? totalAmount / data.length : 0;

  const statsCards = [
    {
      title: "Total Pembelian",
      value: totalAmount,
      description: `Dari ${data.length} transaksi`,
      icon: ShoppingBag,
      format: "currency" as const,
    },
    {
      title: "Total Dibayar",
      value: totalPaid,
      description:
        totalAmount > 0
          ? `${((totalPaid / totalAmount) * 100).toFixed(1)}% dari total`
          : "0% dari total",
      icon: DollarSign,
      format: "currency" as const,
    },
    {
      title: "Total Hutang",
      value: totalDebt,
      description: "Sisa yang belum dibayar",
      icon: TrendingUp,
      format: "currency" as const,
    },
    {
      title: "Rata-rata",
      value: average,
      description: "Per transaksi",
      icon: Calendar,
      format: "currency" as const,
    },
  ];

  // ✨ OPTION 1: Using commonColumns helper (cleaner)
  const columns: ReportColumn<PurchaseReport>[] = [
    commonColumns.invoiceNumber as ReportColumn<PurchaseReport>,
    {
      key: "purchaseDate",
      header: "Tanggal",
      width: "110px",
    },
    commonColumns.supplierName as ReportColumn<PurchaseReport>,
    {
      key: "purchaseType",
      header: "Jenis",
      format: "badge",
      width: "120px",
    },
    commonColumns.totalAmount as ReportColumn<PurchaseReport>,
    commonColumns.paidAmount as ReportColumn<PurchaseReport>,
    commonColumns.remainingDebt as ReportColumn<PurchaseReport>,
    commonColumns.status as ReportColumn<PurchaseReport>,
    {
      key: "dueDate",
      header: "Jatuh Tempo",
      width: "110px",
    },
  ];

  /* ✨ OPTION 2: Without helper (if you prefer)
  const columns: ReportColumn<PurchaseReport>[] = [
    { key: "invoiceNumber", header: "No. Faktur", width: "150px" },
    { key: "purchaseDate", header: "Tanggal", width: "110px" },
    { key: "supplierName", header: "Supplier", width: "200px" },
    { key: "purchaseType", header: "Jenis", format: "badge", width: "120px" },
    { key: "totalAmount", header: "Total", format: "currency", align: "right", width: "150px" },
    { key: "paidAmount", header: "Dibayar", format: "currency", align: "right", width: "140px" },
    { key: "remainingDebt", header: "Sisa", format: "currency", align: "right", width: "130px" },
    { key: "status", header: "Status", format: "badge", width: "110px" },
    { key: "dueDate", header: "Jatuh Tempo", width: "110px" },
  ];
  */

  return (
    <ReportLayout>
      <ReportHeader
        title="Laporan Jenis Pembelian"
        description="Laporan pembelian berdasarkan jenis (Tunai/Kredit)"
        icon={<ShoppingBag className="h-6 w-6 text-primary" />}
      />

      {!isLoading && data.length > 0 && <ReportStats stats={statsCards} />}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            showSearch={true}
            showDateRange={true}
          />
        </div>

        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada data pembelian"
      />
    </ReportLayout>
  );
}

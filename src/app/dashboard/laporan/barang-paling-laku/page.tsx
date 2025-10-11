// src/app/(dashboard)/laporan/barang-paling-laku/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { TrendingUp } from "lucide-react";
import { BestSellingReport } from "@/types/report";

export default function BarangPalingLakuPage() {
  const [filters, setFilters] = useState({
    limit: 50,
    startDate: "",
    endDate: "",
    categoryId: "",
  });

  const { data, isLoading } = useReport<BestSellingReport>({
    endpoint: "/reports/best-selling",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/best-selling",
    filename: "Laporan_Barang_Paling_Laku",
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleReset = () => {
    setFilters({
      limit: 50,
      startDate: "",
      endDate: "",
      categoryId: "",
    });
  };

  const handleExport = () => {
    const exportFilters = { ...filters };
    delete (exportFilters as any).limit;
    exportReport(exportFilters);
  };

  const columns: ReportColumn<BestSellingReport>[] = [
    {
      key: "rank",
      header: "#",
      width: "60px",
      align: "center",
      render: (value) => (
        <div className="font-semibold text-primary">{value}</div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      width: "120px",
    },
    {
      key: "productName",
      header: "Nama Produk",
      width: "300px",
    },
    {
      key: "category",
      header: "Kategori",
      width: "150px",
    },
    {
      key: "unit",
      header: "Satuan",
      width: "80px",
      align: "center",
    },
    {
      key: "sellingPrice",
      header: "Harga Jual",
      format: "currency",
      align: "right",
      width: "130px",
    },
    {
      key: "totalQuantity",
      header: "Terjual",
      format: "number",
      align: "center",
      width: "100px",
      render: (value) => (
        <div className="font-semibold text-green-600">
          {Number(value).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      key: "totalTransactions",
      header: "Transaksi",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "totalRevenue",
      header: "Total Pendapatan",
      format: "currency",
      align: "right",
      width: "150px",
    },
    {
      key: "avgPerTransaction",
      header: "Avg/Transaksi",
      format: "number",
      align: "center",
      width: "120px",
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Barang Paling Laku"
          description="Produk dengan penjualan tertinggi berdasarkan kuantitas"
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
        />
        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showSearch={false}
      />

      <ReportTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Tidak ada data penjualan ditemukan"
      />
    </ReportLayout>
  );
}

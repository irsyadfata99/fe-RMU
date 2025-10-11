// src/app/(dashboard)/laporan/jenis-pembelian/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { ShoppingCart } from "lucide-react";
import { PurchaseReport } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function JenisPembelianPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    purchaseType: "",
    supplierId: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const { data, pagination, isLoading } = useReport<PurchaseReport>({
    endpoint: "/reports/purchases",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/purchases",
    filename: "Laporan_Jenis_Pembelian",
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 50,
      purchaseType: "",
      supplierId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    const exportFilters = { ...filters };
    delete (exportFilters as any).page;
    delete (exportFilters as any).limit;
    exportReport(exportFilters);
  };

  const columns: ReportColumn<PurchaseReport>[] = [
    {
      key: "invoiceNumber",
      header: "No. Faktur",
      width: "150px",
    },
    {
      key: "purchaseDate",
      header: "Tanggal",
      width: "110px",
    },
    {
      key: "supplierName",
      header: "Supplier",
      width: "200px",
    },
    {
      key: "purchaseType",
      header: "Jenis",
      width: "120px",
      render: (value) => {
        const colors = {
          TUNAI: "bg-green-100 text-green-700",
          KREDIT: "bg-yellow-100 text-yellow-700",
          KONSINYASI: "bg-blue-100 text-blue-700",
        };
        return (
          <span
            className={`inline-block px-2 py-1 text-xs rounded ${
              colors[value as keyof typeof colors]
            }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "totalAmount",
      header: "Total",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "paidAmount",
      header: "Dibayar",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "remainingDebt",
      header: "Sisa Hutang",
      format: "currency",
      align: "right",
      width: "140px",
      render: (value) =>
        Number(value) > 0 ? (
          <div className="font-semibold text-red-600">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(Number(value))}
          </div>
        ) : (
          <div className="text-muted-foreground">-</div>
        ),
    },
    {
      key: "status",
      header: "Status",
      format: "badge",
      width: "110px",
    },
    {
      key: "dueDate",
      header: "Jatuh Tempo",
      width: "110px",
    },
    {
      key: "inputBy",
      header: "Input By",
      width: "150px",
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Jenis Pembelian"
          description="Daftar pembelian berdasarkan jenis pembayaran"
          icon={<ShoppingCart className="h-6 w-6 text-primary" />}
        />
        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Jenis Pembelian</Label>
            <Select
              value={filters.purchaseType}
              onValueChange={(value) =>
                handleFilterChange({
                  purchaseType: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="TUNAI">Tunai</SelectItem>
                <SelectItem value="KREDIT">Kredit</SelectItem>
                <SelectItem value="KONSINYASI">Konsinyasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada data pembelian ditemukan"
      />
    </ReportLayout>
  );
}

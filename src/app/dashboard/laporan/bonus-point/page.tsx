// src/app/(dashboard)/laporan/bonus-point/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { Gift } from "lucide-react";
import { PointReport } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function BonusPointPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    memberId: "",
    regionCode: "",
    type: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const { data, pagination, isLoading } = useReport<PointReport>({
    endpoint: "/reports/points",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/points",
    filename: "Laporan_Bonus_Point",
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
      memberId: "",
      regionCode: "",
      type: "",
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

  const columns: ReportColumn<PointReport>[] = [
    {
      key: "transactionDate",
      header: "Tanggal",
      width: "150px",
    },
    {
      key: "memberName",
      header: "Member",
      width: "180px",
    },
    {
      key: "regionName",
      header: "Wilayah",
      width: "130px",
    },
    {
      key: "type",
      header: "Tipe",
      width: "120px",
      render: (value) => {
        const colors = {
          EARN: "bg-green-100 text-green-700",
          REDEEM: "bg-blue-100 text-blue-700",
          ADJUSTMENT: "bg-yellow-100 text-yellow-700",
          EXPIRED: "bg-red-100 text-red-700",
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
      key: "points",
      header: "Point",
      align: "center",
      width: "100px",
      render: (value, row) => {
        const isNegative = row.type === "REDEEM" || row.type === "EXPIRED";
        return (
          <div
            className={`font-semibold ${
              isNegative ? "text-red-600" : "text-green-600"
            }`}
          >
            {isNegative ? "-" : "+"}
            {Number(value).toLocaleString("id-ID")}
          </div>
        );
      },
    },
    {
      key: "pointsBefore",
      header: "Sebelum",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "pointsAfter",
      header: "Setelah",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "currentPoints",
      header: "Saat Ini",
      format: "number",
      align: "center",
      width: "100px",
      render: (value) => (
        <div className="font-semibold text-primary">
          {Number(value).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      width: "250px",
    },
    {
      key: "invoiceNumber",
      header: "No. Faktur",
      width: "150px",
    },
    {
      key: "transactionAmount",
      header: "Nilai Transaksi",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "expiryDate",
      header: "Expired",
      width: "110px",
    },
    {
      key: "daysUntilExpiry",
      header: "Sisa Waktu",
      width: "120px",
      render: (value) => {
        if (value === "-")
          return <span className="text-muted-foreground">-</span>;
        if (value === "EXPIRED") {
          return (
            <span className="text-xs text-red-600 font-semibold">EXPIRED</span>
          );
        }
        return <span className="text-xs">{value}</span>;
      },
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Bonus Point"
          description="Riwayat transaksi point member"
          icon={<Gift className="h-6 w-6 text-primary" />}
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
            <Label>Tipe Transaksi</Label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                handleFilterChange({ type: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="EARN">Earn</SelectItem>
                <SelectItem value="REDEEM">Redeem</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
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
        emptyMessage="Tidak ada transaksi point ditemukan"
      />
    </ReportLayout>
  );
}

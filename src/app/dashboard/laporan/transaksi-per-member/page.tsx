// src/app/(dashboard)/laporan/transaksi-per-member/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { Users } from "lucide-react";
import { MemberTransactionReport } from "@/types/report";

export default function TransaksiPerMemberPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    regionCode: "",
    startDate: "",
    endDate: "",
    search: "",
    sortBy: "totalSpending",
    sortOrder: "DESC" as "DESC" | "ASC",
  });

  const { data, pagination, isLoading } = useReport<MemberTransactionReport>({
    endpoint: "/reports/member-transactions",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/member-transactions",
    filename: "Laporan_Transaksi_Member",
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
      regionCode: "",
      startDate: "",
      endDate: "",
      search: "",
      sortBy: "totalSpending",
      sortOrder: "DESC",
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

  const columns: ReportColumn<MemberTransactionReport>[] = [
    {
      key: "uniqueId",
      header: "ID Member",
      width: "120px",
    },
    {
      key: "fullName",
      header: "Nama Lengkap",
      width: "200px",
    },
    {
      key: "regionName",
      header: "Wilayah",
      width: "150px",
    },
    {
      key: "whatsapp",
      header: "WhatsApp",
      width: "130px",
    },
    {
      key: "totalTransactions",
      header: "Transaksi",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "totalSpending",
      header: "Total Belanja",
      format: "currency",
      align: "right",
      width: "150px",
      render: (value) => (
        <div className="font-semibold text-green-600">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Number(value))}
        </div>
      ),
    },
    {
      key: "totalDebt",
      header: "Hutang",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "totalPoints",
      header: "Poin",
      format: "number",
      align: "center",
      width: "80px",
    },
    {
      key: "avgPerTransaction",
      header: "Avg/Transaksi",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "isActive",
      header: "Status",
      width: "100px",
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            value === "Aktif"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Transaksi per Member"
          description="Ringkasan transaksi berdasarkan member"
          icon={<Users className="h-6 w-6 text-primary" />}
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
      />

      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada data member ditemukan"
      />
    </ReportLayout>
  );
}

// src/app/(dashboard)/laporan/piutang-member/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { ArrowUpCircle } from "lucide-react";
import { MemberDebtReport } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function PiutangMemberPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    status: "",
    overdue: false,
    memberId: "",
    regionCode: "",
    search: "",
  });

  const { data, pagination, isLoading } = useReport<MemberDebtReport>({
    endpoint: "/reports/receivables",
    ...filters,
    overdue: filters.overdue ? "true" : "",
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/receivables",
    filename: "Laporan_Piutang_Member",
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
      status: "",
      overdue: false,
      memberId: "",
      regionCode: "",
      search: "",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    const exportFilters = {
      status: filters.status,
      overdue: filters.overdue ? "true" : "",
      memberId: filters.memberId,
      regionCode: filters.regionCode,
      search: filters.search,
    };
    exportReport(exportFilters);
  };

  const columns: ReportColumn<MemberDebtReport>[] = [
    {
      key: "invoiceNumber",
      header: "No. Faktur",
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
      key: "whatsapp",
      header: "WhatsApp",
      width: "130px",
    },
    {
      key: "saleDate",
      header: "Tgl Transaksi",
      width: "110px",
    },
    {
      key: "totalAmount",
      header: "Total Piutang",
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
      key: "remainingAmount",
      header: "Sisa Piutang",
      format: "currency",
      align: "right",
      width: "140px",
      render: (value) => (
        <div className="font-semibold text-orange-600">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Number(value))}
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Jatuh Tempo",
      width: "110px",
    },
    {
      key: "status",
      header: "Status",
      format: "badge",
      width: "110px",
    },
    {
      key: "isOverdue",
      header: "Overdue",
      width: "90px",
      align: "center",
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            value === "YA"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "daysOverdue",
      header: "Hari Telat",
      format: "number",
      align: "center",
      width: "90px",
      render: (value) =>
        Number(value) > 0 ? (
          <div className="font-semibold text-red-600">{value} hari</div>
        ) : (
          <div className="text-muted-foreground">-</div>
        ),
    },
    {
      key: "lastPaymentDate",
      header: "Bayar Terakhir",
      width: "120px",
    },
    {
      key: "lastPaymentAmount",
      header: "Nominal Terakhir",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "paymentProgress",
      header: "Progress",
      width: "100px",
      align: "center",
      render: (value) => (
        <div className="text-xs">
          <div className="font-semibold">{Number(value).toFixed(0)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Piutang Member"
          description="Daftar piutang koperasi dari member"
          icon={<ArrowUpCircle className="h-6 w-6 text-primary" />}
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
            <Label>Status Pembayaran</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                handleFilterChange({ status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter Overdue</Label>
            <div className="flex items-center space-x-2 h-10">
              <Switch
                checked={filters.overdue}
                onCheckedChange={(checked) =>
                  handleFilterChange({ overdue: checked })
                }
              />
              <Label className="cursor-pointer">
                {filters.overdue ? "Hanya Overdue" : "Semua"}
              </Label>
            </div>
          </div>
        </div>

        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          showDateRange={false}
        />
      </div>

      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada data piutang ditemukan"
      />
    </ReportLayout>
  );
}

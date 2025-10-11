// src/app/(dashboard)/laporan/transaksi-bulanan/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { CalendarDays } from "lucide-react";
import { MonthlyTransactionReport } from "@/types/report";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TransaksiBulananPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useReport<MonthlyTransactionReport>({
    endpoint: "/reports/monthly-transactions",
    year,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/monthly-transactions",
    filename: "Laporan_Transaksi_Bulanan",
  });

  const handleExport = () => {
    exportReport({ year });
  };

  const columns: ReportColumn<MonthlyTransactionReport>[] = [
    {
      key: "monthName",
      header: "Bulan",
      width: "120px",
    },
    {
      key: "year",
      header: "Tahun",
      width: "80px",
      align: "center",
    },
    {
      key: "totalTransactions",
      header: "Total Transaksi",
      format: "number",
      align: "center",
      width: "140px",
    },
    {
      key: "totalRevenue",
      header: "Total Pendapatan",
      format: "currency",
      align: "right",
      width: "180px",
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
      key: "tunaiCount",
      header: "Tunai (Qty)",
      format: "number",
      align: "center",
      width: "110px",
    },
    {
      key: "kreditCount",
      header: "Kredit (Qty)",
      format: "number",
      align: "center",
      width: "110px",
    },
    {
      key: "avgPerTransaction",
      header: "Avg/Transaksi",
      format: "currency",
      align: "right",
      width: "150px",
    },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Transaksi Bulanan"
          description="Ringkasan transaksi penjualan per bulan"
          icon={<CalendarDays className="h-6 w-6 text-primary" />}
        />
        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Tahun</Label>
            <Select
              value={String(year)}
              onValueChange={(v) => setYear(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <ReportTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Tidak ada transaksi ditemukan pada tahun ini"
      />
    </ReportLayout>
  );
}

// src/components/laporan/report-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import { ReportPagination } from "@/types/report";
import { formatCurrency, formatDate } from "@/lib/utils";

// Column definition
export interface ReportColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  format?: "currency" | "date" | "number" | "badge";
  width?: string;
  align?: "left" | "center" | "right";
}

interface ReportTableProps<T> {
  data: T[];
  columns: ReportColumn<T>[];
  pagination?: ReportPagination;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReportTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  onPageChange,
  isLoading = false,
  emptyMessage = "Tidak ada data ditemukan",
}: ReportTableProps<T>) {
  // Format cell value based on column format
  const formatCellValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return "-";

    switch (format) {
      case "currency":
        return formatCurrency(Number(value));
      case "date":
        return formatDate(value);
      case "number":
        return Number(value).toLocaleString("id-ID");
      default:
        return value;
    }
  };

  // Render cell content
  const renderCell = (row: T, column: ReportColumn<T>) => {
    const value = row[column.key];

    // Custom render function
    if (column.render) {
      return column.render(value, row);
    }

    // Badge format
    if (column.format === "badge") {
      return <Badge variant={getBadgeVariant(value)}>{value}</Badge>;
    }

    // Standard formatting
    return formatCellValue(value, column.format);
  };

  // Get badge variant based on value
  const getBadgeVariant = (
    value: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const lowercaseValue = String(value).toLowerCase();

    if (
      lowercaseValue.includes("paid") ||
      lowercaseValue.includes("lunas") ||
      lowercaseValue.includes("approved") ||
      lowercaseValue.includes("aktif")
    ) {
      return "default";
    }
    if (
      lowercaseValue.includes("pending") ||
      lowercaseValue.includes("partial") ||
      lowercaseValue.includes("cicilan")
    ) {
      return "secondary";
    }
    if (
      lowercaseValue.includes("rejected") ||
      lowercaseValue.includes("overdue") ||
      lowercaseValue.includes("cancelled") ||
      lowercaseValue.includes("nonaktif")
    ) {
      return "destructive";
    }
    return "outline";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Coba ubah filter atau periode tanggal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                      ? "text-center"
                      : ""
                  }
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                        ? "text-center"
                        : ""
                    }
                  >
                    {renderCell(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {data.length} dari{" "}
            {pagination.total.toLocaleString("id-ID")} data
            {pagination.totalPages > 1 &&
              ` • Halaman ${pagination.page} dari ${pagination.totalPages}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Berikutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// src/components/stock/stock-adjustment-table.tsx
// ============================================
"use client";
import { StockAdjustmentRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { ensureArray } from "@/lib/swr-fetcher";
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
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { ADJUSTMENT_TYPE_LABELS } from "@/lib/validations";

interface StockAdjustmentTableProps {
  adjustments: StockAdjustmentRecord[] | undefined | null;
  onView?: (adjustment: StockAdjustmentRecord) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  userRole: string;
}

export function StockAdjustmentTable({
  adjustments,
  onView,
  onApprove,
  onReject,
  userRole,
}: StockAdjustmentTableProps) {
  const safeAdjustments = ensureArray(adjustments);

  if (safeAdjustments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada adjustment ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-center">Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeAdjustments.map((adjustment) => (
            <TableRow key={adjustment.id}>
              <TableCell className="font-mono text-sm">
                {adjustment.adjustmentNumber}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(adjustment.adjustmentDate)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{adjustment.product?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {adjustment.product?.sku}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {ADJUSTMENT_TYPE_LABELS[adjustment.adjustmentType]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`font-semibold ${
                    adjustment.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {adjustment.quantity > 0 ? "+" : ""}
                  {adjustment.quantity}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    adjustment.status === "APPROVED"
                      ? "default"
                      : adjustment.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {adjustment.status === "APPROVED"
                    ? "Disetujui"
                    : adjustment.status === "PENDING"
                    ? "Menunggu"
                    : "Ditolak"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(adjustment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {userRole === "ADMIN" && adjustment.status === "PENDING" && (
                    <>
                      {onApprove && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onApprove(adjustment.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onReject(adjustment.id)}
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

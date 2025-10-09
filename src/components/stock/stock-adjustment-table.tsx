// src/components/stock/stock-adjustment-table.tsx
"use client";

import { StockAdjustmentRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
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
  adjustments: StockAdjustmentRecord[];
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
  if (adjustments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada adjustment ditemukan</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      APPROVED: "default",
      PENDING: "secondary",
      REJECTED: "destructive",
    };
    const labels: Record<string, string> = {
      APPROVED: "Disetujui",
      PENDING: "Menunggu",
      REJECTED: "Ditolak",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant="outline">{ADJUSTMENT_TYPE_LABELS[type] || type}</Badge>
    );
  };

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
            <TableHead>Alasan</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adjustments.map((adjustment) => (
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
                  <p className="text-xs text-muted-foreground">
                    Stok: {adjustment.product?.stock} {adjustment.product?.unit}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(adjustment.adjustmentType)}</TableCell>
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
              <TableCell className="max-w-xs truncate text-sm">
                {adjustment.reason}
              </TableCell>
              <TableCell className="text-sm">{adjustment.user?.name}</TableCell>
              <TableCell>{getStatusBadge(adjustment.status)}</TableCell>
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
                          title="Setujui"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onReject(adjustment.id)}
                          title="Tolak"
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

export default StockAdjustmentTable;

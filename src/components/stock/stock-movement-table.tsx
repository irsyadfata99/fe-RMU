// ============================================
// src/components/stock/stock-movement-table.tsx
// ============================================
"use client";
import { StockMovementRecord } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { STOCK_MOVEMENT_TYPE_LABELS } from "@/lib/validations";
import { ArrowUp, ArrowDown, RefreshCw, Undo2 } from "lucide-react";

interface StockMovementTableProps {
  movements: StockMovementRecord[] | undefined | null;
}

export function StockMovementTable({ movements }: StockMovementTableProps) {
  const safeMovements = ensureArray(movements);

  if (safeMovements.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Tidak ada pergerakan stok ditemukan
        </p>
      </div>
    );
  }

  const getMovementIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      IN: <ArrowUp className="h-4 w-4 text-green-600" />,
      OUT: <ArrowDown className="h-4 w-4 text-red-600" />,
      ADJUSTMENT: <RefreshCw className="h-4 w-4 text-blue-600" />,
      RETURN_IN: <Undo2 className="h-4 w-4 text-green-600" />,
      RETURN_OUT: <Undo2 className="h-4 w-4 text-red-600" />,
    };
    return icons[type] || null;
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Tipe Gerakan</TableHead>
            <TableHead className="text-center">Stok Sebelum</TableHead>
            <TableHead className="text-center">Perubahan</TableHead>
            <TableHead className="text-center">Stok Sesudah</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeMovements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="text-sm">
                {formatDateTime(movement.createdAt)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{movement.product?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {movement.product?.sku}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="gap-1">
                  {getMovementIcon(movement.type)}
                  {STOCK_MOVEMENT_TYPE_LABELS[movement.type] || movement.type}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-mono">
                {movement.quantityBefore}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`font-semibold ${
                    movement.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>
              </TableCell>
              <TableCell className="text-center font-mono font-semibold">
                {movement.quantityAfter}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {movement.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// src/components/stock/stock-movement-table.tsx
"use client";

import React from "react";
import { StockMovementRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
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
  movements: StockMovementRecord[];
}

export function StockMovementTable({ movements }: StockMovementTableProps) {
  if (movements.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Tidak ada pergerakan stok ditemukan
        </p>
      </div>
    );
  }

  const getMovementIcon = (type: string): React.ReactElement | null => {
    const icons: Record<string, React.ReactElement> = {
      IN: <ArrowUp className="h-4 w-4 text-green-600" />,
      OUT: <ArrowDown className="h-4 w-4 text-red-600" />,
      ADJUSTMENT: <RefreshCw className="h-4 w-4 text-blue-600" />,
      RETURN_IN: <Undo2 className="h-4 w-4 text-green-600" />,
      RETURN_OUT: <Undo2 className="h-4 w-4 text-red-600" />,
    };
    return icons[type] || null;
  };

  const getMovementBadge = (type: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      IN: "default",
      OUT: "destructive",
      ADJUSTMENT: "secondary",
      RETURN_IN: "default",
      RETURN_OUT: "destructive",
    };
    return (
      <Badge variant={variants[type] || "outline"} className="gap-1">
        {getMovementIcon(type)}
        {STOCK_MOVEMENT_TYPE_LABELS[type] || type}
      </Badge>
    );
  };

  const getReferenceTypeBadge = (type?: string) => {
    if (!type) return "-";
    const labels: Record<string, string> = {
      PURCHASE: "Pembelian",
      SALE: "Penjualan",
      ADJUSTMENT: "Penyesuaian",
      RETURN: "Retur",
    };
    return (
      <Badge variant="outline" className="text-xs">
        {labels[type] || type}
      </Badge>
    );
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
            <TableHead>Referensi</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Catatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
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
              <TableCell>{getMovementBadge(movement.type)}</TableCell>
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
              <TableCell>
                {getReferenceTypeBadge(movement.referenceType)}
              </TableCell>
              <TableCell className="text-sm">
                {movement.user?.name || "-"}
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

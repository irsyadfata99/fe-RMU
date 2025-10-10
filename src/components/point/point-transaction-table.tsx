// src/components/point/point-transaction-table.tsx
"use client";

import { PointTransaction } from "@/types/point";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  POINT_TRANSACTION_TYPE_LABELS,
  POINT_TRANSACTION_TYPE_COLORS,
} from "@/types/point";
import { TrendingUp, TrendingDown, Settings, Clock } from "lucide-react";

interface PointTransactionTableProps {
  transactions: PointTransaction[];
}

export function PointTransactionTable({
  transactions,
}: PointTransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Tidak ada transaksi point ditemukan
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      EARN: <TrendingUp className="h-4 w-4" />,
      REDEEM: <TrendingDown className="h-4 w-4" />,
      ADJUSTMENT: <Settings className="h-4 w-4" />,
      EXPIRED: <Clock className="h-4 w-4" />,
    };
    return icons[type] || null;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant={
          POINT_TRANSACTION_TYPE_COLORS[
            type as keyof typeof POINT_TRANSACTION_TYPE_COLORS
          ] || "outline"
        }
        className="gap-1"
      >
        {getTypeIcon(type)}
        {POINT_TRANSACTION_TYPE_LABELS[
          type as keyof typeof POINT_TRANSACTION_TYPE_LABELS
        ] || type}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Wilayah</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-center">Point</TableHead>
            <TableHead className="text-center">Sebelum</TableHead>
            <TableHead className="text-center">Sesudah</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Faktur</TableHead>
            <TableHead>Kadaluarsa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((trx) => (
            <TableRow key={trx.id}>
              <TableCell className="text-sm">
                {formatDateTime(trx.createdAt)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{trx.member?.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {trx.member?.uniqueId}
                  </p>
                  <p className="text-xs font-semibold text-primary">
                    Point: {trx.member?.totalPoints || 0}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {trx.member?.regionName || "-"}
              </TableCell>
              <TableCell>{getTypeBadge(trx.type)}</TableCell>
              <TableCell className="text-center">
                <span
                  className={`font-bold ${
                    trx.points > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trx.points > 0 ? "+" : ""}
                  {trx.points}
                </span>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                {trx.pointsBefore}
              </TableCell>
              <TableCell className="text-center font-mono text-sm font-semibold">
                {trx.pointsAfter}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate text-sm">{trx.description}</p>
                {trx.notes && (
                  <p className="truncate text-xs text-muted-foreground">
                    {trx.notes}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {trx.sale ? (
                  <div className="text-sm">
                    <p className="font-mono">{trx.sale.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(trx.sale.finalAmount)}
                    </p>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {trx.expiryDate ? (
                  <div className="text-sm">
                    <p>{formatDateTime(trx.expiryDate)}</p>
                    {trx.isExpired ? (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Expired
                      </Badge>
                    ) : trx.daysUntilExpiry !== undefined &&
                      trx.daysUntilExpiry <= 30 ? (
                      <p className="text-xs text-orange-600">
                        {trx.daysUntilExpiry} hari lagi
                      </p>
                    ) : null}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

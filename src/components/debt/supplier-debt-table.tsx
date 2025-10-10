// src/components/debt/supplier-debt-table.tsx
"use client";

import { SupplierDebt } from "@/types/debt";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { Eye, DollarSign } from "lucide-react";

interface SupplierDebtTableProps {
  debts: SupplierDebt[];
  onView?: (debt: SupplierDebt) => void;
  onPay?: (debt: SupplierDebt) => void;
}

export function SupplierDebtTable({
  debts,
  onView,
  onPay,
}: SupplierDebtTableProps) {
  if (debts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada hutang ditemukan</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PAID: "default",
      PENDING: "secondary",
      PARTIAL: "outline",
      OVERDUE: "destructive",
    };
    const labels: Record<string, string> = {
      PAID: "Lunas",
      PENDING: "Pending",
      PARTIAL: "Cicilan",
      OVERDUE: "Jatuh Tempo",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Faktur</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Tanggal Pembelian</TableHead>
            <TableHead className="text-right">Total Hutang</TableHead>
            <TableHead className="text-right">Sudah Dibayar</TableHead>
            <TableHead className="text-right">Sisa Hutang</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => (
            <TableRow key={debt.id}>
              <TableCell className="font-mono text-sm">
                {debt.invoiceNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{debt.supplier?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {debt.supplier?.code}
                  </p>
                  {debt.supplier?.contactPerson && (
                    <p className="text-xs text-muted-foreground">
                      CP: {debt.supplier.contactPerson}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {debt.purchase?.purchaseDate
                  ? formatDate(debt.purchase.purchaseDate)
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(debt.totalAmount)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(debt.paidAmount)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(debt.remainingAmount)}
              </TableCell>
              <TableCell>
                {debt.dueDate ? (
                  <div>
                    <p className="text-sm">{formatDate(debt.dueDate)}</p>
                    {debt.isOverdue && (
                      <p className="text-xs text-red-600">
                        Terlambat {debt.daysOverdue} hari
                      </p>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>{getStatusBadge(debt.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(debt)}
                      title="Lihat Detail"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onPay && debt.status !== "PAID" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onPay(debt)}
                      title="Bayar Hutang"
                    >
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </Button>
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

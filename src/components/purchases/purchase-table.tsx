// src/components/purchases/purchase-table.tsx
"use client";

import { Purchase } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CreditCard } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  PURCHASE_TYPE_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/lib/validations";

interface PurchaseTableProps {
  purchases: Purchase[];
  onPayment?: (purchase: Purchase) => void;
  userRole: string;
}

export function PurchaseTable({
  purchases,
  onPayment,
  userRole,
}: PurchaseTableProps) {
  if (purchases.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada pembelian ditemukan</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PAID: "default",
      PARTIAL: "secondary",
      PENDING: "destructive",
      CANCELLED: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {PURCHASE_STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      TUNAI: "bg-green-500",
      KREDIT: "bg-orange-500",
      KONSINYASI: "bg-blue-500",
    };
    return (
      <Badge className={colors[type] || ""}>
        {PURCHASE_TYPE_LABELS[type] || type}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Terbayar</TableHead>
            <TableHead>Sisa Hutang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-mono text-sm font-medium">
                {purchase.invoiceNumber}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(purchase.purchaseDate)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{purchase.supplier?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {purchase.supplier?.code}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(purchase.purchaseType)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(purchase.totalAmount)}
              </TableCell>
              <TableCell className="text-green-600">
                {formatCurrency(purchase.paidAmount)}
              </TableCell>
              <TableCell>
                <span
                  className={
                    purchase.remainingDebt > 0
                      ? "font-semibold text-orange-600"
                      : "text-muted-foreground"
                  }
                >
                  {formatCurrency(purchase.remainingDebt)}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(purchase.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/transaksi/pembelian/${purchase.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {purchase.purchaseType === "KREDIT" &&
                    purchase.remainingDebt > 0 &&
                    onPayment && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onPayment(purchase)}
                        title="Bayar Hutang"
                      >
                        <CreditCard className="h-4 w-4 text-orange-600" />
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

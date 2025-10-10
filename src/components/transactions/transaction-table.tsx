// src/components/transactions/transaction-table.tsx
"use client";

import { Transaction } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer } from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();

  // ✅ Button "Cetak Invoice" redirects to detail page
  const handlePrintClick = (transactionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    router.push(`/dashboard/transaksi/penjualan/${transactionId}`);
  };

  const handleRowClick = (transactionId: string) => {
    router.push(`/dashboard/transaksi/penjualan/${transactionId}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PARTIAL":
        return "secondary";
      case "PENDING":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSaleTypeVariant = (saleType: string) => {
    return saleType === "TUNAI" ? "default" : "secondary";
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Tidak ada transaksi ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(transaction.id)}
            >
              <TableCell className="font-mono font-medium">
                {transaction.invoiceNumber}
              </TableCell>
              <TableCell>{formatDateTime(transaction.saleDate)}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {transaction.member?.fullName || "UMUM"}
                  </p>
                  {transaction.member && (
                    <p className="text-xs text-muted-foreground">
                      {transaction.member.uniqueId}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getSaleTypeVariant(transaction.saleType)}>
                  {transaction.saleType}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(transaction.finalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* ✅ Redirect to detail page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePrintClick(transaction.id, e)}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Invoice
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

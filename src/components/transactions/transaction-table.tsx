// ============================================
// src/components/transactions/transaction-table.tsx
// ============================================
"use client";
import { Transaction } from "@/types";
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
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer } from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionTableProps {
  transactions: Transaction[] | undefined | null;
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();
  const safeTransactions = ensureArray(transactions);

  const handlePrintClick = (transactionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/transaksi/penjualan/${transactionId}`);
  };

  const handleRowClick = (transactionId: string) => {
    router.push(`/dashboard/transaksi/penjualan/${transactionId}`);
  };

  if (safeTransactions.length === 0) {
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
          {safeTransactions.map((transaction) => (
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
                <Badge
                  variant={
                    transaction.saleType === "TUNAI" ? "default" : "secondary"
                  }
                >
                  {transaction.saleType}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(transaction.finalAmount)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.status === "PAID" ? "default" : "secondary"
                  }
                >
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
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

// src/components/transactions/transaction-table.tsx
"use client";

import { Transaction } from "@/types";
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
import { Eye, Printer } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada transaksi ditemukan</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PAID: "default",
      PARTIAL: "secondary",
      PENDING: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getSaleTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "TUNAI" ? "default" : "secondary"}>{type}</Badge>
    );
  };

  const handlePrint = (transaction: Transaction) => {
    if (transaction.saleType === "TUNAI") {
      window.open(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${transaction.id}/print/thermal`,
        "_blank"
      );
    } else {
      window.open(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${transaction.id}/print/invoice`,
        "_blank"
      );
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono text-sm font-medium">
                {transaction.invoiceNumber}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(transaction.saleDate)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium">
                    {transaction.member?.fullName || "UMUM"}
                  </p>
                  {transaction.member && (
                    <p className="text-xs text-muted-foreground">
                      {transaction.member.uniqueId}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{getSaleTypeBadge(transaction.saleType)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(transaction.finalAmount)}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/transaksi/penjualan/${transaction.id}`}
                  >
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handlePrint(transaction)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

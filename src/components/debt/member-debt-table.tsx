// src/components/debt/member-debt-table.tsx
"use client";

import { useState } from "react";
import { DebtPaymentModal } from "./debt-payment-modal";
import { MemberDebt } from "@/types/debt";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, DollarSign } from "lucide-react";

interface MemberDebtTableProps {
  debts: MemberDebt[];
  onView?: (debt: MemberDebt) => void;
  onPay?: (debt: MemberDebt) => void;
}

export function MemberDebtTable({ debts, onView, onPay }: MemberDebtTableProps) {
  const [selectedDebt, setSelectedDebt] = useState<MemberDebt | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const handlePay = (debt: MemberDebt) => {
    setSelectedDebt(debt);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (onPay && selectedDebt) {
      onPay(selectedDebt);
    }
  };

  if (debts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada piutang ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Faktur</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead>Tanggal Transaksi</TableHead>
              <TableHead className="text-right">Total Piutang</TableHead>
              <TableHead className="text-right">Sudah Dibayar</TableHead>
              <TableHead className="text-right">Sisa Piutang</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-mono text-sm">{debt.invoiceNumber}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{debt.member?.fullName}</p>
                    <p className="text-xs text-muted-foreground">ID: {debt.member?.uniqueId}</p>
                    {debt.member?.whatsapp && <p className="text-xs text-muted-foreground">WA: {debt.member.whatsapp}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{debt.member?.regionName || "-"}</TableCell>
                <TableCell className="text-sm">{debt.sale?.saleDate ? formatDate(debt.sale.saleDate) : "-"}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(debt.totalAmount)}</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(debt.paidAmount)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(debt.remainingAmount)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{formatDate(debt.dueDate)}</p>
                    {debt.isOverdue && <p className="text-xs text-red-600">Terlambat {debt.daysOverdue} hari</p>}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(debt.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <Button variant="ghost" size="icon-sm" onClick={() => onView(debt)} title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {debt.status !== "PAID" && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handlePay(debt)} title="Terima Pembayaran">
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

      <DebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedDebt(null);
        }}
        debt={selectedDebt}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

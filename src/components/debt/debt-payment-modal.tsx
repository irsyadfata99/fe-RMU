// src/components/debt/debt-payment-modal.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Printer, Loader2 } from "lucide-react";
import { MemberDebt, PayMemberDebtRequest } from "@/types/debt";
import { useMemberDebtActions } from "@/hooks/useMemberDebts";
import { printDebtPaymentReceipt } from "@/services/debtService";
import { toast } from "sonner";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: MemberDebt | null;
  onSuccess?: () => void;
}

export function DebtPaymentModal({ isOpen, onClose, debt, onSuccess }: DebtPaymentModalProps) {
  const { payDebt, isLoading: isProcessing } = useMemberDebtActions();
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "DEBIT" | "CREDIT">("CASH");
  const [notes, setNotes] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  if (!debt) return null;

  const handleReset = () => {
    setAmount(0);
    setPaymentMethod("CASH");
    setNotes("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePayment = async (shouldPrint: boolean = false) => {
    if (amount <= 0) {
      toast.error("Jumlah pembayaran harus lebih dari 0");
      return;
    }

    if (amount > debt.remainingAmount) {
      toast.error(`Pembayaran melebihi sisa hutang (Rp ${debt.remainingAmount.toLocaleString("id-ID")})`);
      return;
    }

    try {
      const paymentData: PayMemberDebtRequest = {
        amount,
        paymentMethod,
        notes: notes || undefined,
      };

      const result = await payDebt(debt.id, paymentData);

      if (shouldPrint && result.payment.id) {
        setIsPrinting(true);
        try {
          await printDebtPaymentReceipt(debt.id, result.payment.id);
          toast.success("Nota berhasil dicetak", {
            description: "Silakan ambil nota dari printer",
          });
        } catch (printError) {
          console.error("Print error:", printError);
          toast.warning("Pembayaran berhasil, tapi gagal cetak nota", {
            description: "Anda bisa cetak ulang dari riwayat pembayaran",
          });
        } finally {
          setIsPrinting(false);
        }
      }

      handleReset();
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const quickAmounts = [10000, 50000, 100000, 500000];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran Hutang</DialogTitle>
          <DialogDescription>
            Faktur: <span className="font-bold">{debt.invoiceNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Member Info - Compact */}
          <div className="rounded-lg border bg-muted/50 p-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member</span>
              <span className="font-medium">
                {debt.member?.fullName} ({debt.member?.uniqueId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wilayah</span>
              <span className="font-medium">{debt.member?.regionName}</span>
            </div>
          </div>

          {/* Debt Summary - Compact */}
          <div className="rounded-lg border bg-muted/50 p-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Hutang</span>
              <span className="font-semibold">{formatCurrency(debt.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sudah Dibayar</span>
              <span className="font-semibold text-green-600">{formatCurrency(debt.paidAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1">
              <span className="text-sm font-semibold">Sisa Hutang</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(debt.remainingAmount)}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-1">
            <Label className="text-sm">Jumlah Bayar</Label>
            <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} placeholder="0" autoFocus />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-1">
            {quickAmounts.map((quickAmount) => (
              <Button key={quickAmount} variant="outline" size="sm" onClick={() => setAmount(quickAmount)} disabled={quickAmount > debt.remainingAmount} className="text-xs h-8">
                {formatCurrency(quickAmount).replace("Rp", "").replace(".", "k").trim()}
              </Button>
            ))}
          </div>

          {/* Pay Full Button */}
          <Button variant="outline" size="sm" className="w-full" onClick={() => setAmount(debt.remainingAmount)}>
            Bayar Lunas ({formatCurrency(debt.remainingAmount)})
          </Button>

          {/* Payment Method */}
          <div className="space-y-1">
            <Label className="text-sm">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={(value: "CASH" | "TRANSFER" | "DEBIT" | "CREDIT") => setPaymentMethod(value)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tunai</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="DEBIT">Debit</SelectItem>
                <SelectItem value="CREDIT">Kartu Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-sm">Catatan (Opsional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan pembayaran..." rows={2} className="text-sm" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={isProcessing || isPrinting} className="flex-1">
              Batal
            </Button>
            <Button size="sm" onClick={() => handlePayment(false)} disabled={isProcessing || isPrinting || amount <= 0} className="flex-1 gap-1">
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Proses
                </>
              ) : (
                <>
                  <DollarSign className="h-3 w-3" />
                  Bayar
                </>
              )}
            </Button>
            <Button size="sm" onClick={() => handlePayment(true)} disabled={isProcessing || isPrinting || amount <= 0} className="flex-1 gap-1" variant="default">
              {isPrinting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Cetak
                </>
              ) : (
                <>
                  <Printer className="h-3 w-3" />
                  Cetak
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

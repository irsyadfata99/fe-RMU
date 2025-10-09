// src/components/transactions/payment-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CreditCard, Banknote } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  hasMember: boolean;
  onConfirm: (data: any) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  hasMember,
  onConfirm,
}: PaymentModalProps) {
  const [saleType, setSaleType] = useState<"TUNAI" | "KREDIT">("TUNAI");
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [dpAmount, setDpAmount] = useState(0);
  const [dueDate, setDueDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  const change = paymentReceived - totalAmount;
  const remainingDebt = totalAmount - dpAmount;

  const handleConfirm = () => {
    if (saleType === "TUNAI") {
      if (paymentReceived < totalAmount) {
        alert("Pembayaran kurang dari total belanja");
        return;
      }
      onConfirm({
        saleType: "TUNAI",
        paymentReceived,
        notes,
      });
    } else {
      if (!hasMember) {
        alert("Pilih member untuk transaksi kredit");
        return;
      }
      if (!dueDate) {
        alert("Pilih tanggal jatuh tempo");
        return;
      }
      onConfirm({
        saleType: "KREDIT",
        dpAmount,
        dueDate: format(dueDate, "yyyy-MM-dd"),
        notes,
      });
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran</DialogTitle>
          <DialogDescription>
            Total:{" "}
            <span className="font-bold">{formatCurrency(totalAmount)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={saleType} onValueChange={(v) => setSaleType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="TUNAI">
              <Banknote className="mr-2 h-4 w-4" />
              Tunai
            </TabsTrigger>
            <TabsTrigger value="KREDIT" disabled={!hasMember}>
              <CreditCard className="mr-2 h-4 w-4" />
              Kredit
            </TabsTrigger>
          </TabsList>

          {/* TUNAI */}
          <TabsContent value="TUNAI" className="space-y-4">
            <div className="space-y-2">
              <Label>Jumlah Bayar</Label>
              <Input
                type="number"
                value={paymentReceived}
                onChange={(e) => setPaymentReceived(Number(e.target.value))}
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentReceived(amount)}
                >
                  {formatCurrency(amount).replace("Rp", "").trim()}
                </Button>
              ))}
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-semibold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bayar</span>
                <span className="font-semibold">
                  {formatCurrency(paymentReceived)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-semibold">Kembalian</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(change > 0 ? change : 0)}
                </span>
              </div>
            </div>
          </TabsContent>

          {/* KREDIT */}
          <TabsContent value="KREDIT" className="space-y-4">
            <div className="space-y-2">
              <Label>DP (Down Payment)</Label>
              <Input
                type="number"
                value={dpAmount}
                onChange={(e) => setDpAmount(Number(e.target.value))}
                placeholder="0 (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Jatuh Tempo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, "PPP", { locale: id })
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-semibold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>DP</span>
                <span className="font-semibold">
                  {formatCurrency(dpAmount)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-semibold">Sisa Hutang</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(remainingDebt)}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>Catatan (Opsional)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan transaksi..."
            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Konfirmasi Pembayaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

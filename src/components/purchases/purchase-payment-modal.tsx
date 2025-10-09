// src/components/purchases/purchase-payment-modal.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchasePaymentSchema, PurchasePaymentForm } from "@/lib/validations";
import { Purchase } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PurchasePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onConfirm: (data: PurchasePaymentForm) => Promise<void>;
  isLoading: boolean;
}

export function PurchasePaymentModal({
  isOpen,
  onClose,
  purchase,
  onConfirm,
  isLoading,
}: PurchasePaymentModalProps) {
  const form = useForm<PurchasePaymentForm>({
    resolver: zodResolver(purchasePaymentSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  });

  const amount = form.watch("amount") || 0;
  const remainingAfterPayment = purchase ? purchase.remainingDebt - amount : 0;

  const handleSubmit = async (data: PurchasePaymentForm) => {
    await onConfirm(data);
    form.reset();
  };

  const quickAmounts = [50000, 100000, 500000, 1000000];

  if (!purchase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bayar Hutang Pembelian</DialogTitle>
          <DialogDescription>
            Invoice: <span className="font-mono">{purchase.invoiceNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pembelian</span>
            <span className="font-semibold">
              {formatCurrency(purchase.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sudah Dibayar</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(purchase.paidAmount)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Sisa Hutang</span>
            <span className="text-lg font-bold text-orange-600">
              {formatCurrency(purchase.remainingDebt)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Bayar *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setValue("amount", quickAmount)}
                  disabled={isLoading}
                >
                  {(quickAmount / 1000).toFixed(0)}k
                </Button>
              ))}
            </div>

            {/* Lunas Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => form.setValue("amount", purchase.remainingDebt)}
              disabled={isLoading}
            >
              Bayar Lunas ({formatCurrency(purchase.remainingDebt)})
            </Button>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Catatan pembayaran (opsional)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {amount > 0 && (
              <div className="rounded-lg bg-primary/10 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span className="font-semibold">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Setelah Bayar</span>
                  <span
                    className={
                      remainingAfterPayment === 0
                        ? "font-semibold text-green-600"
                        : "font-semibold text-orange-600"
                    }
                  >
                    {formatCurrency(
                      remainingAfterPayment > 0 ? remainingAfterPayment : 0
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Bayar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// src/app/dashboard/transaksi/pembelian/[id]/page.tsx
"use client";

import { use, useState } from "react"; // ✅ Import 'use' from React
import { usePurchase, usePurchaseActions } from "@/hooks/usePurchase";
import { PurchaseDetail } from "@/components/purchases/purchase-detail";
import { PurchasePaymentModal } from "@/components/purchases/purchase-payment-modal";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

export default function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Ubah type menjadi Promise
}) {
  // ✅ Unwrap params menggunakan React.use()
  const { id } = use(params);

  const { purchase, isLoading, mutate } = usePurchase(id);
  const { updatePayment, isLoading: isUpdating } = usePurchaseActions();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePaymentSubmit = async (data: {
    amount: number;
    notes?: string;
  }) => {
    try {
      await updatePayment(id, data);
      setIsPaymentModalOpen(false);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Pembelian tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transaksi/pembelian/riwayat">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detail Pembelian</h1>
            <p className="text-muted-foreground">
              Invoice: {purchase.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Payment Button for KREDIT */}
        {purchase.purchaseType === "KREDIT" && purchase.remainingDebt > 0 && (
          <Button onClick={() => setIsPaymentModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Bayar Hutang
          </Button>
        )}
      </div>

      {/* Detail */}
      <PurchaseDetail purchase={purchase} />

      {/* Payment Modal */}
      <PurchasePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        purchase={purchase}
        onConfirm={handlePaymentSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}

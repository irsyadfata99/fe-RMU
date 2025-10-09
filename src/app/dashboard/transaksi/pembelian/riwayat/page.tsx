// src/app/dashboard/transaksi/pembelian/riwayat/page.tsx
"use client";

import { useState } from "react";
import { usePurchases, usePurchaseActions } from "@/hooks/usePurchase";
import { useSuppliers } from "@/hooks/useSupplier";
import { useCurrentUser } from "@/hooks/useAuth";
import { PurchaseTable } from "@/components/purchases/purchase-table";
import { PurchasePaymentModal } from "@/components/purchases/purchase-payment-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, History } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Purchase } from "@/types";

export default function PurchaseHistoryPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [page, setPage] = useState(1);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );

  const { purchases, isLoading, mutate } = usePurchases({
    page,
    limit: 10,
    search,
    purchaseType: purchaseType || undefined,
    status: status || undefined,
    supplierId: supplierId || undefined,
  });

  const { suppliers } = useSuppliers({ isActive: true });
  const { updatePayment, isLoading: isUpdating } = usePurchaseActions();

  const handlePayment = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: {
    amount: number;
    notes?: string;
  }) => {
    if (!selectedPurchase) return;

    try {
      await updatePayment(selectedPurchase.id, data);
      setIsPaymentModalOpen(false);
      setSelectedPurchase(null);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Riwayat Pembelian
          </h1>
          <p className="text-muted-foreground">
            Daftar semua transaksi pembelian barang
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Link href="/dashboard/transaksi/pembelian">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Input Pembelian
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Semua Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Supplier</SelectItem>
            {suppliers?.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={purchaseType} onValueChange={setPurchaseType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua</SelectItem>
            <SelectItem value="TUNAI">Tunai</SelectItem>
            <SelectItem value="KREDIT">Kredit</SelectItem>
            <SelectItem value="KONSINYASI">Konsinyasi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua</SelectItem>
            <SelectItem value="PAID">Lunas</SelectItem>
            <SelectItem value="PARTIAL">Sebagian</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <PurchaseTable
          purchases={purchases || []}
          onPayment={handlePayment}
          userRole={user?.role || "KASIR"}
        />
      )}

      {/* Payment Modal */}
      <PurchasePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPurchase(null);
        }}
        purchase={selectedPurchase}
        onConfirm={handlePaymentSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}

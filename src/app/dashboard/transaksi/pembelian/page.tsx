// src/app/dashboard/transaksi/pembelian/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { usePurchaseActions } from "@/hooks/usePurchase";
import { PurchaseFormData } from "@/lib/validations";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreatePurchasePage() {
  const router = useRouter();
  const { createPurchase, isLoading } = usePurchaseActions();

  const handleSubmit = async (data: PurchaseFormData) => {
    try {
      // Transform data to match API
      const purchaseData = {
        supplierId: data.supplierId,
        supplierInvoiceNumber: data.supplierInvoiceNumber,
        purchaseType: data.purchaseType as "TUNAI" | "KREDIT" | "KONSINYASI",
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          expDate: item.expDate,
        })),
        paidAmount: data.paidAmount || 0,
        dueDate: data.dueDate,
        notes: data.notes,
      };

      await createPurchase(purchaseData);
      router.push("/dashboard/transaksi/pembelian/riwayat");
    } catch (error) {
      // Error handled by hook
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transaksi/pembelian/riwayat">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Input Pembelian Barang
          </h1>
          <p className="text-muted-foreground">
            Tambah stok barang dari supplier
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">ℹ️</div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-blue-900">
              Petunjuk Input Pembelian:
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-0.5">
              <li>Pilih supplier terlebih dahulu</li>
              <li>
                <strong>TUNAI</strong> = Bayar langsung saat barang datang
              </li>
              <li>
                <strong>KREDIT</strong> = Hutang ke supplier (wajib isi jatuh
                tempo)
              </li>
              <li>
                <strong>KONSINYASI</strong> = Bayar sesuai barang yang laku
              </li>
              <li>Harga beli & jual akan otomatis update di master produk</li>
              <li>Stok akan otomatis bertambah setelah disimpan</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Form */}
      <PurchaseForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

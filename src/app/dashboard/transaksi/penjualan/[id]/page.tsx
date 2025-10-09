// src/app/dashboard/transaksi/penjualan/[id]/page.tsx
"use client";

import { useTransaction } from "@/hooks/useTransaction";
import { InvoicePreview } from "@/components/transactions/invoice-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function TransactionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { transaction, isLoading } = useTransaction(params.id);

  const handlePrint = () => {
    if (!transaction) return;

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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Transaksi tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transaksi/penjualan">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detail Transaksi</h1>
            <p className="text-muted-foreground">{transaction.invoiceNumber}</p>
          </div>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak {transaction.saleType === "TUNAI" ? "Struk" : "Invoice"}
        </Button>
      </div>

      {/* Invoice Preview */}
      <InvoicePreview transaction={transaction} />
    </div>
  );
}

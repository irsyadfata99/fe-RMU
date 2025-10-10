// src/app/dashboard/transaksi/penjualan/[id]/page.tsx
"use client";

import { use } from "react";
import { useTransaction } from "@/hooks/useTransaction";
import { InvoicePreview } from "@/components/transactions/invoice-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { transaction, isLoading } = useTransaction(id);

  // ✅ FIXED: Print invoice langsung dengan fetch HTML lalu print
  const handlePrintInvoice = async () => {
    if (!transaction) return;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

      // Tentukan endpoint print berdasarkan jenis transaksi
      const printEndpoint =
        transaction.saleType === "KREDIT"
          ? "print/invoice" // Dot matrix untuk KREDIT
          : "print/thermal"; // Thermal untuk TUNAI

      const printUrl = `${baseUrl}/sales/${transaction.id}/${printEndpoint}`;

      toast.loading("Memuat invoice...");

      // ✅ Fetch HTML dari backend
      const response = await fetch(printUrl);

      if (!response.ok) {
        throw new Error("Gagal memuat invoice");
      }

      const html = await response.text();

      // ✅ Buat window baru dan tulis HTML
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error(
          "Pop-up diblokir! Silakan izinkan pop-up untuk browser ini."
        );
        // Fallback: buka di tab baru
        window.open(printUrl, "_blank");
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();

      toast.dismiss();
      toast.success("Invoice siap dicetak");
    } catch (error) {
      console.error("Print error:", error);
      toast.dismiss();
      toast.error("Gagal memuat invoice");
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
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">
          Transaksi tidak ditemukan
        </p>
        <Link href="/dashboard/transaksi/penjualan">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Riwayat
          </Button>
        </Link>
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

        {/* ✅ Print menggunakan dot matrix format */}
        <Button onClick={handlePrintInvoice} size="lg">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Invoice
        </Button>
      </div>

      {/* Invoice Preview */}
      <InvoicePreview transaction={transaction} />
    </div>
  );
}

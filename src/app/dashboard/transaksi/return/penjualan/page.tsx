// src/app/dashboard/transaksi/return/penjualan/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSalesReturns, useReturnActions } from "@/hooks/useReturn";
import { useCurrentUser } from "@/hooks/useAuth";
import { ReturnItemSelector } from "@/components/returns/return-item-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const salesReturnSchema = z.object({
  saleId: z.string().min(1, "Pilih transaksi penjualan"),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
  refundMethod: z.enum(["CASH", "DEBT_DEDUCTION", "STORE_CREDIT"], {
    message: "Pilih metode refund",
  }),
  notes: z.string().optional(),
});

type SalesReturnFormData = z.infer<typeof salesReturnSchema>;

export default function CreateSalesReturnPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [saleSearch, setSaleSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [isLoadingSale, setIsLoadingSale] = useState(false);

  const { createSalesReturn, isLoading } = useReturnActions();

  const form = useForm<SalesReturnFormData>({
    resolver: zodResolver(salesReturnSchema),
    defaultValues: {
      saleId: "",
      reason: "",
      refundMethod: "CASH",
      notes: "",
    },
  });

  const handleSearchSale = async () => {
    if (!saleSearch.trim()) return;

    setIsLoadingSale(true);
    try {
      const sale = await apiClient.get<any>(`/sales/search/${saleSearch}`);
      setSelectedSale(sale);
      form.setValue("saleId", sale.id);

      // Set available products from sale items
      const products = sale.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        price: item.sellingPrice,
        maxQuantity: item.quantity,
      }));
      setAvailableProducts(products);
      setReturnItems([]);
    } catch (error) {
      console.error("Sale not found:", error);
      alert("Transaksi tidak ditemukan");
    } finally {
      setIsLoadingSale(false);
    }
  };

  const handleSubmit = async (data: SalesReturnFormData) => {
    if (returnItems.length === 0) {
      alert("Pilih minimal 1 produk untuk diretur");
      return;
    }

    try {
      const payload = {
        saleId: data.saleId,
        items: returnItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        reason: data.reason,
        refundMethod: data.refundMethod,
        notes: data.notes,
      };

      await createSalesReturn(payload);
      router.push("/dashboard/transaksi/return/riwayat");
    } catch (error) {
      console.error("Failed to create sales return:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transaksi/return/riwayat">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            Buat Retur Penjualan
          </h1>
          <p className="text-muted-foreground">Return barang dari penjualan</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <div className="text-sm text-blue-700 space-y-1">
            <p className="font-semibold">Petunjuk Retur Penjualan:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Masukkan nomor invoice untuk mencari transaksi</li>
              <li>Pilih produk yang akan diretur</li>
              <li>Stok akan otomatis bertambah setelah retur disetujui</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Search Sale */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Transaksi Penjualan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan nomor invoice..."
              value={saleSearch}
              onChange={(e) => setSaleSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSale()}
              className="flex-1"
            />
            <Button onClick={handleSearchSale} disabled={isLoadingSale}>
              {isLoadingSale ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Cari"
              )}
            </Button>
          </div>

          {selectedSale && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-semibold">
                    {selectedSale.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span>
                    {new Date(selectedSale.saleDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member</span>
                  <span>{selectedSale.member?.fullName || "UMUM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSale.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Form */}
      {selectedSale && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Items Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Produk yang Diretur</CardTitle>
              </CardHeader>
              <CardContent>
                <ReturnItemSelector
                  availableProducts={availableProducts}
                  items={returnItems}
                  onChange={setReturnItems}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Retur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="refundMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metode Refund *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="DEBT_DEDUCTION">
                            Potong Hutang
                          </SelectItem>
                          <SelectItem value="STORE_CREDIT">
                            Store Credit
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alasan Retur *</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Jelaskan alasan retur (minimal 10 karakter)"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Tambahan</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Catatan tambahan (opsional)"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || returnItems.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Buat Retur"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

// src/app/dashboard/transaksi/return/pembelian/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReturnActions } from "@/hooks/useReturn";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const purchaseReturnSchema = z.object({
  purchaseId: z.string().min(1, "Pilih transaksi pembelian"),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
  notes: z.string().optional(),
});

type PurchaseReturnFormData = z.infer<typeof purchaseReturnSchema>;

export default function CreatePurchaseReturnPage() {
  const router = useRouter();
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);

  const { createPurchaseReturn, isLoading } = useReturnActions();

  const form = useForm<PurchaseReturnFormData>({
    resolver: zodResolver(purchaseReturnSchema),
    defaultValues: {
      purchaseId: "",
      reason: "",
      notes: "",
    },
  });

  const handleSearchPurchase = async () => {
    if (!purchaseSearch.trim()) return;

    setIsLoadingPurchase(true);
    try {
      const purchase = await apiClient.get<any>(
        `/purchases/search/${purchaseSearch}`
      );
      setSelectedPurchase(purchase);
      form.setValue("purchaseId", purchase.id);

      const products = purchase.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product?.name || item.productName,
        unit: item.unit,
        price: item.purchasePrice,
        maxQuantity: item.quantity,
      }));
      setAvailableProducts(products);
      setReturnItems([]);
    } catch (error) {
      console.error("Purchase not found:", error);
      alert("Pembelian tidak ditemukan");
    } finally {
      setIsLoadingPurchase(false);
    }
  };

  const handleSubmit = async (data: PurchaseReturnFormData) => {
    if (returnItems.length === 0) {
      alert("Pilih minimal 1 produk untuk diretur");
      return;
    }

    try {
      const payload = {
        purchaseId: data.purchaseId,
        items: returnItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        reason: data.reason,
        notes: data.notes,
      };

      await createPurchaseReturn(payload);
      router.push("/dashboard/transaksi/return/riwayat");
    } catch (error) {
      console.error("Failed to create purchase return:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transaksi/return/riwayat">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            Buat Retur Pembelian
          </h1>
          <p className="text-muted-foreground">Return barang ke supplier</p>
        </div>
      </div>

      <Alert className="bg-orange-50 border-orange-200">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="text-sm text-orange-700 space-y-1">
            <p className="font-semibold">Petunjuk Retur Pembelian:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Masukkan nomor invoice untuk mencari pembelian</li>
              <li>Pilih produk yang akan diretur ke supplier</li>
              <li>Stok akan otomatis berkurang setelah retur disetujui</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Cari Transaksi Pembelian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan nomor invoice..."
              value={purchaseSearch}
              onChange={(e) => setPurchaseSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchPurchase()}
              className="flex-1"
            />
            <Button onClick={handleSearchPurchase} disabled={isLoadingPurchase}>
              {isLoadingPurchase ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                "Cari"
              )}
            </Button>
          </div>

          {selectedPurchase && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-mono font-semibold">
                    {selectedPurchase.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier</span>
                  <span>{selectedPurchase.supplier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedPurchase.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPurchase && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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

            <Card>
              <CardHeader>
                <CardTitle>Detail Retur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

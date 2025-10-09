// src/components/stock/stock-adjustment-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockAdjustmentSchema,
  StockAdjustmentFormData,
  ADJUSTMENT_TYPE_LABELS,
} from "@/lib/validations";
import { Product } from "@/types";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StockAdjustmentFormProps {
  onSubmit: (data: StockAdjustmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function StockAdjustmentForm({
  onSubmit,
  onCancel,
  isLoading,
}: StockAdjustmentFormProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: "",
      adjustmentType: "DAMAGED",
      quantity: 0,
      reason: "",
      notes: "",
    },
  });

  // Product autocomplete
  const { data: products } = useSWR(
    search.length >= 2 ? `/products/autocomplete?query=${search}` : null,
    (url) => apiClient.get<Product[]>(url)
  );

  const adjustmentType = form.watch("adjustmentType");
  const quantity = form.watch("quantity");

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch("");
    setShowResults(false);
    form.setValue("productId", product.id);
  };

  const isReducingStock = ["DAMAGED", "EXPIRED", "LOST", "LEAKED"].includes(
    adjustmentType
  );

  const newStockAfter = selectedProduct ? selectedProduct.stock + quantity : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProduct ? (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {selectedProduct.sku}
                    </p>
                    <p className="text-sm">
                      Stok Saat Ini:{" "}
                      <span className="font-semibold">
                        {selectedProduct.stock} {selectedProduct.unit}
                      </span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      form.setValue("productId", "");
                    }}
                  >
                    Ganti
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Cari produk berdasarkan nama atau SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                />
                {showResults && products && products.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full px-4 py-3 text-left hover:bg-accent"
                      >
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku} | Stok: {product.stock}{" "}
                          {product.unit}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <FormMessage>
              {form.formState.errors.productId?.message}
            </FormMessage>
          </CardContent>
        </Card>

        {/* Adjustment Details */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Detail Penyesuaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adjustment Type */}
              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Penyesuaian *</FormLabel>
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
                        {Object.entries(ADJUSTMENT_TYPE_LABELS).map(
                          ([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jumlah {isReducingStock ? "Pengurangan" : "Penambahan"} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(
                            isReducingStock ? -Math.abs(value) : Math.abs(value)
                          );
                        }}
                        value={Math.abs(field.value)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {isReducingStock ? (
                        <span className="text-red-600">
                          Stok akan dikurangi (-)
                        </span>
                      ) : (
                        <span className="text-green-600">
                          Stok akan ditambah (+)
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              {quantity !== 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Preview Perubahan:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span>Stok Sekarang: {selectedProduct.stock}</span>
                        <span>→</span>
                        <span
                          className={
                            quantity > 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {quantity > 0 ? "+" : ""}
                          {quantity}
                        </span>
                        <span>→</span>
                        <span className="font-semibold">
                          Stok Baru: {newStockAfter}
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan *</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Jelaskan alasan penyesuaian stok (minimal 10 karakter)"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
        )}

        {/* Action Buttons */}
        {selectedProduct && (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Penyesuaian"
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

export default StockAdjustmentForm;

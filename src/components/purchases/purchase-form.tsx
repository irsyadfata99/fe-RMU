// src/components/purchases/purchase-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, PurchaseFormData } from "@/lib/validations";
import { useSuppliers } from "@/hooks/useSupplier";
import { PurchaseItemRow } from "./purchase-item-row";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PurchaseFormProps {
  onSubmit: (data: PurchaseFormData) => Promise<void>;
  isLoading: boolean;
}

export function PurchaseForm({ onSubmit, isLoading }: PurchaseFormProps) {
  const { suppliers } = useSuppliers({ isActive: true });
  const [items, setItems] = useState<any[]>([{}]);

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: "",
      supplierInvoiceNumber: "",
      purchaseType: "TUNAI",
      items: [],
      paidAmount: 0,
      dueDate: "",
      notes: "",
    },
  });

  const purchaseType = form.watch("purchaseType");
  const paidAmount = form.watch("paidAmount") || 0;

  const handleAddItem = () => {
    setItems([...items, {}]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  const handleItemChange = (
    index: number,
    data: {
      productId: string;
      quantity: number;
      purchasePrice: number;
      sellingPrice: number;
      expDate?: string;
    }
  ) => {
    const currentItems = form.getValues("items");
    currentItems[index] = data;
    form.setValue("items", currentItems);
  };

  const totalAmount = form
    .watch("items")
    .reduce(
      (sum, item) => sum + (item?.purchasePrice || 0) * (item?.quantity || 0),
      0
    );

  const remainingDebt = totalAmount - paidAmount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembelian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Supplier */}
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.code} - {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Number */}
              <FormField
                control={form.control}
                name="supplierInvoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Invoice Supplier</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Opsional (auto-generate)"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Purchase Type */}
              <FormField
                control={form.control}
                name="purchaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Pembelian *</FormLabel>
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
                        <SelectItem value="TUNAI">Tunai</SelectItem>
                        <SelectItem value="KREDIT">Kredit</SelectItem>
                        <SelectItem value="KONSINYASI">Konsinyasi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date (if KREDIT) */}
              {purchaseType === "KREDIT" && (
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jatuh Tempo *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

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
                      placeholder="Catatan pembelian (opsional)"
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

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Item Pembelian</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-3">Produk</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-1">Satuan</div>
              <div className="col-span-2">Harga Beli</div>
              <div className="col-span-2">Harga Jual</div>
              <div className="col-span-2">Exp Date</div>
              <div className="col-span-1 text-right">Subtotal</div>
            </div>

            {/* Items */}
            {items.map((_, index) => (
              <PurchaseItemRow
                key={index}
                index={index}
                onRemove={handleRemoveItem}
                onChange={handleItemChange}
              />
            ))}

            {items.length === 0 && (
              <div className="flex h-32 items-center justify-center border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Belum ada item. Klik Tambah Item untuk mulai.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Pembelian</span>
                <span className="font-semibold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Paid Amount */}
              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Bayar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {purchaseType === "KREDIT" && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-orange-600">
                      Sisa Hutang
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {formatCurrency(remainingDebt > 0 ? remainingDebt : 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => window.history.back()}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading || items.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Simpan Pembelian"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

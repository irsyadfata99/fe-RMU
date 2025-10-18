"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductForm as ProductFormType } from "@/lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product, ProductType } from "@/types";
import useSWR from "swr";
import { arrayFetcher, ensureArray } from "@/lib/swr-fetcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormType) => void;
  isLoading: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useSWR("/categories", arrayFetcher);
  const { data: suppliersData } = useSWR("/suppliers", arrayFetcher);

  const categories = ensureArray(categoriesData) as Category[];
  const suppliers = ensureArray(suppliersData) as Supplier[];

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          categoryId: initialData.categoryId || "",
          name: initialData.name || "",
          productType: initialData.productType || ProductType.CASH,
          expiryDate: initialData.expiryDate || undefined,
          minStock: Number(initialData.minStock) || 0,
          maxStock: Number(initialData.maxStock) || 0,
          description: initialData.description || "",
          sellingPriceGeneral: Number(initialData.sellingPriceGeneral) || 0,
          sellingPriceMember: Number(initialData.sellingPriceMember) || 0,
          points: Number(initialData.points) || 0,
          unit: initialData.unit || "PCS",
          supplierId: initialData.supplierId || undefined,
          barcode: initialData.barcode || undefined,
          purchaseType: (initialData.purchaseType as "TUNAI" | "KREDIT" | "KONSINYASI") || "TUNAI",
          invoiceNo: initialData.invoiceNo || undefined,
          purchasePrice: Number(initialData.purchasePrice) || 0,
          stock: Number(initialData.stock) || 0,
        }
      : {
          categoryId: "",
          name: "",
          productType: ProductType.CASH,
          expiryDate: undefined,
          minStock: 0,
          maxStock: 0,
          description: "",
          sellingPriceGeneral: 0,
          sellingPriceMember: 0,
          points: 0,
          unit: "PCS",
          supplierId: undefined,
          barcode: undefined,
          purchaseType: "TUNAI",
          invoiceNo: undefined,
          purchasePrice: 0,
          stock: 0,
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informasi Dasar</h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Beras Premium 5kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Tidak ada kategori
                        </SelectItem>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan *</FormLabel>
                    <FormControl>
                      <Input placeholder="PCS, KG, LITER" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="8991234567890" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Beli *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPriceGeneral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual Umum *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sellingPriceMember"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga Jual Member *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Harga khusus untuk anggota koperasi</p>
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Awal *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Minimum *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informasi Supplier & Point</h3>

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada supplier</SelectItem>
                      {suppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pembelian *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis pembelian" />
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

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Produk</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProductType.CASH}>Tunai</SelectItem>
                      <SelectItem value={ProductType.INSTALLMENT}>Beli Putus</SelectItem>
                      <SelectItem value={ProductType.CONSIGNMENT}>Konsinyasi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Deskripsi produk (opsional)"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Produk"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

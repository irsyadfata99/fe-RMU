// src/app/(protected)/dashboard/products/stock-opname/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Eye, Search, ClipboardCheck, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiClient, handleApiError } from "@/lib/api";
import { StockOpname, Product, Category } from "@/types";
import { stockOpnameSchema, StockOpnameForm } from "@/lib/validations";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/utils";

export default function StockOpnamePage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOpname, setSelectedOpname] = useState<StockOpname | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: opnames, isLoading: loadingOpnames, mutate } = useSWR<StockOpname[]>("/products/stock-opname", (url) => apiClient.get<StockOpname[]>(url));
  const { data: products } = useSWR<Product[]>("/products", (url) => apiClient.get<Product[]>(url));
  const { data: categories } = useSWR<Category[]>("/products/categories", (url) => apiClient.get<Category[]>(url));

  const form = useForm<StockOpnameForm>({
    resolver: zodResolver(stockOpnameSchema),
    defaultValues: {
      productId: "",
      physicalStock: 0,
      notes: "",
    },
  });

  // Get selected product for showing system stock
  const selectedProductId = form.watch("productId");
  const selectedProduct = products?.find((p) => p.id === selectedProductId);

  // Filter opnames
  const filteredOpnames = opnames?.filter((opname) => {
    const matchSearch = opname.productName.toLowerCase().includes(search.toLowerCase());
    const product = products?.find((p) => p.id === opname.productId);
    const matchCategory = categoryFilter === "all" || product?.categoryId === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Calculate stats
  const totalOpnames = opnames?.length || 0;
  const totalDifference = opnames?.reduce((sum, op) => sum + Math.abs(op.difference), 0) || 0;
  const positiveCount = opnames?.filter((op) => op.difference > 0).length || 0;
  const negativeCount = opnames?.filter((op) => op.difference < 0).length || 0;

  // Handle create opname
  const handleSubmit = async (data: StockOpnameForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/products/stock-opname", data);
      toast.success("Stock opname berhasil dicatat");
      mutate();
      handleCloseDialog();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = () => {
    form.reset({
      productId: "",
      physicalStock: 0,
      notes: "",
    });
    setDialogOpen(true);
  };

  const handleViewDetail = (opname: StockOpname) => {
    setSelectedOpname(opname);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    form.reset();
  };

  const getDifferenceBadge = (difference: number) => {
    if (difference === 0) {
      return (
        <Badge variant="default" className="bg-blue-500">
          Sesuai
        </Badge>
      );
    } else if (difference > 0) {
      return (
        <Badge variant="default" className="bg-green-500">
          +{difference}
        </Badge>
      );
    } else {
      return <Badge variant="destructive">{difference}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Opname</h1>
          <p className="text-muted-foreground">Pencatatan dan pengecekan stok fisik barang</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Catat Opname
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Opname</p>
                <p className="text-2xl font-bold">{totalOpnames}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Selisih</p>
                <p className="text-2xl font-bold">{totalDifference}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Lebih</p>
                <p className="text-2xl font-bold">{positiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-500/10 p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Kurang</p>
                <p className="text-2xl font-bold">{negativeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Stock Opname</CardTitle>
          <CardDescription>Semua pencatatan stock opname produk</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOpnames ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredOpnames && filteredOpnames.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Stok Fisik</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpnames.map((opname) => (
                    <TableRow key={opname.id}>
                      <TableCell className="text-sm">{formatDate(opname.createdAt)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{opname.productName}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{opname.systemStock}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{opname.physicalStock}</span>
                      </TableCell>
                      <TableCell>{getDifferenceBadge(opname.difference)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{opname.userName}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(opname)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{search || (categoryFilter && categoryFilter !== "all") ? "Tidak ada data opname yang ditemukan" : "Belum ada pencatatan stock opname"}</div>
          )}
        </CardContent>
      </Card>

      {/* Add Opname Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Catat Stock Opname</DialogTitle>
            <DialogDescription>Catat hasil pengecekan stok fisik barang</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produk *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id}>
                            {prod.name} - Stok: {prod.stock} {prod.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProduct && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stok Sistem:</span>
                    <span className="font-semibold">
                      {selectedProduct.stock} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kategori:</span>
                    <span>{selectedProduct.categoryName}</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="physicalStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok Fisik *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} disabled={isSubmitting} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Masukkan jumlah stok fisik hasil pengecekan</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProduct && form.watch("physicalStock") !== undefined && (
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-medium">Selisih:</p>
                  <div className="flex items-center gap-2">
                    {form.watch("physicalStock") - selectedProduct.stock === 0 ? (
                      <Badge variant="default" className="bg-blue-500">
                        Sesuai (0)
                      </Badge>
                    ) : form.watch("physicalStock") - selectedProduct.stock > 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        Lebih +{form.watch("physicalStock") - selectedProduct.stock}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Kurang {form.watch("physicalStock") - selectedProduct.stock}</Badge>
                    )}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Catatan tambahan (opsional)..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Opname"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Stock Opname</DialogTitle>
            <DialogDescription>Informasi lengkap pencatatan stock opname</DialogDescription>
          </DialogHeader>
          {selectedOpname && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Produk</p>
                <p className="font-medium text-lg">{selectedOpname.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="text-sm">{formatDate(selectedOpname.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Petugas</p>
                  <p className="text-sm">{selectedOpname.userName}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stok Sistem:</span>
                  <span className="font-semibold text-lg">{selectedOpname.systemStock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stok Fisik:</span>
                  <span className="font-semibold text-lg">{selectedOpname.physicalStock}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">Selisih:</span>
                  {getDifferenceBadge(selectedOpname.difference)}
                </div>
              </div>

              {selectedOpname.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Catatan</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedOpname.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// src/app/(protected)/dashboard/products/returns/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Eye, CheckCircle, XCircle, Search, RotateCcw, AlertCircle } from "lucide-react";
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
import { ProductReturn, Product, Transaction } from "@/types";
import { returnSchema, ReturnForm } from "@/lib/validations";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function ProductReturnsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: returns, isLoading: loadingReturns, mutate } = useSWR<ProductReturn[]>("/products/returns", (url) => apiClient.get<ProductReturn[]>(url));
  const { data: products } = useSWR<Product[]>("/products", (url) => apiClient.get<Product[]>(url));
  const { data: transactions } = useSWR<Transaction[]>("/transactions", (url) => apiClient.get<Transaction[]>(url));

  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      reason: "",
    },
  });

  // Filter returns
  const filteredReturns = returns?.filter((ret) => {
    const matchSearch = ret.productName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || ret.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate stats
  const totalReturns = returns?.length || 0;
  const pendingCount = returns?.filter((r) => r.status === "PENDING").length || 0;
  const approvedCount = returns?.filter((r) => r.status === "APPROVED").length || 0;
  const rejectedCount = returns?.filter((r) => r.status === "REJECTED").length || 0;

  // Handle create return
  const handleSubmit = async (data: ReturnForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/products/returns", data);
      toast.success("Retur barang berhasil diajukan");
      mutate();
      handleCloseDialog();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedReturn) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/products/returns/${selectedReturn.id}/approve`);
      toast.success("Retur barang berhasil disetujui");
      mutate();
      setApproveDialogOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedReturn) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/products/returns/${selectedReturn.id}/reject`);
      toast.success("Retur barang berhasil ditolak");
      mutate();
      setRejectDialogOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = () => {
    form.reset({
      productId: "",
      quantity: 1,
      reason: "",
    });
    setDialogOpen(true);
  };

  const handleViewDetail = (returnItem: ProductReturn) => {
    setSelectedReturn(returnItem);
    setDetailDialogOpen(true);
  };

  const handleApproveClick = (returnItem: ProductReturn) => {
    setSelectedReturn(returnItem);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (returnItem: ProductReturn) => {
    setSelectedReturn(returnItem);
    setRejectDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: ReturnStatus) => {
    const variants: Record<ReturnStatus, { variant: "default" | "destructive" | "secondary"; label: string; className?: string }> = {
      PENDING: { variant: "secondary", label: "Menunggu", className: "bg-yellow-500 text-white" },
      APPROVED: { variant: "default", label: "Disetujui", className: "bg-green-500 text-white" },
      REJECTED: { variant: "destructive", label: "Ditolak" },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Return Barang</h1>
          <p className="text-muted-foreground">Kelola retur barang dari pelanggan</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Retur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Retur</p>
                <p className="text-2xl font-bold">{totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disetujui</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-500/10 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="APPROVED">Disetujui</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Retur Barang</CardTitle>
          <CardDescription>Semua pengajuan retur barang dari pelanggan</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReturns ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredReturns && filteredReturns.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="text-sm">{formatDate(returnItem.createdAt)}</TableCell>
                      <TableCell className="font-mono text-sm">{returnItem.transactionId.slice(0, 8)}</TableCell>
                      <TableCell>
                        <p className="font-medium">{returnItem.productName}</p>
                      </TableCell>
                      <TableCell>{returnItem.quantity} pcs</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">{returnItem.reason}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleViewDetail(returnItem)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {returnItem.status === "PENDING" && (
                            <>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleApproveClick(returnItem)}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleRejectClick(returnItem)}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{search || (statusFilter && statusFilter !== "all") ? "Tidak ada retur yang ditemukan" : "Belum ada retur barang"}</div>
          )}
        </CardContent>
      </Card>

      {/* Add Return Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Retur Barang</DialogTitle>
            <DialogDescription>Ajukan retur barang dari pelanggan</DialogDescription>
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
                            {prod.name} - {prod.barcode}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} disabled={isSubmitting} />
                    </FormControl>
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
                        placeholder="Jelaskan alasan retur barang..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  {isSubmitting ? "Mengajukan..." : "Ajukan Retur"}
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
            <DialogTitle>Detail Retur Barang</DialogTitle>
            <DialogDescription>Informasi lengkap retur barang</DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Transaksi</p>
                  <p className="font-mono text-sm">{selectedReturn.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedReturn.status)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama Produk</p>
                <p className="font-medium">{selectedReturn.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                  <p>{selectedReturn.quantity} pcs</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p className="text-sm">{formatDate(selectedReturn.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Alasan Retur</p>
                <p className="text-sm mt-1">{selectedReturn.reason}</p>
              </div>

              {selectedReturn.updatedAt !== selectedReturn.createdAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</p>
                  <p className="text-sm">{formatDate(selectedReturn.updatedAt)}</p>
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

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Retur Barang</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menyetujui retur barang ini?</DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-semibold">Produk:</span> {selectedReturn.productName}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Jumlah:</span> {selectedReturn.quantity} pcs
              </p>
              <p className="text-sm">
                <span className="font-semibold">Alasan:</span> {selectedReturn.reason}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="button" onClick={handleApprove} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Memproses..." : "Setujui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Retur Barang</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menolak retur barang ini?</DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-semibold">Produk:</span> {selectedReturn.productName}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Jumlah:</span> {selectedReturn.quantity} pcs
              </p>
              <p className="text-sm">
                <span className="font-semibold">Alasan:</span> {selectedReturn.reason}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

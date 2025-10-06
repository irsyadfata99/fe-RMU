// src/app/(protected)/dashboard/products/categories/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiClient, handleApiError } from "@/lib/api";
import { Category } from "@/types";
import { categorySchema, CategoryForm } from "@/lib/validations";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/utils";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories, isLoading, mutate } = useSWR<Category[]>("/products/categories", (url) => apiClient.get<Category[]>(url));

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Filter categories based on search
  const filteredCategories = categories?.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));

  // Handle create/edit
  const handleSubmit = async (data: CategoryForm) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update
        await apiClient.put(`/products/categories/${editingCategory.id}`, data);
        toast.success("Kategori berhasil diupdate");
      } else {
        // Create
        await apiClient.post("/products/categories", data);
        toast.success("Kategori berhasil ditambahkan");
      }
      mutate();
      handleCloseDialog();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await apiClient.delete(`/products/categories/${deletingCategory.id}`);
      toast.success("Kategori berhasil dihapus");
      mutate();
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open add dialog
  const handleAdd = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      description: "",
    });
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
    });
    setDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategori Barang</h1>
          <p className="text-muted-foreground">Kelola kategori produk untuk klasifikasi barang</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{categories?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Kategori</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>Semua kategori produk yang tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ? "Aktif" : "Nonaktif"}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(category)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{search ? "Tidak ada kategori yang ditemukan" : "Belum ada kategori"}</div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>{editingCategory ? "Ubah informasi kategori produk" : "Tambahkan kategori produk baru"}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Makanan Ringan" {...field} />
                    </FormControl>
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
                        placeholder="Deskripsi singkat kategori"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
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
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori <strong>{deletingCategory?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

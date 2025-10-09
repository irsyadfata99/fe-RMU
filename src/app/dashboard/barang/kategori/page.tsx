// src/app/dashboard/barang/kategori/page.tsx
"use client";

import { useState } from "react";
import { useCategories, useCategoryActions } from "@/hooks/useCategory";
import { CategoryTable } from "@/components/categories/category-table";
import { CategoryForm } from "@/components/categories/category-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Category } from "@/types";
import { CategoryForm as CategoryFormType } from "@/lib/validations";

export default function CategoriesPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { categories, isLoading, mutate } = useCategories({ search });
  const { createCategory, updateCategory, deleteCategory, toggleActive, isLoading: isSubmitting } = useCategoryActions();

  const handleCreate = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: CategoryFormType) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus kategori ini?")) {
      try {
        await deleteCategory(id);
        mutate();
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleActive(id);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategori Produk</h1>
          <p className="text-muted-foreground">Kelola kategori untuk mengorganisir produk</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <CategoryTable categories={categories || []} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} userRole={user?.role || "KASIR"} />
      )}

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>{editingCategory ? "Perbarui informasi kategori" : "Buat kategori baru untuk mengorganisir produk"}</DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingCategory(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

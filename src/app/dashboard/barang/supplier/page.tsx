// src/app/dashboard/barang/supplier/page.tsx
"use client";

import { useState } from "react";
import { useSuppliers, useSupplierActions } from "@/hooks/useSupplier";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { SupplierDetailCard } from "@/components/suppliers/supplier-detail-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Supplier } from "@/types";
import { SupplierForm as SupplierFormType } from "@/lib/validations";

export default function SuppliersPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  const { suppliers, isLoading, mutate } = useSuppliers({ search });
  const { createSupplier, updateSupplier, deleteSupplier, toggleActive, isLoading: isSubmitting } = useSupplierActions();

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (data: SupplierFormType) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await createSupplier(data);
      }
      setIsDialogOpen(false);
      setEditingSupplier(null);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus supplier ini?")) {
      try {
        await deleteSupplier(id);
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
          <h1 className="text-3xl font-bold">Data Supplier</h1>
          <p className="text-muted-foreground">Kelola supplier dan pemasok produk</p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Supplier
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <SupplierTable suppliers={suppliers || []} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} userRole={user?.role || "KASIR"} />
      )}

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle>
            <DialogDescription>{editingSupplier ? "Perbarui informasi supplier" : "Tambahkan supplier baru ke database"}</DialogDescription>
          </DialogHeader>
          <SupplierForm
            initialData={editingSupplier || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingSupplier(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Sheet Detail */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Supplier</SheetTitle>
            <SheetDescription>Informasi lengkap tentang supplier</SheetDescription>
          </SheetHeader>
          <div className="mt-6">{viewingSupplier && <SupplierDetailCard supplier={viewingSupplier} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

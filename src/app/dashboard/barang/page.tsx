// src/app/dashboard/barang/page.tsx
"use client";

import { useState } from "react";
import { useProducts, useProductActions } from "@/hooks/useProduct";
import { ProductTable } from "@/components/products/product-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";

export default function ProductListPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { products, isLoading, mutate } = useProducts({
    page,
    limit: 10,
    search,
  });
  const { deleteProduct } = useProductActions();

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await deleteProduct(id);
        mutate();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daftar Produk</h1>
          <p className="text-muted-foreground">
            Kelola semua produk di koperasi
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Link href="/dashboard/barang/tambah">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk (nama, barcode, SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ProductTable
          products={products || []}
          onDelete={handleDelete}
          userRole={user?.role || "KASIR"}
        />
      )}
    </div>
  );
}

// ============================================
// src/components/products/product-table.tsx
// ✅ REMOVED status badge column (no soft delete)
// ============================================
"use client";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ensureArray } from "@/lib/swr-fetcher";
import { StockBadge } from "./stock-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[] | undefined | null;
  onDelete: (id: string) => void;
  userRole: string;
}

export function ProductTable({ products, onDelete, userRole }: ProductTableProps) {
  const safeProducts = ensureArray(products);

  if (safeProducts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Stok</TableHead>
            {/* ✅ REMOVED: Status column */}
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell className="font-mono text-xs">{product.barcode || "-"}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.category?.name || "-"}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>
                    {product.stock} {product.unit}
                  </span>
                  <StockBadge stock={product.stock} minStock={product.minStock} />
                </div>
              </TableCell>
              {/* ✅ REMOVED: Status badge cell */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/barang/${product.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {userRole === "ADMIN" && (
                    <>
                      <Link href={`/dashboard/barang/${product.id}/edit`}>
                        <Button variant="ghost" size="icon-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (window.confirm(`⚠️ PERINGATAN!\n\n` + `Produk "${product.name}" akan DIHAPUS PERMANENT dari database.\n\n` + `Data tidak dapat dikembalikan!\n\n` + `Yakin ingin melanjutkan?`)) {
                            onDelete(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
  );
}

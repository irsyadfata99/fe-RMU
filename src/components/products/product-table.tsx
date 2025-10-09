// src/components/products/product-table.tsx
"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { StockBadge } from "./stock-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  userRole: string;
}

export function ProductTable({
  products,
  onDelete,
  userRole,
}: ProductTableProps) {
  if (products.length === 0) {
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
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-xs">{product.sku}</TableCell>
              <TableCell className="font-mono text-xs">
                {product.barcode || "-"}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.category?.name || "-"}</Badge>
              </TableCell>
              <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
              <TableCell>
                {product.stock} {product.unit}
              </TableCell>
              <TableCell>
                <StockBadge stock={product.stock} minStock={product.minStock} />
              </TableCell>
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
                        onClick={() => onDelete(product.id)}
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

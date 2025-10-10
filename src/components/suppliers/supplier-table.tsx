// ============================================
// src/components/suppliers/supplier-table.tsx
// ============================================
"use client";
import { Supplier } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ensureArray } from "@/lib/swr-fetcher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ToggleLeft, ToggleRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SupplierTableProps {
  suppliers: Supplier[] | undefined | null;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  userRole: string;
}

export function SupplierTable({
  suppliers,
  onView,
  onEdit,
  onDelete,
  onToggle,
  userRole,
}: SupplierTableProps) {
  const safeSuppliers = ensureArray(suppliers);

  if (safeSuppliers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada supplier ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Supplier</TableHead>
            <TableHead>Kontak</TableHead>
            <TableHead>Total Hutang</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeSuppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-mono text-xs">
                {supplier.code}
              </TableCell>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-sm">{supplier.phone}</p>
                  {supplier.email && (
                    <p className="text-xs text-muted-foreground">
                      {supplier.email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    supplier.totalDebt > 0
                      ? "font-semibold text-orange-600"
                      : "text-muted-foreground"
                  }
                >
                  {formatCurrency(supplier.totalDebt)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={supplier.isActive ? "default" : "secondary"}>
                  {supplier.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(supplier.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onView(supplier)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {userRole === "ADMIN" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onToggle(supplier.id)}
                      >
                        {supplier.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(supplier.id)}
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

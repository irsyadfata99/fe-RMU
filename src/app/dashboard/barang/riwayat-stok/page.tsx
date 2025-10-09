// src/app/dashboard/barang/riwayat-stok/page.tsx
"use client";

import { useState } from "react";
import { useStockMovements } from "@/hooks/useStock";
import { StockMovementTable } from "@/components/stock/stock-movement-table";
import { StockMovementFilter } from "@/components/stock/stock-movement-filter";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { History, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StockMovementPage() {
  const [filters, setFilters] = useState<{
    productId?: string;
    type?: string;
    referenceType?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [page, setPage] = useState(1);

  const { movements, isLoading } = useStockMovements({
    page,
    limit: 20,
    ...filters,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const handleFilter = (newFilters: {
    productId?: string;
    type?: string;
    referenceType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          Riwayat Pergerakan Stok
        </h1>
        <p className="text-muted-foreground">
          History lengkap pergerakan stok barang
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-blue-900">Informasi Riwayat Stok</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • <strong>IN</strong> = Stok masuk dari pembelian
            </p>
            <p>
              • <strong>OUT</strong> = Stok keluar dari penjualan
            </p>
            <p>
              • <strong>ADJUSTMENT</strong> = Penyesuaian manual stok
            </p>
            <p>
              • <strong>RETURN_IN</strong> = Retur penjualan (barang kembali)
            </p>
            <p>
              • <strong>RETURN_OUT</strong> = Retur pembelian (barang keluar)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <StockMovementFilter onFilter={handleFilter} onReset={handleReset} />

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <StockMovementTable movements={movements || []} />
      )}

      {/* Empty State */}
      {!isLoading && movements?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Tidak Ada Riwayat</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Belum ada pergerakan stok yang tercatat
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

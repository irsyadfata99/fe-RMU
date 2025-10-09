// src/app/dashboard/barang/stok-opname/page.tsx
"use client";

import { useState } from "react";
import {
  useStockAdjustments,
  useStockAdjustmentActions,
} from "@/hooks/useStock";
import { useCurrentUser } from "@/hooks/useAuth";
import { StockAdjustmentForm } from "@/components/stock/stock-adjustment-form";
import { StockAdjustmentTable } from "@/components/stock/stock-adjustment-table";
import { StockAdjustmentDetail } from "@/components/stock/stock-adjustment-detail";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PlusCircle, ClipboardList, AlertTriangle } from "lucide-react";
import { StockAdjustmentRecord, AdjustmentType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ADJUSTMENT_TYPE_LABELS } from "@/lib/validations";

export default function StockOpnamePage() {
  const user = useCurrentUser();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [adjustmentType, setAdjustmentType] = useState<string | undefined>(
    undefined
  );
  const [page] = useState(1);

  // Dialog & Sheet state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<StockAdjustmentRecord | null>(null);

  const { adjustments, isLoading, mutate } = useStockAdjustments({
    page,
    limit: 10,
    status: status || undefined,
    adjustmentType: adjustmentType || undefined,
    sortBy: "adjustmentDate",
    sortOrder: "DESC",
  });

  const {
    createAdjustment,
    approveAdjustment,
    rejectAdjustment,
    isLoading: isSubmitting,
  } = useStockAdjustmentActions();

  const handleCreateSubmit = async (data: {
    productId: string;
    adjustmentType: AdjustmentType;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    try {
      await createAdjustment(data);
      setIsFormDialogOpen(false);
      mutate();
    } catch {
      // Error handled by hook
    }
  };

  const handleView = (adjustment: StockAdjustmentRecord) => {
    setSelectedAdjustment(adjustment);
    setIsDetailSheetOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Yakin ingin menyetujui adjustment ini?")) return;

    try {
      await approveAdjustment(id);
      mutate();
    } catch {
      // Error handled by hook
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Alasan penolakan:");
    if (!reason) return;

    try {
      await rejectAdjustment(id, reason);
      mutate();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Stok Opname / Adjustment
          </h1>
          <p className="text-muted-foreground">
            Penyesuaian stok manual untuk koreksi stok
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <Button onClick={() => setIsFormDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Adjustment
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-orange-900">
                ⚠️ Penting: Adjustment Stok
              </p>
              <ul className="list-disc list-inside text-orange-700 space-y-0.5">
                <li>
                  <strong>DAMAGED/EXPIRED/LOST/LEAKED</strong> = Mengurangi stok
                  (-)
                </li>
                <li>
                  <strong>FOUND/REPACK</strong> = Menambah stok (+)
                </li>
                <li>Adjustment akan langsung disetujui (auto-approve)</li>
                <li>Stok akan otomatis berubah setelah adjustment dibuat</li>
                <li>Riwayat adjustment dapat dilihat di Riwayat Stok</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Select
          value={adjustmentType}
          onValueChange={(value) =>
            setAdjustmentType(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {Object.entries(ADJUSTMENT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="APPROVED">Disetujui</SelectItem>
            <SelectItem value="PENDING">Menunggu</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <StockAdjustmentTable
          adjustments={adjustments || []}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          userRole={user?.role || "KASIR"}
        />
      )}

      {/* Create Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Stock Adjustment</DialogTitle>
            <DialogDescription>
              Penyesuaian manual untuk koreksi stok barang
            </DialogDescription>
          </DialogHeader>
          <StockAdjustmentForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsFormDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Adjustment</SheetTitle>
            <SheetDescription>
              Informasi lengkap adjustment stok
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedAdjustment && (
              <StockAdjustmentDetail adjustment={selectedAdjustment} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

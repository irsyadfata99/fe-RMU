// src/components/stock/stock-adjustment-detail.tsx
"use client";

import { StockAdjustmentRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ADJUSTMENT_TYPE_LABELS } from "@/lib/validations";
import {
  Package,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface StockAdjustmentDetailProps {
  adjustment: StockAdjustmentRecord;
}

export function StockAdjustmentDetail({
  adjustment,
}: StockAdjustmentDetailProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      APPROVED: "default",
      PENDING: "secondary",
      REJECTED: "destructive",
    };
    const labels: Record<string, string> = {
      APPROVED: "Disetujui",
      PENDING: "Menunggu",
      REJECTED: "Ditolak",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Detail Adjustment</CardTitle>
              <p className="text-lg font-mono font-semibold text-primary mt-1">
                {adjustment.adjustmentNumber}
              </p>
            </div>
            {getStatusBadge(adjustment.status)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informasi Produk
            </h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Produk</span>
                <span className="font-medium">{adjustment.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-mono">{adjustment.product?.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stok Saat Ini</span>
                <span className="font-semibold">
                  {adjustment.product?.stock} {adjustment.product?.unit}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adjustment Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detail Penyesuaian
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Jenis Adjustment</span>
                <Badge variant="outline">
                  {ADJUSTMENT_TYPE_LABELS[adjustment.adjustmentType] ||
                    adjustment.adjustmentType}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Perubahan Stok</span>
                <span
                  className={`text-xl font-bold ${
                    adjustment.quantity > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {adjustment.quantity > 0 ? "+" : ""}
                  {adjustment.quantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {formatDateTime(adjustment.adjustmentDate)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alasan
            </h3>
            <p className="text-sm text-muted-foreground rounded-lg bg-muted p-3">
              {adjustment.reason}
            </p>
          </div>

          {adjustment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Catatan Tambahan</h3>
                <p className="text-sm text-muted-foreground">
                  {adjustment.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* User Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi User
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat Oleh</span>
                <span className="font-medium">{adjustment.user?.name}</span>
              </div>
              {adjustment.approver && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disetujui Oleh</span>
                  <span className="font-medium">
                    {adjustment.approver.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat Pada</span>
                <span>{formatDateTime(adjustment.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Terakhir Update</span>
                <span>{formatDateTime(adjustment.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {adjustment.status === "APPROVED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">
                  Adjustment Disetujui
                </p>
                <p className="text-sm text-green-700">
                  Stok telah diperbarui sesuai adjustment ini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {adjustment.status === "PENDING" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  Menunggu Persetujuan
                </p>
                <p className="text-sm text-orange-700">
                  Adjustment ini menunggu persetujuan dari Admin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {adjustment.status === "REJECTED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Adjustment Ditolak</p>
                <p className="text-sm text-red-700">
                  Adjustment ini telah ditolak dan tidak mempengaruhi stok.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StockAdjustmentDetail;

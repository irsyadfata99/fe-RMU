// src/components/purchases/purchase-detail.tsx
"use client";

import { Purchase } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  PURCHASE_TYPE_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/lib/validations";
import { Building2, Calendar, User, Package, CreditCard } from "lucide-react";

interface PurchaseDetailProps {
  purchase: Purchase;
}

export function PurchaseDetail({ purchase }: PurchaseDetailProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PAID: "default",
      PARTIAL: "secondary",
      PENDING: "destructive",
      CANCELLED: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {PURCHASE_STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      TUNAI: "bg-green-500",
      KREDIT: "bg-orange-500",
      KONSINYASI: "bg-blue-500",
    };
    return (
      <Badge className={colors[type] || ""}>
        {PURCHASE_TYPE_LABELS[type] || type}
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
              <CardTitle className="text-2xl">Detail Pembelian</CardTitle>
              <p className="text-lg font-mono font-semibold text-primary mt-1">
                {purchase.invoiceNumber}
              </p>
            </div>
            <div className="flex gap-2">
              {getTypeBadge(purchase.purchaseType)}
              {getStatusBadge(purchase.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Supplier Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informasi Supplier
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{purchase.supplier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kode</span>
                  <span className="font-mono">{purchase.supplier?.code}</span>
                </div>
                {purchase.supplier?.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Telepon</span>
                    <span>{purchase.supplier.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informasi Transaksi
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {formatDateTime(purchase.purchaseDate)}
                  </span>
                </div>
                {purchase.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jatuh Tempo</span>
                    <span className="font-medium text-orange-600">
                      {formatDateTime(purchase.dueDate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span>{formatDateTime(purchase.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {purchase.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Catatan</h3>
                <p className="text-sm text-muted-foreground">
                  {purchase.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Pembelian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">Produk</th>
                  <th className="p-3 text-center text-sm font-medium">Qty</th>
                  <th className="p-3 text-right text-sm font-medium">
                    Harga Beli
                  </th>
                  <th className="p-3 text-right text-sm font-medium">
                    Harga Jual
                  </th>
                  <th className="p-3 text-center text-sm font-medium">
                    Exp Date
                  </th>
                  <th className="p-3 text-right text-sm font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.items?.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.unit}
                      </p>
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.purchasePrice)}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.sellingPrice)}
                    </td>
                    <td className="p-3 text-center text-xs">
                      {item.expDate ? formatDateTime(item.expDate) : "-"}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Ringkasan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pembelian</span>
            <span className="font-semibold">
              {formatCurrency(purchase.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Terbayar</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(purchase.paidAmount)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Sisa Hutang</span>
            <span className="text-xl font-bold text-orange-600">
              {formatCurrency(purchase.remainingDebt)}
            </span>
          </div>

          {purchase.debt && (
            <>
              <Separator />
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Status Hutang</span>
                  <Badge variant="secondary">{purchase.debt.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa di Debt</span>
                  <span className="font-semibold">
                    {formatCurrency(purchase.debt.remainingAmount)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

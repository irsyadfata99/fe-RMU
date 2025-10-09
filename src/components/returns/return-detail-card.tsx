// src/components/returns/return-detail-card.tsx
"use client";

import { PurchaseReturn, SalesReturn } from "@/types/return";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReturnStatusBadge } from "./return-status-badge";
import {
  Package,
  Calendar,
  FileText,
  Building2,
  UserCircle,
} from "lucide-react";

interface ReturnDetailCardProps {
  returnData: PurchaseReturn | SalesReturn;
  type: "purchase" | "sales";
}

export function ReturnDetailCard({ returnData, type }: ReturnDetailCardProps) {
  const isPurchase = type === "purchase";
  const purchaseReturn = returnData as PurchaseReturn;
  const salesReturn = returnData as SalesReturn;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {isPurchase ? "Retur Pembelian" : "Retur Penjualan"}
              </CardTitle>
              <p className="text-lg font-mono font-semibold text-primary mt-1">
                {returnData.returnNumber}
              </p>
            </div>
            <ReturnStatusBadge status={returnData.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                {isPurchase ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <UserCircle className="h-4 w-4" />
                )}
                {isPurchase ? "Informasi Supplier" : "Informasi Member"}
              </h3>
              <div className="space-y-2 text-sm">
                {isPurchase ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama</span>
                      <span className="font-medium">
                        {purchaseReturn.supplier?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kode</span>
                      <span className="font-mono">
                        {purchaseReturn.supplier?.code}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama</span>
                      <span className="font-medium">
                        {salesReturn.member?.fullName || "UMUM"}
                      </span>
                    </div>
                    {salesReturn.member && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID Member</span>
                        <span className="font-mono">
                          {salesReturn.member.uniqueId}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informasi Retur
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal</span>
                  <span className="font-medium">
                    {formatDateTime(returnData.returnDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat oleh</span>
                  <span className="font-medium">
                    {returnData.user?.name || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Alasan Retur
            </h3>
            <p className="text-sm text-muted-foreground rounded-lg bg-muted p-3">
              {returnData.reason}
            </p>
          </div>

          {returnData.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Catatan</h3>
                <p className="text-sm text-muted-foreground">
                  {returnData.notes}
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
            Item Retur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium">Produk</th>
                  <th className="p-3 text-center text-sm font-medium">Qty</th>
                  <th className="p-3 text-right text-sm font-medium">Harga</th>
                  <th className="p-3 text-right text-sm font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {returnData.items?.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.product?.sku}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-4 flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Retur</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(returnData.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReturnDetailCard;

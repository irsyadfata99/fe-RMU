// src/components/transactions/invoice-preview.tsx
"use client";

import { Transaction } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface InvoicePreviewProps {
  transaction: Transaction;
}

export function InvoicePreview({ transaction }: InvoicePreviewProps) {
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Invoice Transaksi</CardTitle>
            <p className="text-sm text-muted-foreground">
              {transaction.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <Badge
              variant={
                transaction.saleType === "TUNAI" ? "default" : "secondary"
              }
              className="mb-2"
            >
              {transaction.saleType}
            </Badge>
            <br />
            <Badge
              variant={
                transaction.status === "PAID"
                  ? "default"
                  : transaction.status === "PARTIAL"
                  ? "secondary"
                  : "destructive"
              }
            >
              {transaction.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Informasi Transaksi</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="font-medium">
                  {formatDateTime(transaction.saleDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kasir</span>
                <span className="font-medium">
                  {transaction.user?.name || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Informasi Pelanggan</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">
                  {transaction.member?.fullName || "UMUM"}
                </span>
              </div>
              {transaction.member && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Member</span>
                    <span className="font-medium">
                      {transaction.member.uniqueId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WhatsApp</span>
                    <span className="font-medium">
                      {transaction.member.whatsapp}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-2">
          <h3 className="font-semibold">Detail Pembelian</h3>
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
                {transaction.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.unit}
                      </p>
                    </td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.sellingPrice)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(transaction.totalAmount)}
            </span>
          </div>
          {transaction.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diskon</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(transaction.discountAmount)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(transaction.finalAmount)}
            </span>
          </div>

          {transaction.saleType === "TUNAI" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bayar</span>
                <span className="font-medium">
                  {formatCurrency(transaction.paymentReceived)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kembalian</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(transaction.changeAmount)}
                </span>
              </div>
            </>
          ) : (
            <>
              {transaction.dpAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">DP</span>
                  <span className="font-medium">
                    {formatCurrency(transaction.dpAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sisa Hutang</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(transaction.remainingDebt)}
                </span>
              </div>
              {transaction.dueDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jatuh Tempo</span>
                  <span className="font-medium">
                    {formatDateTime(transaction.dueDate)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {transaction.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Catatan</h3>
              <p className="text-sm text-muted-foreground">
                {transaction.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

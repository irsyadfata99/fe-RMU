// src/app/dashboard/transaksi/pos/page.tsx
"use client";

import { POSInterface } from "@/components/transactions/pos-interface";
import { Card } from "@/components/ui/card";

export default function POSPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Point of Sale (POS)</h1>
        <p className="text-muted-foreground">
          Sistem kasir untuk transaksi penjualan
        </p>
      </div>

      {/* POS Interface */}
      <Card className="p-6">
        <POSInterface />
      </Card>
    </div>
  );
}

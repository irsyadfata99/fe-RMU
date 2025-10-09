// src/components/dashboard/recent-transactions.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ✅ Backend uses different pagination format
      const response = await apiClient.get<any>("/sales", {
        params: {
          page: 1,
          limit: 5,
          sortBy: "saleDate",
          sortOrder: "DESC",
        },
      });

      // ✅ Handle different response formats
      setTransactions(Array.isArray(response) ? response : []);
      setError(false);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setError(true);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Gagal memuat transaksi
          </p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{transaction.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.member?.fullName || "UMUM"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(transaction.saleDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(transaction.finalAmount)}
                </p>
                <Badge
                  variant={
                    transaction.saleType === "TUNAI" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {transaction.saleType}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/dashboard/transaksi/penjualan">
        <Button variant="outline" className="w-full" size="sm">
          Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

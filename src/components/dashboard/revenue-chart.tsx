// src/components/dashboard/revenue-chart.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // ✅ Add proper error handling
      const response = await apiClient.get<any>("/reports/daily-transactions", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });

      setData(Array.isArray(response) ? response : []);
      setError(false);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      setError(true);
      setData([]); // Set empty array on error
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
            Gagal memuat data chart
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

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Belum ada data transaksi
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue || 0));

  return (
    <div className="space-y-4">
      <div className="flex h-64 items-end justify-between gap-2">
        {data.map((item, index) => {
          const height =
            maxRevenue > 0 ? (item.totalRevenue / maxRevenue) * 100 : 0;
          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative w-full group">
                <div
                  className="w-full rounded-t-md bg-primary transition-all hover:bg-primary/80"
                  style={{
                    height: `${height}%`,
                    minHeight: height > 0 ? "20px" : "0",
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap rounded bg-popover px-2 py-1 text-xs shadow-md">
                    {formatCurrency(item.totalRevenue)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">7 Hari Terakhir</span>
        <span className="font-medium">
          Total:{" "}
          {formatCurrency(
            data.reduce((acc, d) => acc + (d.totalRevenue || 0), 0)
          )}
        </span>
      </div>
    </div>
  );
}

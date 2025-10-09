// src/hooks/useDashboard.ts
"use client";

import useSWR from "swr";
import { apiClient } from "@/lib/api";

interface DashboardMetrics {
  sales: {
    totalTransactions: number;
    totalRevenue: number;
    tunaiRevenue: number;
    kreditRevenue: number;
  };
  purchases: {
    totalPurchases: number;
    totalSpending: number;
  };
  debts: {
    totalDebt: number;
    pendingCount: number;
  };
  receivables: {
    totalReceivable: number;
    pendingCount: number;
  };
  products: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
  };
  members: {
    totalMembers: number;
    activeMembers: number;
    totalPoints: number;
  };
  returns: {
    purchaseReturns: number;
    salesReturns: number;
    totalReturns: number;
  };
}

// Transform backend response to match frontend expectations
const transformMetrics = (data: DashboardMetrics) => {
  return {
    todayTransactions: data.sales?.totalTransactions || 0,
    todayRevenue: data.sales?.totalRevenue || 0,
    todayReceivables: data.receivables?.totalReceivable || 0,
    todayPayables: data.debts?.totalDebt || 0,
    fastMovingStock: Math.max(
      0,
      data.products?.totalProducts -
        data.products?.lowStock -
        data.products?.outOfStock || 0
    ),
    slowMovingStock: data.products?.lowStock || 0,
    overStock: 0, // Not available in current endpoint
    lowStock: data.products?.lowStock || 0,
  };
};

const fetcher = async (url: string) => {
  try {
    const data = await apiClient.get<DashboardMetrics>(url);
    return transformMetrics(data);
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    // Return default values on error
    return {
      todayTransactions: 0,
      todayRevenue: 0,
      todayReceivables: 0,
      todayPayables: 0,
      fastMovingStock: 0,
      slowMovingStock: 0,
      overStock: 0,
      lowStock: 0,
    };
  }
};

export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    "/reports/summary", // ✅ Changed from /dashboard/metrics
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: false, // Don't retry on error
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

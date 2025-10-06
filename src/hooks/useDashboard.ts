// src/hooks/useDashboard.ts

"use client";

import useSWR from "swr";
import { DashboardMetrics } from "@/types";
import { apiClient } from "@/lib/api";

const fetcher = (url: string) => apiClient.get<DashboardMetrics>(url);

export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR("/dashboard/metrics", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

// ============================================
// src/hooks/useStock.ts (PARTIAL FIX)
// ============================================
"use client";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import {
  StockMovementRecord,
  StockAdjustmentRecord,
  CreateAdjustmentRequest,
} from "@/types";

export function useStockMovements(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/stock/movements?${queryString}`,
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    movements: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStockAdjustments(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/stock/adjustments?${queryString}`,
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    adjustments: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStockAdjustment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/stock/adjustments/${id}` : null,
    itemFetcher,
    { revalidateOnFocus: false }
  );

  return {
    adjustment: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStockAdjustmentActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createAdjustment = async (data: CreateAdjustmentRequest) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.post<StockAdjustmentRecord>(
        "/stock/adjustments",
        data
      );
      toast.success("Adjustment berhasil dibuat");
      return adjustment;
    } finally {
      setIsLoading(false);
    }
  };

  const approveAdjustment = async (id: string) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.patch<StockAdjustmentRecord>(
        `/stock/adjustments/${id}/approve`
      );
      toast.success("Adjustment berhasil disetujui");
      return adjustment;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectAdjustment = async (id: string, reason?: string) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.patch<StockAdjustmentRecord>(
        `/stock/adjustments/${id}/reject`,
        { reason }
      );
      toast.success("Adjustment ditolak");
      return adjustment;
    } finally {
      setIsLoading(false);
    }
  };

  return { createAdjustment, approveAdjustment, rejectAdjustment, isLoading };
}

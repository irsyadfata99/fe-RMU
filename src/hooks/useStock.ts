// src/hooks/useStock.ts
"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import {
  StockMovementRecord,
  StockAdjustmentRecord,
  CreateAdjustmentRequest,
  StockStats,
} from "@/types";

// ============================================
// STOCK STATISTICS
// ============================================
export function useStockStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/stock/stats",
    (url) => apiClient.get<StockStats>(url),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30s
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// STOCK MOVEMENTS (History)
// ============================================
export function useStockMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
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
    (url) => apiClient.get<StockMovementRecord[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    movements: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// STOCK MOVEMENTS BY PRODUCT
// ============================================
export function useProductStockHistory(
  productId: string | null,
  params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    productId ? `/stock/movements/${productId}/history?${queryString}` : null,
    (url) => apiClient.get<StockMovementRecord[]>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    history: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// STOCK ADJUSTMENTS (Manual Adjustment)
// ============================================
export function useStockAdjustments(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  adjustmentType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
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
    (url) => apiClient.get<StockAdjustmentRecord[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    adjustments: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// SINGLE STOCK ADJUSTMENT
// ============================================
export function useStockAdjustment(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/stock/adjustments/${id}` : null,
    (url) => apiClient.get<StockAdjustmentRecord>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    adjustment: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// STOCK ADJUSTMENT ACTIONS
// ============================================
export function useStockAdjustmentActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Create stock adjustment
   */
  const createAdjustment = async (data: CreateAdjustmentRequest) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.post<StockAdjustmentRecord>(
        "/stock/adjustments",
        data
      );
      toast.success("Adjustment berhasil dibuat", {
        description: `Nomor: ${adjustment.adjustmentNumber}`,
      });
      return adjustment;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal membuat adjustment";
      toast.error("Adjustment gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve adjustment (ADMIN only)
   */
  const approveAdjustment = async (id: string) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.patch<StockAdjustmentRecord>(
        `/stock/adjustments/${id}/approve`
      );
      toast.success("Adjustment berhasil disetujui", {
        description: adjustment.adjustmentNumber,
      });
      return adjustment;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal approve adjustment";
      toast.error("Approve gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reject adjustment (ADMIN only)
   */
  const rejectAdjustment = async (id: string, reason?: string) => {
    setIsLoading(true);
    try {
      const adjustment = await apiClient.patch<StockAdjustmentRecord>(
        `/stock/adjustments/${id}/reject`,
        { reason }
      );
      toast.success("Adjustment ditolak", {
        description: adjustment.adjustmentNumber,
      });
      return adjustment;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal reject adjustment";
      toast.error("Reject gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAdjustment,
    approveAdjustment,
    rejectAdjustment,
    isLoading,
  };
}

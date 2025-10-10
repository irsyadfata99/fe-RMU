// src/hooks/useReturn.ts - COMPLETE REPLACEMENT
"use client";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import {
  PurchaseReturn,
  SalesReturn,
  PurchaseReturnQueryParams,
  SalesReturnQueryParams,
  CreatePurchaseReturnRequest,
  CreateSalesReturnRequest,
  ApproveReturnRequest,
  RejectReturnRequest,
  ReturnStats,
} from "@/types/return";

// ✅ FIXED FETCHER - Handle berbagai struktur response
const fetcher = async (url: string) => {
  try {
    const response = await apiClient.get(url);

    console.log("🔍 Return Hook - Fetcher Response:", { url, response });

    // ✅ Case 1: apiClient.get sudah extract data, response adalah array
    if (Array.isArray(response)) {
      console.log("✅ Direct array response:", response.length, "items");
      return response;
    }

    // ✅ Case 2: Response punya property data yang array
    if (response && typeof response === "object") {
      const data = (response as any).data;

      if (Array.isArray(data)) {
        console.log("✅ Array in response.data:", data.length, "items");
        return data;
      }
    }

    console.warn(
      "⚠️ Unexpected response structure, returning empty array:",
      response
    );
    return [];
  } catch (error) {
    console.error("❌ Fetcher error:", error);
    return [];
  }
};

// ============================================
// PURCHASE RETURN HOOKS
// ============================================

/**
 * Get all purchase returns with filters
 */
export function usePurchaseReturns(params?: PurchaseReturnQueryParams) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/returns/purchases?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PurchaseReturn[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        console.log(
          "✅ usePurchaseReturns - Data loaded:",
          data?.length,
          "items"
        );
      },
      onError: (error) => {
        console.error("❌ usePurchaseReturns - Error:", error);
      },
    }
  );

  return {
    returns: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Get single purchase return by ID
 */
export function usePurchaseReturn(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/returns/purchases/${id}` : null,
    (url) => apiClient.get<PurchaseReturn>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    return: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// SALES RETURN HOOKS
// ============================================

/**
 * Get all sales returns with filters
 */
export function useSalesReturns(params?: SalesReturnQueryParams) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/returns/sales?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<SalesReturn[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        console.log("✅ useSalesReturns - Data loaded:", data?.length, "items");
      },
      onError: (error) => {
        console.error("❌ useSalesReturns - Error:", error);
      },
    }
  );

  return {
    returns: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Get single sales return by ID
 */
export function useSalesReturn(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/returns/sales/${id}` : null,
    (url) => apiClient.get<SalesReturn>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    return: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// RETURN STATISTICS
// ============================================

/**
 * Get return statistics
 */
export function useReturnStats(params?: {
  startDate?: string;
  endDate?: string;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading } = useSWR(
    `/returns/stats?${queryString}`,
    (url) => apiClient.get<ReturnStats>(url),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30s
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

// ============================================
// RETURN ACTIONS (Create, Approve, Reject)
// ============================================

export function useReturnActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Create purchase return
   */
  const createPurchaseReturn = async (data: CreatePurchaseReturnRequest) => {
    setIsLoading(true);
    try {
      const result = await apiClient.post<PurchaseReturn>(
        "/returns/purchases",
        data
      );
      toast.success("Retur pembelian berhasil dibuat", {
        description: `Nomor: ${result.returnNumber}`,
      });
      return result;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal membuat retur pembelian";
      toast.error("Retur pembelian gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create sales return
   */
  const createSalesReturn = async (data: CreateSalesReturnRequest) => {
    setIsLoading(true);
    try {
      const result = await apiClient.post<SalesReturn>("/returns/sales", data);
      toast.success("Retur penjualan berhasil dibuat", {
        description: `Nomor: ${result.returnNumber}`,
      });
      return result;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal membuat retur penjualan";
      toast.error("Retur penjualan gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve purchase return
   */
  const approvePurchaseReturn = async (
    id: string,
    data?: ApproveReturnRequest
  ) => {
    setIsLoading(true);
    try {
      const result = await apiClient.patch<PurchaseReturn>(
        `/returns/purchases/${id}/approve`,
        data || {}
      );
      toast.success("Retur pembelian disetujui", {
        description: result.returnNumber,
      });
      return result;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal menyetujui retur";
      toast.error("Approve gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reject purchase return
   */
  const rejectPurchaseReturn = async (
    id: string,
    data: RejectReturnRequest
  ) => {
    setIsLoading(true);
    try {
      const result = await apiClient.patch<PurchaseReturn>(
        `/returns/purchases/${id}/reject`,
        data
      );
      toast.success("Retur pembelian ditolak", {
        description: result.returnNumber,
      });
      return result;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gagal menolak retur";
      toast.error("Reject gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Approve sales return
   */
  const approveSalesReturn = async (
    id: string,
    data?: ApproveReturnRequest
  ) => {
    setIsLoading(true);
    try {
      const result = await apiClient.patch<SalesReturn>(
        `/returns/sales/${id}/approve`,
        data || {}
      );
      toast.success("Retur penjualan disetujui", {
        description: result.returnNumber,
      });
      return result;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal menyetujui retur";
      toast.error("Approve gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reject sales return
   */
  const rejectSalesReturn = async (id: string, data: RejectReturnRequest) => {
    setIsLoading(true);
    try {
      const result = await apiClient.patch<SalesReturn>(
        `/returns/sales/${id}/reject`,
        data
      );
      toast.success("Retur penjualan ditolak", {
        description: result.returnNumber,
      });
      return result;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gagal menolak retur";
      toast.error("Reject gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPurchaseReturn,
    createSalesReturn,
    approvePurchaseReturn,
    rejectPurchaseReturn,
    approveSalesReturn,
    rejectSalesReturn,
    isLoading,
  };
}

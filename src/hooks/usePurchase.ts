// src/hooks/usePurchase.ts
"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { Purchase, PurchaseStats, CreatePurchaseRequest } from "@/types";

const fetcher = (url: string) => apiClient.get<Purchase[]>(url);

// ============================================
// GET ALL PURCHASES (with filters)
// ============================================
export function usePurchases(params?: {
  page?: number;
  limit?: number;
  search?: string;
  purchaseType?: string;
  status?: string;
  supplierId?: string;
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
    `/purchases?${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    purchases: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// GET SINGLE PURCHASE BY ID
// ============================================
export function usePurchase(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/purchases/${id}` : null,
    (url) => apiClient.get<Purchase>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    purchase: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// GET PURCHASE STATISTICS
// ============================================
export function usePurchaseStats(params?: {
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
    `/purchases/stats?${queryString}`,
    (url) => apiClient.get<PurchaseStats>(url),
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
// PURCHASE ACTIONS (Create, Update Payment)
// ============================================
export function usePurchaseActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Create new purchase
   */
  const createPurchase = async (data: CreatePurchaseRequest) => {
    setIsLoading(true);
    try {
      const purchase = await apiClient.post<Purchase>("/purchases", data);
      toast.success("Pembelian berhasil dibuat", {
        description: `Invoice: ${purchase.invoiceNumber}`,
      });
      return purchase;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal membuat pembelian";
      toast.error("Pembelian gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update payment for KREDIT purchase
   */
  const updatePayment = async (
    purchaseId: string,
    data: { amount: number; notes?: string }
  ) => {
    setIsLoading(true);
    try {
      const purchase = await apiClient.patch<Purchase>(
        `/purchases/${purchaseId}/pay`,
        data
      );
      toast.success("Pembayaran berhasil diupdate", {
        description: `Sisa hutang: Rp ${purchase.remainingDebt.toLocaleString(
          "id-ID"
        )}`,
      });
      return purchase;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Gagal update pembayaran";
      toast.error("Update pembayaran gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPurchase,
    updatePayment,
    isLoading,
  };
}

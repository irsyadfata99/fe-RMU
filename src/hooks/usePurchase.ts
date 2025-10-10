// ============================================
// src/hooks/usePurchase.ts
// ============================================
"use client";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { Purchase, PurchaseStats, CreatePurchaseRequest } from "@/types";

export function usePurchases(params?: any) {
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
    arrayFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  return {
    purchases: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePurchase(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/purchases/${id}` : null,
    itemFetcher,
    { revalidateOnFocus: false }
  );

  return {
    purchase: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePurchaseActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createPurchase = async (data: CreatePurchaseRequest) => {
    setIsLoading(true);
    try {
      const purchase = await apiClient.post<Purchase>("/purchases", data);
      toast.success("Pembelian berhasil dibuat", {
        description: `Invoice: ${purchase.invoiceNumber}`,
      });
      return purchase;
    } finally {
      setIsLoading(false);
    }
  };

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
      toast.success("Pembayaran berhasil diupdate");
      return purchase;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPurchase, updatePayment, isLoading };
}

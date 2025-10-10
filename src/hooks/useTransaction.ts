// ============================================
// src/hooks/useTransaction.ts
// ============================================
"use client";
import useSWR from "swr";
import { Transaction } from "@/types";
import api from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";

export function useTransactions(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/sales?${queryString}`,
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    transactions: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTransaction(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/sales/${id}` : null,
    itemFetcher,
    { revalidateOnFocus: false }
  );

  return {
    transaction: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTransactionActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createSale = async (data: any) => {
    setIsLoading(true);
    try {
      const sale = await api.post<Transaction>("/sales", data);
      toast.success("Transaksi berhasil dibuat");
      return sale;
    } finally {
      setIsLoading(false);
    }
  };

  const printInvoice = (id: string) => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${id}/print/invoice`,
      "_blank"
    );
  };

  const printThermal = (id: string) => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${id}/print/thermal`,
      "_blank"
    );
  };

  return { createSale, printInvoice, printThermal, isLoading };
}

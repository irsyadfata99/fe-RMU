// src/hooks/useTransaction.ts
"use client";

import useSWR from "swr";
import { Transaction } from "@/types";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get<any>(url);

export function useTransactions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  saleType?: string;
  status?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
}) {
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
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    transactions: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTransaction(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/sales/${id}` : null,
    (url) => apiClient.get<Transaction>(url),
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

  const createSale = async (data: {
    memberId?: string;
    saleType: "TUNAI" | "KREDIT";
    items: Array<{ productId: string; quantity: number }>;
    discountAmount?: number;
    discountPercentage?: number;
    dpAmount?: number;
    paymentReceived?: number;
    dueDate?: string;
    notes?: string;
  }) => {
    setIsLoading(true);
    try {
      const sale = await apiClient.post<Transaction>("/sales", data);
      toast.success("Transaksi berhasil dibuat");
      return sale;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal membuat transaksi");
      throw error;
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

  return {
    createSale,
    printInvoice,
    printThermal,
    isLoading,
  };
}

// ============================================
// FILE 2: src/hooks/useTransaction.ts
// ============================================
import useSWR from "swr";
import { Transaction } from "@/types";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

// ✅ FIXED FETCHER
const transactionsFetcher = async (url: string): Promise<Transaction[]> => {
  try {
    const response = await apiClient.get<any>(url);

    console.log("🔍 Transactions Fetcher:", { url, response });

    if (Array.isArray(response)) {
      console.log("✅ Direct array:", response.length, "transactions");
      return response;
    }

    if (response?.data && Array.isArray(response.data)) {
      console.log(
        "✅ Array in response.data:",
        response.data.length,
        "transactions"
      );
      return response.data;
    }

    console.warn("⚠️ Unexpected response structure:", response);
    return [];
  } catch (error) {
    console.error("❌ Transactions fetcher error:", error);
    return [];
  }
};

const transactionFetcher = async (url: string): Promise<Transaction | null> => {
  try {
    const response = await apiClient.get<Transaction>(url);
    return response;
  } catch (error) {
    console.error("❌ Transaction fetcher error:", error);
    return null;
  }
};

export function useTransactions(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(
    `/sales?${queryString}`,
    transactionsFetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) =>
        console.log("✅ useTransactions loaded:", data?.length, "transactions"),
    }
  );

  return {
    transactions: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTransaction(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Transaction | null>(
    id ? `/sales/${id}` : null,
    transactionFetcher,
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
      const sale = await apiClient.post<Transaction>("/sales", data);
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

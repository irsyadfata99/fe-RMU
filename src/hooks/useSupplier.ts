// ============================================
// FILE 1: src/hooks/useSupplier.ts
// ============================================
import useSWR from "swr";
import { Supplier } from "@/types";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

// ✅ FIXED FETCHER
const suppliersFetcher = async (url: string): Promise<Supplier[]> => {
  try {
    const response = await apiClient.get<any>(url);

    console.log("🔍 Suppliers Fetcher:", { url, response });

    if (Array.isArray(response)) {
      console.log("✅ Direct array:", response.length, "suppliers");
      return response;
    }

    if (response?.data && Array.isArray(response.data)) {
      console.log(
        "✅ Array in response.data:",
        response.data.length,
        "suppliers"
      );
      return response.data;
    }

    console.warn("⚠️ Unexpected response structure:", response);
    return [];
  } catch (error) {
    console.error("❌ Suppliers fetcher error:", error);
    return [];
  }
};

const supplierFetcher = async (url: string): Promise<Supplier | null> => {
  try {
    const response = await apiClient.get<Supplier>(url);
    return response;
  } catch (error) {
    console.error("❌ Supplier fetcher error:", error);
    return null;
  }
};

export function useSuppliers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<Supplier[]>(
    `/suppliers?${queryString}`,
    suppliersFetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) =>
        console.log("✅ useSuppliers loaded:", data?.length, "suppliers"),
    }
  );

  return {
    suppliers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplier(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Supplier | null>(
    id ? `/suppliers/${id}` : null,
    supplierFetcher,
    { revalidateOnFocus: false }
  );

  return {
    supplier: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplierActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createSupplier = async (data: any) => {
    setIsLoading(true);
    try {
      const supplier = await apiClient.post<Supplier>("/suppliers", data);
      toast.success("Supplier berhasil ditambahkan");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const supplier = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
      toast.success("Supplier berhasil diupdate");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/suppliers/${id}`);
      toast.success("Supplier berhasil dihapus");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/suppliers/${id}/toggle`, {});
      toast.success("Status supplier berhasil diubah");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive,
    isLoading,
  };
}

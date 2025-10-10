// ============================================
// src/hooks/useSupplier.ts
// ============================================
import useSWR from "swr";
import { Supplier } from "@/types";
import api from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";

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

  const { data, error, isLoading, mutate } = useSWR(
    `/suppliers?${queryString}`,
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    suppliers: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplier(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/suppliers/${id}` : null,
    itemFetcher,
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
      const supplier = await api.post<Supplier>("/suppliers", data);
      toast.success("Supplier berhasil ditambahkan");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const supplier = await api.put<Supplier>(`/suppliers/${id}`, data);
      toast.success("Supplier berhasil diupdate");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier berhasil dihapus");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/suppliers/${id}/toggle`);
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

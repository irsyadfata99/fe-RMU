// src/hooks/useSupplier.ts
"use client";

import useSWR from "swr";
import { Supplier } from "@/types";
import api from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data.data || [];
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

  const { data, error, isLoading, mutate } = useSWR(
    `/suppliers?${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    suppliers: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplier(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/suppliers/${id}` : null,
    fetcher, // ✅ FIXED: Gunakan fetcher yang sama
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

  const createSupplier = async (data: {
    name: string;
    address: string;
    phone: string;
    contactPerson?: string;
    email?: string;
    description?: string;
  }) => {
    setIsLoading(true);
    try {
      const supplier = await api.post<Supplier>("/suppliers", data);
      toast.success("Supplier berhasil ditambahkan");
      return supplier;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan supplier"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (
    id: string,
    data: {
      name: string;
      address: string;
      phone: string;
      contactPerson?: string;
      email?: string;
      description?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const supplier = await api.put<Supplier>(`/suppliers/${id}`, data);
      toast.success("Supplier berhasil diupdate");
      return supplier;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal update supplier");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier berhasil dihapus");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus supplier");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/suppliers/${id}/toggle`);
      toast.success("Status supplier berhasil diubah");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
      throw error;
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

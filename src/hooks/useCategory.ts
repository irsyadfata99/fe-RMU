// src/hooks/useCategory.ts
"use client";
import useSWR from "swr";
import { Category } from "@/types";
import api from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";

export function useCategories(params?: {
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
    `/categories?${queryString}`,
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    categories: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategory(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/categories/${id}` : null,
    itemFetcher,
    { revalidateOnFocus: false }
  );

  return {
    category: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategoryActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    setIsLoading(true);
    try {
      const category = await api.post<Category>("/categories", data);
      toast.success("Kategori berhasil ditambahkan");
      return category;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan kategori"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (
    id: string,
    data: { name: string; description?: string }
  ) => {
    setIsLoading(true);
    try {
      const category = await api.put<Category>(`/categories/${id}`, data);
      toast.success("Kategori berhasil diupdate");
      return category;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Kategori berhasil dihapus");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/categories/${id}/toggle`);
      toast.success("Status kategori berhasil diubah");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive,
    isLoading,
  };
}

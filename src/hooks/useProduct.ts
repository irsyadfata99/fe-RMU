// src/hooks/useProduct.ts
"use client";

import useSWR from "swr";
import { Product } from "@/types";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = (url: string) => apiClient.get<Product[]>(url);

export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  outOfStock?: boolean;
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
    `/products?${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/products/${id}` : null,
    (url) => apiClient.get<Product>(url),
    { revalidateOnFocus: false }
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProductActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createProduct = async (data: any) => {
    setIsLoading(true);
    try {
      const product = await apiClient.post<Product>("/products", data);
      toast.success("Produk berhasil ditambahkan");
      return product;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambahkan produk");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const product = await apiClient.put<Product>(`/products/${id}`, data);
      toast.success("Produk berhasil diupdate");
      return product;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal update produk");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success("Produk berhasil dihapus");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus produk");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchByBarcode = async (barcode: string) => {
    try {
      return await apiClient.get<Product>(`/products/barcode/${barcode}`);
    } catch (error) {
      throw error;
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    searchByBarcode,
    isLoading,
  };
}

export default useProduct;

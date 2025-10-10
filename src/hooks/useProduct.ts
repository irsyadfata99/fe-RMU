// ============================================
// src/hooks/useProduct.ts
// ============================================
import useSWR from "swr";
import { Product } from "@/types";
import api from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";

export function useProducts(params?: any) {
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
    arrayFetcher,
    { revalidateOnFocus: false }
  );

  return {
    products: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/products/${id}` : null,
    itemFetcher,
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
      const product = await api.post<Product>("/products", data);
      toast.success("Produk berhasil ditambahkan");
      return product;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const product = await api.put<Product>(`/products/${id}`, data);
      toast.success("Produk berhasil diupdate");
      return product;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Produk berhasil dihapus");
    } finally {
      setIsLoading(false);
    }
  };

  const searchByBarcode = async (barcode: string) => {
    return await api.get<Product>(`/products/barcode/${barcode}`);
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    searchByBarcode,
    isLoading,
  };
}

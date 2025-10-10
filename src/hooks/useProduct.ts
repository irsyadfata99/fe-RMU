// src/hooks/useProduct.ts
"use client";

import useSWR from "swr";
import { Product } from "@/types";
import api from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  try {
    const response = await api.get(url);

    // ✅ Handle different response formats
    let result = response.data.data;

    // If response.data.data is an object with products array
    if (result && typeof result === "object" && !Array.isArray(result)) {
      // Check if it has a products property
      if ("products" in result && Array.isArray(result.products)) {
        return result.products;
      }
      // Check if it has a data property
      if ("data" in result && Array.isArray(result.data)) {
        return result.data;
      }
      // If it's a single object, wrap in array
      return [result];
    }

    // If it's already an array, return as is
    if (Array.isArray(result)) {
      return result;
    }

    // Fallback to empty array
    return [];
  } catch (error) {
    console.error("Fetcher error:", error);
    return [];
  }
};

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
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    products: Array.isArray(data) ? data : [], // ✅ ALWAYS ensure array
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/products/${id}` : null,
    async (url) => {
      try {
        const response = await api.get(url);
        let result = response.data.data;

        // If result is array, get first item
        if (Array.isArray(result)) {
          return result[0] || null;
        }

        return result;
      } catch (error) {
        console.error("Fetcher error:", error);
        return null;
      }
    },
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
      const product = await api.put<Product>(`/products/${id}`, data);
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
      await api.delete(`/products/${id}`);
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
      return await api.get<Product>(`/products/barcode/${barcode}`);
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

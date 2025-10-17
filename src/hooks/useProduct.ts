// ============================================
// src/hooks/useProduct.ts
// ============================================
import useSWR from "swr";
import { Product } from "@/types";
import { apiClient as api } from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductForm as ProductFormData } from "@/lib/validations";

export function useProducts(params?: Record<string, unknown>) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(`/products?${queryString}`, arrayFetcher, { revalidateOnFocus: false });

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
    async (url: string) => {
      const result = await itemFetcher(url);
      return result as Product | undefined;
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

import { ProductForm } from "@/lib/validations";

export function useProductActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createProduct = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const product = await api.post<Product>("/products", data);
      toast.success("Produk berhasil ditambahkan");
      return product;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Transform data untuk match dengan backend API
      const payload = {
        name: data.name,
        barcode: data.barcode,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPriceGeneral, // Backend expect "sellingPrice"
        minStock: data.minStock,
        description: data.description || null,
      };

      console.log("Sending to API:", payload); // Debug
      const product = await api.put<Product>(`/products/${id}`, payload);
      toast.success("Produk berhasil diupdate");
      return product;
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Gagal mengupdate produk");
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

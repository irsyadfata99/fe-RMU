// ============================================
// src/hooks/useProduct.ts - FIXED
// ✅ Simplified response handling - apiClient already extracts data
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
      const payload = {
        name: data.name,
        barcode: data.barcode || null,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        productType: data.productType,
        purchaseType: data.purchaseType,
        invoiceNo: data.invoiceNo || null,
        expiryDate: data.expiryDate || null,
        description: data.description || null,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPriceGeneral: data.sellingPriceGeneral,
        sellingPriceMember: data.sellingPriceMember,
        points: data.points || 0,
        stock: data.stock,
        minStock: data.minStock,
        maxStock: data.maxStock || 0,
      };

      console.log("Sending to API:", payload);
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

  // ✅ CRITICAL FIX: searchByBarcode now returns clean Product data
  // apiClient.get already extracts response.data.data
  const searchByBarcode = async (barcode: string): Promise<Product> => {
    try {
      console.log("🔍 Searching barcode:", barcode);

      // apiClient.get already handles response extraction
      const product = await api.get<Product>(`/products/barcode/${barcode}`);

      console.log("✅ Product found:", {
        id: product.id,
        name: product.name,
        sellingPriceGeneral: product.sellingPriceGeneral,
        sellingPriceMember: product.sellingPriceMember,
      });

      // ✅ Validate critical fields
      if (!product || !product.id) {
        throw new Error("Data produk tidak valid");
      }

      if (!product.sellingPriceGeneral || !product.sellingPriceMember) {
        throw new Error(`Produk ${product.name} tidak memiliki data harga yang lengkap`);
      }

      return product;
    } catch (error) {
      console.error("❌ Error in searchByBarcode:", error);
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

// src/app/dashboard/barang/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProduct, useProductActions } from "@/hooks/useProduct";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ProductForm as ProductFormType } from "@/lib/validations";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { product, isLoading } = useProduct(id);
  const { updateProduct, isLoading: isUpdating } = useProductActions();

  const handleSubmit = async (data: ProductFormType) => {
    try {
      await updateProduct(id, data);
      router.push("/dashboard/barang");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Produk tidak ditemukan</p>
      </div>
    );
  }

  // Ensure description is never null for the form
  const safeProduct = {
    ...product,
    description: product.description ?? "",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/barang">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Produk</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={safeProduct} onSubmit={handleSubmit} isLoading={isUpdating} />
        </CardContent>
      </Card>
    </div>
  );
}

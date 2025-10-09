// src/app/dashboard/barang/tambah/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
import { useProductActions } from "@/hooks/useProduct";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddProductPage() {
  const router = useRouter();
  const { createProduct, isLoading } = useProductActions();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct(data);
      router.push("/dashboard/barang");
    } catch (error) {
      console.error(error);
    }
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
          <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
          <p className="text-muted-foreground">
            Lengkapi form untuk menambah produk
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

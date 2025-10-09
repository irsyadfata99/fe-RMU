// src/components/products/barcode-scanner.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onProductFound: (product: Product) => void;
}

export function BarcodeScanner({ onProductFound }: BarcodeScannerProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: products } = useSWR(
    search.length >= 2 ? `/products/autocomplete?query=${search}` : null,
    (url) => apiClient.get<any[]>(url)
  );

  const handleSelect = async (productId: string) => {
    try {
      const product = await apiClient.get<Product>(`/products/${productId}`);
      onProductFound(product);
      setSearch("");
      setShowResults(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Cari Produk Manual</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ketik nama produk..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowResults(true);
            }}
            className="pl-10"
          />
        </div>

        {showResults && products && products.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="max-h-64 overflow-y-auto">
              {products.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stok: {product.stock} {product.unit}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// src/components/purchases/purchase-item-row.tsx (CRITICAL FIX)
// ============================================
"use client";
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import useSWR from "swr";
import { arrayFetcher, ensureArray } from "@/lib/swr-fetcher";

interface PurchaseItemRowProps {
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, data: any) => void;
  initialData?: any;
}

export function PurchaseItemRow({
  index,
  onRemove,
  onChange,
  initialData,
}: PurchaseItemRowProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(initialData?.quantity ?? 1);
  const [purchasePrice, setPurchasePrice] = useState(
    initialData?.purchasePrice ?? 0
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice ?? 0
  );
  const [expDate, setExpDate] = useState(initialData?.expDate ?? "");

  // ✅ FIX: Use arrayFetcher
  const { data: productsData } = useSWR(
    search.length >= 2 ? `/products/autocomplete?query=${search}` : null,
    arrayFetcher
  );

  const products = ensureArray(productsData);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch("");
    setShowResults(false);
    setPurchasePrice(product.purchasePrice);
    setSellingPrice(product.sellingPrice);

    onChange(index, {
      productId: product.id,
      quantity,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      expDate,
    });
  };

  const subtotal = (quantity || 0) * (purchasePrice || 0);
  const displaySubtotal = isNaN(subtotal) ? 0 : subtotal;

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg bg-muted/30">
      <div className="col-span-3 relative">
        {selectedProduct ? (
          <div className="space-y-1">
            <p className="font-medium text-sm">{selectedProduct.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {selectedProduct.sku}
            </p>
          </div>
        ) : (
          <>
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="h-8"
            />
            {showResults && products.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {products.map((product: Product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stok: {product.stock} {product.unit}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="col-span-1">
        <Input
          type="number"
          value={quantity || ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            setQuantity(val);
            if (selectedProduct) {
              onChange(index, {
                productId: selectedProduct.id,
                quantity: val,
                purchasePrice,
                sellingPrice,
                expDate,
              });
            }
          }}
          min={1}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      <div className="col-span-1">
        <Input
          value={selectedProduct?.unit || "-"}
          disabled
          className="h-8 bg-muted"
        />
      </div>

      <div className="col-span-2">
        <Input
          type="number"
          value={purchasePrice || ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPurchasePrice(val);
            if (selectedProduct) {
              onChange(index, {
                productId: selectedProduct.id,
                quantity,
                purchasePrice: val,
                sellingPrice,
                expDate,
              });
            }
          }}
          min={0}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      <div className="col-span-2">
        <Input
          type="number"
          value={sellingPrice || ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSellingPrice(val);
            if (selectedProduct) {
              onChange(index, {
                productId: selectedProduct.id,
                quantity,
                purchasePrice,
                sellingPrice: val,
                expDate,
              });
            }
          }}
          min={0}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      <div className="col-span-2">
        <Input
          type="date"
          value={expDate || ""}
          onChange={(e) => {
            setExpDate(e.target.value);
            if (selectedProduct) {
              onChange(index, {
                productId: selectedProduct.id,
                quantity,
                purchasePrice,
                sellingPrice,
                expDate: e.target.value,
              });
            }
          }}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      <div className="col-span-1 flex items-center justify-end">
        <p className="text-sm font-semibold">
          {formatCurrency(displaySubtotal)}
        </p>
      </div>

      <div className="col-span-1 flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(index)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default PurchaseItemRow;

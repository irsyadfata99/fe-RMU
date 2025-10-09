// src/components/purchases/purchase-item-row.tsx
"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import useSWR from "swr";
import { apiClient } from "@/lib/api";

interface PurchaseItemRowProps {
  index: number;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    data: {
      productId: string;
      quantity: number;
      purchasePrice: number;
      sellingPrice: number;
      expDate?: string;
    }
  ) => void;
  initialData?: {
    productId: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    expDate?: string;
  };
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
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [purchasePrice, setPurchasePrice] = useState(
    initialData?.purchasePrice || 0
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialData?.sellingPrice || 0
  );
  const [expDate, setExpDate] = useState(initialData?.expDate || "");

  // Product autocomplete
  const { data: products } = useSWR(
    search.length >= 2 ? `/products/autocomplete?query=${search}` : null,
    (url) => apiClient.get<Product[]>(url)
  );

  // Load initial product if editing
  useEffect(() => {
    if (initialData?.productId && !selectedProduct) {
      apiClient
        .get<Product>(`/products/${initialData.productId}`)
        .then(setSelectedProduct)
        .catch(console.error);
    }
  }, [initialData, selectedProduct]);

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

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (selectedProduct) {
      onChange(index, {
        productId: selectedProduct.id,
        quantity: newQuantity,
        purchasePrice,
        sellingPrice,
        expDate,
      });
    }
  };

  const handlePurchasePriceChange = (newPrice: number) => {
    setPurchasePrice(newPrice);
    if (selectedProduct) {
      onChange(index, {
        productId: selectedProduct.id,
        quantity,
        purchasePrice: newPrice,
        sellingPrice,
        expDate,
      });
    }
  };

  const handleSellingPriceChange = (newPrice: number) => {
    setSellingPrice(newPrice);
    if (selectedProduct) {
      onChange(index, {
        productId: selectedProduct.id,
        quantity,
        purchasePrice,
        sellingPrice: newPrice,
        expDate,
      });
    }
  };

  const handleExpDateChange = (newDate: string) => {
    setExpDate(newDate);
    if (selectedProduct) {
      onChange(index, {
        productId: selectedProduct.id,
        quantity,
        purchasePrice,
        sellingPrice,
        expDate: newDate,
      });
    }
  };

  const subtotal = quantity * purchasePrice;

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg bg-muted/30">
      {/* Product Search */}
      <div className="col-span-3 relative">
        {selectedProduct ? (
          <div className="space-y-1">
            <p className="font-medium text-sm">{selectedProduct.name}</p>
            <p className="text-xs text-muted-foreground">
              SKU: {selectedProduct.sku}
            </p>
            <p className="text-xs text-muted-foreground">
              Stok: {selectedProduct.stock} {selectedProduct.unit}
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
            {showResults && products && products.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {products.map((product) => (
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

      {/* Quantity */}
      <div className="col-span-1">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          min={1}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      {/* Unit */}
      <div className="col-span-1">
        <Input
          value={selectedProduct?.unit || "-"}
          disabled
          className="h-8 bg-muted"
        />
      </div>

      {/* Purchase Price */}
      <div className="col-span-2">
        <Input
          type="number"
          value={purchasePrice}
          onChange={(e) => handlePurchasePriceChange(Number(e.target.value))}
          min={0}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      {/* Selling Price */}
      <div className="col-span-2">
        <Input
          type="number"
          value={sellingPrice}
          onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
          min={0}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      {/* Exp Date */}
      <div className="col-span-2">
        <Input
          type="date"
          value={expDate}
          onChange={(e) => handleExpDateChange(e.target.value)}
          disabled={!selectedProduct}
          className="h-8"
        />
      </div>

      {/* Subtotal */}
      <div className="col-span-1 flex items-center justify-end">
        <p className="text-sm font-semibold">{formatCurrency(subtotal)}</p>
      </div>

      {/* Remove Button */}
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

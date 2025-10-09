// src/components/returns/return-item-selector.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReturnItem {
  productId: string;
  productName?: string;
  unit?: string;
  quantity: number;
  price: number;
  maxQuantity?: number;
}

interface ReturnItemSelectorProps {
  availableProducts: Array<{
    productId: string;
    productName: string;
    unit: string;
    price: number;
    maxQuantity: number;
  }>;
  items: ReturnItem[];
  onChange: (items: ReturnItem[]) => void;
  disabled?: boolean;
}

export function ReturnItemSelector({
  availableProducts,
  items,
  onChange,
  disabled = false,
}: ReturnItemSelectorProps) {
  const handleAddItem = (product: (typeof availableProducts)[0]) => {
    const existingItem = items.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      // Update quantity
      const newItems = items.map((item) =>
        item.productId === product.productId
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, product.maxQuantity),
            }
          : item
      );
      onChange(newItems);
    } else {
      // Add new item
      onChange([
        ...items,
        {
          productId: product.productId,
          productName: product.productName,
          unit: product.unit,
          quantity: 1,
          price: product.price,
          maxQuantity: product.maxQuantity,
        },
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    const validQuantity = Math.max(
      1,
      Math.min(quantity, item.maxQuantity || 999)
    );

    const newItems = items.map((i) =>
      i.productId === productId ? { ...i, quantity: validQuantity } : i
    );
    onChange(newItems);
  };

  const handleRemoveItem = (productId: string) => {
    onChange(items.filter((item) => item.productId !== productId));
  };

  const subtotal = (item: ReturnItem) => item.quantity * item.price;
  const total = items.reduce((sum, item) => sum + subtotal(item), 0);

  return (
    <div className="space-y-4">
      {/* Available Products */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Pilih Produk yang Diretur</h3>
        <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
          {availableProducts.map((product) => {
            const isSelected = items.some(
              (item) => item.productId === product.productId
            );

            return (
              <button
                key={product.productId}
                type="button"
                onClick={() => handleAddItem(product)}
                disabled={disabled || isSelected}
                className={`flex items-center justify-between p-3 rounded-md border text-left transition-colors ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-accent"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Max: {product.maxQuantity} {product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(product.price)}
                  </p>
                  {isSelected && (
                    <span className="text-xs text-primary">✓ Dipilih</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Items */}
      {items.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Item yang Diretur</h3>
          <div className="border rounded-lg">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <div className="col-span-4">Produk</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Harga</div>
              <div className="col-span-3 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item) => (
              <div
                key={item.productId}
                className="grid grid-cols-12 gap-2 px-3 py-3 border-b last:border-0 items-center"
              >
                <div className="col-span-4">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Max: {item.maxQuantity}
                  </p>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.productId,
                        parseInt(e.target.value) || 1
                      )
                    }
                    min={1}
                    max={item.maxQuantity}
                    disabled={disabled}
                    className="h-8 text-center"
                  />
                </div>
                <div className="col-span-2 text-right text-sm">
                  {formatCurrency(item.price)}
                </div>
                <div className="col-span-3 text-right font-semibold">
                  {formatCurrency(subtotal(item))}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveItem(item.productId)}
                    disabled={disabled}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end border-t pt-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Retur</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

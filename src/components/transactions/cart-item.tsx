// src/components/transactions/cart-item.tsx
"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CartItemProps {
  item: {
    product: Product;
    quantity: number;
    subtotal: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) return;
    if (newQuantity > item.product.stock) {
      alert(`Stok tidak cukup. Tersedia: ${item.product.stock}`);
      return;
    }
    setQuantity(newQuantity);
    onUpdateQuantity(item.product.id, newQuantity);
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 space-y-1">
        <p className="font-medium">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(item.product.sellingPrice)} × {item.quantity}
        </p>
        <p className="text-xs text-muted-foreground">
          Stok: {item.product.stock} {item.product.unit}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handleQuantityChange(quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          className="h-8 w-16 text-center"
          min={1}
          max={item.product.stock}
        />
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => handleQuantityChange(quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <p className="min-w-[100px] text-right font-semibold">
          {formatCurrency(item.subtotal)}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(item.product.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

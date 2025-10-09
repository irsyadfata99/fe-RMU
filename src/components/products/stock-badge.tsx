// src/components/products/stock-badge.tsx
import { Badge } from "@/components/ui/badge";

interface StockBadgeProps {
  stock: number;
  minStock: number;
}

export function StockBadge({ stock, minStock }: StockBadgeProps) {
  if (stock === 0) {
    return <Badge variant="destructive">Habis</Badge>;
  }
  if (stock <= minStock) {
    return <Badge className="bg-orange-500">Menipis</Badge>;
  }
  return <Badge className="bg-green-500">Normal</Badge>;
}

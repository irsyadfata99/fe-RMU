// src/app/(protected)/dashboard/products/stock/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Product, Category, StockStatus } from "@/types";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

export default function StockPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch data
  const { data: products, isLoading } = useSWR<Product[]>("/products", (url) =>
    apiClient.get<Product[]>(url)
  );
  const { data: categories } = useSWR<Category[]>(
    "/products/categories",
    (url) => apiClient.get<Category[]>(url)
  );

  // Filter products
  const filteredProducts = products?.filter((prod) => {
    const matchSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.barcode.includes(search);
    const matchCategory = !categoryFilter || prod.categoryId === categoryFilter;
    const matchStatus = !statusFilter || prod.stockStatus === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  // Calculate stats
  const normalStock =
    products?.filter((p) => p.stockStatus === StockStatus.NORMAL).length || 0;
  const lowStock =
    products?.filter((p) => p.stockStatus === StockStatus.LOW).length || 0;
  const overStock =
    products?.filter((p) => p.stockStatus === StockStatus.OVER).length || 0;
  const emptyStock =
    products?.filter((p) => p.stockStatus === StockStatus.EMPTY).length || 0;

  const getStockStatusBadge = (status: StockStatus) => {
    const variants: Record<
      StockStatus,
      {
        variant: "default" | "destructive" | "secondary";
        label: string;
        color: string;
      }
    > = {
      [StockStatus.NORMAL]: {
        variant: "default",
        label: "Normal",
        color: "text-green-600",
      },
      [StockStatus.LOW]: {
        variant: "secondary",
        label: "Hampir Habis",
        color: "text-orange-600",
      },
      [StockStatus.OVER]: {
        variant: "secondary",
        label: "Over Stock",
        color: "text-blue-600",
      },
      [StockStatus.EMPTY]: {
        variant: "destructive",
        label: "Habis",
        color: "text-red-600",
      },
    };
    const config = variants[status];
    return (
      <Badge
        variant={config.variant}
        className={
          status === StockStatus.LOW
            ? "bg-orange-500"
            : status === StockStatus.OVER
            ? "bg-blue-500"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
  };

  const getStockIndicator = (product: Product) => {
    const percentage = (product.stock / product.maxStock) * 100;
    let color = "bg-green-500";
    if (product.stock === 0) color = "bg-red-500";
    else if (product.stock <= product.minStock) color = "bg-orange-500";
    else if (product.stock >= product.maxStock) color = "bg-blue-500";

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${color} h-2 rounded-full transition-all`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {product.minStock}</span>
          <span>Max: {product.maxStock}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stok Barang</h1>
        <p className="text-muted-foreground">
          Monitoring stok barang real-time (Read-Only)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Normal</p>
                <p className="text-2xl font-bold">{normalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hampir Habis</p>
                <p className="text-2xl font-bold">{lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Over Stock</p>
                <p className="text-2xl font-bold">{overStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Habis</p>
                <p className="text-2xl font-bold">{emptyStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk (nama/barcode)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status Stok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                <SelectItem value={StockStatus.NORMAL}>Normal</SelectItem>
                <SelectItem value={StockStatus.LOW}>Hampir Habis</SelectItem>
                <SelectItem value={StockStatus.OVER}>Over Stock</SelectItem>
                <SelectItem value={StockStatus.EMPTY}>Habis</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Stok Real-Time</CardTitle>
          <CardDescription>
            Data stok barang di sistem (Read-Only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Indikator Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nilai Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">
                        {product.barcode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock <= product.minStock
                              ? "text-orange-600"
                              : product.stock >= product.maxStock
                              ? "text-blue-600"
                              : ""
                          }`}
                        >
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        {getStockIndicator(product)}
                      </TableCell>
                      <TableCell>
                        {getStockStatusBadge(product.stockStatus)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(product.stock * product.purchasePrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {search || categoryFilter || statusFilter
                ? "Tidak ada produk yang ditemukan"
                : "Belum ada produk"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

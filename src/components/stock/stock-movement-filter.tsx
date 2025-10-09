// src/components/stock/stock-movement-filter.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { STOCK_MOVEMENT_TYPE_LABELS } from "@/lib/validations";

interface StockMovementFilterProps {
  onFilter: (filters: {
    productId?: string;
    type?: string;
    referenceType?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  onReset: () => void;
}

export function StockMovementFilter({
  onFilter,
  onReset,
}: StockMovementFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    productId: "",
    type: "",
    referenceType: "",
    startDate: "",
    endDate: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    // Convert empty strings to undefined for API
    const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== "all") {
        acc[key as keyof typeof filters] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    onFilter(apiFilters);
  };

  const handleReset = () => {
    setFilters({
      productId: "",
      type: "",
      referenceType: "",
      startDate: "",
      endDate: "",
    });
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "all"
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Toggle Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter{" "}
              {hasActiveFilters &&
                `(${
                  Object.values(filters).filter((v) => v && v !== "all").length
                })`}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Movement Type */}
                <div className="space-y-2">
                  <Label>Tipe Gerakan</Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      {Object.entries(STOCK_MOVEMENT_TYPE_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Type */}
                <div className="space-y-2">
                  <Label>Referensi</Label>
                  <Select
                    value={filters.referenceType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("referenceType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua referensi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="PURCHASE">Pembelian</SelectItem>
                      <SelectItem value="SALE">Penjualan</SelectItem>
                      <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
                      <SelectItem value="RETURN">Retur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>Tanggal Akhir</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-end">
                <Button onClick={handleApply} className="gap-2">
                  <Search className="h-4 w-4" />
                  Terapkan Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StockMovementFilter;

// src/components/point/point-filter.tsx
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
import { PointTransactionFilters, PointTransactionType } from "@/types/point";

interface PointFilterProps {
  onFilter: (filters: PointTransactionFilters) => void;
  onReset: () => void;
}

// Local filter state type that includes "all" option
interface LocalFilters {
  type: PointTransactionType | "all" | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

export function PointFilter({ onFilter, onReset }: PointFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<LocalFilters>({
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const handleFilterChange = <K extends keyof LocalFilters>(
    key: K,
    value: LocalFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    // Convert local filters to API filters
    const apiFilters: PointTransactionFilters = {};

    if (filters.type && filters.type !== "all") {
      apiFilters.type = filters.type as PointTransactionType;
    }
    if (filters.startDate) {
      apiFilters.startDate = filters.startDate;
    }
    if (filters.endDate) {
      apiFilters.endDate = filters.endDate;
    }

    onFilter(apiFilters);
  };

  const handleReset = () => {
    setFilters({
      type: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== "all"
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
                  Object.values(filters).filter(
                    (v) => v !== undefined && v !== "" && v !== "all"
                  ).length
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
                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label>Jenis Transaksi</Label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("type", value as LocalFilters["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="EARN">Dapat Point</SelectItem>
                      <SelectItem value="REDEEM">Tukar Point</SelectItem>
                      <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
                      <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "startDate",
                        e.target.value || undefined
                      )
                    }
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>Tanggal Akhir</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value || undefined)
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

export default PointFilter;

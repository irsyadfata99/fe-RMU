// src/components/debt/debt-filter.tsx
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
import { DebtFilters } from "@/types/debt";
import { REGIONS } from "@/constants/regions";

interface DebtFilterProps {
  onFilter: (filters: DebtFilters) => void;
  onReset: () => void;
  showRegionFilter?: boolean; // For member debts only
}

// Local filter state type that includes "all" option
interface LocalFilters {
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "all" | undefined;
  overdue: boolean | undefined;
  regionCode: string | "all" | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

export function DebtFilter({
  onFilter,
  onReset,
  showRegionFilter = false,
}: DebtFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<LocalFilters>({
    status: undefined,
    overdue: undefined,
    regionCode: undefined,
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
    const apiFilters: DebtFilters = {};

    if (filters.status && filters.status !== "all") {
      apiFilters.status = filters.status;
    }
    if (filters.overdue !== undefined) {
      apiFilters.overdue = filters.overdue;
    }
    if (filters.regionCode && filters.regionCode !== "all") {
      apiFilters.regionCode = filters.regionCode;
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
      status: undefined,
      overdue: undefined,
      regionCode: undefined,
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
                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "status",
                        value as LocalFilters["status"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PARTIAL">Cicilan</SelectItem>
                      <SelectItem value="PAID">Lunas</SelectItem>
                      <SelectItem value="OVERDUE">Jatuh Tempo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Overdue Filter */}
                <div className="space-y-2">
                  <Label>Filter Jatuh Tempo</Label>
                  <Select
                    value={
                      filters.overdue === undefined
                        ? "all"
                        : filters.overdue
                        ? "true"
                        : "false"
                    }
                    onValueChange={(value) =>
                      handleFilterChange(
                        "overdue",
                        value === "all" ? undefined : value === "true"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="true">Hanya Jatuh Tempo</SelectItem>
                      <SelectItem value="false">Belum Jatuh Tempo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region Filter (only for member debts) */}
                {showRegionFilter && (
                  <div className="space-y-2">
                    <Label>Wilayah</Label>
                    <Select
                      value={filters.regionCode || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "regionCode",
                          value as LocalFilters["regionCode"]
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua wilayah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        {REGIONS.map((region) => (
                          <SelectItem key={region.code} value={region.code}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

export default DebtFilter;

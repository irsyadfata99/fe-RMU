// src/components/laporan/report-filters.tsx
"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  showSearch?: boolean;
  showDateRange?: boolean;
}

export function ReportFilters({
  filters,
  onFilterChange,
  onReset,
  showSearch = true,
  showDateRange = true,
}: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  });

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({ search: "", startDate: "", endDate: "" });
    onReset();
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showSearch && (
          <div className="space-y-2">
            <Label>Pencarian</Label>
            <Input
              placeholder="Cari..."
              value={localFilters.search}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, search: e.target.value })
              }
            />
          </div>
        )}

        {showDateRange && (
          <>
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={localFilters.startDate}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    startDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={localFilters.endDate}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, endDate: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Terapkan
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          Reset
        </Button>
      </div>
    </div>
  );
}

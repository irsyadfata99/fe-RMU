// ============================================
// FILE 3: src/components/laporan/report-stats.tsx
// ============================================
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  format?: "number" | "currency" | "percentage";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ReportStatsProps {
  stats: StatCard[];
}

export function ReportStats({ stats }: ReportStatsProps) {
  const formatValue = (value: string | number, format?: string) => {
    if (format === "currency") {
      return formatCurrency(Number(value));
    }
    if (format === "percentage") {
      return `${value}%`;
    }
    if (format === "number") {
      return Number(value).toLocaleString("id-ID");
    }
    return value;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(stat.value, stat.format)}
              </div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
              {stat.trend && (
                <div
                  className={`text-xs mt-1 ${
                    stat.trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}%
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

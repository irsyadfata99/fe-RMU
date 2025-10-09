// src/components/dashboard/stats-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  prefix,
  suffix,
  isCurrency = false,
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    warning: "bg-orange-500/10 text-orange-600",
    danger: "bg-red-500/10 text-red-600",
  };

  const formatValue = () => {
    if (isCurrency) {
      return formatCurrency(value);
    }
    const formatted = formatNumber(value);
    if (prefix) return `${prefix} ${formatted}`;
    if (suffix) return `${formatted} ${suffix}`;
    return formatted;
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue()}</p>
          </div>
          <div className={cn("rounded-full p-3", variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

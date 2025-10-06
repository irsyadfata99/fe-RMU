// src/components/shared/metric-card.tsx

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function MetricCard({ title, value, variant = "default", className }: MetricCardProps) {
  const variantStyles = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-orange-600",
    danger: "text-destructive",
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold", variantStyles[variant])}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

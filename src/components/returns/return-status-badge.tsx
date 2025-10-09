// src/components/returns/return-status-badge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { ReturnStatus } from "@/types/return";

interface ReturnStatusBadgeProps {
  status: ReturnStatus;
  className?: string;
}

export function ReturnStatusBadge({
  status,
  className,
}: ReturnStatusBadgeProps) {
  const variants: Record<
    ReturnStatus,
    "default" | "secondary" | "destructive"
  > = {
    APPROVED: "default",
    PENDING: "secondary",
    REJECTED: "destructive",
  };

  const labels: Record<ReturnStatus, string> = {
    APPROVED: "Disetujui",
    PENDING: "Menunggu",
    REJECTED: "Ditolak",
  };

  return (
    <Badge variant={variants[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}

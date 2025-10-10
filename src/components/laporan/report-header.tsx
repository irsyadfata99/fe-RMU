// ============================================
// FILE 2: src/components/laporan/report-header.tsx
// ============================================
"use client";

import { FileText } from "lucide-react";

interface ReportHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function ReportHeader({ title, description, icon }: ReportHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg bg-primary/10 p-3">
        {icon || <FileText className="h-6 w-6 text-primary" />}
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

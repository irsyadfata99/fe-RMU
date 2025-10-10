// src/components/laporan/report-export-button.tsx
"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  disabled?: boolean;
}

export function ReportExportButton({
  onExport,
  isExporting,
  disabled = false,
}: ReportExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      disabled={disabled || isExporting}
      variant="outline"
      className="min-w-[120px]"
    >
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Mengekspor..." : "Export Excel"}
    </Button>
  );
}

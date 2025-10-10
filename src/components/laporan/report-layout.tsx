// ============================================
// FILE 1: src/components/laporan/report-layout.tsx
// ============================================
"use client";

import { ReactNode } from "react";

interface ReportLayoutProps {
  children: ReactNode;
}

export function ReportLayout({ children }: ReportLayoutProps) {
  return <div className="space-y-6">{children}</div>;
}

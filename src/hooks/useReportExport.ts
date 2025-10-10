// src/hooks/useReportExport.ts
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface UseReportExportOptions {
  endpoint: string;
  filename: string;
}

export function useReportExport({
  endpoint,
  filename,
}: UseReportExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = async (filters: any = {}) => {
    try {
      setIsExporting(true);

      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();
      const url = queryString
        ? `${endpoint}/export?${queryString}`
        : `${endpoint}/export`;

      // Download file
      const response = await apiClient.get(url, {
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${filename}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Laporan berhasil diexport");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error?.response?.data?.message || "Gagal export laporan");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReport,
    isExporting,
  };
}

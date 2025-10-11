// src/hooks/useReportExport.ts
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface UseReportExportOptions {
  endpoint: string;
  filename: string;
}

export function useReportExport({ endpoint, filename }: UseReportExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = async (filters: any = {}) => {
    try {
      setIsExporting(true);

      // Build query string
      const queryParams = new URLSearchParams();

      // ✅ FIXED: Add export=true parameter
      queryParams.append("export", "true");

      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const queryString = queryParams.toString();

      // ✅ FIXED: Use same endpoint, just add export=true in query
      const url = `${endpoint}?${queryString}`;

      console.log("[Export] Requesting:", url);

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

      // ✅ Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `${filename}_${timestamp}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Laporan berhasil diexport");
    } catch (error: any) {
      console.error("Export error:", error);

      // ✅ Better error messages
      if (error?.response?.status === 404) {
        toast.error("Endpoint export tidak ditemukan");
      } else if (error?.response?.status === 401) {
        toast.error("Sesi anda habis, silakan login kembali");
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Gagal export laporan. Coba lagi.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReport,
    isExporting,
  };
}

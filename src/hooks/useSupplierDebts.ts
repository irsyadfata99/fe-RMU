// src/hooks/useSupplierDebts.ts
"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import {
  getSupplierDebts,
  getSupplierDebtDetail,
  getSupplierDebtsBySupplier,
  paySupplierDebt,
  exportSupplierDebts,
} from "@/services/debtService";
import {
  SupplierDebt,
  SupplierDebtSummary,
  PaySupplierDebtRequest,
  DebtFilters,
  DebtExportFilters,
} from "@/types/debt";
import { PaginatedResponse } from "@/types";

// ============================================
// GET ALL SUPPLIER DEBTS (with filters)
// ============================================
export function useSupplierDebts(filters?: DebtFilters) {
  const queryKey = `/payments/supplier-debts?${JSON.stringify(filters || {})}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<SupplierDebt>
  >(queryKey, () => getSupplierDebts(filters), {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    debts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// GET SINGLE SUPPLIER DEBT DETAIL
// ============================================
export function useSupplierDebt(debtId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SupplierDebt>(
    debtId ? `/payments/supplier-debts/${debtId}` : null,
    debtId ? () => getSupplierDebtDetail(debtId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    debt: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// GET DEBTS BY SUPPLIER
// ============================================
export function useSupplierDebtsBySupplier(supplierId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SupplierDebtSummary>(
    supplierId ? `/payments/supplier-debts/supplier/${supplierId}/list` : null,
    supplierId ? () => getSupplierDebtsBySupplier(supplierId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// SUPPLIER DEBT ACTIONS
// ============================================
export function useSupplierDebtActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Pay supplier debt
   */
  const payDebt = async (debtId: string, data: PaySupplierDebtRequest) => {
    setIsLoading(true);
    try {
      const result = await paySupplierDebt(debtId, data);
      toast.success("Pembayaran berhasil diproses", {
        description: `Sisa hutang: Rp ${result.debt.remainingAmount.toLocaleString(
          "id-ID"
        )}`,
      });
      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Gagal memproses pembayaran";
      toast.error("Pembayaran gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export supplier debts to Excel
   */
  const exportToExcel = async (filters?: DebtExportFilters) => {
    setIsLoading(true);
    try {
      const blob = await exportSupplierDebts(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hutang-Supplier-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export berhasil", {
        description: "File Excel berhasil diunduh",
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Gagal export data";
      toast.error("Export gagal", {
        description: errorMsg,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payDebt,
    exportToExcel,
    isLoading,
  };
}

// src/hooks/useMemberDebts.ts
"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import {
  getMemberDebts,
  getMemberDebtDetail,
  getMemberDebtsByMember,
  payMemberDebt,
  exportMemberDebts,
  getDebtStats,
} from "@/services/debtService";
import {
  MemberDebt,
  MemberDebtSummary,
  PayMemberDebtRequest,
  DebtFilters,
  DebtExportFilters,
  DebtStats,
} from "@/types/debt";
import { PaginatedResponse } from "@/types";

// ============================================
// GET ALL MEMBER DEBTS (with filters)
// ============================================
export function useMemberDebts(filters?: DebtFilters) {
  const queryKey = `/payments/member-debts?${JSON.stringify(filters || {})}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<MemberDebt>
  >(queryKey, () => getMemberDebts(filters), {
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
// GET SINGLE MEMBER DEBT DETAIL
// ============================================
export function useMemberDebt(debtId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MemberDebt>(
    debtId ? `/payments/member-debts/${debtId}` : null,
    debtId ? () => getMemberDebtDetail(debtId) : null,
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
// GET DEBTS BY MEMBER
// ============================================
export function useMemberDebtsByMember(memberId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MemberDebtSummary>(
    memberId ? `/payments/member-debts/member/${memberId}` : null,
    memberId ? () => getMemberDebtsByMember(memberId) : null,
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
// GET DEBT STATISTICS
// ============================================
export function useDebtStats() {
  const { data, error, isLoading } = useSWR<DebtStats>(
    "/payments/stats",
    () => getDebtStats(),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30s
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

// ============================================
// MEMBER DEBT ACTIONS
// ============================================
export function useMemberDebtActions() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Pay member debt
   */
  const payDebt = async (debtId: string, data: PayMemberDebtRequest) => {
    setIsLoading(true);
    try {
      const result = await payMemberDebt(debtId, data);
      toast.success("Pembayaran berhasil diproses", {
        description: `Bukti: ${
          result.payment.receiptNumber
        } - Sisa: Rp ${result.debt.remainingAmount.toLocaleString("id-ID")}`,
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
   * Export member debts to Excel
   */
  const exportToExcel = async (filters?: DebtExportFilters) => {
    setIsLoading(true);
    try {
      const blob = await exportMemberDebts(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Piutang-Member-${
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

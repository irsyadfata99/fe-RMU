// src/services/debtService.ts
// API Service untuk Supplier Debt & Member Debt

import { apiClient } from "@/lib/api";
import { SupplierDebt, SupplierDebtSummary, PaySupplierDebtRequest, MemberDebt, MemberDebtSummary, PayMemberDebtRequest, PayMemberDebtResponse, DebtStats, DebtFilters, DebtExportFilters } from "@/types/debt";
import { PaginatedResponse } from "@/types";

// ============================================
// SUPPLIER DEBT (HUTANG KE SUPPLIER)
// ============================================

/**
 * Get all supplier debts with filters
 */
export const getSupplierDebts = async (filters?: DebtFilters): Promise<PaginatedResponse<SupplierDebt>> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.overdue) params.append("overdue", filters.overdue.toString());
  if (filters?.supplierId) params.append("supplierId", filters.supplierId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await apiClient.get<PaginatedResponse<SupplierDebt>>(`/payments/supplier-debts?${params.toString()}`);
  return response;
};

/**
 * Get supplier debt detail
 */
export const getSupplierDebtDetail = async (debtId: string): Promise<SupplierDebt> => {
  return await apiClient.get<SupplierDebt>(`/payments/supplier-debts/${debtId}`);
};

/**
 * Get debts by specific supplier
 */
export const getSupplierDebtsBySupplier = async (supplierId: string): Promise<SupplierDebtSummary> => {
  return await apiClient.get<SupplierDebtSummary>(`/payments/supplier-debts/supplier/${supplierId}/list`);
};

/**
 * Pay supplier debt
 */
export const paySupplierDebt = async (debtId: string, data: PaySupplierDebtRequest): Promise<{ debt: SupplierDebt }> => {
  return await apiClient.post<{ debt: SupplierDebt }>(`/payments/supplier-debts/${debtId}/pay`, data);
};

/**
 * Export supplier debts to Excel
 */
export const exportSupplierDebts = async (filters?: DebtExportFilters): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.overdue) params.append("overdue", filters.overdue.toString());
  if (filters?.supplierId) params.append("supplierId", filters.supplierId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/supplier-debts/export?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export supplier debts");
  }

  return await response.blob();
};

// ============================================
// MEMBER DEBT (PIUTANG DARI MEMBER)
// ============================================

/**
 * Get all member debts with filters
 */
export const getMemberDebts = async (filters?: DebtFilters): Promise<PaginatedResponse<MemberDebt>> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.overdue) params.append("overdue", filters.overdue.toString());
  if (filters?.memberId) params.append("memberId", filters.memberId);
  if (filters?.regionCode) params.append("regionCode", filters.regionCode);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await apiClient.get<PaginatedResponse<MemberDebt>>(`/payments/member-debts?${params.toString()}`);
  return response;
};

/**
 * Get member debt detail
 */
export const getMemberDebtDetail = async (debtId: string): Promise<MemberDebt> => {
  return await apiClient.get<MemberDebt>(`/payments/member-debts/${debtId}`);
};

/**
 * Get debts by specific member
 */
export const getMemberDebtsByMember = async (memberId: string): Promise<MemberDebtSummary> => {
  return await apiClient.get<MemberDebtSummary>(`/payments/member-debts/member/${memberId}`);
};

/**
 * Pay member debt
 */
export const payMemberDebt = async (debtId: string, data: PayMemberDebtRequest): Promise<PayMemberDebtResponse> => {
  return await apiClient.post<PayMemberDebtResponse>(`/payments/member-debts/${debtId}/pay`, data);
};

/**
 * Export member debts to Excel
 */
export const exportMemberDebts = async (filters?: DebtExportFilters): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.overdue) params.append("overdue", filters.overdue.toString());
  if (filters?.memberId) params.append("memberId", filters.memberId);
  if (filters?.regionCode) params.append("regionCode", filters.regionCode);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/member-debts/export?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export member debts");
  }

  return await response.blob();
};

// ============================================
// DEBT STATISTICS
// ============================================

/**
 * Get combined debt statistics
 */
export const getDebtStats = async (): Promise<DebtStats> => {
  return await apiClient.get<DebtStats>("/payments/stats");
};

/**
 * Print debt payment receipt
 * ✅ Production-ready with proper base URL handling
 */
export const printDebtPaymentReceipt = async (debtId: string, paymentId: string): Promise<void> => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  // ✅ Consistent with other API calls - no /api suffix
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/member-debts/${debtId}/print-receipt/${paymentId}`;

  try {
    // Fetch HTML dengan authentication
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/html",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sesi login habis. Silakan login kembali.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get HTML content
    const htmlContent = await response.text();

    // Open new window and write HTML
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      throw new Error("Popup diblokir. Mohon izinkan popup untuk mencetak nota.");
    }

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error("Print error:", error);
    throw error;
  }
};

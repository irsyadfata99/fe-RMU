// src/services/pointService.ts
// API Service untuk Point Management

import { apiClient } from "@/lib/api";
import {
  PointTransaction,
  PointSummary,
  PointSettings,
  UpdatePointSettingsRequest,
  RedeemPointsRequest,
  AdjustPointsRequest,
  ExpirePointsResponse,
  PointPreviewItem,
  PointPreviewResponse,
  ValidateRedemptionRequest,
  ValidateRedemptionResponse,
  PointTransactionFilters,
  PointExportFilters,
  MemberPointHistory,
} from "@/types/point";
import { PaginatedResponse } from "@/types";

// ============================================
// POINT SETTINGS
// ============================================

/**
 * Get point system settings
 */
export const getPointSettings = async (): Promise<PointSettings> => {
  return await apiClient.get<PointSettings>("/points/settings");
};

/**
 * Update point system settings (ADMIN only)
 */
export const updatePointSettings = async (
  data: UpdatePointSettingsRequest
): Promise<PointSettings> => {
  return await apiClient.put<PointSettings>("/points/settings", data);
};

// ============================================
// POINT TRANSACTIONS
// ============================================

/**
 * Get all point transactions (ADMIN only)
 */
export const getPointTransactions = async (
  filters?: PointTransactionFilters
): Promise<PaginatedResponse<PointTransaction>> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.type) params.append("type", filters.type);
  if (filters?.memberId) params.append("memberId", filters.memberId);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await apiClient.get<PaginatedResponse<PointTransaction>>(
    `/points/transactions?${params.toString()}`
  );
  return response;
};

/**
 * Export point transactions to Excel (ADMIN only)
 */
export const exportPointTransactions = async (
  filters?: PointExportFilters
): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.memberId) params.append("memberId", filters.memberId);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/points/transactions/export?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to export point transactions");
  }

  return await response.blob();
};

// ============================================
// MEMBER POINT OPERATIONS
// ============================================

/**
 * Get member point summary
 */
export const getMemberPointSummary = async (
  memberId: string
): Promise<PointSummary> => {
  return await apiClient.get<PointSummary>(`/points/member/${memberId}`);
};

/**
 * Get member point history with pagination
 */
export const getMemberPointHistory = async (
  memberId: string,
  filters?: { page?: number; limit?: number; type?: string }
): Promise<MemberPointHistory> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.type) params.append("type", filters.type);

  return await apiClient.get<MemberPointHistory>(
    `/points/member/${memberId}/history?${params.toString()}`
  );
};

/**
 * Redeem member points
 */
export const redeemPoints = async (
  data: RedeemPointsRequest
): Promise<{
  transaction: PointTransaction;
  pointValue: number;
}> => {
  return await apiClient.post<{
    transaction: PointTransaction;
    pointValue: number;
  }>("/points/redeem", data);
};

/**
 * Adjust points manually (ADMIN only)
 */
export const adjustPoints = async (
  data: AdjustPointsRequest
): Promise<PointTransaction> => {
  return await apiClient.post<PointTransaction>("/points/adjust", data);
};

/**
 * Expire old points (ADMIN only)
 */
export const expirePoints = async (): Promise<ExpirePointsResponse> => {
  return await apiClient.post<ExpirePointsResponse>("/points/expire");
};

// ============================================
// POINT PREVIEW & VALIDATION
// ============================================

/**
 * Preview point calculation for cart items
 */
export const previewPointCalculation = async (
  items: PointPreviewItem[]
): Promise<PointPreviewResponse> => {
  return await apiClient.post<PointPreviewResponse>("/points/preview", {
    items,
  });
};

/**
 * Validate if member can redeem points
 */
export const validatePointRedemption = async (
  data: ValidateRedemptionRequest
): Promise<ValidateRedemptionResponse> => {
  return await apiClient.post<ValidateRedemptionResponse>(
    "/points/validate-redemption",
    data
  );
};

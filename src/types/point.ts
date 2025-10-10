// src/types/point.ts
// Types untuk Point Management

// ============================================
// POINT TRANSACTION
// ============================================

export type PointTransactionType = "EARN" | "REDEEM" | "ADJUSTMENT" | "EXPIRED";

export interface PointTransaction {
  id: string;
  memberId: string;
  saleId?: string;
  type: PointTransactionType;
  points: number; // Positive for EARN, negative for REDEEM/EXPIRED
  pointsBefore: number;
  pointsAfter: number;
  description: string;
  expiryDate?: string;
  isExpired: boolean;
  createdBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  daysUntilExpiry?: number;
  // Relations
  member?: {
    id: string;
    uniqueId: string;
    fullName: string;
    regionCode: string;
    regionName: string;
    totalPoints: number;
  };
  sale?: {
    id: string;
    invoiceNumber: string;
    finalAmount: number;
  };
}

// ============================================
// POINT SUMMARY
// ============================================

export interface PointSummary {
  memberId: string;
  memberName: string;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  expiringSoon: number; // Points expiring in next 30 days
}

// ============================================
// POINT SETTINGS
// ============================================

export interface PointSettings {
  pointEnabled: boolean;
  pointSystemMode: "GLOBAL" | "PER_PRODUCT" | "PER_CATEGORY";
  pointPerAmount: number; // e.g., 1000 = 1 point per Rp 1000
  pointDecimalRounding: "UP" | "DOWN" | "NEAREST";
  minTransactionForPoints: number;
  pointExpiryMonths: number;
}

export type UpdatePointSettingsRequest = Partial<PointSettings>;

// ============================================
// POINT ACTIONS
// ============================================

export interface RedeemPointsRequest {
  memberId: string;
  points: number;
  description?: string;
  notes?: string;
}

export interface AdjustPointsRequest {
  memberId: string;
  points: number; // Can be positive or negative
  description: string;
  notes?: string;
}

export interface ExpirePointsResponse {
  totalExpired: number;
  details: {
    memberId: string;
    memberName: string;
    pointsExpired: number;
    originalDate: string;
  }[];
}

// ============================================
// POINT PREVIEW & VALIDATION
// ============================================

export interface PointPreviewItem {
  productId: string;
  quantity: number;
  subtotal: number;
}

export interface PointPreviewResponse {
  totalPoints: number;
  breakdown: {
    productId: string;
    productName: string;
    points: number;
  }[];
  reason?: string;
}

export interface ValidateRedemptionRequest {
  memberId: string;
  pointsToRedeem: number;
  transactionAmount: number;
}

export interface ValidateRedemptionResponse {
  isValid: boolean;
  message: string;
  maxRedeemablePoints?: number;
  pointValue?: number;
}

// ============================================
// POINT FILTERS
// ============================================

export interface PointTransactionFilters {
  page?: number;
  limit?: number;
  type?: PointTransactionType;
  memberId?: string;
  search?: string; // Search member name or uniqueId
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// ============================================
// POINT EXPORT FILTERS
// ============================================

export type PointExportFilters = Omit<
  PointTransactionFilters,
  "page" | "limit"
>;

// ============================================
// POINT TRANSACTION HISTORY (per member)
// ============================================

export interface MemberPointHistory {
  transactions: PointTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// POINT TRANSACTION TYPE LABELS (untuk UI)
// ============================================

export const POINT_TRANSACTION_TYPE_LABELS: Record<
  PointTransactionType,
  string
> = {
  EARN: "Dapat Point",
  REDEEM: "Tukar Point",
  ADJUSTMENT: "Penyesuaian",
  EXPIRED: "Kadaluarsa",
};

// ============================================
// POINT TRANSACTION TYPE COLORS (untuk badge)
// ============================================

export const POINT_TRANSACTION_TYPE_COLORS: Record<
  PointTransactionType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  EARN: "default",
  REDEEM: "secondary",
  ADJUSTMENT: "outline",
  EXPIRED: "destructive",
};

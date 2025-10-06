// src/mocks/data.ts
import { User, DashboardMetrics, Member } from "@/types";
import { UserRole, Gender } from "@/types";

// ============================================
// MOCK USERS
// ============================================
export const mockUsers: User[] = [
  {
    id: "user-1",
    username: "admin",
    email: "admin@koperasi.com",
    name: "Admin Koperasi",
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    username: "kasir",
    email: "kasir@koperasi.com",
    name: "Kasir Koperasi",
    role: UserRole.KASIR,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Password untuk demo: admin123, kasir123
export const mockPasswords: Record<string, string> = {
  admin: "admin123",
  kasir: "kasir123",
};

// ============================================
// MOCK DASHBOARD METRICS
// ============================================
export const mockDashboardMetrics: DashboardMetrics = {
  todayTransactions: 142,
  todayRevenue: 25_750_000,
  todayReceivables: 3_500_000,
  todayPayables: 1_200_000,
  fastMovingStock: 8,
  slowMovingStock: 3,
  overStock: 2,
  lowStock: 5,
};

// ============================================
// MOCK MEMBERS
// ============================================
export const mockMembers: Member[] = [
  {
    id: "member-1",
    uniqueId: "BDG-001",
    nik: "3273010101990001",
    fullName: "Iwan Sentosa",
    address: "Jl. Raya Bandung No. 123, Kec. Cicendo",
    regionCode: "BDG",
    regionName: "Bandung",
    whatsapp: "081234567890",
    gender: Gender.MALE,
    totalDebt: 1_500_000,
    totalTransactions: 25,
    monthlySpending: 3_750_000,
    totalPoints: 375,
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "member-2",
    uniqueId: "GRT-001",
    nik: "3273020202880002",
    fullName: "Siti Nurhaliza",
    address: "Jl. Garut Raya No. 45, Kec. Tarogong",
    regionCode: "GRT",
    regionName: "Garut",
    whatsapp: "082345678901",
    gender: Gender.FEMALE,
    totalDebt: 750_000,
    totalTransactions: 15,
    monthlySpending: 2_250_000,
    totalPoints: 225,
    isActive: true,
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-09-28T00:00:00Z",
  },
];

// ============================================
// TOKEN STORAGE (In-memory untuk demo)
// ============================================
export const tokenStorage = new Map<string, User>();

// Generate simple JWT-like token
export function generateToken(userId: string): string {
  return `mock-token-${userId}-${Date.now()}`;
}

// Validate token
export function validateToken(token: string): User | null {
  return tokenStorage.get(token) || null;
}

// Helper: Get user by username
export function getUserByUsername(username: string): User | undefined {
  return mockUsers.find((u) => u.username === username);
}

// Helper: Get member by uniqueId
export function getMemberByUniqueId(uniqueId: string): Member | undefined {
  return mockMembers.find((m) => m.uniqueId === uniqueId);
}

// Helper: Generate randomized dashboard metrics (untuk simulasi real-time)
export function getRandomizedMetrics(): DashboardMetrics {
  return {
    todayTransactions: mockDashboardMetrics.todayTransactions + Math.floor(Math.random() * 10),
    todayRevenue: mockDashboardMetrics.todayRevenue + Math.floor(Math.random() * 1_000_000),
    todayReceivables: mockDashboardMetrics.todayReceivables + Math.floor(Math.random() * 500_000),
    todayPayables: mockDashboardMetrics.todayPayables + Math.floor(Math.random() * 300_000),
    fastMovingStock: mockDashboardMetrics.fastMovingStock + Math.floor(Math.random() * 3),
    slowMovingStock: mockDashboardMetrics.slowMovingStock,
    overStock: mockDashboardMetrics.overStock,
    lowStock: mockDashboardMetrics.lowStock + Math.floor(Math.random() * 2),
  };
}

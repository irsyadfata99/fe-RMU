// src/hooks/useMember.ts
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Member } from "@/types";
import { toast } from "sonner";

// ✅ Define proper interface for member stats
interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  totalPoints: number;
  totalTransactions: number;
}

interface UseMembersParams {
  search?: string;
  regionCode?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useMembers(params?: UseMembersParams) {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.regionCode) queryParams.append("regionCode", params.regionCode);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const queryString = queryParams.toString();
  const endpoint = `/members${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<Member[]>(
    endpoint,
    async (url: string) => {
      const response = await apiClient.get<Member[]>(url);
      return Array.isArray(response) ? response : [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    members: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// ✅ Fix useMemberStats to return proper typed data
export function useMemberStats() {
  const { data, error, isLoading, mutate } = useSWR<MemberStats>(
    "/members/stats",
    async (url: string) => {
      try {
        const response = await apiClient.get<MemberStats>(url);

        // Ensure all required properties exist with defaults
        return {
          totalMembers: response.totalMembers || 0,
          activeMembers: response.activeMembers || 0,
          totalPoints: response.totalPoints || 0,
          totalTransactions: response.totalTransactions || 0,
        };
      } catch (err) {
        console.error("Error fetching member stats:", err);
        // Return default values on error
        return {
          totalMembers: 0,
          activeMembers: 0,
          totalPoints: 0,
          totalTransactions: 0,
        };
      }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMemberActions() {
  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      const response = await apiClient.put<Member>(`/members/${id}`, data);
      toast.success("Data member berhasil diperbarui");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui member";
      toast.error(message);
      throw error;
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await apiClient.patch<Member>(
        `/members/${id}/toggle-active`,
        {}
      );
      toast.success("Status member berhasil diubah");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengubah status";
      toast.error(message);
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await apiClient.delete(`/members/${id}`);
      toast.success("Member berhasil dihapus");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus member";
      toast.error(message);
      throw error;
    }
  };

  return {
    updateMember,
    toggleActive,
    deleteMember,
    isLoading: false,
  };
}

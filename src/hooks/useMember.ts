// src/hooks/useMember.ts
"use client";

import useSWR from "swr";
import { Member } from "@/types";
import api from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  const response = await api.get(url);
  return response.data.data || [];
};

export function useMembers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  regionCode?: string;
  isActive?: boolean;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/members?${queryString}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    members: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMember(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/members/${id}` : null,
    fetcher, // ✅ FIXED: Gunakan fetcher yang sama
    { revalidateOnFocus: false }
  );

  return {
    member: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useMemberStats() {
  const { data, error, isLoading } = useSWR(
    "/members/stats",
    fetcher, // ✅ FIXED: Gunakan fetcher yang sama
    { revalidateOnFocus: false }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

export function useMemberActions() {
  const [isLoading, setIsLoading] = useState(false);

  const updateMember = async (
    id: string,
    data: {
      fullName: string;
      address: string;
      regionCode: string;
      whatsapp: string;
      gender: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const member = await api.put<Member>(`/members/${id}`, data);
      toast.success("Data member berhasil diupdate");
      return member;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal update member");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await api.patch(`/members/${id}/toggle`);
      toast.success("Status member berhasil diubah");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/members/${id}`);
      toast.success("Member berhasil dihapus");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus member");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateMember,
    toggleActive,
    deleteMember,
    isLoading,
  };
}

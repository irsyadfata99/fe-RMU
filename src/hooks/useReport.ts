// src/hooks/useReport.ts
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";

interface UseReportOptions {
  endpoint: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  [key: string]: string | number | undefined;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination: Pagination;
}

export function useReport<T = Record<string, unknown>>({
  endpoint,
  ...params
}: UseReportOptions) {
  // Build query string
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const { data, error, mutate, isLoading } = useSWR<ApiResponse<T>>(
    url,
    async (url: string) => {
      const response = await apiClient.get<ApiResponse<T>>(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    data: (data?.data || []) as T[],
    pagination: (data?.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    }) as Pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

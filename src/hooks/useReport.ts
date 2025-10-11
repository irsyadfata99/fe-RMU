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
  [key: string]: string | number | boolean | undefined;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ✅ FIXED: Support both response structures
interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}

interface SimpleApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

type ApiResponse<T> = PaginatedApiResponse<T> | SimpleApiResponse<T>;

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

  const {
    data: responseData,
    error,
    mutate,
    isLoading,
  } = useSWR<ApiResponse<T>>(
    url,
    async (url: string) => {
      try {
        const response = await apiClient.get(url);

        // ✅ FIXED: Handle different response structures
        // Case 1: Response is already unwrapped (from apiClient)
        if (response.data) {
          return response;
        }

        // Case 2: Response needs unwrapping
        return response.data;
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // ✅ FIXED: Safely extract data and pagination
  const extractData = (): T[] => {
    if (!responseData) return [];

    // If responseData.data is an array, return it
    if (Array.isArray(responseData.data)) {
      return responseData.data as T[];
    }

    // If responseData itself is an array (direct array response)
    if (Array.isArray(responseData)) {
      return responseData as T[];
    }

    return [];
  };

  const extractPagination = (): Pagination => {
    const defaultPagination: Pagination = {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    };

    if (!responseData) return defaultPagination;

    // Check if response has pagination property
    if ("pagination" in responseData && responseData.pagination) {
      return responseData.pagination;
    }

    return defaultPagination;
  };

  return {
    data: extractData(),
    pagination: extractPagination(),
    isLoading,
    isError: error,
    mutate,
  };
}

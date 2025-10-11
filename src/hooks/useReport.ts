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

// ✅ FIXED: Support all response structures
interface PaginatedApiResponse<T> {
  success: boolean;
  data: {
    data: T[];
    pagination: Pagination;
  };
  message?: string;
}

interface SimpleApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

type ApiResponse<T> = PaginatedApiResponse<T> | SimpleApiResponse<T>;

export function useReport<T = Record<string, unknown>>({ endpoint, ...params }: UseReportOptions) {
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

  // ✅ FIXED: Safely extract data with proper nested structure handling
  const extractData = (): T[] => {
    if (!responseData) return [];

    // Case 1: Paginated response { data: { data: [], pagination: {} } }
    if (responseData.data && typeof responseData.data === "object" && !Array.isArray(responseData.data) && "data" in responseData.data) {
      const nestedData = (responseData.data as { data: unknown }).data;
      if (Array.isArray(nestedData)) {
        return nestedData as T[];
      }
    }

    // Case 2: Simple response { data: [] }
    if (Array.isArray(responseData.data)) {
      return responseData.data as T[];
    }

    // Case 3: Direct array (fallback)
    if (Array.isArray(responseData)) {
      return responseData as T[];
    }

    console.warn(`[useReport] Unexpected data structure for ${url}:`, responseData);
    return [];
  };

  // ✅ FIXED: Safely extract pagination
  const extractPagination = (): Pagination => {
    const defaultPagination: Pagination = {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    };

    if (!responseData) return defaultPagination;

    // Case 1: Nested pagination { data: { data: [], pagination: {} } }
    if (responseData.data && typeof responseData.data === "object" && !Array.isArray(responseData.data) && "pagination" in responseData.data) {
      return (responseData.data as { pagination: Pagination }).pagination;
    }

    // Case 2: Direct pagination { pagination: {} }
    if ("pagination" in responseData && responseData.pagination) {
      return responseData.pagination as Pagination;
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

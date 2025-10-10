// src/lib/api.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ApiError, ApiResponse } from "@/types";

// ============================================
// AXIOS INSTANCE
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error("Access denied:", data.message);
          break;

        case 404:
          // Not found
          console.error("Resource not found:", data.message);
          break;

        case 422:
          // Validation error
          if (data.errors && Object.keys(data.errors).length > 0) {
            console.error("Validation error:", data.errors);
          } else if (data.message) {
            console.error("Validation error:", data.message);
          } else {
            console.error("Validation error: Unknown validation error");
          }
          break;

        case 500:
          // Server error
          console.error("Server error:", data.message);
          break;

        default:
          console.error("API error:", data.message);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error: No response from server");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH TOKEN HELPERS
// ============================================

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);

    // Also set as cookie for middleware
    document.cookie = `auth_token=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`; // 7 days
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");

    // Remove cookie
    document.cookie = "auth_token=; path=/; max-age=0";
  }
};
export const clearAuth = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }
};

// ============================================
// API ERROR HANDLER
// ============================================

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Prioritas 1: Message dari response
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Prioritas 2: Validation errors
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      if (errorMessages.length > 0) {
        return errorMessages.join(", ");
      }
    }

    // Prioritas 3: Axios message
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "An unexpected error occurred";
};

// ============================================
// TYPED API METHODS
// ============================================

export const apiClient = {
  // GET request - ✅ FIXED: Handle multiple response structures
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get(url, config);

    console.log(`🔍 API GET ${url}:`, response.data);

    // ✅ Case 1: Response has nested data.data structure
    if (response.data?.data !== undefined) {
      return response.data.data as T;
    }

    // ✅ Case 2: Response has single data property
    if (response.data !== undefined) {
      return response.data as T;
    }

    // ✅ Case 3: Response is the data itself (no wrapper)
    return response as T;
  },

  // POST request - ✅ FIXED: Handle multiple response structures
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.post(url, data, config);

    console.log(`🔍 API POST ${url}:`, response.data);

    // ✅ Case 1: Response has nested data.data structure
    if (response.data?.data !== undefined) {
      return response.data.data as T;
    }

    // ✅ Case 2: Response has single data property
    if (response.data !== undefined) {
      return response.data as T;
    }

    // ✅ Case 3: Response is the data itself
    return response as T;
  },

  // PUT request - ✅ FIXED: Handle multiple response structures
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.put(url, data, config);

    console.log(`🔍 API PUT ${url}:`, response.data);

    if (response.data?.data !== undefined) {
      return response.data.data as T;
    }

    if (response.data !== undefined) {
      return response.data as T;
    }

    return response as T;
  },

  // PATCH request - ✅ FIXED: Handle multiple response structures
  patch: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.patch(url, data, config);

    console.log(`🔍 API PATCH ${url}:`, response.data);

    if (response.data?.data !== undefined) {
      return response.data.data as T;
    }

    if (response.data !== undefined) {
      return response.data as T;
    }

    return response as T;
  },

  // DELETE request - ✅ FIXED: Handle multiple response structures
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete(url, config);

    console.log(`🔍 API DELETE ${url}:`, response.data);

    if (response.data?.data !== undefined) {
      return response.data.data as T;
    }

    if (response.data !== undefined) {
      return response.data as T;
    }

    return response as T;
  },
};

// ============================================
// EXPORT DEFAULT API INSTANCE
// ============================================

export default api;

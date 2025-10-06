// src/lib/api.ts

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
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
          console.error("Validation error:", data.errors);
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
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
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

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.errors) {
      // Convert validation errors to string
      const errors = axiosError.response.data.errors;
      return Object.values(errors).flat().join(", ");
    }

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
  // GET request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // POST request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PUT request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PATCH request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};

// ============================================
// EXPORT DEFAULT API INSTANCE
// ============================================

export default api;

// src/lib/api.ts
// Enhanced API client with automatic retry, request queuing, and rate limit handling

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError } from "@/types";

// ============================================
// RATE LIMIT ERROR HANDLER
// ============================================
const showRateLimitToast = (retryAfter: number) => {
  if (typeof window === "undefined") return;

  // Only show toast in browser environment
  const message = `Terlalu banyak request. Silakan tunggu ${retryAfter} detik...`;

  // Fallback console warning (you can replace with toast library)
  console.warn(message);

  // You can integrate with your toast library here
  // Example: toast.error(message, { id: 'rate-limit', duration: retryAfter * 1000 });
};

// ============================================
// REQUEST QUEUE & DEDUPLICATION
// ============================================
const pendingRequests = new Map<string, Promise<any>>();

const getRequestKey = (config: AxiosRequestConfig): string => {
  const { method = "get", url = "", params = {}, data = {} } = config;
  return `${method.toUpperCase()}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

const deduplicateRequest = async <T>(config: AxiosRequestConfig, executor: () => Promise<T>): Promise<T> => {
  const key = getRequestKey(config);

  // If same request is pending, return the existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // Execute new request
  const promise = executor().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

// ============================================
// RETRY LOGIC WITH EXPONENTIAL BACKOFF
// ============================================
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  shouldRetry: (error: AxiosError) => {
    // Retry on rate limit (429) or network errors
    if (!error.response) return true; // Network error

    const status = error.response.status;

    // Retry on rate limit or server errors
    return status === 429 || (status >= 500 && status < 600);
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateRetryDelay = (attemptNumber: number, config: RetryConfig, retryAfter?: number): number => {
  // If server provides retry-after, use it (in seconds)
  if (retryAfter && retryAfter > 0) {
    return Math.min(retryAfter * 1000, config.maxDelay);
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  const exponentialDelay = config.baseDelay * Math.pow(2, attemptNumber);

  // Add jitter (random 0-500ms) to avoid thundering herd
  const jitter = Math.random() * 500;

  return Math.min(exponentialDelay + jitter, config.maxDelay);
};

const retryRequest = async <T>(request: () => Promise<T>, config: RetryConfig = defaultRetryConfig, attemptNumber: number = 0): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    const axiosError = error as AxiosError<{
      message?: string;
      retryAfter?: number;
    }>;

    // Check if we should retry
    if (attemptNumber >= config.maxRetries || !config.shouldRetry(axiosError)) {
      throw error;
    }

    // Get retry-after from response headers (in seconds)
    const retryAfter = axiosError.response?.headers?.["retry-after"] ? parseInt(axiosError.response.headers["retry-after"]) : axiosError.response?.data?.retryAfter;

    const delay = calculateRetryDelay(attemptNumber, config, retryAfter);

    // Show toast for rate limit errors
    if (axiosError.response?.status === 429) {
      showRateLimitToast(Math.ceil(delay / 1000));
    }

    console.warn(`Request failed (attempt ${attemptNumber + 1}/${config.maxRetries + 1}). ` + `Retrying in ${Math.ceil(delay / 1000)}s...`);

    await sleep(delay);
    return retryRequest(request, config, attemptNumber + 1);
  }
};

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
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          break;

        case 403:
          console.error("Access denied:", data.message);
          break;

        case 404:
          console.error("Resource not found:", data.message);
          break;

        case 422:
          if (data.errors && Object.keys(data.errors).length > 0) {
            console.error("Validation error:", data.errors);
          } else if (data.message) {
            console.error("Validation error:", data.message);
          }
          break;

        case 429:
          // Rate limit error - will be handled by retry logic
          console.warn("Rate limit exceeded:", data.message);
          break;

        case 500:
          console.error("Server error:", data.message);
          break;

        default:
          console.error("API error:", data.message);
      }
    } else if (error.request) {
      console.error("Network error: No response from server");
    } else {
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
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
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
      const errors = axiosError.response.data.errors;
      const errorMessages = Object.values(errors).flat();
      if (errorMessages.length > 0) {
        return errorMessages.join(", ");
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "An unexpected error occurred";
};

// ============================================
// ENHANCED API METHODS WITH RETRY & DEDUPLICATION
// ============================================
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return deduplicateRequest({ method: "GET", url, ...config }, () =>
      retryRequest(async () => {
        const response = await api.get(url, config);

        if (response.data?.data !== undefined) {
          return response.data.data as T;
        }
        if (response.data !== undefined) {
          return response.data as T;
        }
        return response as T;
      })
    );
  },

  post: async <T>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    // Don't deduplicate POST requests (they may have side effects)
    return retryRequest(
      async () => {
        const response = await api.post(url, data, config);

        if (response.data?.data !== undefined) {
          return response.data.data as T;
        }
        if (response.data !== undefined) {
          return response.data as T;
        }
        return response as T;
      },
      {
        ...defaultRetryConfig,
        maxRetries: 2, // Fewer retries for write operations
        shouldRetry: (error) => {
          // Only retry POST on rate limit, not on other errors
          return error.response?.status === 429;
        },
      }
    );
  },

  put: async <T>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return retryRequest(
      async () => {
        const response = await api.put(url, data, config);

        if (response.data?.data !== undefined) {
          return response.data.data as T;
        }
        if (response.data !== undefined) {
          return response.data as T;
        }
        return response as T;
      },
      {
        ...defaultRetryConfig,
        maxRetries: 2,
        shouldRetry: (error) => error.response?.status === 429,
      }
    );
  },

  patch: async <T>(
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return retryRequest(
      async () => {
        const response = await api.patch(url, data, config);

        if (response.data?.data !== undefined) {
          return response.data.data as T;
        }
        if (response.data !== undefined) {
          return response.data as T;
        }
        return response as T;
      },
      {
        ...defaultRetryConfig,
        maxRetries: 2,
        shouldRetry: (error) => error.response?.status === 429,
      }
    );
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return retryRequest(
      async () => {
        const response = await api.delete(url, config);

        if (response.data?.data !== undefined) {
          return response.data.data as T;
        }
        if (response.data !== undefined) {
          return response.data as T;
        }
        return response as T;
      },
      {
        ...defaultRetryConfig,
        maxRetries: 1, // Minimal retries for delete
        shouldRetry: (error) => error.response?.status === 429,
      }
    );
  },
};

// ============================================
// EXPORT DEFAULT API INSTANCE
// ============================================
export default api;

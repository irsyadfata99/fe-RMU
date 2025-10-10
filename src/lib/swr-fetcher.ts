// src/lib/swr-fetcher.ts
import api from "@/lib/api";

/**
 * Universal SWR fetcher that ALWAYS returns an array
 * Handles all possible backend response formats
 */
export const arrayFetcher = async <T = unknown>(url: string): Promise<T[]> => {
  try {
    const response = await api.get(url);

    // Extract data from nested structure
    const result = response.data?.data ?? response.data;

    // If null/undefined, return empty array
    if (!result) {
      console.warn(`[arrayFetcher] No data found for ${url}`);
      return [];
    }

    // If already an array, return it
    if (Array.isArray(result)) {
      return result;
    }

    // If it's an object, check for common array properties
    if (typeof result === "object") {
      const arrayKeys = [
        "products",
        "categories",
        "suppliers",
        "members",
        "transactions",
        "adjustments",
        "movements",
        "items",
        "data",
        "results",
        "list",
      ];

      for (const key of arrayKeys) {
        if (key in result && Array.isArray(result[key])) {
          return result[key];
        }
      }

      // If single object with 'id' property, wrap in array
      if ("id" in result) {
        return [result];
      }
    }

    // Last resort: return empty array
    console.warn(`[arrayFetcher] Unexpected data format for ${url}:`, result);
    return [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[arrayFetcher] Error fetching ${url}:`, message);
    return [];
  }
};

/**
 * Single item fetcher for detail endpoints
 */
export const itemFetcher = async <T = unknown>(
  url: string
): Promise<T | null> => {
  try {
    const response = await api.get(url);
    const result = response.data?.data ?? response.data;

    if (!result) return null;

    // If array, return first item
    if (Array.isArray(result)) {
      return result[0] ?? null;
    }

    // If object, return as is
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[itemFetcher] Error fetching ${url}:`, message);
    return null;
  }
};

/**
 * Ensures data is always an array (for component safety)
 */
export const ensureArray = <T>(data: T | T[] | undefined | null): T[] => {
  if (data === null || data === undefined) return [];
  if (Array.isArray(data)) return data;
  return [data];
};

/**
 * Safe map helper for components
 */
export const safeMap = <T, R>(
  data: T[] | undefined | null,
  callback: (item: T, index: number) => R
): R[] => {
  return ensureArray(data).map(callback);
};

// src/lib/swr-fetcher.ts
import api from "@/lib/api";

/**
 * Universal SWR fetcher that handles different API response formats
 * Ensures consistent array returns for list endpoints
 */
export const arrayFetcher = async (url: string): Promise<any[]> => {
  try {
    const response = await api.get(url);
    let result = response.data.data;

    // Handle nested object with array property
    if (result && typeof result === "object" && !Array.isArray(result)) {
      // Try common array property names
      const arrayKeys = [
        "products",
        "categories",
        "suppliers",
        "members",
        "transactions",
        "adjustments",
        "movements",
        "data",
      ];

      for (const key of arrayKeys) {
        if (key in result && Array.isArray(result[key])) {
          return result[key];
        }
      }

      // If single object, wrap in array
      return [result];
    }

    // If already array, return as is
    if (Array.isArray(result)) {
      return result;
    }

    // Fallback
    return [];
  } catch (error) {
    console.error("SWR Fetcher error:", error);
    return [];
  }
};

/**
 * Single item fetcher for detail endpoints
 */
export const itemFetcher = async (url: string): Promise<any | null> => {
  try {
    const response = await api.get(url);
    let result = response.data.data;

    // If array, return first item
    if (Array.isArray(result)) {
      return result[0] || null;
    }

    return result || null;
  } catch (error) {
    console.error("SWR Item Fetcher error:", error);
    return null;
  }
};

/**
 * Ensures data is always an array
 */
export const ensureArray = <T>(data: T | T[] | undefined | null): T[] => {
  if (Array.isArray(data)) return data;
  if (data === null || data === undefined) return [];
  return [data];
};

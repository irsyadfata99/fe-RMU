// src/hooks/useAuth.ts

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LoginRequest, LoginResponse } from "@/types";
import { apiClient, setAuthToken, removeAuthToken, getAuthToken } from "@/lib/api";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Get user data from localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        setUser(JSON.parse(userData));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      removeAuthToken();
      localStorage.removeItem("user_data");
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);

      // API Call: POST /api/auth/login
      const response = await apiClient.post<LoginResponse>("/auth/login", credentials);

      // Save token
      setAuthToken(response.token);

      // Save user data
      localStorage.setItem("user_data", JSON.stringify(response.user));
      setUser(response.user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem("user_data");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      // API Call: GET /api/auth/me
      const userData = await apiClient.get<User>("/auth/me");
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      logout();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };
}

// Helper hook to get current user (for use in components)
export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return user;
}

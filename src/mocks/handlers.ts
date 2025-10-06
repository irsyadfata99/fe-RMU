// src/mocks/handlers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from "msw";
import { mockPasswords, tokenStorage, generateToken, validateToken, getUserByUsername, getMemberByUniqueId, getRandomizedMetrics } from "./data";
import { productsHandlers } from "./handlers-products";
import type { LoginRequest, LoginResponse, ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Auth handlers (existing)
const authHandlers = [
  // LOGIN
  http.post<never, LoginRequest>(`${API_URL}/auth/login`, async ({ request }: any) => {
    await delay(500);
    const body = await request.json();
    const { username, password } = body;

    console.log("[MSW] Login attempt:", { username });

    const user = getUserByUsername(username);
    const validPassword = mockPasswords[username] === password;

    if (!user || !validPassword) {
      console.log("[MSW] Login failed: Invalid credentials");
      return HttpResponse.json(
        {
          success: false,
          message: "Username atau password salah",
        },
        { status: 401 }
      );
    }

    const token = generateToken(user.id);
    tokenStorage.set(token, user);

    console.log("[MSW] Login success:", { username, role: user.role });

    const response: LoginResponse = {
      token,
      user,
    };

    return HttpResponse.json<ApiResponse<LoginResponse>>({
      success: true,
      message: "Login berhasil",
      data: response,
    });
  }),

  // GET CURRENT USER
  http.get(`${API_URL}/auth/me`, async ({ request }: any) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return HttpResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = validateToken(token);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "User data retrieved",
      data: user,
    });
  }),

  // LOGOUT
  http.post(`${API_URL}/auth/logout`, async ({ request }: any) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      tokenStorage.delete(token);
      console.log("[MSW] Logout success");
    }

    return HttpResponse.json({
      success: true,
      message: "Logout berhasil",
      data: null,
    });
  }),
];

// Dashboard handlers
const dashboardHandlers = [
  http.get(`${API_URL}/dashboard/metrics`, async ({ request }: any) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return HttpResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = validateToken(token);

    if (!user) {
      return HttpResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        { status: 401 }
      );
    }

    const metrics = getRandomizedMetrics();

    return HttpResponse.json({
      success: true,
      message: "Dashboard metrics retrieved",
      data: metrics,
    });
  }),
];

// Member handlers
const memberHandlers = [
  http.get(`${API_URL}/members/search/:uniqueId`, async ({ params }: any) => {
    await delay(400);

    const { uniqueId } = params;
    const member = getMemberByUniqueId(uniqueId as string);

    if (!member) {
      return HttpResponse.json(
        {
          success: false,
          message: "Member tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "Member found",
      data: member,
    });
  }),

  http.post(`${API_URL}/members/register`, async ({ request }: any) => {
    await delay(600);

    const body = (await request.json()) as any;

    const regionCode = body.regionCode as string;
    const nextNumber = 1;
    const uniqueId = `${regionCode}-${String(nextNumber).padStart(3, "0")}`;

    const newMember = {
      id: `member-${Date.now()}`,
      uniqueId,
      nik: body.nik as string,
      fullName: body.fullName as string,
      address: body.address as string,
      regionCode: body.regionCode as string,
      regionName: body.regionCode as string,
      whatsapp: body.whatsapp as string,
      gender: body.gender as string,
      totalDebt: 0,
      totalTransactions: 0,
      monthlySpending: 0,
      totalPoints: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      message: "Pendaftaran berhasil",
      data: newMember,
    });
  }),
];

// Combine all handlers
export const handlers = [...authHandlers, ...dashboardHandlers, ...memberHandlers, ...productsHandlers];

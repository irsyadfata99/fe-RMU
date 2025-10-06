// src/mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";
import { mockUsers, mockPasswords, tokenStorage, generateToken, validateToken, getUserByUsername, getMemberByUniqueId, getRandomizedMetrics } from "./data";
import type { LoginRequest, LoginResponse, ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const handlers = [
  // ============================================
  // AUTH: LOGIN
  // ============================================
  http.post<never, LoginRequest>(`${API_URL}/auth/login`, async ({ request }) => {
    await delay(500); // Simulate network delay

    const body = await request.json();
    const { username, password } = body;

    console.log("[MSW] Login attempt:", { username });

    // Validate credentials
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

    // Generate token
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

  // ============================================
  // AUTH: GET CURRENT USER
  // ============================================
  http.get(`${API_URL}/auth/me`, async ({ request }) => {
    await delay(200);

    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("[MSW] Auth check:", { hasToken: !!token });

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
      console.log("[MSW] Auth failed: Invalid token");
      return HttpResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        { status: 401 }
      );
    }

    console.log("[MSW] Auth success:", { username: user.username });

    return HttpResponse.json({
      success: true,
      message: "User data retrieved",
      data: user,
    });
  }),

  // ============================================
  // AUTH: LOGOUT (Optional - for clearing token)
  // ============================================
  http.post(`${API_URL}/auth/logout`, async ({ request }) => {
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

  // ============================================
  // DASHBOARD: GET METRICS
  // ============================================
  http.get(`${API_URL}/dashboard/metrics`, async ({ request }) => {
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

    console.log("[MSW] Dashboard metrics requested by:", user.username);

    // Randomize data sedikit untuk simulasi real-time
    const metrics = getRandomizedMetrics();

    return HttpResponse.json({
      success: true,
      message: "Dashboard metrics retrieved",
      data: metrics,
    });
  }),

  // ============================================
  // MEMBER: SEARCH BY UNIQUE ID
  // ============================================
  http.get(`${API_URL}/members/search/:uniqueId`, async ({ params }) => {
    await delay(400);

    const { uniqueId } = params;
    console.log("[MSW] Member search:", { uniqueId });

    const member = getMemberByUniqueId(uniqueId as string);

    if (!member) {
      console.log("[MSW] Member not found:", { uniqueId });
      return HttpResponse.json(
        {
          success: false,
          message: "Member tidak ditemukan",
        },
        { status: 404 }
      );
    }

    console.log("[MSW] Member found:", { uniqueId, name: member.fullName });

    return HttpResponse.json({
      success: true,
      message: "Member found",
      data: member,
    });
  }),

  // ============================================
  // MEMBER: REGISTER NEW MEMBER
  // ============================================
  http.post(`${API_URL}/members/register`, async ({ request }) => {
    await delay(600);

    const body = (await request.json()) as any;

    if (!body) {
      return HttpResponse.json(
        {
          success: false,
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    console.log("[MSW] Member registration:", { nik: body.nik, name: body.fullName });

    // Validate NIK uniqueness (mock) - check against mockMembers instead
    const existingMember = getMemberByUniqueId(body.uniqueId);
    if (existingMember) {
      return HttpResponse.json(
        {
          success: false,
          message: "NIK sudah terdaftar",
        },
        { status: 400 }
      );
    }

    // Generate unique ID (mock logic)
    const regionCode = body.regionCode as string;
    const nextNumber = 1; // In production, this would be auto-incremented from DB
    const uniqueId = `${regionCode}-${String(nextNumber).padStart(3, "0")}`;

    const newMember = {
      id: `member-${Date.now()}`,
      uniqueId,
      nik: body.nik as string,
      fullName: body.fullName as string,
      address: body.address as string,
      regionCode: body.regionCode as string,
      regionName: body.regionCode as string, // In production, lookup region name from REGIONS
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

    console.log("[MSW] Member registered:", { uniqueId, name: newMember.fullName });

    return HttpResponse.json({
      success: true,
      message: "Pendaftaran berhasil",
      data: newMember,
    });
  }),

  // ============================================
  // FALLBACK: Unhandled requests
  // ============================================
  http.all("*", async () => {
    // Log unhandled requests untuk debugging
    return;
  }),
];

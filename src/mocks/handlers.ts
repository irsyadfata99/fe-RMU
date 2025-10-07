// src/mocks/handlers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay, passthrough } from "msw";
import { getRandomizedMetrics } from "./data";
import { productsHandlers } from "./handlers-products";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// ============================================
// BYPASS REAL BACKEND FOR AUTH & MEMBERS
// ============================================
const bypassHandlers = [
  // Bypass semua request ke /auth/* (pakai real backend)
  http.all(`${API_URL}/auth/*`, () => passthrough()),

  // Bypass semua request ke /members/* (pakai real backend)
  http.all(`${API_URL}/members/*`, () => passthrough()),
];

// ============================================
// DASHBOARD HANDLERS
// ============================================
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

    const metrics = getRandomizedMetrics();

    return HttpResponse.json({
      success: true,
      message: "Dashboard metrics retrieved",
      data: metrics,
    });
  }),
];

// ============================================
// COMBINE ALL HANDLERS
// ============================================
export const handlers = [
  ...bypassHandlers, // PENTING: Taruh di paling atas!
  ...dashboardHandlers,
  ...productsHandlers,
];

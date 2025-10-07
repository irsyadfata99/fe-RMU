// src/mocks/handlers.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from "msw";
import { getMemberByUniqueId, getRandomizedMetrics } from "./data";
import { productsHandlers } from "./handlers-products";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// ============================================
// AUTH HANDLERS - DISABLED (Pakai Real Backend)
// ============================================
// authHandlers dihapus karena sekarang pakai real backend

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

    // Tidak perlu validasi token karena sudah di-handle backend
    const metrics = getRandomizedMetrics();

    return HttpResponse.json({
      success: true,
      message: "Dashboard metrics retrieved",
      data: metrics,
    });
  }),
];

// ============================================
// MEMBER HANDLERS
// ============================================
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

// ============================================
// COMBINE ALL HANDLERS (Tanpa authHandlers)
// ============================================
export const handlers = [
  ...dashboardHandlers,
  ...memberHandlers,
  ...productsHandlers,
];

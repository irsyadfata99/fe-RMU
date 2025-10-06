// src/mocks/handlers-products.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from "msw";
import { mockCategories, mockSuppliers, generateCategoryId, generateSupplierId } from "./data-products";
import type { Category, Supplier, ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const productsHandlers = [
  // ============================================
  // CATEGORIES: GET ALL
  // ============================================
  http.get(`${API_URL}/products/categories`, async ({ request }: any) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    console.log("[MSW] Fetching all categories");

    return HttpResponse.json<ApiResponse<Category[]>>({
      success: true,
      message: "Categories retrieved",
      data: [...mockCategories],
    });
  }),

  // ============================================
  // CATEGORIES: CREATE
  // ============================================
  http.post(`${API_URL}/products/categories`, async ({ request }: any) => {
    await delay(500);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as any;

    // Check duplicate name
    const exists = mockCategories.find((c) => c.name.toLowerCase() === body.name.toLowerCase());
    if (exists) {
      return HttpResponse.json(
        {
          success: false,
          message: "Kategori dengan nama tersebut sudah ada",
        },
        { status: 400 }
      );
    }

    const newCategory: Category = {
      id: generateCategoryId(),
      name: body.name,
      description: body.description || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCategories.push(newCategory);
    console.log("[MSW] Category created:", newCategory.name);

    return HttpResponse.json<ApiResponse<Category>>({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: newCategory,
    });
  }),

  // ============================================
  // CATEGORIES: UPDATE
  // ============================================
  http.put(`${API_URL}/products/categories/:id`, async ({ request, params }: any) => {
    await delay(400);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = (await request.json()) as any;

    const categoryIndex = mockCategories.findIndex((c) => c.id === id);
    if (categoryIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check duplicate name (exclude self)
    const duplicate = mockCategories.find((c) => c.id !== id && c.name.toLowerCase() === body.name.toLowerCase());
    if (duplicate) {
      return HttpResponse.json(
        {
          success: false,
          message: "Kategori dengan nama tersebut sudah ada",
        },
        { status: 400 }
      );
    }

    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      name: body.name,
      description: body.description || "",
      updatedAt: new Date().toISOString(),
    };

    console.log("[MSW] Category updated:", mockCategories[categoryIndex].name);

    return HttpResponse.json<ApiResponse<Category>>({
      success: true,
      message: "Kategori berhasil diupdate",
      data: mockCategories[categoryIndex],
    });
  }),

  // ============================================
  // CATEGORIES: DELETE
  // ============================================
  http.delete(`${API_URL}/products/categories/:id`, async ({ request, params }: any) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const categoryIndex = mockCategories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "Kategori tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const deletedCategory = mockCategories[categoryIndex];
    mockCategories.splice(categoryIndex, 1);

    console.log("[MSW] Category deleted:", deletedCategory.name);

    return HttpResponse.json<ApiResponse<null>>({
      success: true,
      message: "Kategori berhasil dihapus",
      data: null,
    });
  }),

  // ============================================
  // SUPPLIERS: GET ALL
  // ============================================
  http.get(`${API_URL}/products/suppliers`, async ({ request }: any) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    console.log("[MSW] Fetching all suppliers");

    return HttpResponse.json<ApiResponse<Supplier[]>>({
      success: true,
      message: "Suppliers retrieved",
      data: [...mockSuppliers],
    });
  }),

  // ============================================
  // SUPPLIERS: CREATE
  // ============================================
  http.post(`${API_URL}/products/suppliers`, async ({ request }: any) => {
    await delay(500);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as any;

    // Check duplicate phone
    const exists = mockSuppliers.find((s) => s.phone === body.phone);
    if (exists) {
      return HttpResponse.json(
        {
          success: false,
          message: "Nomor telepon sudah terdaftar",
        },
        { status: 400 }
      );
    }

    const newSupplier: Supplier = {
      id: generateSupplierId(),
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email || "",
      totalDebt: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSuppliers.push(newSupplier);
    console.log("[MSW] Supplier created:", newSupplier.name);

    return HttpResponse.json<ApiResponse<Supplier>>({
      success: true,
      message: "Supplier berhasil ditambahkan",
      data: newSupplier,
    });
  }),

  // ============================================
  // SUPPLIERS: UPDATE
  // ============================================
  http.put(`${API_URL}/products/suppliers/:id`, async ({ request, params }: any) => {
    await delay(400);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = (await request.json()) as any;

    const supplierIndex = mockSuppliers.findIndex((s) => s.id === id);
    if (supplierIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check duplicate phone (exclude self)
    const duplicate = mockSuppliers.find((s) => s.id !== id && s.phone === body.phone);
    if (duplicate) {
      return HttpResponse.json(
        {
          success: false,
          message: "Nomor telepon sudah terdaftar",
        },
        { status: 400 }
      );
    }

    mockSuppliers[supplierIndex] = {
      ...mockSuppliers[supplierIndex],
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email || "",
      updatedAt: new Date().toISOString(),
    };

    console.log("[MSW] Supplier updated:", mockSuppliers[supplierIndex].name);

    return HttpResponse.json<ApiResponse<Supplier>>({
      success: true,
      message: "Supplier berhasil diupdate",
      data: mockSuppliers[supplierIndex],
    });
  }),

  // ============================================
  // SUPPLIERS: DELETE
  // ============================================
  http.delete(`${API_URL}/products/suppliers/:id`, async ({ request, params }: any) => {
    await delay(300);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return HttpResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const supplierIndex = mockSuppliers.findIndex((s) => s.id === id);

    if (supplierIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: "Supplier tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const deletedSupplier = mockSuppliers[supplierIndex];
    mockSuppliers.splice(supplierIndex, 1);

    console.log("[MSW] Supplier deleted:", deletedSupplier.name);

    return HttpResponse.json<ApiResponse<null>>({
      success: true,
      message: "Supplier berhasil dihapus",
      data: null,
    });
  }),
];

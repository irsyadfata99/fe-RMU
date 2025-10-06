// src/constants/regions.ts

import { Region } from "@/types";

export const REGIONS: Region[] = [
  { code: "BDG", name: "Bandung" },
  { code: "KBG", name: "Kabupaten Bandung" },
  { code: "KBB", name: "Kabupaten Bandung Barat" },
  { code: "KBT", name: "Kabupaten Bandung Timur" },
  { code: "CMH", name: "Cimahi" },
  { code: "GRT", name: "Garut" },
  { code: "KGU", name: "Kabupaten Garut Utara" },
  { code: "KGS", name: "Kabupaten Garut Selatan" },
  { code: "SMD", name: "Sumedang" },
  { code: "TSM", name: "Tasikmalaya" },
  { code: "SMI", name: "Kota Sukabumi" },
  { code: "KSI", name: "Kabupaten Sukabumi" },
  { code: "KSU", name: "Kabupaten Sukabumi Utara" },
  { code: "CJR", name: "Cianjur" },
  { code: "BGR", name: "Bogor" },
  { code: "KBR", name: "Kabupaten Bogor" },
  { code: "YMG", name: "Yamughni" },
  { code: "PMB", name: "Pembina" },
];

// Helper to get region name by code
export function getRegionName(code: string): string {
  const region = REGIONS.find((r) => r.code === code);
  return region ? region.name : code;
}

// Helper to get region code by name
export function getRegionCode(name: string): string {
  const region = REGIONS.find((r) => r.name === name);
  return region ? region.code : "";
}

// Helper to check if region code exists
export function isValidRegionCode(code: string): boolean {
  return REGIONS.some((r) => r.code === code);
}

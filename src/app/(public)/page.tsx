// src/app/(public)/page.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { SearchMemberCard } from "@/components/members/search-member-card";
import { MemberInfoCard } from "@/components/members/member-info-card";
import { Member } from "@/types";
import { apiClient, handleApiError } from "@/lib/api";

export default function HomePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (uniqueId: string) => {
    setIsLoading(true);
    setMember(null);

    try {
      // API Call: GET /api/members/search/:uniqueId
      const data = await apiClient.get<Member>(`/members/search/${uniqueId}`);
      setMember(data);
      toast.success("Anggota ditemukan!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || "Anggota tidak ditemukan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMember(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Selamat Datang di Koperasi POS</h1>
            <p className="text-muted-foreground">Cari informasi anggota atau daftar sebagai anggota baru</p>
          </div>

          {/* Search Card */}
          <SearchMemberCard onSearch={handleSearch} isLoading={isLoading} />

          {/* Member Info Card (Conditional) */}
          {member && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <MemberInfoCard member={member} onClose={handleClose} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

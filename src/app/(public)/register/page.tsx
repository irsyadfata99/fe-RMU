// src/app/(public)/register/page.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { RegisterForm } from "@/components/members/register-form";
import { MembershipCard } from "@/components/members/membership-card";
import { MemberRegistrationForm } from "@/lib/validations";
import { Member } from "@/types";
import { apiClient, handleApiError } from "@/lib/api";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [showCard, setShowCard] = useState(false);

  const handleSubmit = async (data: MemberRegistrationForm) => {
    setIsLoading(true);

    try {
      // API Call: POST /api/members/register
      const member = await apiClient.post<Member>("/members/register", data);

      setRegisteredMember(member);
      setShowCard(true);
      toast.success("Pendaftaran berhasil!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || "Pendaftaran gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCard = () => {
    setShowCard(false);
    // Redirect ke homepage atau reset form
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Daftar Anggota Baru</h1>
            <p className="text-muted-foreground">Bergabunglah dengan Koperasi POS dan nikmati berbagai keuntungan</p>
          </div>

          {/* Registration Form */}
          <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>

      {/* Membership Card Modal */}
      {registeredMember && <MembershipCard member={registeredMember} isOpen={showCard} onClose={handleCloseCard} />}
    </div>
  );
}

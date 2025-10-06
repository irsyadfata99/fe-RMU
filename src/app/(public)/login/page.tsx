// src/app/(public)/login/page.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm as LoginFormType } from "@/lib/validations";
import { handleApiError } from "@/lib/api";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormType) => {
    setIsLoading(true);

    try {
      await login(data);
      toast.success("Login berhasil!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage || "Login gagal. Periksa username dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Login Dashboard</h1>
            <p className="text-muted-foreground">Akses sistem Point of Sale Koperasi</p>
          </div>

          {/* Demo Credentials Info */}
          <Alert className="max-w-md mx-auto">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">Demo Credentials:</p>
                <p className="text-sm">
                  Admin: <code className="bg-muted px-1 py-0.5 rounded">admin</code> / <code className="bg-muted px-1 py-0.5 rounded">admin123</code>
                </p>
                <p className="text-sm">
                  Kasir: <code className="bg-muted px-1 py-0.5 rounded">kasir</code> / <code className="bg-muted px-1 py-0.5 rounded">kasir123</code>
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Login Form */}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

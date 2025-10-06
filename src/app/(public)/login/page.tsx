// src/app/(public)/login/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm as LoginFormType } from "@/lib/validations";
import { handleApiError } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, KeyRound } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormType) => {
    setIsLoading(true);

    try {
      await login(data);
      toast.success("Login berhasil!", {
        description: "Selamat datang di Koperasi POS",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error("Login gagal", {
        description: errorMessage || "Periksa username dan password Anda.",
      });
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Login Dashboard</h1>
            <p className="text-muted-foreground">Akses sistem Point of Sale Koperasi Yamughni</p>
          </div>

          {/* Demo Credentials Banner */}
          <Alert className="max-w-md mx-auto border-primary/50 bg-primary/5">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-primary flex items-center gap-1">🔑 Demo Credentials</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-12">Admin:</span>
                    <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">admin</code>
                    <span className="text-muted-foreground">/</span>
                    <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">admin123</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-12">Kasir:</span>
                    <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">kasir</code>
                    <span className="text-muted-foreground">/</span>
                    <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">kasir123</code>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">💡 Role Admin memiliki akses penuh, Kasir hanya Dashboard & Transaksi</p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Login Form */}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Footer Info */}
          <div className="text-center max-w-md mx-auto">
            <p className="text-xs text-muted-foreground">
              Sistem menggunakan Mock API (MSW) untuk demo.
              <br />
              Cek browser console untuk melihat API logs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

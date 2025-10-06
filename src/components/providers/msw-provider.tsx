// src/components/providers/msw-provider.tsx
"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      // Only enable MSW in development or if NEXT_PUBLIC_USE_MSW is set
      const shouldEnableMSW = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_USE_MSW === "true";

      if (shouldEnableMSW) {
        try {
          const { worker } = await import("@/mocks/browser");

          await worker.start({
            onUnhandledRequest: "bypass", // Don't warn about unhandled requests
            quiet: false, // Show MSW logs in console
          });

          console.log("🔶 MSW: Mock API Started");
          console.log("📡 API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api");
          console.log("🔑 Demo Credentials:");
          console.log("   Admin: admin / admin123");
          console.log("   Kasir: kasir / kasir123");
        } catch (error) {
          console.error("❌ MSW: Failed to start", error);
        }
      } else {
        console.log("⚠️ MSW: Disabled (production mode)");
      }

      setMswReady(true);
    }

    initMSW();
  }, []);

  // Show loading screen until MSW is ready (prevents race conditions)
  if (!mswReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full border-4 border-primary/20 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Initializing System...</p>
            <p className="text-sm text-muted-foreground">Setting up mock API</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

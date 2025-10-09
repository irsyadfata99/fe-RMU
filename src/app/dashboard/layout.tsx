// src/app/dashboard/layout.tsx
"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useCurrentUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check screen size
    if (typeof window !== "undefined") {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  if (!isMounted || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userRole={user.role}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          user={user}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

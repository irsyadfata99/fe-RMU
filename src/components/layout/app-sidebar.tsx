// src/components/layout/app-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavigationByRole } from "@/config/navigation";
import { ChevronLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: string;
}

export function AppSidebar({ isOpen, onToggle, userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigationByRole(userRole);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Koperasi POS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {navigation.map((category) => (
              <div key={category.category}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.category}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant={isActive ? "secondary" : "default"}
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium">Role: {userRole}</p>
            <p className="text-xs text-muted-foreground">
              {userRole === "ADMIN" ? "Akses Penuh" : "Terbatas"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

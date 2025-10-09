// src/components/layout/app-header.tsx
"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { User } from "@/types";

interface AppHeaderProps {
  user: User;
  onSidebarToggle: () => void;
}

export function AppHeader({ user, onSidebarToggle }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSidebarToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm">
          <Bell className="h-5 w-5" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}

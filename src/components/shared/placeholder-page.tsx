// src/components/shared/placeholder-page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  badge?: string;
}

export function PlaceholderPage({ title, description, badge = "Coming Soon" }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{title}</h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {badge}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Card */}
      <Card className="max-w-2xl border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-orange-500" />
            Under Development
          </CardTitle>
          <CardDescription>Halaman ini sedang dalam pengembangan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Fitur <span className="font-semibold text-foreground">{title}</span> akan segera tersedia.
            </p>
            <p className="text-sm text-muted-foreground">Saat ini Anda dapat menggunakan:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Dashboard untuk melihat overview metrics</li>
              <li>Profile untuk melihat informasi user</li>
              <li>Logout untuk keluar dari sistem</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> Navigasi sidebar menampilkan semua menu yang tersedia berdasarkan role Anda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">In Development</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expected Release</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">Phase 2 - TBA</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

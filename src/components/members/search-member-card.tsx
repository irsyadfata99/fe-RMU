// src/components/members/search-member-card.tsx

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SearchMemberCardProps {
  onSearch: (uniqueId: string) => void;
  isLoading?: boolean;
}

export function SearchMemberCard({ onSearch, isLoading }: SearchMemberCardProps) {
  const [uniqueId, setUniqueId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueId.trim()) {
      onSearch(uniqueId.trim());
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cari Anggota</CardTitle>
        <CardDescription>Masukkan ID Anggota untuk melihat informasi detail</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uniqueId">ID Anggota</Label>
            <Input id="uniqueId" placeholder="Contoh: BDG-001" value={uniqueId} onChange={(e) => setUniqueId(e.target.value.toUpperCase())} disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !uniqueId.trim()}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Mencari..." : "Cari Anggota"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

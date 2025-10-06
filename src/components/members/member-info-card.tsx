// src/components/members/member-info-card.tsx

"use client";

import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Member } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface MemberInfoCardProps {
  member: Member;
  onClose: () => void;
}

export function MemberInfoCard({ member, onClose }: MemberInfoCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informasi Anggota</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ID & Nama */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ID Anggota</span>
            <span className="font-semibold">{member.uniqueId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nama Lengkap</span>
            <span className="font-semibold">{member.fullName}</span>
          </div>
        </div>

        <Separator />

        {/* Alamat & Wilayah */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Alamat</span>
            <span className="font-medium text-right max-w-xs">{member.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Wilayah</span>
            <span className="font-medium">{member.regionName}</span>
          </div>
        </div>

        <Separator />

        {/* Financial Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Hutang</span>
            <span className="font-semibold text-destructive">{formatCurrency(member.totalDebt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Jumlah Transaksi</span>
            <span className="font-medium">{member.totalTransactions}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Spending Bulan Ini</span>
            <span className="font-semibold text-primary">{formatCurrency(member.monthlySpending)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Point</span>
            <span className="font-semibold">{member.totalPoints} poin</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

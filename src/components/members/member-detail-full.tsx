// src/components/members/member-detail-full.tsx
"use client";

import { Member } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, CreditCard, ShoppingCart, Gift, Calendar, IdCard } from "lucide-react";

interface MemberDetailFullProps {
  member: Member;
}

export function MemberDetailFull({ member }: MemberDetailFullProps) {
  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6" />
                {member.fullName}
              </CardTitle>
              <p className="text-lg font-mono font-semibold text-primary mt-1">{member.uniqueId}</p>
            </div>
            <Badge variant={member.isActive ? "default" : "secondary"} className="text-sm">
              {member.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Personal Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Informasi Pribadi</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">NIK:</span> <span className="font-mono">{member.nik}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Jenis Kelamin:</span> <span>{member.gender}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">WhatsApp:</span> <span>{member.whatsapp}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-muted-foreground">Alamat:</span> <span>{member.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Wilayah:</span> <Badge variant="outline">{member.regionName}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial & Stats Card */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Debt Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Total Hutang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${member.totalDebt > 0 ? "text-orange-600" : "text-green-600"}`}>{formatCurrency(member.totalDebt)}</p>
            <p className="text-xs text-muted-foreground mt-1">{member.totalDebt > 0 ? "Masih memiliki hutang" : "Tidak ada hutang"}</p>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-5 w-5 text-primary" />
              Total Point
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{member.totalPoints} poin</p>
            <p className="text-xs text-muted-foreground mt-1">Dapat ditukar untuk diskon</p>
          </CardContent>
        </Card>

        {/* Transactions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-5 w-5" />
              Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{member.totalTransactions}x</p>
            <p className="text-xs text-muted-foreground mt-1">Total transaksi</p>
          </CardContent>
        </Card>

        {/* Monthly Spending Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Spending Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(member.monthlySpending)}</p>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Terdaftar: {formatDate(member.createdAt, "dd MMM yyyy HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Terakhir Update: {formatDate(member.updatedAt, "dd MMM yyyy HH:mm")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

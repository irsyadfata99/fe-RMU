// src/components/suppliers/supplier-detail-card.tsx
"use client";

import { Supplier } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, MapPin, Phone, Calendar, CreditCard } from "lucide-react";

interface SupplierDetailCardProps {
  supplier: Supplier;
}

export function SupplierDetailCard({ supplier }: SupplierDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {supplier.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Kode: {supplier.code}</p>
          </div>
          <Badge variant={supplier.isActive ? "default" : "secondary"}>{supplier.isActive ? "Aktif" : "Nonaktif"}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Informasi Kontak</h3>

          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{supplier.phone}</span>
          </div>

          {supplier.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{supplier.email}</span>
            </div>
          )}

          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="flex-1">{supplier.address}</span>
          </div>
        </div>

        <Separator />

        {/* Financial Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Informasi Keuangan</h3>

          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Hutang</span>
            </div>
            <span className={`text-lg font-bold ${supplier.totalDebt > 0 ? "text-orange-600" : "text-green-600"}`}>{formatCurrency(supplier.totalDebt)}</span>
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Dibuat: {formatDate(supplier.createdAt, "dd MMM yyyy HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Diupdate: {formatDate(supplier.updatedAt, "dd MMM yyyy HH:mm")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

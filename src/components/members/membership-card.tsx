// src/components/members/membership-card.tsx

"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Member } from "@/types";
import { Download } from "lucide-react";

interface MembershipCardProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export function MembershipCard({ member, isOpen, onClose }: MembershipCardProps) {
  const handleDownload = () => {
    // TODO: Implement screenshot/download functionality
    alert("Fitur download akan segera tersedia!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pendaftaran Berhasil!</DialogTitle>
          <DialogDescription>Kartu keanggotaan Anda telah dibuat. Screenshot kartu ini untuk referensi Anda.</DialogDescription>
        </DialogHeader>

        {/* Digital Membership Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">KOPERASI POS</h3>
              <p className="text-sm opacity-90">Kartu Anggota</p>
            </div>

            <Separator className="bg-primary-foreground/20" />

            {/* Member Info */}
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs opacity-75">ID Anggota</p>
                <p className="text-2xl font-bold tracking-wide">{member.uniqueId}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs opacity-75">Nama Lengkap</p>
                <p className="font-semibold">{member.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs opacity-75">NIK</p>
                  <p className="text-sm font-medium">{member.nik}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs opacity-75">Wilayah</p>
                  <p className="text-sm font-medium">{member.regionName}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs opacity-75">Alamat</p>
                <p className="text-sm font-medium line-clamp-2">{member.address}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs opacity-75">No. WhatsApp</p>
                <p className="text-sm font-medium">{member.whatsapp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Kartu
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Selesai
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">Simpan screenshot kartu ini untuk referensi transaksi Anda</p>
      </DialogContent>
    </Dialog>
  );
}

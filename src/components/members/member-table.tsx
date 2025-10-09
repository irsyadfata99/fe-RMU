// src/components/members/member-table.tsx
"use client";

import { Member } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberTableProps {
  members: Member[];
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onToggle: (id: string) => void;
  userRole: string;
}

export function MemberTable({ members, onView, onEdit, onToggle, userRole }: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada member ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Member</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Wilayah</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Total Hutang</TableHead>
            <TableHead>Total Point</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-mono font-semibold">{member.uniqueId}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">NIK: {member.nik}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{member.regionName}</Badge>
              </TableCell>
              <TableCell className="text-sm">{member.whatsapp}</TableCell>
              <TableCell>
                <span className={member.totalDebt > 0 ? "font-semibold text-orange-600" : "text-muted-foreground"}>{formatCurrency(member.totalDebt)}</span>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-primary">{member.totalPoints} poin</span>
              </TableCell>
              <TableCell>
                <Badge variant={member.isActive ? "default" : "secondary"}>{member.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => onView(member)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {userRole === "ADMIN" && (
                    <>
                      <Button variant="ghost" size="icon-sm" onClick={() => onToggle(member.id)} title={member.isActive ? "Nonaktifkan" : "Aktifkan"}>
                        {member.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

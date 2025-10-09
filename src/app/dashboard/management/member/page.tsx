// src/app/dashboard/management/member/page.tsx
"use client";

import { useState } from "react";
import { useMembers, useMemberActions, useMemberStats } from "@/hooks/useMember";
import { MemberTable } from "@/components/members/member-table";
import { MemberDetailFull } from "@/components/members/member-detail-full";
import { MemberEditForm } from "@/components/members/member-edit-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Member } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/constants/regions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function MembersManagementPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  const { members, isLoading, mutate } = useMembers({
    search,
    regionCode: regionFilter || undefined,
  });
  const { stats, isLoading: statsLoading } = useMemberStats();
  const { updateMember, toggleActive, isLoading: isSubmitting } = useMemberActions();

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleView = (member: Member) => {
    setViewingMember(member);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (!editingMember) return;

    try {
      await updateMember(editingMember.id, data);
      setIsDialogOpen(false);
      setEditingMember(null);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleActive(id);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Member</h1>
        <p className="text-muted-foreground">Kelola data member dan anggota koperasi</p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Member</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">{stats.activeMembers} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Point</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Akumulasi semua member</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Semua member</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari nama, NIK, atau ID member..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Select value={regionFilter || "ALL"} onValueChange={(value) => setRegionFilter(value === "ALL" ? "" : value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Semua Wilayah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Wilayah</SelectItem>
            {REGIONS.map((region) => (
              <SelectItem key={region.code} value={region.code}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <MemberTable members={members || []} onView={handleView} onEdit={handleEdit} onToggle={handleToggle} userRole={user?.role || "KASIR"} />
      )}

      {/* Dialog Form Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Member</DialogTitle>
            <DialogDescription>Perbarui informasi member. NIK tidak dapat diubah.</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <MemberEditForm
              initialData={editingMember}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingMember(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Sheet Detail */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Member</SheetTitle>
            <SheetDescription>Informasi lengkap dan riwayat member</SheetDescription>
          </SheetHeader>
          <div className="mt-6">{viewingMember && <MemberDetailFull member={viewingMember} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

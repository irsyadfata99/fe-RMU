// src/app/dashboard/management/member-debt/page.tsx
"use client";

import { useState } from "react";
import {
  useMemberDebts,
  useMemberDebtActions,
  useDebtStats,
} from "@/hooks/useMemberDebts";
import { MemberDebtTable } from "@/components/debt/member-debt-table";
import { DebtFilter } from "@/components/debt/debt-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Download, DollarSign, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCurrentUser } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { DebtFilters, MemberDebt, PayMemberDebtRequest } from "@/types/debt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MemberDebtPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DebtFilters>({
    page: 1,
    limit: 10,
  });

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<MemberDebt | null>(null);
  const [paymentData, setPaymentData] = useState<PayMemberDebtRequest>({
    amount: 0,
    paymentMethod: "CASH",
    notes: "",
  });

  const { debts, pagination, isLoading, mutate } = useMemberDebts({
    ...filters,
    search: search || undefined,
    page,
  });
  const { stats } = useDebtStats();
  const {
    payDebt,
    exportToExcel,
    isLoading: isSubmitting,
  } = useMemberDebtActions();

  const handleFilter = (newFilters: DebtFilters) => {
    setFilters({ ...newFilters, page: 1, limit: 10 });
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 10 });
    setSearch("");
    setPage(1);
  };

  const handleExport = async () => {
    await exportToExcel({
      search: search || undefined,
      ...filters,
    });
  };

  const handlePayClick = (debt: MemberDebt) => {
    setSelectedDebt(debt);
    setPaymentData({
      amount: parseFloat(debt.remainingAmount.toString()),
      paymentMethod: "CASH",
      notes: "",
    });
    setIsPaymentDialogOpen(true);
  };

  const handlePaySubmit = async () => {
    if (!selectedDebt) return;

    try {
      await payDebt(selectedDebt.id, paymentData);
      setIsPaymentDialogOpen(false);
      setSelectedDebt(null);
      mutate();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kelola Piutang Member</h1>
        <p className="text-muted-foreground">
          Kelola penerimaan pembayaran piutang dari member
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Piutang Member
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(stats.memberDebts.total))}
              </div>
              <p className="text-xs text-muted-foreground">
                Belum dibayar oleh member
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Piutang Jatuh Tempo
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.memberDebts.overdue}
              </div>
              <p className="text-xs text-muted-foreground">
                Perlu segera ditagih
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <DebtFilter
        onFilter={handleFilter}
        onReset={handleReset}
        showRegionFilter={true}
      />

      {/* Search & Export */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor faktur, nama member, atau ID member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={handleExport}
          disabled={isSubmitting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <MemberDebtTable
            debts={debts}
            onPay={handlePayClick}
            onView={(debt) => {
              // TODO: Implement view detail
              console.log("View debt:", debt);
            }}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {debts.length} dari {pagination.total} data
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terima Pembayaran Piutang</DialogTitle>
            <DialogDescription>
              {selectedDebt && (
                <>
                  Faktur: {selectedDebt.invoiceNumber} -{" "}
                  {selectedDebt.member?.fullName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedDebt && (
            <div className="space-y-4">
              {/* Debt Info */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-semibold">
                    {selectedDebt.member?.fullName} (
                    {selectedDebt.member?.uniqueId})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Piutang:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedDebt.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sudah Dibayar:</span>
                  <span className="text-green-600">
                    {formatCurrency(selectedDebt.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Sisa Piutang:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(selectedDebt.remainingAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jumlah Pembayaran *</Label>
                  <Input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    max={selectedDebt.remainingAmount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: {formatCurrency(selectedDebt.remainingAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value: any) =>
                      setPaymentData({ ...paymentData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tunai</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                      <SelectItem value="DEBIT">Kartu Debit</SelectItem>
                      <SelectItem value="CREDIT">Kartu Kredit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Catatan (Opsional)</Label>
                  <Textarea
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    placeholder="Catatan pembayaran..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePaySubmit}
                  disabled={isSubmitting || paymentData.amount <= 0}
                >
                  {isSubmitting ? "Memproses..." : "Terima Pembayaran"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

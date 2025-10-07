// src/app/(protected)/dashboard/receivables/payment/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, Eye, DollarSign, Printer, User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiClient, handleApiError } from "@/lib/api";
import { Member, Receivable, PaymentStatus } from "@/types";
import { paymentSchema, PaymentForm } from "@/lib/validations";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

// Mock Payment History Type
interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

// Mock Receivable with Payment History
interface ReceivableWithHistory extends Receivable {
  paymentHistory: PaymentHistory[];
}

export default function ReceivablesPaymentPage() {
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableWithHistory | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<{
    receivable: ReceivableWithHistory;
    payment: PaymentHistory;
  } | null>(null);

  // Fetch members
  const { data: members } = useSWR<Member[]>("/members", (url) => apiClient.get<Member[]>(url));

  // Mock receivables data (replace with real API later)
  const [mockReceivables, setMockReceivables] = useState<ReceivableWithHistory[]>([
    {
      id: "1",
      transactionId: "TRX-001",
      memberId: "member-1",
      memberName: "John Doe",
      memberUniqueId: "BDG-001",
      amount: 500000,
      paidAmount: 200000,
      remainingAmount: 300000,
      status: PaymentStatus.PARTIAL,
      dueDate: "2025-11-01",
      createdAt: "2025-10-01T10:00:00Z",
      updatedAt: "2025-10-05T14:30:00Z",
      paymentHistory: [
        {
          id: "pay-1",
          amount: 200000,
          paymentDate: "2025-10-05",
          notes: "Pembayaran pertama",
          createdAt: "2025-10-05T14:30:00Z",
        },
      ],
    },
    {
      id: "2",
      transactionId: "TRX-002",
      memberId: "member-1",
      memberName: "John Doe",
      memberUniqueId: "BDG-001",
      amount: 750000,
      paidAmount: 0,
      remainingAmount: 750000,
      status: PaymentStatus.UNPAID,
      dueDate: "2025-11-15",
      createdAt: "2025-10-10T11:00:00Z",
      updatedAt: "2025-10-10T11:00:00Z",
      paymentHistory: [],
    },
  ]);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // Filter members
  const filteredMembers = members?.filter(
    (m) => m.isActive && m.totalDebt > 0 && (m.fullName.toLowerCase().includes(searchMember.toLowerCase()) || m.uniqueId.toLowerCase().includes(searchMember.toLowerCase()) || m.nik.includes(searchMember))
  );

  // Get receivables for selected member
  const memberReceivables = selectedMember ? mockReceivables.filter((r) => r.memberId === selectedMember.id && r.status !== PaymentStatus.PAID) : [];

  // Select member
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchMember("");
  };

  // Remove member
  const handleRemoveMember = () => {
    setSelectedMember(null);
    setSelectedReceivable(null);
  };

  // Open payment dialog
  const handlePaymentClick = (receivable: ReceivableWithHistory) => {
    setSelectedReceivable(receivable);
    form.reset({
      amount: receivable.remainingAmount,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setPaymentDialogOpen(true);
  };

  // View detail
  const handleViewDetail = (receivable: ReceivableWithHistory) => {
    setSelectedReceivable(receivable);
    setDetailDialogOpen(true);
  };

  // Process payment
  const handleSubmitPayment = async (data: PaymentForm) => {
    if (!selectedReceivable) return;

    if (data.amount > selectedReceivable.remainingAmount) {
      toast.error("Jumlah pembayaran melebihi sisa hutang");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call (replace with real API later)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock payment processing
      const newPayment: PaymentHistory = {
        id: `pay-${Date.now()}`,
        amount: data.amount,
        paymentDate: data.paymentDate,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      const newPaidAmount = selectedReceivable.paidAmount + data.amount;
      const newRemainingAmount = selectedReceivable.amount - newPaidAmount;
      const newStatus = newRemainingAmount === 0 ? PaymentStatus.PAID : newPaidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

      // Update mock data
      setMockReceivables((prev) =>
        prev.map((r) =>
          r.id === selectedReceivable.id
            ? {
                ...r,
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus,
                paymentHistory: [...r.paymentHistory, newPayment],
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );

      // Update member debt (mock)
      if (selectedMember) {
        selectedMember.totalDebt -= data.amount;
      }

      toast.success("Pembayaran berhasil diproses");

      // Set completed payment for print
      setCompletedPayment({
        receivable: {
          ...selectedReceivable,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
        payment: newPayment,
      });

      setPaymentDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    setPrintDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: "default" | "destructive" | "secondary"; label: string; className?: string }> = {
      PAID: { variant: "default", label: "Lunas", className: "bg-green-500 text-white" },
      UNPAID: { variant: "destructive", label: "Belum Bayar" },
      PARTIAL: { variant: "secondary", label: "Bayar Sebagian", className: "bg-yellow-500 text-white" },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pembayaran Piutang</h1>
        <p className="text-muted-foreground">Kelola pembayaran hutang member</p>
      </div>

      {/* Stats Card */}
      {selectedMember && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Member Terpilih</p>
                <p className="text-2xl font-bold">{selectedMember.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.uniqueId} • {selectedMember.whatsapp}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Hutang</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(selectedMember.totalDebt)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveMember}>
                Ganti Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Selection */}
      {!selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Member</CardTitle>
            <CardDescription>Cari member yang memiliki hutang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari member (Nama/ID/NIK)..." value={searchMember} onChange={(e) => setSearchMember(e.target.value)} className="pl-9" autoFocus />
              </div>

              {searchMember && filteredMembers && filteredMembers.length > 0 && (
                <div className="max-h-80 overflow-y-auto border rounded-lg">
                  {filteredMembers.map((member) => (
                    <button key={member.id} onClick={() => handleSelectMember(member)} className="w-full p-4 text-left hover:bg-accent transition-colors border-b last:border-b-0 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{member.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.uniqueId} • {member.whatsapp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Hutang</p>
                        <p className="font-bold text-destructive">{formatCurrency(member.totalDebt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchMember && (!filteredMembers || filteredMembers.length === 0) && <p className="text-center text-muted-foreground py-8">Member tidak ditemukan atau tidak memiliki hutang</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receivables Table */}
      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Piutang</CardTitle>
            <CardDescription>Piutang yang belum lunas dari {selectedMember.fullName}</CardDescription>
          </CardHeader>
          <CardContent>
            {memberReceivables.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No Invoice</TableHead>
                      <TableHead>Total Hutang</TableHead>
                      <TableHead>Sudah Dibayar</TableHead>
                      <TableHead>Sisa</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberReceivables.map((receivable) => (
                      <TableRow key={receivable.id}>
                        <TableCell className="text-sm">{formatDate(receivable.createdAt)}</TableCell>
                        <TableCell className="font-mono text-sm">{receivable.transactionId}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(receivable.amount)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(receivable.paidAmount)}</TableCell>
                        <TableCell className="font-bold text-destructive">{formatCurrency(receivable.remainingAmount)}</TableCell>
                        <TableCell className="text-sm">{receivable.dueDate ? formatDate(receivable.dueDate) : "-"}</TableCell>
                        <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(receivable)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="sm" onClick={() => handlePaymentClick(receivable)} disabled={receivable.remainingAmount === 0}>
                              <DollarSign className="h-4 w-4 mr-1" />
                              Bayar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada piutang yang belum lunas</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
            <DialogDescription>Input jumlah pembayaran piutang</DialogDescription>
          </DialogHeader>

          {selectedReceivable && (
            <div className="mb-4 p-4 border rounded-lg bg-accent/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">No Invoice:</p>
                  <p className="font-mono font-semibold">{selectedReceivable.transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Hutang:</p>
                  <p className="font-semibold">{formatCurrency(selectedReceivable.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sudah Dibayar:</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedReceivable.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sisa Hutang:</p>
                  <p className="font-bold text-destructive">{formatCurrency(selectedReceivable.remainingAmount)}</p>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitPayment)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Pembayaran *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max={selectedReceivable?.remainingAmount} placeholder="Masukkan jumlah" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pembayaran *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan (Opsional)</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Catatan pembayaran..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Memproses..." : "Proses Pembayaran"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Piutang</DialogTitle>
            <DialogDescription>Informasi lengkap dan riwayat pembayaran</DialogDescription>
          </DialogHeader>

          {selectedReceivable && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No Invoice</p>
                  <p className="font-mono">{selectedReceivable.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedReceivable.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Member</p>
                  <p>
                    {selectedReceivable.memberName} ({selectedReceivable.memberUniqueId})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Transaksi</p>
                  <p>{formatDate(selectedReceivable.createdAt)}</p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Hutang</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedReceivable.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sudah Dibayar</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(selectedReceivable.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sisa Hutang</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(selectedReceivable.remainingAmount)}</p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Riwayat Pembayaran</p>
                {selectedReceivable.paymentHistory.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Catatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReceivable.paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="text-sm">{formatDate(payment.paymentDate)}</TableCell>
                            <TableCell className="font-semibold text-green-600">{formatCurrency(payment.amount)}</TableCell>
                            <TableCell className="text-sm">{payment.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Belum ada pembayaran</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog with Print Option */}
      {completedPayment && (
        <Dialog
          open={!!completedPayment && !printDialogOpen}
          onOpenChange={(open) => {
            if (!open) setCompletedPayment(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Pembayaran Berhasil
              </DialogTitle>
              <DialogDescription>Pembayaran piutang telah diproses</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm text-muted-foreground">Jumlah Dibayar</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(completedPayment.payment.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">No Invoice</p>
                  <p className="font-mono font-semibold">{completedPayment.receivable.transactionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal</p>
                  <p>{formatDate(completedPayment.payment.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sisa Hutang</p>
                  <p className="font-bold text-destructive">{formatCurrency(completedPayment.receivable.remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(completedPayment.receivable.status)}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCompletedPayment(null)}>
                Tutup
              </Button>
              <Button onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print Bukti Bayar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Bukti Bayar</DialogTitle>
            <DialogDescription>Preview bukti pembayaran</DialogDescription>
          </DialogHeader>

          {completedPayment && (
            <>
              {/* Print Preview */}
              <div id="payment-receipt" className="print-receipt border rounded-lg p-4 bg-white">
                <div className="receipt-content">
                  {/* Header */}
                  <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-300">
                    <h1 className="text-xl font-bold">KOPERASIMART</h1>
                    <p className="text-xs mt-1">Jl. Contoh No. 123, Bandung</p>
                    <p className="text-xs">Telp: (022) 1234567</p>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold">BUKTI PEMBAYARAN PIUTANG</h2>
                  </div>

                  {/* Payment Info */}
                  <div className="text-xs mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Tanggal Bayar:</span>
                      <span>{formatDate(completedPayment.payment.paymentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{formatDateTime(completedPayment.payment.createdAt)}</span>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Member:</span>
                      <span className="font-semibold">{completedPayment.receivable.memberName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID Member:</span>
                      <span className="font-mono">{completedPayment.receivable.memberUniqueId}</span>
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>No Invoice:</span>
                      <span className="font-mono font-semibold">{completedPayment.receivable.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hutang:</span>
                      <span>{formatCurrency(completedPayment.receivable.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sudah Dibayar:</span>
                      <span className="text-green-600">{formatCurrency(completedPayment.receivable.paidAmount)}</span>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3">
                    <div className="flex justify-between text-base font-bold">
                      <span>JUMLAH DIBAYAR:</span>
                      <span className="text-green-600">{formatCurrency(completedPayment.payment.amount)}</span>
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>SISA HUTANG:</span>
                      <span className="text-red-600">{formatCurrency(completedPayment.receivable.remainingAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold">{completedPayment.receivable.status === PaymentStatus.PAID ? "LUNAS" : completedPayment.receivable.status === PaymentStatus.PARTIAL ? "BAYAR SEBAGIAN" : "BELUM BAYAR"}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {completedPayment.payment.notes && (
                    <div className="border-t border-dashed border-gray-300 pt-3 mb-3 text-xs">
                      <p className="font-semibold">Catatan:</p>
                      <p className="mt-1">{completedPayment.payment.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-300 text-xs">
                    <p className="font-semibold">Terima kasih atas pembayaran Anda!</p>
                    <p className="mt-1">Simpan bukti ini sebagai tanda pembayaran</p>
                    <p className="mt-2">www.koperasimart.com</p>
                  </div>
                </div>
              </div>

              {/* Print Styles */}
              <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  .print-receipt,
                  .print-receipt * {
                    visibility: visible;
                  }
                  .print-receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 80mm;
                    padding: 10mm;
                    margin: 0;
                    background: white;
                  }
                  .receipt-content {
                    font-family: "Courier New", monospace;
                  }
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                }
              `}</style>
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPrintDialogOpen(false);
                setCompletedPayment(null);
              }}
            >
              Batal
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

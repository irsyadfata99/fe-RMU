// src/app/(protected)/dashboard/payables/payment/page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, Eye, DollarSign, Printer, Building2, AlertCircle, CheckCircle, Clock, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient, handleApiError } from "@/lib/api";
import { Supplier, Payable, PaymentStatus } from "@/types";
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

// Mock Payable with Payment History
interface PayableWithHistory extends Payable {
  paymentHistory: PaymentHistory[];
}

// New Invoice Schema
const newInvoiceSchema = z.object({
  supplierId: z.string().min(1, "Pilih supplier"),
  invoiceNumber: z.string().min(1, "Nomor faktur harus diisi"),
  amount: z.number().min(1, "Jumlah hutang harus lebih dari 0"),
  dueDate: z.string().optional(),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional(),
});

type NewInvoiceForm = z.infer<typeof newInvoiceSchema>;

export default function PayablesPaymentPage() {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPayable, setSelectedPayable] = useState<PayableWithHistory | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newInvoiceDialogOpen, setNewInvoiceDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<{
    payable: PayableWithHistory;
    payment: PaymentHistory;
  } | null>(null);

  // Fetch suppliers
  const { data: suppliers } = useSWR<Supplier[]>("/suppliers", (url) => apiClient.get<Supplier[]>(url));

  // Mock payables data (replace with real API later)
  const [mockPayables, setMockPayables] = useState<PayableWithHistory[]>([
    {
      id: "1",
      supplierId: "supplier-1",
      supplierName: "PT. Supplier Indonesia",
      invoiceNumber: "SUP-251001-001",
      amount: 5000000,
      paidAmount: 2000000,
      remainingAmount: 3000000,
      status: PaymentStatus.PARTIAL,
      dueDate: "2025-11-01",
      createdAt: "2025-10-01T10:00:00Z",
      updatedAt: "2025-10-05T14:30:00Z",
      paymentHistory: [
        {
          id: "pay-1",
          amount: 2000000,
          paymentDate: "2025-10-05",
          notes: "Pembayaran pertama",
          createdAt: "2025-10-05T14:30:00Z",
        },
      ],
    },
    {
      id: "2",
      supplierId: "supplier-1",
      supplierName: "PT. Supplier Indonesia",
      invoiceNumber: "SUP-251005-002",
      amount: 7500000,
      paidAmount: 0,
      remainingAmount: 7500000,
      status: PaymentStatus.UNPAID,
      dueDate: "2025-11-15",
      createdAt: "2025-10-05T11:00:00Z",
      updatedAt: "2025-10-05T11:00:00Z",
      paymentHistory: [],
    },
  ]);

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const newInvoiceForm = useForm<NewInvoiceForm>({
    resolver: zodResolver(newInvoiceSchema),
    defaultValues: {
      supplierId: "",
      invoiceNumber: "",
      amount: 0,
      dueDate: "",
      notes: "",
    },
  });

  // Filter suppliers
  const filteredSuppliers = suppliers?.filter((s) => s.isActive && s.totalDebt > 0 && (s.name.toLowerCase().includes(searchSupplier.toLowerCase()) || s.phone.includes(searchSupplier)));

  // Get payables for selected supplier
  const supplierPayables = selectedSupplier ? mockPayables.filter((p) => p.supplierId === selectedSupplier.id && p.status !== PaymentStatus.PAID) : [];

  // Select supplier
  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSearchSupplier("");
  };

  // Remove supplier
  const handleRemoveSupplier = () => {
    setSelectedSupplier(null);
    setSelectedPayable(null);
  };

  // Open payment dialog
  const handlePaymentClick = (payable: PayableWithHistory) => {
    setSelectedPayable(payable);
    paymentForm.reset({
      amount: payable.remainingAmount,
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setPaymentDialogOpen(true);
  };

  // View detail
  const handleViewDetail = (payable: PayableWithHistory) => {
    setSelectedPayable(payable);
    setDetailDialogOpen(true);
  };

  // Process payment
  const handleSubmitPayment = async (data: PaymentForm) => {
    if (!selectedPayable) return;

    if (data.amount > selectedPayable.remainingAmount) {
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

      const newPaidAmount = selectedPayable.paidAmount + data.amount;
      const newRemainingAmount = selectedPayable.amount - newPaidAmount;
      const newStatus = newRemainingAmount === 0 ? PaymentStatus.PAID : newPaidAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

      // Update mock data
      setMockPayables((prev) =>
        prev.map((p) =>
          p.id === selectedPayable.id
            ? {
                ...p,
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus,
                paymentHistory: [...p.paymentHistory, newPayment],
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );

      // Update supplier debt (mock)
      if (selectedSupplier) {
        selectedSupplier.totalDebt -= data.amount;
      }

      toast.success("Pembayaran berhasil diproses");

      // Set completed payment for print
      setCompletedPayment({
        payable: {
          ...selectedPayable,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
        payment: newPayment,
      });

      setPaymentDialogOpen(false);
      paymentForm.reset();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit new invoice
  const handleSubmitNewInvoice = async (data: NewInvoiceForm) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate invoice number with format SUP-YYMMDD-XXX
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const sequence = String(mockPayables.length + 1).padStart(3, "0");
      const generatedInvoice = `SUP-${yy}${mm}${dd}-${sequence}`;

      const supplier = suppliers?.find((s) => s.id === data.supplierId);

      // Create new payable
      const newPayable: PayableWithHistory = {
        id: `payable-${Date.now()}`,
        supplierId: data.supplierId,
        supplierName: supplier?.name || "Unknown",
        invoiceNumber: generatedInvoice,
        amount: data.amount,
        paidAmount: 0,
        remainingAmount: data.amount,
        status: PaymentStatus.UNPAID,
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentHistory: [],
      };

      setMockPayables((prev) => [...prev, newPayable]);

      toast.success(`Faktur ${generatedInvoice} berhasil ditambahkan`);
      setNewInvoiceDialogOpen(false);
      newInvoiceForm.reset();
      setActiveTab("existing");
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
        <h1 className="text-3xl font-bold">Pembayaran Hutang Supplier</h1>
        <p className="text-muted-foreground">Kelola pembayaran hutang ke supplier</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="existing">Hutang Existing</TabsTrigger>
          <TabsTrigger value="new">Input Faktur Baru</TabsTrigger>
        </TabsList>

        {/* EXISTING DEBT TAB */}
        <TabsContent value="existing" className="space-y-6">
          {/* Stats Card */}
          {selectedSupplier && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Supplier Terpilih</p>
                    <p className="text-2xl font-bold">{selectedSupplier.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Hutang</p>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(selectedSupplier.totalDebt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveSupplier}>
                    Ganti Supplier
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplier Selection */}
          {!selectedSupplier && (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Supplier</CardTitle>
                <CardDescription>Cari supplier yang memiliki hutang</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Cari supplier (Nama/Telepon)..." value={searchSupplier} onChange={(e) => setSearchSupplier(e.target.value)} className="pl-9" autoFocus />
                  </div>

                  {searchSupplier && filteredSuppliers && filteredSuppliers.length > 0 && (
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                      {filteredSuppliers.map((supplier) => (
                        <button key={supplier.id} onClick={() => handleSelectSupplier(supplier)} className="w-full p-4 text-left hover:bg-accent transition-colors border-b last:border-b-0 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{supplier.name}</p>
                            <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Hutang</p>
                            <p className="font-bold text-destructive">{formatCurrency(supplier.totalDebt)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchSupplier && (!filteredSuppliers || filteredSuppliers.length === 0) && <p className="text-center text-muted-foreground py-8">Supplier tidak ditemukan atau tidak memiliki hutang</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payables Table */}
          {selectedSupplier && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Hutang</CardTitle>
                <CardDescription>Hutang yang belum lunas ke {selectedSupplier.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {supplierPayables.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>No Faktur</TableHead>
                          <TableHead>Total Hutang</TableHead>
                          <TableHead>Sudah Dibayar</TableHead>
                          <TableHead>Sisa</TableHead>
                          <TableHead>Jatuh Tempo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierPayables.map((payable) => (
                          <TableRow key={payable.id}>
                            <TableCell className="text-sm">{formatDate(payable.createdAt)}</TableCell>
                            <TableCell className="font-mono text-sm">{payable.invoiceNumber}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(payable.amount)}</TableCell>
                            <TableCell className="text-green-600">{formatCurrency(payable.paidAmount)}</TableCell>
                            <TableCell className="font-bold text-destructive">{formatCurrency(payable.remainingAmount)}</TableCell>
                            <TableCell className="text-sm">{payable.dueDate ? formatDate(payable.dueDate) : "-"}</TableCell>
                            <TableCell>{getStatusBadge(payable.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDetail(payable)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="default" size="sm" onClick={() => handlePaymentClick(payable)} disabled={payable.remainingAmount === 0}>
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
                    <p>Tidak ada hutang yang belum lunas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NEW INVOICE TAB */}
        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Faktur Baru dari Supplier</CardTitle>
              <CardDescription>Tambahkan faktur pembelian baru yang akan dibayar</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...newInvoiceForm}>
                <form onSubmit={newInvoiceForm.handleSubmit(handleSubmitNewInvoice)} className="space-y-4">
                  <FormField
                    control={newInvoiceForm.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={isSubmitting}
                          >
                            <option value="">Pilih Supplier</option>
                            {suppliers?.map((supplier) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={newInvoiceForm.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Faktur (dari Supplier) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 0925-375" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Masukkan nomor faktur asli dari supplier</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={newInvoiceForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Hutang *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={newInvoiceForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jatuh Tempo</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={newInvoiceForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Catatan pembelian..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Memproses..." : "Tambah Faktur"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proses Pembayaran</DialogTitle>
            <DialogDescription>Input jumlah pembayaran hutang supplier</DialogDescription>
          </DialogHeader>

          {selectedPayable && (
            <div className="mb-4 p-4 border rounded-lg bg-accent/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">No Faktur:</p>
                  <p className="font-mono font-semibold">{selectedPayable.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier:</p>
                  <p className="font-semibold">{selectedPayable.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Hutang:</p>
                  <p className="font-semibold">{formatCurrency(selectedPayable.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sudah Dibayar:</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedPayable.paidAmount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Sisa Hutang:</p>
                  <p className="font-bold text-destructive text-lg">{formatCurrency(selectedPayable.remainingAmount)}</p>
                </div>
              </div>
            </div>
          )}

          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleSubmitPayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Pembayaran *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max={selectedPayable?.remainingAmount} placeholder="Masukkan jumlah" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
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
                control={paymentForm.control}
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
            <DialogTitle>Detail Hutang Supplier</DialogTitle>
            <DialogDescription>Informasi lengkap dan riwayat pembayaran</DialogDescription>
          </DialogHeader>

          {selectedPayable && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No Faktur</p>
                  <p className="font-mono">{selectedPayable.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayable.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                  <p>{selectedPayable.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Faktur</p>
                  <p>{formatDate(selectedPayable.createdAt)}</p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Hutang</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedPayable.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sudah Dibayar</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(selectedPayable.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sisa Hutang</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(selectedPayable.remainingAmount)}</p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Riwayat Pembayaran</p>
                {selectedPayable.paymentHistory.length > 0 ? (
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
                        {selectedPayable.paymentHistory.map((payment) => (
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
              <DialogDescription>Pembayaran hutang supplier telah diproses</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg bg-green-50">
                <p className="text-sm text-muted-foreground">Jumlah Dibayar</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(completedPayment.payment.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">No Faktur</p>
                  <p className="font-mono font-semibold">{completedPayment.payable.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal</p>
                  <p>{formatDate(completedPayment.payment.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier</p>
                  <p className="font-semibold">{completedPayment.payable.supplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sisa Hutang</p>
                  <p className="font-bold text-destructive">{formatCurrency(completedPayment.payable.remainingAmount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Status</p>
                  {getStatusBadge(completedPayment.payable.status)}
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
                    <h2 className="text-lg font-bold">BUKTI PEMBAYARAN HUTANG</h2>
                    <p className="text-xs">KEPADA SUPPLIER</p>
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

                  {/* Supplier Info */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Supplier:</span>
                      <span className="font-semibold">{completedPayment.payable.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No Faktur:</span>
                      <span className="font-mono font-semibold">{completedPayment.payable.invoiceNumber}</span>
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Total Hutang:</span>
                      <span>{formatCurrency(completedPayment.payable.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sudah Dibayar:</span>
                      <span className="text-green-600">{formatCurrency(completedPayment.payable.paidAmount)}</span>
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
                      <span className="text-red-600">{formatCurrency(completedPayment.payable.remainingAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold">{completedPayment.payable.status === PaymentStatus.PAID ? "LUNAS" : completedPayment.payable.status === PaymentStatus.PARTIAL ? "BAYAR SEBAGIAN" : "BELUM BAYAR"}</span>
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
                    <p className="font-semibold">Terima kasih atas kerjasamanya!</p>
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

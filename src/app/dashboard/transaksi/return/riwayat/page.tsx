// src/app/dashboard/transaksi/return/riwayat/page.tsx
"use client";

import { useState } from "react";
import {
  usePurchaseReturns,
  useSalesReturns,
  useReturnActions,
} from "@/hooks/useReturn";
import { useCurrentUser } from "@/hooks/useAuth";
import { ReturnTable } from "@/components/returns/return-table";
import { ReturnDetailCard } from "@/components/returns/return-detail-card";
import { ReturnApprovalModal } from "@/components/returns/return-approval-modal";
import { ReturnRejectModal } from "@/components/returns/return-reject-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PlusCircle, History, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ReturnHistoryPage() {
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"purchase" | "sales">("purchase");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page] = useState(1);

  // Sheet & Modal states
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [returnType, setReturnType] = useState<"purchase" | "sales">(
    "purchase"
  );

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionReturnId, setActionReturnId] = useState<string | null>(null);
  const [actionReturnNumber, setActionReturnNumber] = useState<string | null>(
    null
  );

  // Fetch data
  const {
    returns: purchaseReturns,
    isLoading: loadingPurchase,
    mutate: mutatePurchase,
  } = usePurchaseReturns({
    page,
    limit: 20,
    status: status && status !== "all" ? (status as any) : undefined,
    sortBy: "returnDate",
    sortOrder: "DESC",
  });

  const {
    returns: salesReturns,
    isLoading: loadingSales,
    mutate: mutateSales,
  } = useSalesReturns({
    page,
    limit: 20,
    status: status && status !== "all" ? (status as any) : undefined,
    sortBy: "returnDate",
    sortOrder: "DESC",
  });

  const {
    approvePurchaseReturn,
    rejectPurchaseReturn,
    approveSalesReturn,
    rejectSalesReturn,
    isLoading: isActioning,
  } = useReturnActions();

  const handleView = (returnData: any, type: "purchase" | "sales") => {
    setSelectedReturn(returnData);
    setReturnType(type);
    setIsDetailSheetOpen(true);
  };

  const handleApprove = (id: string, returnNumber: string) => {
    setActionReturnId(id);
    setActionReturnNumber(returnNumber);
    setIsApproveModalOpen(true);
  };

  const handleReject = (id: string, returnNumber: string) => {
    setActionReturnId(id);
    setActionReturnNumber(returnNumber);
    setIsRejectModalOpen(true);
  };

  const handleApproveConfirm = async (data: { notes?: string }) => {
    if (!actionReturnId) return;

    try {
      if (activeTab === "purchase") {
        await approvePurchaseReturn(actionReturnId, data);
        mutatePurchase();
      } else {
        await approveSalesReturn(actionReturnId, data);
        mutateSales();
      }
      setIsApproveModalOpen(false);
      setActionReturnId(null);
      setActionReturnNumber(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRejectConfirm = async (data: { notes: string }) => {
    if (!actionReturnId) return;

    try {
      if (activeTab === "purchase") {
        await rejectPurchaseReturn(actionReturnId, data);
        mutatePurchase();
      } else {
        await rejectSalesReturn(actionReturnId, data);
        mutateSales();
      }
      setIsRejectModalOpen(false);
      setActionReturnId(null);
      setActionReturnNumber(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Riwayat Return
          </h1>
          <p className="text-muted-foreground">
            Daftar semua transaksi return barang
          </p>
        </div>
        {user?.role === "ADMIN" && (
          <div className="flex gap-2">
            <Link href="/dashboard/transaksi/return/pembelian">
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retur Pembelian
              </Button>
            </Link>
            <Link href="/dashboard/transaksi/return/penjualan">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Retur Penjualan
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="purchase">Retur Pembelian</TabsTrigger>
          <TabsTrigger value="sales">Retur Penjualan</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row mt-4">
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              setStatus(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Purchase Returns Tab */}
        <TabsContent value="purchase">
          {loadingPurchase ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <ReturnTable
              returns={purchaseReturns || []}
              type="purchase"
              onView={(id) => {
                const returnData = purchaseReturns?.find((r) => r.id === id);
                if (returnData) handleView(returnData, "purchase");
              }}
              onApprove={
                user?.role === "ADMIN"
                  ? (id) => {
                      const returnData = purchaseReturns?.find(
                        (r) => r.id === id
                      );
                      if (returnData)
                        handleApprove(id, returnData.returnNumber);
                    }
                  : undefined
              }
              onReject={
                user?.role === "ADMIN"
                  ? (id) => {
                      const returnData = purchaseReturns?.find(
                        (r) => r.id === id
                      );
                      if (returnData) handleReject(id, returnData.returnNumber);
                    }
                  : undefined
              }
              userRole={user?.role || "KASIR"}
            />
          )}
        </TabsContent>

        {/* Sales Returns Tab */}
        <TabsContent value="sales">
          {loadingSales ? (
            <div className="flex h-96 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <ReturnTable
              returns={salesReturns || []}
              type="sales"
              onView={(id) => {
                const returnData = salesReturns?.find((r) => r.id === id);
                if (returnData) handleView(returnData, "sales");
              }}
              onApprove={
                user?.role === "ADMIN"
                  ? (id) => {
                      const returnData = salesReturns?.find((r) => r.id === id);
                      if (returnData)
                        handleApprove(id, returnData.returnNumber);
                    }
                  : undefined
              }
              onReject={
                user?.role === "ADMIN"
                  ? (id) => {
                      const returnData = salesReturns?.find((r) => r.id === id);
                      if (returnData) handleReject(id, returnData.returnNumber);
                    }
                  : undefined
              }
              userRole={user?.role || "KASIR"}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detail Return</SheetTitle>
            <SheetDescription>
              Informasi lengkap tentang return barang
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedReturn && (
              <ReturnDetailCard returnData={selectedReturn} type={returnType} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Approval Modal */}
      <ReturnApprovalModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setActionReturnId(null);
          setActionReturnNumber(null);
        }}
        returnData={
          actionReturnId && actionReturnNumber
            ? {
                returnNumber: actionReturnNumber,
                totalAmount: selectedReturn?.totalAmount || 0,
                type: activeTab,
              }
            : null
        }
        onConfirm={handleApproveConfirm}
        isLoading={isActioning}
      />

      {/* Reject Modal */}
      <ReturnRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setActionReturnId(null);
          setActionReturnNumber(null);
        }}
        returnNumber={actionReturnNumber}
        onConfirm={handleRejectConfirm}
        isLoading={isActioning}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransaction";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionHistoryPage() {
  const [search, setSearch] = useState("");
  const [saleType, setSaleType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page] = useState(1);

  const { transactions, isLoading } = useTransactions({
    page,
    limit: 10,
    search,
    saleType: saleType,
    status: status,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Riwayat Penjualan</h1>
        <p className="text-muted-foreground">Semua transaksi penjualan</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={saleType || "all"}
          onValueChange={(value) =>
            setSaleType(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="TUNAI">Tunai</SelectItem>
            <SelectItem value="KREDIT">Kredit</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status || "all"}
          onValueChange={(value) =>
            setStatus(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="PAID">Lunas</SelectItem>
            <SelectItem value="PARTIAL">Cicilan</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <TransactionTable transactions={transactions || []} />
      )}
    </div>
  );
}

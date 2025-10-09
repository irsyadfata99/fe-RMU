// src/components/returns/return-table.tsx
"use client";

import { PurchaseReturn, SalesReturn } from "@/types/return";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { ReturnStatusBadge } from "./return-status-badge";

interface ReturnTableProps {
  returns: (PurchaseReturn | SalesReturn)[];
  type: "purchase" | "sales";
  onView: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  userRole: string;
}

export function ReturnTable({
  returns,
  type,
  onView,
  onApprove,
  onReject,
  userRole,
}: ReturnTableProps) {
  if (returns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Tidak ada retur ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor Retur</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>{type === "purchase" ? "Supplier" : "Member"}</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((returnItem) => (
            <TableRow key={returnItem.id}>
              <TableCell className="font-mono text-sm font-medium">
                {returnItem.returnNumber}
              </TableCell>
              <TableCell className="text-sm">
                {formatDateTime(returnItem.returnDate)}
              </TableCell>
              <TableCell>
                {type === "purchase" ? (
                  <div>
                    <p className="font-medium">
                      {(returnItem as PurchaseReturn).supplier?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(returnItem as PurchaseReturn).supplier?.code}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">
                      {(returnItem as SalesReturn).member?.fullName || "UMUM"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(returnItem as SalesReturn).member?.uniqueId}
                    </p>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(returnItem.totalAmount)}
              </TableCell>
              <TableCell>
                <ReturnStatusBadge status={returnItem.status} />
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm">
                {returnItem.reason}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onView(returnItem.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {userRole === "ADMIN" && returnItem.status === "PENDING" && (
                    <>
                      {onApprove && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onApprove(returnItem.id)}
                          title="Setujui"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onReject(returnItem.id)}
                          title="Tolak"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
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

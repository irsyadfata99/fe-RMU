"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
interface ReturnApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnData: {
    returnNumber: string;
    totalAmount: number;
    type: "purchase" | "sales";
  } | null;
  onConfirm: (data: { notes?: string }) => Promise<void>;
  isLoading: boolean;
}
export function ReturnApprovalModal({
  isOpen,
  onClose,
  returnData,
  onConfirm,
  isLoading,
}: ReturnApprovalModalProps) {
  const [notes, setNotes] = useState("");
  const handleSubmit = async () => {
    try {
      await onConfirm({ notes: notes || undefined });
      setNotes("");
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };
  if (!returnData) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Setujui Retur
          </DialogTitle>
          <DialogDescription>
            Konfirmasi persetujuan retur ini
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nomor Retur</span>
              <span className="font-mono font-semibold">
                {returnData.returnNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jenis</span>
              <span className="font-medium">
                {returnData.type === "purchase"
                  ? "Retur Pembelian"
                  : "Retur Penjualan"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(returnData.totalAmount)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 karakter
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Setujui Retur
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Loader2, XCircle } from "lucide-react";
interface ReturnRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnNumber: string | null;
  onConfirm: (data: { notes: string }) => Promise<void>;
  isLoading: boolean;
}
export function ReturnRejectModal({
  isOpen,
  onClose,
  returnNumber,
  onConfirm,
  isLoading,
}: ReturnRejectModalProps) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    if (notes.length < 10) {
      setError("Alasan penolakan minimal 10 karakter");
      return;
    }
    try {
      await onConfirm({ notes });
      setNotes("");
      setError("");
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setNotes("");
          setError("");
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Tolak Retur
          </DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk retur: {returnNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Reason */}
          <div className="space-y-2">
            <Label>
              Alasan Penolakan <span className="text-destructive">*</span>
            </Label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError("");
              }}
              placeholder="Jelaskan alasan penolakan retur ini (min. 10 karakter)..."
              className={`flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                error ? "border-destructive" : "border-input"
              }`}
              disabled={isLoading}
              maxLength={500}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
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
              disabled={isLoading || notes.length < 10}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak Retur
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

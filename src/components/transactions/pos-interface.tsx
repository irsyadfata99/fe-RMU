"use client";
import { useState, useEffect } from "react";
import { useProductActions } from "@/hooks/useProduct";
import { useTransactionActions } from "@/hooks/useTransaction";
import { CartItem } from "./cart-item";
import { PaymentModal } from "./payment-modal";
import { BarcodeScanner } from "@/components/products/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Product } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSWR from "swr";
import { apiClient } from "@/lib/api";
interface CartItemType {
  product: Product;
  quantity: number;
  subtotal: number;
}
export function POSInterface() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [barcode, setBarcode] = useState("");
  const [memberId, setMemberId] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { searchByBarcode } = useProductActions();
  const { createSale, isLoading } = useTransactionActions();
  const { data: members } = useSWR("/members", (url) => apiClient.get<any[]>(url));
  useEffect(() => {
    const input = document.getElementById("barcode-input") as HTMLInputElement;
    if (input) input.focus();
  }, []);
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      const product = await searchByBarcode(barcode);
      addToCart(product);
      setBarcode("");
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Produk tidak ditemukan");
    }
  };
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          subtotal: product.sellingPrice,
        },
      ]);
    }
  };
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: item.product.sellingPrice * quantity,
            }
          : item
      )
    );
  };
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
    toast.success("Item dihapus dari keranjang");
  };
  const clearCart = () => {
    if (window.confirm("Yakin ingin mengosongkan keranjang?")) {
      setCart([]);
      setMemberId("");
      toast.success("Keranjang dikosongkan");
    }
  };
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = 0;
  const total = subtotal - discount;
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }
    setIsPaymentModalOpen(true);
  };
  const handlePaymentComplete = async (paymentData: any) => {
    try {
      const saleData = {
        memberId: memberId && memberId !== "UMUM" ? memberId : undefined,
        saleType: paymentData.saleType,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discountAmount: discount,
        paymentReceived: paymentData.paymentReceived,
        dpAmount: paymentData.dpAmount,
        dueDate: paymentData.dueDate,
        notes: paymentData.notes,
      };

      const sale = await createSale(saleData);

      if (!sale || !sale.id) {
        throw new Error("Sale ID tidak ditemukan dalam response");
      }

      setIsPaymentModalOpen(false);

      // ✅ NEW: Get print HTML and print directly
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      let printUrl = "";

      if (paymentData.saleType === "TUNAI") {
        printUrl = `${baseUrl}/sales/${sale.id}/print/thermal`;
        toast.success("Transaksi TUNAI berhasil!");
      } else {
        printUrl = `${baseUrl}/sales/${sale.id}/print/invoice`;
        toast.success("Transaksi KREDIT berhasil!");
      }

      // ✅ FIX: Fetch HTML and print in same tab
      await printInCurrentTab(printUrl);

      // Clear cart
      setCart([]);
      setMemberId("");

      toast.success(`Transaksi ${sale.invoiceNumber} berhasil!`);
    } catch (error: any) {
      console.error("❌ Error creating sale:", error);
      toast.error("Transaksi gagal: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ NEW: Print in current tab
  const printInCurrentTab = async (url: string) => {
    try {
      // Fetch HTML content
      const response = await fetch(url);
      const html = await response.text();

      // Create a new window with the HTML content
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        throw new Error("Pop-up blocked");
      }

      // Write HTML to new window
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();

        // Close window after print
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (error) {
      console.error("Print error:", error);
      // Fallback
      window.open(url, "_blank");
    }
  };

  // ✅ NEW: Function untuk print via iframe
  const printIframe = (url: string) => {
    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;

    document.body.appendChild(iframe);

    // Wait for iframe to load, then print
    iframe.onload = () => {
      try {
        // Trigger print on iframe content
        iframe.contentWindow?.print();

        // Remove iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } catch (error) {
        console.error("Print error:", error);

        // Fallback: open in new tab if iframe print fails
        window.open(url, "_blank");
        document.body.removeChild(iframe);
      }
    };

    // Error handling
    iframe.onerror = () => {
      console.error("Failed to load print content");
      document.body.removeChild(iframe);

      // Fallback: open in new tab
      window.open(url, "_blank");
    };
  };
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-2">
          <Label>Scan Barcode</Label>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <Input id="barcode-input" placeholder="Scan atau ketik barcode..." value={barcode} onChange={(e) => setBarcode(e.target.value)} className="flex-1" autoComplete="off" />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <BarcodeScanner onProductFound={addToCart} />

        <div className="space-y-2">
          <Label>Member (Opsional)</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih member atau kosongkan untuk umum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UMUM">UMUM (Tidak ada member)</SelectItem>
              {members?.map((member: any) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.uniqueId} - {member.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Keranjang Belanja</Label>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Kosongkan
              </Button>
            )}
          </div>

          <div className="rounded-lg border">
            {cart.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Keranjang masih kosong</p>
                  <p className="text-xs text-muted-foreground">Scan barcode untuk menambah produk</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <CartItem key={item.product.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Ringkasan Belanja</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diskon</span>
              <span className="font-medium">{formatCurrency(discount)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <Button className="mt-4 w-full" size="lg" onClick={handleCheckout} disabled={cart.length === 0 || isLoading}>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Checkout ({cart.length} item)
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">Tips:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Scan barcode atau cari manual</li>
            <li>• Pilih member untuk transaksi kredit</li>
            <li>• Klik item untuk edit jumlah</li>
          </ul>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} totalAmount={total} hasMember={!!memberId && memberId !== "UMUM"} onConfirm={handlePaymentComplete} />
    </div>
  );
}

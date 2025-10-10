"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useProductActions } from "@/hooks/useProduct";
import { useTransactionActions } from "@/hooks/useTransaction";
import { CartItem } from "./cart-item";
import { PaymentModal } from "./payment-modal";
import { BarcodeScanner } from "@/components/products/barcode-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ShoppingCart, Trash2, Loader2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Product } from "@/types";
import { apiClient } from "@/lib/api";

interface CartItemType {
  cartId: string;
  product: Product;
  quantity: number;
  subtotal: number;
  priceUsed: number;
}

interface Member {
  id: string;
  uniqueId: string;
  fullName: string;
  regionName: string;
}

// ✅ Removed unused Transaction interface

interface PaymentData {
  saleType: "TUNAI" | "TEMPO";
  paymentReceived: number;
  dpAmount?: number;
  dueDate?: string;
  notes?: string;
}

// ✅ Add proper API response interfaces
interface SaleResponse {
  id: string;
  invoiceNumber: string;
  saleType: string;
  finalAmount: number;
}

export function POSInterface() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [barcode, setBarcode] = useState("");
  const [memberId, setMemberId] = useState<string>("");
  const [memberDisplay, setMemberDisplay] = useState<string>("");
  const [memberSearch, setMemberSearch] = useState<string>("");
  const [memberSuggestions, setMemberSuggestions] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const memberInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { searchByBarcode } = useProductActions();
  const { createSale, isLoading } = useTransactionActions();

  // Focus barcode input on mount
  useEffect(() => {
    const input = document.getElementById("barcode-input") as HTMLInputElement;
    if (input) input.focus();
  }, []);

  // ✅ Get correct price based on member status
  const getPrice = useCallback(
    (product: Product): number => {
      return memberId
        ? product.sellingPriceMember
        : product.sellingPriceGeneral;
    },
    [memberId]
  );

  // ✅ Update all cart prices when member changes
  const updateAllPrices = useCallback(() => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const newPrice = getPrice(item.product);
        return {
          ...item,
          priceUsed: newPrice,
          subtotal: newPrice * item.quantity,
        };
      })
    );
  }, [getPrice]);

  // Auto-update prices when member changes
  useEffect(() => {
    if (cart.length > 0) {
      updateAllPrices();
    }
  }, [memberId, cart.length, updateAllPrices]);

  // Debounced member search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memberSearch.length >= 3) {
        searchMembers(memberSearch);
      } else {
        setMemberSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        memberInputRef.current &&
        !memberInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchMembers = async (query: string) => {
    setIsLoadingMembers(true);
    try {
      const members = await apiClient.get<Member[]>(
        `/members?search=${query}&limit=10`
      );
      setMemberSuggestions(members);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching members:", error);
      setMemberSuggestions([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setMemberId(member.id);
    setMemberDisplay(`${member.uniqueId} - ${member.fullName}`);
    setMemberSearch("");
    setShowSuggestions(false);

    toast.success(
      `Member ${member.fullName} dipilih - Harga berubah ke harga member`
    );
  };

  const handleClearMember = () => {
    setMemberId("");
    setMemberDisplay("");
    setMemberSearch("");
    setMemberSuggestions([]);
    setShowSuggestions(false);

    if (cart.length > 0) {
      toast.info("Member dihapus - Harga kembali ke harga umum");
    }
  };

  const handleMemberInputChange = (value: string) => {
    setMemberSearch(value);
    if (memberId) {
      setMemberId("");
      setMemberDisplay("");
    }
  };

  // ✅ Fix handleBarcodeSubmit - handle response properly
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    try {
      // searchByBarcode returns the full axios response
      const response = await searchByBarcode(barcode);

      // Extract product from response
      // Handle multiple possible response structures
      let product: Product | null = null;

      // Case 1: response.data.data (nested structure)
      if (response?.data?.data) {
        product = response.data.data;
      }
      // Case 2: response.data (direct data)
      else if (response?.data) {
        product = response.data;
      }
      // Case 3: response itself is the product (unlikely but safe)
      else if (response && typeof response === "object" && "id" in response) {
        product = response as unknown as Product;
      }

      if (!product || !product.id) {
        throw new Error("Data produk tidak valid");
      }

      addToCart(product);
      setBarcode("");
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Produk tidak ditemukan";
      toast.error(message);
    }
  };

  const addToCart = (product: Product) => {
    // Validate product data
    if (!product || !product.id) {
      toast.error("Data produk tidak valid");
      return;
    }

    const price = getPrice(product);

    // Validate price
    if (isNaN(price) || price <= 0) {
      toast.error("Harga produk tidak valid");
      console.error("Invalid price data:", { product, price });
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      updateQuantity(existingItem.cartId, existingItem.quantity + 1);
    } else {
      const cartId = `${product.id}-${Date.now()}`;
      setCart([
        ...cart,
        {
          cartId,
          product,
          quantity: 1,
          priceUsed: price,
          subtotal: price,
        },
      ]);
    }
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity,
              subtotal: item.priceUsed * quantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
    toast.success("Item dihapus dari keranjang");
  };

  const clearCart = () => {
    if (window.confirm("Yakin ingin mengosongkan keranjang?")) {
      setCart([]);
      handleClearMember();
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

  // ✅ Fix handlePaymentComplete - handle response properly
  const handlePaymentComplete = async (paymentData: PaymentData) => {
    try {
      const saleData = {
        memberId: memberId || undefined,
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

      // createSale returns the full axios response
      const response = await createSale(saleData);

      // Extract sale from response
      // Handle multiple possible response structures
      let sale: SaleResponse | null = null;

      // Case 1: response.data.data (nested structure)
      if (response?.data?.data) {
        sale = response.data.data;
      }
      // Case 2: response.data (direct data)
      else if (response?.data) {
        sale = response.data;
      }
      // Case 3: response itself is the sale (unlikely but safe)
      else if (response && typeof response === "object" && "id" in response) {
        sale = response as unknown as SaleResponse;
      }

      console.log("Sale response:", response);
      console.log("Sale data:", sale);

      if (!sale || !sale.id) {
        throw new Error("Sale ID tidak ditemukan dalam response");
      }

      setIsPaymentModalOpen(false);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      let printUrl = "";

      if (paymentData.saleType === "TUNAI") {
        printUrl = `${baseUrl}/sales/${sale.id}/print/thermal`;
        toast.success("Transaksi TUNAI berhasil!");
      } else {
        printUrl = `${baseUrl}/sales/${sale.id}/print/invoice`;
        toast.success("Transaksi KREDIT berhasil!");
      }

      await printInCurrentTab(printUrl);

      setCart([]);
      handleClearMember();

      toast.success(`Transaksi ${sale.invoiceNumber} berhasil!`);
    } catch (error: unknown) {
      console.error("❌ Error creating sale:", error);
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Transaksi gagal: " + message);
    }
  };

  const printInCurrentTab = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        throw new Error("Pop-up blocked");
      }

      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } catch (error) {
      console.error("Print error:", error);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="space-y-2">
          <Label>Scan Barcode</Label>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <Input
              id="barcode-input"
              placeholder="Scan atau ketik barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <BarcodeScanner onProductFound={addToCart} />

        {/* Member Autocomplete */}
        <div className="space-y-2 relative">
          <Label>Member (Opsional)</Label>
          {memberId ? (
            <div className="flex items-center gap-2">
              <Input value={memberDisplay} disabled className="flex-1" />
              <Button variant="ghost" size="icon" onClick={handleClearMember}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Input
                  ref={memberInputRef}
                  placeholder="Ketik kode atau nama member... (min 3 karakter)"
                  value={memberSearch}
                  onChange={(e) => handleMemberInputChange(e.target.value)}
                  onFocus={() => {
                    if (
                      memberSearch.length >= 3 &&
                      memberSuggestions.length > 0
                    ) {
                      setShowSuggestions(true);
                    }
                  }}
                  autoComplete="off"
                />
                {isLoadingMembers && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              {showSuggestions && memberSearch.length >= 3 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {isLoadingMembers ? (
                    <div className="p-3 text-sm text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Mencari...
                    </div>
                  ) : memberSuggestions.length > 0 ? (
                    <div className="py-1">
                      {memberSuggestions.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMemberSelect(member)}
                          className="w-full px-3 py-2 text-left hover:bg-accent transition-colors cursor-pointer"
                        >
                          <div className="font-medium text-sm">
                            {member.uniqueId} - {member.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.regionName}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-center text-muted-foreground">
                      Tidak ada member ditemukan
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <p className="text-xs text-muted-foreground">
            {memberId
              ? "✅ Menggunakan harga member"
              : "Kosongkan untuk transaksi umum (harga umum)"}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Keranjang Belanja</Label>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive"
              >
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    Keranjang masih kosong
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scan barcode untuk menambah produk
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <CartItem
                    key={item.cartId}
                    item={item}
                    onUpdateQuantity={(productId, quantity) =>
                      updateQuantity(item.cartId, quantity)
                    }
                    onRemove={() => removeFromCart(item.cartId)}
                  />
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
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Checkout ({cart.length} item)
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">Tips:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Scan barcode atau cari manual</li>
            <li>• Pilih member untuk harga member & transaksi kredit</li>
            <li>• Klik item untuk edit jumlah</li>
          </ul>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        hasMember={!!memberId}
        onConfirm={handlePaymentComplete}
      />
    </div>
  );
}

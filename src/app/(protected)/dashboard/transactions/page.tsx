// src/app/(protected)/dashboard/products/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Plus, Trash2, Search, ShoppingCart, User, DollarSign, Printer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient, handleApiError } from "@/lib/api";
import { Product, Member, Transaction, TransactionType } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export default function ProductTransactionsPage() {
  // States
  const [searchProduct, setSearchProduct] = useState("");
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.CASH);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // Fetch data
  const { data: products } = useSWR<Product[]>("/products", (url) => apiClient.get<Product[]>(url));
  const { data: members } = useSWR<Member[]>("/members", (url) => apiClient.get<Member[]>(url));

  // Filter products
  const filteredProducts = products?.filter((p) => p.isActive && p.stock > 0 && (p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.barcode.toLowerCase().includes(searchProduct.toLowerCase())));

  // Filter members
  const filteredMembers = members?.filter((m) => m.isActive && (m.fullName.toLowerCase().includes(searchMember.toLowerCase()) || m.uniqueId.toLowerCase().includes(searchMember.toLowerCase()) || m.nik.includes(searchMember)));

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal - discount;
  const changeAmount = transactionType === TransactionType.CASH ? Math.max(0, paidAmount - total) : 0;

  // Auto-calculate paid amount for cash
  useEffect(() => {
    if (transactionType === TransactionType.CASH && paidAmount === 0 && total > 0) {
      setPaidAmount(total);
    }
  }, [total, transactionType, paidAmount]);

  // Add to cart
  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Stok tidak mencukupi");
        return;
      }
      updateCartQuantity(product.id, existingItem.quantity + 1);
    } else {
      const price = selectedMember ? product.sellingPriceMember : product.sellingPriceGeneral;
      setCart([
        ...cart,
        {
          product,
          quantity: 1,
          price,
          subtotal: price,
        },
      ]);
      toast.success(`${product.name} ditambahkan ke keranjang`);
    }
  };

  // Update cart quantity
  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart(
      cart.map((item) => {
        if (item.product.id === productId) {
          if (newQuantity > item.product.stock) {
            toast.error("Stok tidak mencukupi");
            return item;
          }
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.price * newQuantity,
          };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedMember(null);
    setDiscount(0);
    setPaidAmount(0);
    setNotes("");
    setSearchProduct("");
    setSearchMember("");
    setTransactionType(TransactionType.CASH);
  };

  // Select member
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchMember("");

    // Update cart prices to member price
    setCart(
      cart.map((item) => {
        const price = item.product.sellingPriceMember;
        return {
          ...item,
          price,
          subtotal: price * item.quantity,
        };
      })
    );
  };

  // Remove member
  const handleRemoveMember = () => {
    setSelectedMember(null);
    setTransactionType(TransactionType.CASH);

    // Update cart prices to general price
    setCart(
      cart.map((item) => {
        const price = item.product.sellingPriceGeneral;
        return {
          ...item,
          price,
          subtotal: price * item.quantity,
        };
      })
    );
  };

  // Process transaction
  const handleProcessTransaction = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    if (transactionType === TransactionType.CASH && paidAmount < total) {
      toast.error("Jumlah pembayaran kurang");
      return;
    }

    if (transactionType === TransactionType.CREDIT && !selectedMember) {
      toast.error("Pilih anggota untuk transaksi kredit");
      return;
    }

    setIsProcessing(true);
    try {
      const data = {
        memberId: selectedMember?.id,
        transactionType,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        discount: discount || 0,
        paidAmount: transactionType === TransactionType.CASH ? paidAmount : 0,
        notes: notes || undefined,
      };

      const result = await apiClient.post<Transaction>("/transactions", data);
      toast.success("Transaksi berhasil diproses");

      // Set completed transaction and open print dialog
      setCompletedTransaction(result);
      setPrintDialogOpen(true);

      clearCart();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transaksi Produk (POS)</h1>
        <p className="text-muted-foreground">Point of Sale - Kasir</p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side - Products & Member */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Anggota (Opsional)</CardTitle>
              <CardDescription>Untuk harga anggota dan transaksi kredit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedMember ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedMember.fullName}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedMember.uniqueId}</p>
                      <p className="text-sm text-muted-foreground">Total Hutang: {formatCurrency(selectedMember.totalDebt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveMember}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Cari anggota (Nama/ID/NIK)..." value={searchMember} onChange={(e) => setSearchMember(e.target.value)} className="pl-9" />
                  </div>
                  {searchMember && filteredMembers && filteredMembers.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredMembers.slice(0, 5).map((member) => (
                        <button key={member.id} onClick={() => handleSelectMember(member)} className="w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0">
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.uniqueId} • {member.whatsapp}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle>Cari Produk</CardTitle>
              <CardDescription>Scan barcode atau ketik nama produk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Scan barcode atau cari produk..." value={searchProduct} onChange={(e) => setSearchProduct(e.target.value)} className="pl-9" autoFocus />
              </div>
            </CardContent>
          </Card>

          {/* Product List */}
          {searchProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Hasil Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProducts && filteredProducts.length > 0 ? (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode} • Stok: {product.stock} {product.unit}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {selectedMember ? formatCurrency(product.sellingPriceMember) : formatCurrency(product.sellingPriceGeneral)}
                            {selectedMember && <span className="ml-2 text-xs text-muted-foreground line-through">{formatCurrency(product.sellingPriceGeneral)}</span>}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => handleAddToCart(product)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Produk tidak ditemukan</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Cart */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Keranjang</span>
                <Badge variant="secondary">{cart.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Keranjang kosong</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1} className="h-7 w-7 p-0">
                            -
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="h-7 w-7 p-0">
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)} className="h-7 w-7 p-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  {/* Discount */}
                  <div className="space-y-2 pt-4 border-t">
                    <label className="text-sm font-medium">Diskon (Rp)</label>
                    <Input type="number" min="0" max={subtotal} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="0" />
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Metode Pembayaran</label>
                    <Select value={transactionType} onValueChange={(value) => setTransactionType(value as TransactionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TransactionType.CASH}>Tunai</SelectItem>
                        <SelectItem value={TransactionType.CREDIT} disabled={!selectedMember}>
                          Kredit (Hutang) {!selectedMember && "- Pilih anggota dulu"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Paid Amount (Cash only) */}
                  {transactionType === TransactionType.CASH && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jumlah Bayar</label>
                      <Input type="number" min={total} value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value) || 0)} placeholder={total.toString()} />
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catatan (Opsional)</label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan transaksi..." />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Diskon:</span>
                        <span className="font-medium text-destructive">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>TOTAL:</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                    {transactionType === TransactionType.CASH && paidAmount >= total && (
                      <div className="flex justify-between text-sm">
                        <span>Kembalian:</span>
                        <span className="font-medium text-green-600">{formatCurrency(changeAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    <Button className="w-full" size="lg" onClick={handleProcessTransaction} disabled={isProcessing || (transactionType === TransactionType.CASH && paidAmount < total)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      {isProcessing ? "Memproses..." : "Proses Transaksi"}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clearCart} disabled={isProcessing}>
                      Clear Keranjang
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print Struk</DialogTitle>
            <DialogDescription>Preview struk sebelum print</DialogDescription>
          </DialogHeader>

          {completedTransaction && (
            <>
              {/* Print Preview */}
              <div id="receipt-preview" className="print-receipt border rounded-lg p-4 bg-white">
                <div className="receipt-content">
                  {/* Header */}
                  <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-300">
                    <h1 className="text-xl font-bold">KOPERASIMART</h1>
                    <p className="text-xs mt-1">Jl. Contoh No. 123, Bandung</p>
                    <p className="text-xs">Telp: (022) 1234567</p>
                  </div>

                  {/* Transaction Info */}
                  <div className="text-xs mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>No Invoice:</span>
                      <span className="font-mono font-semibold">{completedTransaction.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{formatDateTime(completedTransaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{completedTransaction.cashierName}</span>
                    </div>
                    {completedTransaction.memberName && (
                      <>
                        <div className="flex justify-between">
                          <span>Anggota:</span>
                          <span>{completedTransaction.memberName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ID Anggota:</span>
                          <span className="font-mono">{completedTransaction.memberUniqueId}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Tipe:</span>
                      <span className="font-semibold">{completedTransaction.transactionType === TransactionType.CASH ? "TUNAI" : "KREDIT"}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-1">Item</th>
                          <th className="text-center py-1">Qty</th>
                          <th className="text-right py-1">Harga</th>
                          <th className="text-right py-1">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedTransaction.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-2">{item.productName}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">{formatCurrency(item.price)}</td>
                            <td className="text-right font-medium">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(completedTransaction.subtotal)}</span>
                    </div>
                    {completedTransaction.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Diskon:</span>
                        <span className="font-medium">-{formatCurrency(completedTransaction.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(completedTransaction.total)}</span>
                    </div>
                    {completedTransaction.transactionType === TransactionType.CASH && (
                      <>
                        <div className="flex justify-between">
                          <span>Bayar:</span>
                          <span className="font-medium">{formatCurrency(completedTransaction.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kembalian:</span>
                          <span className="font-medium">{formatCurrency(completedTransaction.changeAmount)}</span>
                        </div>
                      </>
                    )}
                    {completedTransaction.pointsEarned > 0 && (
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span>Poin Didapat:</span>
                        <span className="font-bold">+{completedTransaction.pointsEarned} poin</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-300 text-xs">
                    <p className="font-semibold">Terima kasih atas kunjungan Anda!</p>
                    <p className="mt-1">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
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
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
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

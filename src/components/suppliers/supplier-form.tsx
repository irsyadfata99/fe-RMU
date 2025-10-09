// src/components/suppliers/supplier-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  supplierSchema,
  SupplierForm as SupplierFormType,
} from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Supplier } from "@/types";

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormType) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SupplierForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: SupplierFormProps) {
  const form = useForm<SupplierFormType>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      contactPerson: "", // Fixed: was using phone
      email: initialData?.email || "",
      description: "", // Fixed: added description
    },
  });

  const handleFormSubmit = (data: SupplierFormType) => {
    console.log("📤 Form data:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Nama Supplier */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Supplier *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: PT. Sumber Makmur"
                  {...field}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Alamat */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alamat lengkap supplier..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nomor Telepon */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Telepon *</FormLabel>
              <FormControl>
                <Input
                  placeholder="08xxxxxxxxxx"
                  {...field}
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Person */}
        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kontak (Opsional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nama orang yang bisa dihubungi"
                  {...field}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Opsional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="supplier@example.com"
                  {...field}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Catatan atau deskripsi tambahan tentang supplier..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

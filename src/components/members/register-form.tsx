// src/components/members/register-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  memberRegistrationSchema,
  MemberRegistrationForm,
} from "@/lib/validations";
import { REGIONS } from "@/constants/regions";
import { Gender } from "@/types";
import { generateMemberUniqueId } from "@/lib/utils";
import { useState, useEffect } from "react";

interface RegisterFormProps {
  onSubmit: (data: MemberRegistrationForm) => void;
  isLoading: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [previewId, setPreviewId] = useState<string>("");

  const form = useForm<MemberRegistrationForm>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      nik: "",
      fullName: "",
      address: "",
      regionCode: "",
      whatsapp: "",
      gender: undefined,
    },
  });

  // Watch regionCode untuk preview ID
  const regionCode = form.watch("regionCode");

  useEffect(() => {
    if (regionCode) {
      // Mock: Generate preview dengan nomor urut 001
      // Di backend nanti akan auto-increment sesuai database
      setPreviewId(generateMemberUniqueId(regionCode, 1));
    } else {
      setPreviewId("");
    }
  }, [regionCode]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Formulir Pendaftaran Anggota</CardTitle>
        <CardDescription>
          Lengkapi data berikut untuk mendaftar sebagai anggota koperasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* NIK */}
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK KTP *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan 16 digit NIK"
                      maxLength={16}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nama Lengkap */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama lengkap"
                      {...field}
                      disabled={isLoading}
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
                  <FormLabel>Alamat Lengkap *</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Masukkan alamat lengkap"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wilayah */}
            <FormField
              control={form.control}
              name="regionCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wilayah *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wilayah" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {/* Preview ID Anggota */}
                  {previewId && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Preview ID Anggota:{" "}
                      <span className="font-semibold text-primary">
                        Akan dibuat otomatis saat registrasi
                      </span>
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* WhatsApp */}
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="08xxxxxxxxxx"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jenis Kelamin */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>{Gender.MALE}</SelectItem>
                      <SelectItem value={Gender.FEMALE}>
                        {Gender.FEMALE}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

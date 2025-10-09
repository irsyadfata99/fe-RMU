// src/components/members/member-edit-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Member, Gender } from "@/types";
import { REGIONS } from "@/constants/regions";

const memberEditSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  regionCode: z.string().min(1, "Pilih wilayah"),
  whatsapp: z.string().regex(/^08\d{8,11}$/, "Format nomor tidak valid"),
  gender: z.nativeEnum(Gender),
});

type MemberEditFormType = z.infer<typeof memberEditSchema>;

interface MemberEditFormProps {
  initialData: Member;
  onSubmit: (data: MemberEditFormType) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function MemberEditForm({ initialData, onSubmit, onCancel, isLoading }: MemberEditFormProps) {
  const form = useForm<MemberEditFormType>({
    resolver: zodResolver(memberEditSchema),
    defaultValues: {
      fullName: initialData.fullName,
      address: initialData.address,
      regionCode: initialData.regionCode,
      whatsapp: initialData.whatsapp,
      gender: initialData.gender,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-semibold">NIK: {initialData.nik}</p>
          <p className="text-xs text-muted-foreground mt-1">NIK tidak dapat diubah</p>
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap *</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor WhatsApp *</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Kelamin *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>{Gender.MALE}</SelectItem>
                  <SelectItem value={Gender.FEMALE}>{Gender.FEMALE}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regionCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wilayah *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat *</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

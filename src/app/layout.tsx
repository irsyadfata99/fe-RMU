// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MSWProvider } from "@/components/providers/msw-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Koperasi POS - Sistem Point of Sale",
  description: "Sistem Point of Sale untuk Koperasi Yamughni",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <MSWProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </MSWProvider>
      </body>
    </html>
  );
}

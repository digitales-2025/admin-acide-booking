import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { Providers } from "@/providers/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotel Prototype",
  description: "Panel administrativo de Hotel Prototype",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`relative ${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          {children}
          <Toaster
            richColors
            position="bottom-right"
            theme="light"
            toastOptions={{
              style: {
                background: "var(--color-card)",
                color: "var(--color-card-foreground)",
                border: "2px solid var(--color-primary)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                fontSize: "14px",
                padding: "16px",
                maxWidth: "380px",
              },
              duration: 4000,
              className: "toast-custom",
            }}
            className="toast-container"
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}

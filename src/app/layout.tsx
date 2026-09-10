import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SIES_Notes — Classroom Social Tracker",
  description: "Classroom notes social tracker for BScIT, SIES Nerul. Dev: @benpy606.",
  authors: [{ name: "@benpy606" }],
};

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full dark ${plusJakartaSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

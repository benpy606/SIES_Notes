import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sies-notes.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SIES_Notes — Classroom Social Tracker for BScIT",
    template: "%s | SIES_Notes",
  },
  description:
    "Classroom notes and study material social tracker for BScIT students at SIES College Nerul. Access handwritten lecture photos, PDF note documents, and study resources. Dev: @benpy606.",
  keywords: [
    "SIES_Notes",
    "SIES Nerul",
    "BScIT Notes",
    "Classroom Notes",
    "College Study Material",
    "Lecture Photos",
    "PDF Notes",
  ],
  authors: [{ name: "@benpy606" }],
  creator: "@benpy606",
  publisher: "SIES_Notes BScIT Cohort",
  openGraph: {
    title: "SIES_Notes — Classroom Social Tracker for BScIT",
    description:
      "Share and access handwritten lecture photos, PDF note documents, and study resources for BScIT students at SIES Nerul.",
    url: siteUrl,
    siteName: "SIES_Notes",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIES_Notes — Classroom Social Tracker for BScIT",
    description: "Classroom notes social tracker for BScIT students at SIES Nerul. Dev: @benpy606.",
    creator: "@benpy606",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e2e8f0" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}

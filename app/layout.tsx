import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ReportIssue from "@/components/ReportIssue";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "dealwise — Know Your Real Rate Before You Sign",
  description:
    "Paste your freelance contract and instantly discover your ACTUAL effective hourly rate. dealwise analyzes contract terms like unlimited revisions, delayed payments, scope creep language, and missing kill fees so you never undercharge again.",
  keywords: [
    "freelance contract analyzer",
    "effective hourly rate calculator",
    "freelancer tools",
    "contract red flags",
    "scope creep detection",
    "contract analysis AI",
    "freelancer contract review",
  ],
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "dealwise — Know Your Real Rate Before You Sign",
    description:
      "Upload your freelance contract. Get your real effective hourly rate in 30 seconds. Free, AI-powered, no signup required.",
    type: "website",
    siteName: "dealwise",
  },
  twitter: {
    card: "summary_large_image",
    title: "dealwise — Know Your Real Rate Before You Sign",
    description:
      "Upload your freelance contract. Get your real effective hourly rate in 30 seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} ${dmSerif.variable}`}>
      <body className="bg-[#FAFBFE] text-[#111827]">
        <AuthProvider>
            {children}
            <ReportIssue />
        </AuthProvider>
      </body>
    </html>
  );
}

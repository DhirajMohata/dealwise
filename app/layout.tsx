import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { CreditsProvider } from "@/components/CreditsProvider";
import PostHogProvider from "@/components/PostHogProvider";
import ReportIssue from "@/components/ReportIssue";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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
    "Upload any freelance contract. In 30 seconds, see your real effective hourly rate after hidden clauses. Detect 30+ red flags. Free AI-powered analysis.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.className} ${dmSerif.variable}`}>
      <body className="bg-white text-gray-900">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <PostHogProvider>
              <CreditsProvider>
                {children}
                <ReportIssue />
              </CreditsProvider>
            </PostHogProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

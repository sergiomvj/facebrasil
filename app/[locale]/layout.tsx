import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova Facebrasil",
  description: "A revista da comunidade brasileira nos EUA",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <NextIntlClientProvider messages={messages}>
        <html lang={locale} suppressHydrationWarning>
          <body className={`${inter.className} dark:bg-slate-950 bg-white dark:text-slate-50 text-gray-900 ethereal-bg`} suppressHydrationWarning>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
            <ClientLayout>
              {children}
            </ClientLayout>
          </body>
        </html>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}

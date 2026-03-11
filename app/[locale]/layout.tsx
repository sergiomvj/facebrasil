import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/contexts/AuthContext';
import { CronInitializer } from '@/components/CronInitializer';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const supabase = await createClient();

  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();

  const siteName = settings?.site_name || t('title');
  const siteDesc = settings?.site_description || t('description');
  const ogImage = settings?.og_image_url || `https://fbr.news/icon.png`; // Fallback icon

  return {
    metadataBase: new URL('https://fbr.news'),
    title: {
      template: settings?.meta_title_template || `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDesc,
    openGraph: {
      title: siteName,
      description: siteDesc,
      images: [ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDesc,
      images: [ogImage],
    }
  };
}

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
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <html lang={locale} suppressHydrationWarning>
          <body className={`${inter.className} dark:bg-slate-950 bg-white dark:text-slate-50 text-gray-900 ethereal-bg`} suppressHydrationWarning>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
            <CronInitializer />
            <ClientLayout>
              {children}
            </ClientLayout>
          </body>
        </html>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import StaticPageLayout from '@/components/StaticPageLayout';

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id: string }>;
}

export default async function AdvertiseSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params;
  const t = await getTranslations('Advertise');

  return (
    <StaticPageLayout
      title="Pagamento Confirmado!"
      category="Anúncios"
      featuredImage="https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=2000"
      content={
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-150 animate-pulse bg-green-500/20 blur-3xl" />
            <div className="relative flex size-24 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/20">
              <CheckCircle2 className="size-12" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Sua campanha está a caminho!
          </h1>
          
          <p className="mb-10 max-w-xl text-lg text-slate-500 dark:text-slate-400">
            Obrigado por confiar na Facebrasil. Recebemos seu pagamento com sucesso. 
            Nossa equipe comercial já foi notificada e entrará em contato em breve para 
            validar os materiais e o cronograma do seu anúncio.
          </p>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-primary/20 dark:border-white/5 dark:bg-slate-900">
              <Star className="mb-4 size-8 text-primary" />
              <h3 className="mb-2 text-xl font-bold">O que acontece agora?</h3>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="font-bold text-primary">1.</span>
                  Você receberá um e-mail de confirmação.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">2.</span>
                  Nosso time analisará suas informações.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">3.</span>
                  Ativaremos seu pacote de anúncios no portal.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-primary/20 dark:border-white/5 dark:bg-slate-900">
              <div className="mb-4 flex size-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Suporte Dedicado</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Qualquer dúvida, você pode falar diretamente com nossa central de anúncios:
              </p>
              <div className="mt-4 text-sm font-bold text-primary">
                ads@facebrasil.com
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              Ir para o Painel
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      }
    />
  );
}

import React from 'react';
import Link from 'next/link';
import { XCircle, RefreshCw, Mail, MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import StaticPageLayout from '@/components/StaticPageLayout';

interface CancelPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ lead_id: string }>;
}

export default async function AdvertiseCancelPage({ params, searchParams }: CancelPageProps) {
  const { locale } = await params;
  const { lead_id } = await searchParams;
  const t = await getTranslations('Advertise');

  return (
    <StaticPageLayout
      title="Pagamento não concluído"
      category="Anúncios"
      featuredImage="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=2000"
      content={
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-150 animate-pulse bg-red-500/10 blur-3xl" />
            <div className="relative flex size-24 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-xl shadow-red-500/5">
              <XCircle className="size-12" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Ops! Algo deu errado.
          </h1>
          
          <p className="mb-10 max-w-xl text-lg text-slate-500 dark:text-slate-400">
            Parece que o pagamento não foi concluído ou foi cancelado. 
            Não se preocupe, seus dados iniciais já foram registrados e sua 
            oportunidade de anunciar continua válida.
          </p>

          <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-red-200 bg-red-50/10 p-8 text-left transition-all hover:bg-red-50/20 dark:border-red-500/10 dark:bg-red-950/20">
              <RefreshCw className="mb-4 size-8 text-red-500" />
              <h3 className="mb-2 text-xl font-bold">Tentar Novamente?</h3>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                Você pode voltar para o formulário e tentar o pagamento novamente com 
                outro método ou conferir seus dados.
              </p>
              <Link
                href={`/${locale}/advertise`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Voltar ao Formulário
              </Link>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50/10 p-8 text-left transition-all hover:bg-blue-50/20 dark:border-blue-500/10 dark:bg-blue-950/20">
              <MessageCircle className="mb-4 size-8 text-blue-500" />
              <h3 className="mb-2 text-xl font-bold">Precisa de Ajuda?</h3>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                Se encontrou algum erro técnico ou prefere pagar por outro método (PIX, Transferência), 
                nossa equipe está pronta para ajudar.
              </p>
              <div className="flex flex-col gap-3">
                <a href="mailto:ads@facebrasil.com" className="flex items-center gap-2 text-sm font-bold text-blue-500 hover:underline">
                  <Mail className="size-4" />
                  ads@facebrasil.com
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

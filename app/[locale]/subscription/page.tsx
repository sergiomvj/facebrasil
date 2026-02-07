import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function SubscriptionPage() {
  const cmsContent = await CMSStaticPage({ slug: 'subscription' });
  if (cmsContent) return cmsContent;

  return (
    <StaticPageLayout
      title="ASSINATURA IMPRESSA"
      category="Revista"
      featuredImage="https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=2000"
      content={
        <>
          <p>
            Não perca nenhuma edição. Receba a Facebrasil Magazine no conforto da sua casa ou
            em seu escritório em qualquer lugar dos Estados Unidos.
          </p>
          <h2>Planos disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 not-prose">
            <div className="p-8 rounded-3xl border-2 border-primary bg-primary/5 shadow-xl relative">
              <span className="absolute top-4 right-4 bg-primary text-white text-[10px] px-2 py-1 rounded-full font-bold">RECOMENDADO</span>
              <h3 className="text-xl font-bold mb-1">Anual</h3>
              <div className="text-3xl font-black text-primary mb-4">$59.90 <span className="text-xs text-slate-500">/ano</span></div>
              <p className="text-sm text-slate-500 mb-6">12 edições enviadas mensalmente com brindes exclusivos.</p>
              <button className="w-full py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20">ASSINAR AGORA</button>
            </div>
            <div className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 dark:bg-slate-800">
              <h3 className="text-xl font-bold mb-1">Semestral</h3>
              <div className="text-3xl font-black dark:text-white text-gray-900 mb-4">$34.90 <span className="text-xs text-slate-500">/6 meses</span></div>
              <p className="text-sm text-slate-500 mb-6">6 edições enviadas para sua casa.</p>
              <button className="w-full py-3 bg-white dark:bg-slate-900 border border-primary text-primary rounded-xl font-black">QUERO ESSE</button>
            </div>
          </div>
          <p className="text-sm text-center text-slate-500">
            Dúvidas sobre assinaturas? Ligue para +1 (407) 000-0000.
          </p>
        </>
      }
    />
  );
}

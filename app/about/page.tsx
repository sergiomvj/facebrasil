import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function AboutPage() {
    const cmsContent = await CMSStaticPage({ slug: 'about' });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="SOBRE NÓS"
            category="Suporte"
            content={
                <>
                    <p>
                        A Facebrasil é mais que uma revista; é a voz e o coração da comunidade brasileira nos Estados Unidos.
                        Fundada com o propósito de informar, integrar e celebrar a cultura brasileira na América, nos tornamos
                        a maior referência editorial para brasileiros vivendo na Flórida e em outros estados americanos.
                    </p>
                    <h2>Nossa Missão</h2>
                    <p>
                        Conectar brasileiros, oferecer guias essenciais sobre vida nos EUA e ser a ponte entre oportunidades
                        e o sucesso da nossa gente em solo americano.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10 not-prose">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5">
                            <h3 className="text-xl font-bold mb-2">Comunidade</h3>
                            <p className="text-sm text-slate-500">Mais de 15 anos sendo o elo central dos brasileiros no exterior.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5">
                            <h3 className="text-xl font-bold mb-2">Credibilidade</h3>
                            <p className="text-sm text-slate-500">Conteúdo verificado e parcerias com as maiores referências do mercado.</p>
                        </div>
                    </div>
                </>
            }
        />
    );
}

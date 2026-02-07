import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
    const { locale } = await params;
    const cmsContent = await CMSStaticPage({ slug: 'privacy', locale });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="POLÍTICA DE PRIVACIDADE"
            category="Suporte"
            featuredImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
            content={
                <>
                    <p className="italic">Última atualização: 06 de Fevereiro de 2026</p>
                    <h2>1. Introdução</h2>
                    <p>
                        A Facebrasil respeita a sua privacidade e está comprometida em proteger os seus dados pessoais.
                        Esta política descreve como coletamos e usamos informações quando você visita nosso portal.
                    </p>
                    <h2>2. Coleta de Dados</h2>
                    <p>
                        Coletamos informações que você nos fornece diretamente, como nome e e-mail ao assinar nossa newsletter,
                        e dados técnicos automáticos, como seu endereço IP e cookies, para melhorar sua experiência de navegação.
                    </p>
                    <h2>3. Segurança</h2>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra
                        acesso não autorizado ou perda.
                    </p>
                </>
            }
        />
    );
}

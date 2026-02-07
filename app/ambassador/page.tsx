import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function AmbassadorPage() {
    const cmsContent = await CMSStaticPage({ slug: 'ambassador' });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="SEJA NOSSO EMBAIXADOR"
            category="Revista"
            featuredImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2000"
            content={
                <>
                    <p>
                        Você é apaixonado pela comunidade brasileira e tem influência em sua região?
                        O programa de Embaixadores da Facebrasil busca pessoas dinâmicas que querem representar
                        nossa marca e expandir nosso impacto nos Estados Unidos.
                    </p>
                    <h2>Por que ser um Embaixador?</h2>
                    <ul>
                        <li>Acesso exclusivo a eventos VIP da Facebrasil.</li>
                        <li>Conexão com os maiores empresários brasileiros na América.</li>
                        <li>Destaque em nossas redes sociais e edições impressas.</li>
                        <li>Benefícios e bonificações por expansão de distribuição.</li>
                    </ul>
                    <h2>Como participar?</h2>
                    <p>
                        Envie seu perfil e por que você acredita que seria um bom embaixador para
                        <span className="text-primary font-bold"> embaixadores@facebrasil.com</span>.
                    </p>
                </>
            }
        />
    );
}

import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function TermsPage() {
    const cmsContent = await CMSStaticPage({ slug: 'terms' });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="TERMOS DE USO"
            category="Suporte"
            featuredImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000"
            content={
                <>
                    <p className="italic">Última atualização: 06 de Fevereiro de 2026</p>
                    <h2>1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar o portal Facebrasil, você concorda em cumprir estes termos de serviço, todas as leis e
                        regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar este site.
                    </p>
                    <h2>2. Uso de Conteúdo</h2>
                    <p>
                        O conteúdo da Facebrasil (textos, imagens, vídeos) é protegido por direitos autorais. É permitida a
                        visualização e o compartilhamento através de links oficiais, mas é proibida a reprodução total ou
                        parcial sem autorização prévia por escrito.
                    </p>
                    <h2>3. Responsabilidade</h2>
                    <p>
                        A Facebrasil não se responsabiliza por opiniões expressas em comentários ou por serviços prestados
                        por terceiros cujos links possam aparecer em nosso site.
                    </p>
                </>
            }
        />
    );
}

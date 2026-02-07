import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function AdvertisePage() {
    const cmsContent = await CMSStaticPage({ slug: 'advertise' });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="ANUNCIE CONOSCO"
            category="Revista"
            featuredImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
            content={
                <>
                    <p>
                        Conecte sua marca à maior e mais qualificada audiência brasileira nos Estados Unidos.
                        A Facebrasil oferece soluções cross-media que garantem visibilidade e resultados reais.
                    </p>
                    <h2>Nossos Canais</h2>
                    <div className="space-y-4 not-prose my-10">
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">P</div>
                            <div>
                                <h4 className="font-bold">Revista Impressa</h4>
                                <p className="text-xs text-slate-500 text-pretty">Distribuição em mais de 500 pontos premium na Flórida e EUA.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5">
                            <div className="size-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black">D</div>
                            <div>
                                <h4 className="font-bold">Portal Digital (SEO Enhanced)</h4>
                                <p className="text-xs text-slate-500 text-pretty">Alcance global com conteúdos otimizados por IA.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5">
                            <div className="size-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 font-black">S</div>
                            <div>
                                <h4 className="font-bold">Redes Sociais</h4>
                                <p className="text-xs text-slate-500 text-pretty">Mais de 100k seguidores engajados e apaixonados pelo Brasil.</p>
                            </div>
                        </div>
                    </div>
                    <p>Solicite nosso <strong>Media Kit 2026</strong> através do e-mail <strong>ads@facebrasil.com</strong>.</p>
                </>
            }
        />
    );
}

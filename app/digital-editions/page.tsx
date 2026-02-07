import React from 'react';
import StaticPageLayout from '@/components/StaticPageLayout';
import CMSStaticPage from '@/components/CMSStaticPage';

export default async function DigitalEditionsPage() {
    const cmsContent = await CMSStaticPage({ slug: 'digital-editions' });
    if (cmsContent) return cmsContent;

    return (
        <StaticPageLayout
            title="EDIÇÕES DIGITAIS"
            category="Revista"
            featuredImage="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=2000"
            content={
                <>
                    <p>
                        Acesse nosso acervo completo de edições digitais. Leve a Facebrasil com você
                        em qualquer dispositivo, a qualquer momento.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-10 not-prose">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="group relative aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden border border-white/10 cursor-pointer shadow-lg hover:shadow-primary/20 transition-all">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-black text-2xl group-hover:text-primary transition-colors">
                                    Edição #{160 - i}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/60 backdrop-blur-md text-[10px] text-center font-bold text-white">
                                    VER ONLINE
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-slate-500 italic">
                        Estamos digitalizando todo o nosso acervo histórico. Novas edições são adicionadas mensalmente.
                    </p>
                </>
            }
        />
    );
}

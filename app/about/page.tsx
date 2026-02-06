import React from 'react';
import { LogoSVG } from '@/lib/constants';

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="size-16 text-primary mx-auto mb-6">
                        <LogoSVG />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter dark:text-white text-gray-900 mb-6">
                        SOBRE NÓS
                    </h1>
                    <p className="text-xl dark:text-slate-400 text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto">
                        A Facebrasil é mais que uma revista; é a voz e o coração da comunidade brasileira nos Estados Unidos.
                    </p>
                </div>

                {/* Content Section */}
                <div className="space-y-12 prose prose-lg dark:prose-invert max-w-none">
                    <section>
                        <h2 className="text-3xl font-black dark:text-white text-gray-900 mb-4 border-l-4 border-primary pl-4">
                            Nossa Missão
                        </h2>
                        <p className="dark:text-slate-300 text-gray-700">
                            Conectar, informar e empoderar brasileiros que escolheram a América como lar. Através de conteúdo relevante, histórias inspiradoras e serviços de utilidade pública, buscamos fortalecer os laços da nossa comunidade e celebrar nossa cultura vibrante.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black dark:text-white text-gray-900 mb-4 border-l-4 border-primary pl-4">
                            O que fazemos
                        </h2>
                        <p className="dark:text-slate-300 text-gray-700">
                            Desde notícias de última hora até guias práticos sobre imigração, saúde e estilo de vida, a Facebrasil oferece uma visão abrangente do que acontece na intersecção entre o Brasil e os EUA. Nossa plataforma digital e edições impressas são referências para quem busca informação de qualidade com uma perspectiva local.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
                        <div className="p-8 rounded-2xl dark:bg-slate-900 bg-gray-50 border dark:border-white/10 border-gray-200">
                            <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">Comunidade</h3>
                            <p className="text-sm dark:text-slate-400 text-gray-600">
                                Fomentamos o networking e o suporte mútuo entre empreendedores e famílias brasileiras.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl dark:bg-slate-900 bg-gray-50 border dark:border-white/10 border-gray-200">
                            <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">Inovação</h3>
                            <p className="text-sm dark:text-slate-400 text-gray-600">
                                Utilizamos as mais recentes tecnologias de IA para enriquecer nossas análises e entregar notícias com mais contexto.
                            </p>
                        </div>
                    </div>

                    <section className="text-center py-12 border-t dark:border-white/10 border-gray-200">
                        <h2 className="text-2xl font-black dark:text-white text-gray-900 mb-6 font-serif italic text-primary">
                            "Levando o Brasil até você, não importa onde você esteja."
                        </h2>
                        <p className="dark:text-slate-500 text-gray-500">
                            © Facebrasil Magazine - Todos os direitos reservados.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-black tracking-tighter dark:text-white text-gray-900 mb-12 text-center">
                    TERMOS DE USO
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <p className="dark:text-slate-400 text-gray-600 italic">Última atualização: 06 de Fevereiro de 2026</p>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">1. Aceitação dos Termos</h2>
                        <p>Ao acessar o portal Facebrasil, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar este site.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">2. Uso de Conteúdo</h2>
                        <p>O conteúdo da Facebrasil (textos, imagens, vídeos) é protegido por direitos autorais. É permitida a visualização e o compartilhamento através de links oficiais, mas é proibida a reprodução total ou parcial sem autorização prévia por escrito.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">3. Comunidade e Gamificação</h2>
                        <p>Ao participar de nosso sistema de recompensas e áreas de comentários, você se compromete a manter uma conduta ética e respeitosa. Reservamo-nos o direito de suspender contas que violem nossas diretrizes de comunidade.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">4. Responsabilidade</h2>
                        <p>A Facebrasil não se responsabiliza por opiniões expressas em comentários ou por serviços prestados por terceiros cujos links possam aparecer em nosso site.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">5. Alterações</h2>
                        <p>Podemos revisar estes termos a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

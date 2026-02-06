import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-black tracking-tighter dark:text-white text-gray-900 mb-12 text-center">
                    POLÍTICA DE PRIVACIDADE
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <p className="dark:text-slate-400 text-gray-600 italic">Última atualização: 06 de Fevereiro de 2026</p>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">1. Introdução</h2>
                        <p>A Facebrasil respeita a sua privacidade e está comprometida em proteger os seus dados pessoais. Esta política descreve como coletamos e usamos informações quando você visita nosso portal.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">2. Coleta de Dados</h2>
                        <p>Coletamos informações que você nos fornece diretamente, como nome e e-mail ao assinar nossa newsletter, e dados técnicos automáticos, como seu endereço IP e cookies, para melhorar sua experiência de navegação.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">3. Uso das Informações</h2>
                        <p>Os dados coletados são utilizados para:</p>
                        <ul>
                            <li>Personalizar sua experiência no portal.</li>
                            <li>Enviar newsletters e comunicações importantes.</li>
                            <li>Analisar o tráfego e melhorar nossos serviços.</li>
                            <li>Gerenciar o sistema de gamificação e recompensas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">4. Segurança</h2>
                        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado ou perda.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900">5. Seus Direitos</h2>
                        <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento através do nosso contato de suporte.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

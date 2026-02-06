import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 dark:bg-slate-950 bg-white">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter dark:text-white text-gray-900 mb-6">
                                CONTATO
                            </h1>
                            <p className="text-xl dark:text-slate-400 text-gray-600 leading-relaxed max-w-md">
                                Alguma dúvida, sugestão ou proposta comercial? Nossa equipe está pronta para te atender.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Mail className="size-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white text-gray-900">Email</h4>
                                    <p className="dark:text-slate-400 text-gray-600">contato@facebrasil.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Phone className="size-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white text-gray-900">Telefone</h4>
                                    <p className="dark:text-slate-400 text-gray-600">+1 (407) 000-0000</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <MapPin className="size-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white text-gray-900">Endereço</h4>
                                    <p className="dark:text-slate-400 text-gray-600">Orlando, FL - United States</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="dark:bg-slate-900 bg-gray-50 p-10 rounded-3xl border dark:border-white/10 border-gray-200 shadow-xl">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold dark:text-slate-400 text-gray-600">Nome</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white dark:bg-slate-800 border dark:border-white/10 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold dark:text-slate-400 text-gray-600">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white dark:bg-slate-800 border dark:border-white/10 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold dark:text-slate-400 text-gray-600">Assunto</label>
                                <select className="w-full bg-white dark:bg-slate-800 border dark:border-white/10 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                    <option>Comercial / Anúncios</option>
                                    <option>Redação / Sugestão de Pauta</option>
                                    <option>Suporte Técnico</option>
                                    <option>Outros</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold dark:text-slate-400 text-gray-600">Mensagem</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-white dark:bg-slate-800 border dark:border-white/10 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Como podemos ajudar?"
                                />
                            </div>
                            <button className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                                Enviar Mensagem
                                <Send className="size-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

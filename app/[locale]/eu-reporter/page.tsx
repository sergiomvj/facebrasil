// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Send, Youtube, Instagram, MapPin, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function EuReporterPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        city: '',
        description: '',
        videoUrl: '',
        name: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Basic validation
            if (!formData.city || !formData.description || !formData.videoUrl) {
                throw new Error('Por favor, preencha os campos obrigatórios.');
            }

            const { error: dbError } = await supabase
                .from('user_video_reports')
                .insert({
                    city: formData.city,
                    description: formData.description,
                    video_url: formData.videoUrl,
                    reporter_name: formData.name || 'Anônimo',
                    title: 'Relato da Comunidade', // Default title, or add field
                    status: 'PENDING' // Needs moderation
                });

            if (dbError) throw dbError;

            setSuccess(true);
            setFormData({ city: '', description: '', videoUrl: '', name: '' });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao enviar relato. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-accent-yellow font-bold text-sm tracking-widest uppercase mb-4 block">Comunidade</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mb-6">
                        EU REPÓRTER
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Como postar vídeos da nossa comunidade?
                    </p>
                </div>

                <div className="grid gap-12">
                    {/* Instructions */}
                    <div className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 space-y-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FileText className="text-primary" />
                            O que enviar?
                        </h2>
                        <p className="text-slate-400">
                            Encorajamos você a enviar todo tipo de situação que ocorre na vida real do imigrante brasileiro nos EUA. Desde eventos culturais, flagrantes de trânsito, alertas climáticos, até dicas de utilidade pública.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                <Youtube className="w-8 h-8 text-red-500 mb-3" />
                                <h3 className="font-bold text-white mb-1">YouTube</h3>
                                <p className="text-sm text-slate-500">Poste seu vídeo ou Shorts no YouTube e cole o link abaixo.</p>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                <Instagram className="w-8 h-8 text-pink-500 mb-3" />
                                <h3 className="font-bold text-white mb-1">Instagram</h3>
                                <p className="text-sm text-slate-500">Poste reels ou vídeos no Instagram (perfil público) e envie o link.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                            Envie Seu Relato
                        </h2>

                        {success ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Relato Enviado!</h3>
                                <p className="text-slate-300">Obrigado por contribuir com a comunidade. Nossa equipe irá revisar seu vídeo em breve.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-6 text-primary font-bold hover:underline"
                                >
                                    Enviar outro relato
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Cidade *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Miami, FL"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Seu Nome (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Seu nome"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400">Descrição do Acontecido *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Descreva o que aconteceu no vídeo..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400">Link do Vídeo * (YouTube/Instagram)</label>
                                    <input
                                        required
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" /> ENVIAR RELATO
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}


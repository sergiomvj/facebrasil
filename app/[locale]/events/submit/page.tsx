// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Clock, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function EventSubmitPage() {
    const router = useRouter();
    const { userId } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        state: '',
        location: '',
        event_date: '',
        event_time: '',
        organizer_name: '',
        organizer_email: '',
        organizer_phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('events').insert([{
                ...formData,
                submitted_by: userId,
                status: 'pending'
            }]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/category/eventos');
            }, 2000);
        } catch (error) {
            console.error('Error submitting event:', error);
            alert('Erro ao cadastrar evento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (success) {
        return (
            <div className="min-h-screen dark:bg-slate-950 bg-gray-50 flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black dark:text-white text-gray-900 mb-4">Evento Cadastrado!</h2>
                    <p className="text-slate-400 mb-6">Seu evento está em análise e será publicado em breve.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-gray-50 py-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Home
                </Link>

                <div className="dark:bg-slate-900 bg-white rounded-2xl p-8 border dark:border-white/10 border-gray-200">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Cadastrar Evento</h1>
                        <p className="text-slate-400">Divulgue seu evento gratuitamente para a comunidade brasileira</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                Título do Evento *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ex: Festival Brasileiro de Verão"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                Descrição * (máximo 200 caracteres)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                maxLength={200}
                                rows={3}
                                className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none resize-none"
                                placeholder="Descreva brevemente o evento..."
                            />
                            <p className="text-xs text-slate-500 mt-1">{formData.description.length}/200 caracteres</p>
                        </div>

                        {/* Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                    Cidade *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ex: Miami"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                    Estado *
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    {US_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Venue */}
                        <div>
                            <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                Local *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ex: Brazilian Cultural Center - 123 Main St"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                    Data *
                                </label>
                                <input
                                    type="date"
                                    name="event_date"
                                    value={formData.event_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                    Horário (opcional)
                                </label>
                                <input
                                    type="time"
                                    name="event_time"
                                    value={formData.event_time}
                                    onChange={handleChange}
                                    className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Organizer Info */}
                        <div className="border-t dark:border-white/10 border-gray-200 pt-6 mt-6">
                            <h3 className="font-bold dark:text-white text-gray-900 mb-4">Informações do Organizador</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                        Nome (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="organizer_name"
                                        value={formData.organizer_name}
                                        onChange={handleChange}
                                        className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                            Email (opcional)
                                        </label>
                                        <input
                                            type="email"
                                            name="organizer_email"
                                            value={formData.organizer_email}
                                            onChange={handleChange}
                                            className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="email@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold dark:text-white text-gray-900 mb-2">
                                            Telefone (opcional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="organizer_phone"
                                            value={formData.organizer_phone}
                                            onChange={handleChange}
                                            className="w-full dark:bg-slate-950 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6">
                            <Link href="/" className="flex-1">
                                <button
                                    type="button"
                                    className="w-full dark:bg-slate-800 bg-gray-200 dark:text-white text-gray-900 font-bold py-4 rounded-xl hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar Evento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


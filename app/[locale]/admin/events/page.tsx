// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Clock, Check, X, Trash2 } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    city: string;
    state: string;
    location: string;
    event_date: string;
    event_time: string | null;
    organizer_name: string | null;
    organizer_email: string | null;
    organizer_phone: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function EventsAdminPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    async function fetchEvents() {
        let query = supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data } = await query;
        if (data) setEvents(data);
        setLoading(false);
    }

    useEffect(() => {
        void fetchEvents();
    }, [filter]);

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        await supabase.from('events').update({ status }).eq('id', id);
        fetchEvents();
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar este evento?')) return;
        await supabase.from('events').delete().eq('id', id);
        fetchEvents();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-500';
            case 'rejected': return 'bg-red-500/20 text-red-500';
            default: return 'bg-yellow-500/20 text-yellow-500';
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-black dark:text-white text-gray-900 mb-2">Eventos</h1>
                <p className="text-slate-400 text-sm">Gerenciar eventos da comunidade</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as 'all' | 'pending' | 'approved' | 'rejected')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === f
                            ? 'bg-primary text-white'
                            : 'dark:bg-slate-800 bg-gray-200 dark:text-slate-300 text-gray-700 dark:hover:bg-slate-700 hover:bg-gray-300'
                            }`}
                    >
                        {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                    </button>
                ))}
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Carregando...</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">Nenhum evento encontrado</div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="dark:bg-slate-900 bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold dark:text-white text-gray-900">{event.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(event.status)}`}>
                                            {event.status}
                                        </span>
                                    </div>

                                    <p className="text-slate-400 text-sm mb-4">{event.description}</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                                            {event.event_time && (
                                                <>
                                                    <Clock className="w-4 h-4 ml-2" />
                                                    <span>{event.event_time}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{event.city}, {event.state}</span>
                                        </div>

                                        <div className="text-slate-500 text-xs">
                                            {event.location}
                                        </div>
                                    </div>

                                    {event.organizer_name && (
                                        <div className="mt-4 pt-4 border-t dark:border-white/10 border-gray-200 text-xs text-slate-500">
                                            <strong>Organizador:</strong> {event.organizer_name}
                                            {event.organizer_email && ` • ${event.organizer_email}`}
                                            {event.organizer_phone && ` • ${event.organizer_phone}`}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {event.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(event.id, 'approved')}
                                                className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                                                title="Aprovar"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(event.id, 'rejected')}
                                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                                title="Rejeitar"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="p-2 dark:bg-slate-800 bg-gray-200 dark:text-slate-400 text-gray-600 rounded-lg dark:hover:bg-red-500/20 hover:bg-red-100 dark:hover:text-red-400 hover:text-red-600 transition-colors"
                                        title="Deletar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}


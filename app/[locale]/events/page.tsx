// @ts-nocheck
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getEvents() {
    const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('event_date', { ascending: true });
    return data || [];
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="min-h-screen dark:bg-slate-950 bg-slate-50">
            <Navbar />

            <div className="pt-32 pb-20 px-6">
                <div className="max-w-[1280px] mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black dark:text-white text-gray-900 tracking-tighter mb-4">
                        Eventos da Comunidade
                    </h1>
                    <p className="dark:text-slate-400 text-gray-600 max-w-2xl mx-auto text-lg">
                        Fique por dentro de tudo o que acontece na nossa comunidade brasileira nos Estados Unidos.
                    </p>
                </div>

                <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border dark:border-white/5 border-gray-200">
                            <Calendar className="w-12 h-12 dark:text-slate-700 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold dark:text-slate-400 text-gray-500">Nenhum evento agendado</h3>
                            <p className="dark:text-slate-500 text-gray-400">Volte em breve para novas atualizações.</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="dark:bg-slate-900 bg-white rounded-3xl p-8 border dark:border-white/5 border-gray-200 hover:border-primary transition-all group shadow-sm hover:shadow-xl">
                                <div className="flex items-center gap-2 mb-6 text-primary">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-bold text-sm tracking-widest uppercase">
                                        {new Date(event.event_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black dark:text-white text-gray-900 mb-4 group-hover:text-primary transition-colors">
                                    {event.title}
                                </h3>

                                <p className="dark:text-slate-400 text-gray-600 mb-8 line-clamp-3">
                                    {event.description}
                                </p>

                                <div className="space-y-4 pt-6 border-t dark:border-white/5 border-gray-100 mt-auto">
                                    <div className="flex items-center gap-3 dark:text-slate-300 text-gray-700">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">{event.city}, {event.state}</span>
                                    </div>
                                    <div className="flex items-center gap-3 dark:text-slate-500 text-gray-500 italic">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}


'use client';

import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';

const EventsAgenda: React.FC = () => {
    return (
        <div className="glass-card rounded-2xl p-8 flex flex-col justify-center border-green-500/20 bg-green-500/5 h-full">
            <div className="text-green-500 mb-4 bg-green-500/10 w-fit p-3 rounded-xl">
                <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight dark:text-white text-gray-900">Agenda de Eventos</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Cadastre aqui o seu evento gratuitamente
            </p>
            <div className="space-y-3">
                <Link href="/events/submit">
                    <button className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Cadastrar
                    </button>
                </Link>
                <Link href="/events">
                    <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all active:scale-95">
                        Ver a Agenda
                    </button>
                </Link>
            </div>
            <p className="text-[10px] text-slate-500 mt-6 text-center">
                Divulgue seus eventos para a comunidade brasileira
            </p>
        </div>
    );
};

export default EventsAgenda;

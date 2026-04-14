"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function DateTimeDisplay() {
    const [mounted, setMounted] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setTime(new Date());
        }, 60000); // Update every minute for elegance (no seconds)

        return () => clearInterval(timer);
    }, []);

    if (!mounted) return (
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
    );

    const formatter = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return (
        <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                <Calendar className="w-3 h-3 text-primary" />
                {formatter.format(time)}
            </div>
            <div className="h-3 w-px bg-slate-300 dark:bg-white/10"></div>
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 dark:text-white tracking-widest">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {timeFormatter.format(time)}
            </div>
        </div>
    );
}

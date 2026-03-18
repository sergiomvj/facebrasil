'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, MinusSquare } from 'lucide-react';

interface LeonChatProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function LeonChat({ isOpen, onClose }: LeonChatProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá! Sou o Leon, seu assistente virtual de suporte ao sistema. Como posso ajudar com o painel hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isMinimized && isOpen) {
            scrollToBottom();
        }
    }, [messages, isMinimized, isOpen]);

    // Reset minimized state when opened
    useEffect(() => {
        if (isOpen) {
            setIsMinimized(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/leon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, history: messages }),
            });

            if (!res.ok) throw new Error('Falha ao comunicar com Leon');

            const data = await res.json();
            
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Erro no chat:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, encontrei um erro de conexão. Tente novamente em instantes.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isMinimized) {
        return (
            <div 
                className="fixed bottom-6 right-6 z-[100] bg-primary text-white p-4 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-transform flex items-center gap-2"
                onClick={() => setIsMinimized(false)}
            >
                <Bot className="w-6 h-6" />
                <span className="font-bold hidden sm:inline">Ajuda do Leon</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[85vh] z-[100] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold">Ajuda do Leon</h3>
                        <p className="text-xs text-primary-foreground/80">Suporte ao Sistema</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                        title="Minimizar"
                    >
                        <MinusSquare className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/20 hover:text-red-300 rounded-md transition-colors"
                        title="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-900">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-primary'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                            </div>
                            <div className={`px-4 py-2 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-200 rounded-tl-sm shadow-sm'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-800 rounded-tl-sm shadow-sm flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span className="text-sm text-slate-500">Leon está digitando...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Faça uma pergunta ao Leon..."
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}

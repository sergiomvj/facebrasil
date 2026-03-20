'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import {
  Bot,
  CornerDownLeft,
  FileText,
  HelpCircle,
  Loader2,
  Route,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  resolveAdminHelpEntry,
  type HelpDocEntry,
} from '@/lib/help/admin-help';

interface AdminHelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function buildInitialMessage(entry: HelpDocEntry): Message {
  return {
    role: 'assistant',
    content: `Voce esta em "${entry.label}". Posso ajudar apenas com esta tela. Se a sua duvida for de outro modulo, navegue ate ele e o contexto sera atualizado automaticamente.`,
  };
}

export default function AdminHelpCenter({
  isOpen,
  onClose,
}: AdminHelpCenterProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string | undefined;
  const activeEntry = useMemo(
    () => resolveAdminHelpEntry(pathname, locale),
    [locale, pathname]
  );
  const [messages, setMessages] = useState<Message[]>(() => [
    buildInitialMessage(activeEntry),
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([buildInitialMessage(activeEntry)]);
    setInput('');
    setIsLoading(false);
  }, [activeEntry]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setMessages((current) => [
      ...current,
      { role: 'user', content: userMessage },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/leon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          route: activeEntry.route,
          helpEntry: activeEntry,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o help contextual');
      }

      const data = (await response.json()) as { reply?: string };
      const reply =
        data.reply ??
        'Nao consegui responder agora. Tente novamente em instantes.';

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: reply },
      ]);
    } catch (error) {
      console.error('Erro no help contextual:', error);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'Encontrei um erro de conexao. Tente novamente em instantes.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[89] bg-slate-950/45 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-2xl flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <div className="border-b border-gray-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-[0.18em]">
                  Preciso de Ajuda
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {activeEntry.label}
              </h2>
              <p className="max-w-xl text-sm text-gray-600 dark:text-slate-400">
                Ajuda contextual da pagina atual. O conteudo e o chat acompanham
                a rota que voce esta visualizando.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Fechar ajuda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <section className="border-b border-gray-200 px-5 py-5 dark:border-white/10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gray-900 dark:text-white">
                Ajuda automatica da pagina atual
              </h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm dark:border-primary/20 dark:bg-slate-900">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                  {activeEntry.summary}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-[0.14em]">
                      Objetivo
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                    {activeEntry.purpose}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Route className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-[0.14em]">
                      Rota atendida
                    </h4>
                  </div>
                  <p className="font-mono text-sm text-gray-700 dark:text-slate-300">
                    {activeEntry.routePrefix ?? activeEntry.route}
                  </p>
                  {activeEntry.routePrefix ? (
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      Esta ajuda tambem cobre detalhes dinamicos desta area.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-gray-900 dark:text-white">
                    Elementos principais
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    {activeEntry.elements.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-gray-900 dark:text-white">
                    Uso pratico
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                    {activeEntry.uses.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-5">
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100">
              Ainda tem duvidas? Pergunte ao Leon. Ele responde apenas sobre a
              pagina atual e reinicia o contexto quando voce muda de rota.
            </div>

            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-gray-900 dark:text-white">
                Chat com o agente
              </h3>
            </div>

            <div className="rounded-[1.75rem] border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="max-h-[42vh] overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[88%] gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-primary text-white'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'rounded-tr-sm bg-blue-600 text-white'
                              : 'rounded-tl-sm border border-gray-200 bg-slate-50 text-gray-800 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading ? (
                    <div className="flex justify-start">
                      <div className="flex max-w-[88%] gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          Leon esta analisando esta tela...
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form
                onSubmit={sendMessage}
                className="border-t border-gray-200 px-4 py-4 dark:border-white/10"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={`Pergunte sobre ${activeEntry.label}...`}
                    disabled={isLoading}
                    className="flex-1 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    Enviar
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  O contexto desta conversa e reiniciado automaticamente quando
                  voce muda de pagina no admin.
                </div>
              </form>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

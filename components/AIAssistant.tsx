'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MessageCircle, 
  X, 
  Send, 
  Bot,
  User,
  Loader2,
  BookOpen,
  Lightbulb,
  Languages,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  articleContent?: string;
  articleTitle?: string;
  mode?: 'inline' | 'floating';
}

export default function AIAssistant({ 
  articleContent, 
  articleTitle,
  mode = 'floating' 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'chat' | 'summarize' | 'translate' | 'explain'>('chat');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem inicial contextual
  useEffect(() => {
    if (articleTitle && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou o assistente IA do Facebrasil. Estou aqui para ajudar você com "${articleTitle}". Posso resumir o artigo, explicar conceitos ou responder suas dúvidas.`,
        timestamp: new Date()
      }]);
    }
  }, [articleTitle]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          articleContent,
          articleTitle,
          history: messages.slice(-5) // últimas 5 mensagens para contexto
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[AI Assistant] Error:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async (feature: 'summarize' | 'translate' | 'explain') => {
    setActiveFeature(feature);
    setLoading(true);

    let prompt = '';
    switch (feature) {
      case 'summarize':
        prompt = 'Resuma este artigo em 3 pontos principais, destacando as informações mais importantes para brasileiros nos EUA.';
        break;
      case 'translate':
        prompt = 'Traduza os conceitos mais importantes deste artigo para português, mantendo os termos técnicos em inglês quando apropriado.';
        break;
      case 'explain':
        prompt = 'Explique como este conteúdo se aplica à realidade de brasileiros imigrantes nos Estados Unidos, dando exemplos práticos.';
        break;
    }

    const featureMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, featureMessage]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          articleContent,
          articleTitle,
          feature
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Não consegui processar esta solicitação.',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('[AI Assistant] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Modo inline (dentro do artigo)
  if (mode === 'inline') {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white">Assistente IA</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <FeatureButton 
            icon={BookOpen} 
            label="Resumir" 
            onClick={() => handleFeature('summarize')}
            active={activeFeature === 'summarize'}
          />
          <FeatureButton 
            icon={Languages} 
            label="Explicar" 
            onClick={() => handleFeature('explain')}
            active={activeFeature === 'explain'}
          />
          <FeatureButton 
            icon={Lightbulb} 
            label="Traduzir" 
            onClick={() => handleFeature('translate')}
            active={activeFeature === 'translate'}
          />
        </div>

        <AnimatePresence>
          {messages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 max-h-96 overflow-y-auto"
            >
              {messages.slice(1).map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'assistant' ? 'bg-slate-800/50' : ''} p-4 rounded-xl`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant' ? 'bg-primary/20 text-primary' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200 leading-relaxed">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="mt-2 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 mt-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processando...</span>
          </div>
        )}
      </div>
    );
  }

  // Modo floating (botão flutuante)
  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-white/10 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Assistente IA</h3>
                    <p className="text-xs text-slate-400">Powered by Facebrasil</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Quick Actions */}
              {articleContent && (
                <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto">
                  <QuickActionButton 
                    icon={BookOpen} 
                    label="Resumir"
                    onClick={() => handleFeature('summarize')}
                  />
                  <QuickActionButton 
                    icon={Lightbulb} 
                    label="Explicar"
                    onClick={() => handleFeature('explain')}
                  />
                  <QuickActionButton 
                    icon={Languages} 
                    label="Traduzir"
                    onClick={() => handleFeature('translate')}
                  />
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant' 
                        ? 'bg-gradient-to-br from-primary to-purple-500 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'assistant' 
                        ? 'bg-slate-800 text-slate-200' 
                        : 'bg-primary text-white'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-slate-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte algo..."
                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FeatureButton({ 
  icon: Icon, 
  label, 
  onClick,
  active 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-primary text-white' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 whitespace-nowrap transition-colors"
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

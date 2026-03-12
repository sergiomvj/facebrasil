'use client';

import { useParams } from 'next/navigation';
import {
    Megaphone,
    MousePointerClick,
    Users,
    PenLine,
    ShoppingBag,
    Search,
    Share2,
    Video,
    Palette,
    ExternalLink,
    Lock,
    Layers,
    DollarSign,
    Code2
} from 'lucide-react';

interface FBRSystem {
    id: string;
    name: string;
    description: string;
    folder: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    colorDim: string;
    status: string;
    tags: string[];
    version?: string;
}

const SYSTEMS: FBRSystem[] = [
    {
        id: 'mkt',
        name: 'FBR-MKT',
        description: 'Plataforma de Inteligência de Marketing. Gera estratégias completas de posicionamento, mix de canais, KPIs e calendário editorial em menos de 60 segundos.',
        folder: 'mkt',
        icon: Megaphone,
        color: '#0EA5E9',
        colorDim: 'rgba(14,165,233,0.15)',
        status: '95%',
        tags: ['Marketing', 'IA Estratégica', 'Multi-tenant'],
        version: 'v2.0',
    },
    {
        id: 'leads',
        name: 'FBR-LEADS',
        description: 'Motor de captação e qualificação de leads. Automatiza formulários, segmentação e nutrição com fluxos de email inteligentes e scoring comportamental.',
        folder: 'leads',
        icon: Users,
        color: '#22C55E',
        colorDim: 'rgba(34,197,94,0.15)',
        status: '90%',
        tags: ['Captação', 'Nutrição', 'Automação'],
        version: 'v1.0',
    },
    {
        id: 'click',
        name: 'FBR-CLICK',
        description: 'Sistema de links inteligentes e rastreamento de cliques. Gerencia campanhas com links personalizados, analytics em tempo real e otimização de funil.',
        folder: 'click',
        icon: MousePointerClick,
        color: '#F97316',
        colorDim: 'rgba(249,115,22,0.15)',
        status: '95%',
        tags: ['Links', 'Analytics', 'Rastreamento'],
        version: 'v1.0',
    },
    {
        id: 'sales',
        name: 'FBR-SALES',
        description: 'Plataforma de inteligência comercial. Centraliza propostas, follow-ups automáticos, pipeline visual e previsibilidade de receita com dados em tempo real.',
        folder: 'sales',
        icon: ShoppingBag,
        color: '#F59E0B',
        colorDim: 'rgba(245,158,11,0.15)',
        status: '75%',
        tags: ['CRM', 'Pipeline', 'Previsão de Receita'],
        version: 'v1.0',
    },
    {
        id: 'redacao',
        name: 'FBR-REDAÇÃO',
        description: 'Estúdio de redação assistida por IA. Produz artigos, newsletters e conteúdo editorial com voz de marca consistente e SEO integrado.',
        folder: 'redacao',
        icon: PenLine,
        color: '#8B5CF6',
        colorDim: 'rgba(139,92,246,0.15)',
        status: '98%',
        tags: ['Copywriting', 'Editorial', 'IA Gerativa'],
        version: 'v1.0',
    },
    {
        id: 'design',
        name: 'FBR-DESIGN',
        description: 'Sistema de design operacional. Gerencia brand assets, templates, guias de identidade visual e exportações padronizadas para todos os produtos do grupo.',
        folder: 'design',
        icon: Palette,
        color: '#14B8A6',
        colorDim: 'rgba(20,184,166,0.15)',
        status: '45%',
        tags: ['Branding', 'Assets', 'Design System'],
        version: 'v1.0',
    },
    {
        id: 'video',
        name: 'FBR-VIDEO',
        description: 'Central de vídeo inteligente. Organiza produções, gerencia scripts, tracks de edição e entrega formatos otimizados para cada plataforma de distribuição.',
        folder: 'video',
        icon: Video,
        color: '#A78BFA',
        colorDim: 'rgba(167,139,250,0.15)',
        status: '30%',
        tags: ['Produção', 'Distribuição', 'Formatos'],
        version: 'v1.0',
    },
    {
        id: 'seo',
        name: 'FBR-SEO',
        description: 'Motor de otimização de buscas. Inteligência semântica, análise de concorrentes, sugestão de palavras-chave e auditoria técnica automatizada.',
        folder: 'seo',
        icon: Search,
        color: '#22C55E',
        colorDim: 'rgba(34,197,94,0.15)',
        status: '15%',
        tags: ['SEO', 'Palavras-chave', 'Auditoria'],
        version: 'v1.0',
    },
    {
        id: 'social',
        name: 'FBR-SOCIAL',
        description: 'Hub de gestão de redes sociais. Agenda posts, monitora engajamento, analisa concorrentes e gera relatórios de performance cross-platform.',
        folder: 'social',
        icon: Share2,
        color: '#EC4899',
        colorDim: 'rgba(236,72,153,0.15)',
        status: '45%',
        tags: ['Social Media', 'Agendamento', 'Analytics'],
        version: 'v1.0',
    },
    {
        id: 'dev',
        name: 'FBR-DEV',
        description: 'Central de desenvolvimento do ecossistema FBR. Gerencia projetos, repositórios, deploys, custos de infraestrutura e ciclo de vida de todos os produtos do grupo.',
        folder: 'dev',
        icon: Code2,
        color: '#06B6D4',
        colorDim: 'rgba(6,182,212,0.15)',
        status: '95%',
        tags: ['Desenvolvimento', 'Infra', 'DevOps'],
        version: 'v1.0',
    },
    {
        id: 'finance',
        name: 'FBR-FINANCE',
        description: 'Hub financeiro central do Grupo Facebrasil. Controla recebimentos, pagamentos, centro de custo por empresa, conciliação automática e auditoria imutável.',
        folder: 'finance',
        icon: DollarSign,
        color: '#10B981',
        colorDim: 'rgba(16,185,129,0.15)',
        status: '50%',
        tags: ['Financeiro', 'Conciliação', 'Auditoria'],
        version: 'v1.0',
    },
];

export default function FBRAppsPage() {
    const params = useParams();
    const locale = params.locale as string;

    const getPercentage = (status: string) => parseInt(status.replace('%', '')) || 0;

    const launch19Mar = SYSTEMS.filter(s => getPercentage(s.status) >= 80);
    const launch26Mar = SYSTEMS.filter(s => getPercentage(s.status) >= 45 && getPercentage(s.status) <= 79);
    const launch02Apr = SYSTEMS.filter(s => getPercentage(s.status) < 45);

    const activeSystems = SYSTEMS;

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="p-2.5 rounded-xl"
                        style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)' }}
                    >
                        <Layers className="w-6 h-6" style={{ color: '#F97316' }} />
                    </div>
                    <div>
                        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#F97316' }}>
                            // ecossistema facebrasil
                        </p>
                        <h1 className="text-2xl lg:text-3xl font-black dark:text-white text-gray-900 tracking-tight leading-none mt-0.5">
                            Gestão de Ativos
                        </h1>
                    </div>
                </div>
                <p className="text-sm dark:text-slate-400 text-gray-500 max-w-2xl leading-relaxed">
                    Todos os aplicativos e ferramentas do Grupo Facebrasil em um único hub centralizado.
                    Acesso restrito à equipe administrativa.
                </p>

                {/* Stats bar */}
                <div className="flex flex-wrap gap-8 mt-6 pt-6 border-t dark:border-white/10 border-gray-200">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <p className="text-xs dark:text-slate-500 text-gray-400 uppercase tracking-wider font-semibold">Lançamento em 19/3</p>
                        </div>
                        <p className="text-2xl font-black" style={{ color: '#F97316' }}>{launch19Mar.length} <span className="text-xs font-normal text-slate-500 ml-1">apps</span></p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-xs dark:text-slate-500 text-gray-400 uppercase tracking-wider font-semibold">Lançamento em 26/3</p>
                        </div>
                        <p className="text-2xl font-black dark:text-white text-gray-700">{launch26Mar.length} <span className="text-xs font-normal text-slate-500 ml-1">apps</span></p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <p className="text-xs dark:text-slate-500 text-gray-400 uppercase tracking-wider font-semibold">Lançamento em 02/04</p>
                        </div>
                        <p className="text-2xl font-black" style={{ color: '#64748B' }}>{launch02Apr.length} <span className="text-xs font-normal text-slate-500 ml-1">apps</span></p>
                    </div>
                </div>
            </div>

            {/* Active Systems Grid */}
            <div className="mb-4">
                <p className="text-xs font-mono uppercase tracking-widest dark:text-slate-500 text-gray-400 mb-5">
                    // ecossistema operacional
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activeSystems.map((system) => (
                        <SystemCard key={system.id} system={system} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SystemCard({ system }: { system: FBRSystem }) {
    const Icon = system.icon;
    const isDev = false;

    const cardContent = (
        <div
            className={`
                group relative flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden
                ${isDev
                    ? 'dark:border-white/5 border-gray-200/70 dark:bg-slate-900/30 bg-gray-50/50 cursor-not-allowed opacity-60'
                    : 'dark:border-white/10 border-gray-200 dark:bg-slate-900/50 bg-white hover:shadow-xl cursor-pointer hover:-translate-y-1'
                }
            `}
            style={isDev ? {} : {
                boxShadow: `0 0 0 0 ${system.colorDim}`,
            }}
            onMouseEnter={isDev ? undefined : (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${system.colorDim}`;
                (e.currentTarget as HTMLElement).style.borderColor = system.color + '40';
            }}
            onMouseLeave={isDev ? undefined : (e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '';
                (e.currentTarget as HTMLElement).style.borderColor = '';
            }}
        >
            {/* Top accent line */}
            {!isDev && (
                <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${system.color}, transparent)` }}
                />
            )}

            <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="p-3 rounded-xl"
                        style={{
                            background: system.colorDim,
                            border: `1px solid ${system.color}30`,
                            color: isDev ? '#64748B' : system.color,
                        }}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        {isDev ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border dark:border-white/10 border-gray-200">
                                <Lock className="w-2.5 h-2.5 text-slate-500" />
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Dev</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full dark:bg-green-500/10 bg-green-50 dark:border-green-500/20 border-green-200 border">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-green-600 dark:text-green-400">{system.status}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 dark:text-slate-600 text-gray-300 group-hover:text-current transition-colors" style={{ color: isDev ? undefined : system.color + '80' }} />
                            </>
                        )}
                    </div>
                </div>

                {/* Name & Version */}
                <div className="mb-2">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-lg font-black dark:text-white text-gray-900 tracking-tight">
                            {system.name}
                        </h2>
                        {system.version && (
                            <span
                                className="text-[10px] font-mono"
                                style={{ color: isDev ? '#64748B' : system.color }}
                            >
                                {system.version}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm dark:text-slate-400 text-gray-500 leading-relaxed flex-1 mb-4">
                    {system.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {system.tags.map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border dark:border-white/8 border-gray-200 dark:text-slate-500 text-gray-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    if (isDev) {
        return cardContent;
    }

    return (
        <a
            href={`/fbrapps/${system.folder}/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-full"
        >
            {cardContent}
        </a>
    );
}

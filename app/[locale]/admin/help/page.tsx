'use client';

import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const topics = [
    {
        title: 'Agendador IA',
        content: 'Automatiza a publicação de conteúdos usando inteligência artificial. Você pode definir os prompts, intervalo de postagem e categorias. O sistema vai gerar textos e imagens automaticamente nas datas estipuladas.'
    },
    {
        title: 'Anúncios',
        content: 'Permite gerenciar banners publicitários (Top, Meio, Fim de artigo, Sidebar). Você pode fazer upload da imagem do anúncio, definir o link de destino e visualizar as estatísticas de clique.'
    },
    {
        title: 'Artigos',
        content: 'Seção principal para criação de notícias e matérias. Clique em "Novo Artigo" para usar o editor rico (Rich Text). Você pode formatar o texto, adicionar imagens in-line, escolher o autor, a categoria e a data de publicação (imediata ou programada).'
    },
    {
        title: 'Autores',
        content: 'Cadastro de jornalistas e criadores de conteúdo. Adicione foto, nome, bio e redes sociais. Os autores criados aqui poderão ser selecionados no momento de escrever um Artigo.'
    },
    {
        title: 'Categorias',
        content: 'Gerencie as editorias do portal (Ex: Política, Esportes, Imigração). Cada categoria tem um slug (URL) único e pode ter uma cor ou ícone associado.'
    },
    {
        title: 'Configurações',
        content: 'Ajustes globais do portal. Aqui você define links de redes sociais do rodapé, chaves de API, e outras variáveis de ambiente que afetam o site como um todo.'
    },
    {
        title: 'Conversor de Imagens',
        content: 'Ferramenta utilitária para converter formatos de imagem (ex: PNG para WebP) visando otimização e carregamento mais rápido no site.'
    },
    {
        title: 'Dashboard',
        content: 'A tela inicial do painel. Mostra estatísticas gerais de acesso, métricas mensais de publicação, artigos mais lidos e um resumo das atividades do portal.'
    },
    {
        title: 'Eventos',
        content: 'Agenda da comunidade. Publique festas, shows e encontros. Preencha a data, local, descrição e imagem de capa para que apareçam na seção de Calendário do site.'
    },
    {
        title: 'FacebrasilShop',
        content: 'Gerenciamento da loja virtual integrada. Adicione produtos, defina preços e gerencie o estoque dos itens vendidos pela Facebrasil.'
    },
    {
        title: 'Gamificação',
        content: 'Controle de XP (Experiência) dos Leitores. Defina quantos pontos um usuário ganha por ler um artigo, comentar ou compartilhar. Acompanhe o ranking (Leaderboard).'
    },
    {
        title: 'Hero Diário',
        content: 'A manchete principal do site. Defina qual artigo ou edição terá o maior destaque visual (banner gigante) na página inicial do portal durante aquele dia.'
    },
    {
        title: 'Leitores',
        content: 'Gestão da base de usuários cadastrados (assinantes/leitores). Veja os dados, pontos de XP acumulados e gerencie permissões.'
    },
    {
        title: 'Mídia',
        content: 'A biblioteca central de arquivos. Todos os uploads feitos no site vão para cá (Supabase Storage). Você pode criar pastas, deletar arquivos antigos e copiar URLs de imagens.'
    },
    {
        title: 'Páginas',
        content: 'Criação de páginas estáticas do site (Quem Somos, Termos de Uso, Política de Privacidade). Funciona de forma similar aos Artigos, mas sem data de validade.'
    },
    {
        title: 'Sistemas FBR',
        content: 'Links rápidos para acessar outros sistemas e microsites do ecossistema Facebrasil.'
    },
    {
        title: 'TV Facebrasil',
        content: 'Gerenciador da grade de vídeos. Adicione links do YouTube, defina programas em destaque e organize a reprodução da web TV.'
    },
    {
        title: 'Vídeos Reportados',
        content: 'Área de moderação. Caso algum usuário reporte um problema em um vídeo da TV Facebrasil, a notificação aparecerá aqui para análise da equipe.'
    }
];

export default function HelpManualPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const filteredTopics = topics.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Manual de Operação
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">
                        Tire suas dúvidas e aprenda como utilizar todas as funcionalidades do painel administrativo.
                    </p>
                </div>
            </div>

            {/* Busca */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Pesquise por uma funcionalidade (ex: Mídia, Artigos)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 text-lg transition-shadow"
                />
            </div>

            {/* Lista Acordeão */}
            <div className="space-y-4">
                {filteredTopics.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                        Nenhum resultado encontrado para "{searchTerm}".
                    </div>
                ) : (
                    filteredTopics.map((topic, index) => {
                        const isExpanded = expandedIndex === index;
                        return (
                            <div 
                                key={index} 
                                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50"
                            >
                                <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {topic.title}
                                    </h3>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                    )}
                                </button>
                                
                                {isExpanded && (
                                    <div className="px-6 pb-4 pt-2 border-t border-gray-100 dark:border-slate-700/50">
                                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                                            {topic.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-xl flex items-start gap-4">
                <HelpCircle className="w-8 h-8 text-blue-500 mt-1 shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">Ainda com dúvidas?</h4>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                        Utilize o assistente <strong>"Ajuda do Leon"</strong> no menu lateral para perguntas rápidas ou entre em contato com o <strong>Suporte Dev</strong> para reportar erros.
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Image,
    FolderOpen,
    Video,
    Star,
    DollarSign,
    MonitorPlay,
    Settings,
    Menu,
    X,
    ChevronLeft,
    Calendar,
    Users,
    Trophy
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Artigos', href: '/admin/articles', icon: FileText },
    { name: 'TV Facebrasil', href: '/admin/tv-facebrasil', icon: MonitorPlay },
    { name: 'Mídia', href: '/admin/media', icon: Image },
    { name: 'Categorias', href: '/admin/categories', icon: FolderOpen },
    { name: 'Autores', href: '/admin/authors', icon: Users },
    { name: 'Eventos', href: '/admin/events', icon: Calendar },
    { name: 'Vídeos Reportados', href: '/admin/video-reports', icon: Video },
    { name: 'Hero Diário', href: '/admin/daily-hero', icon: Star },
    { name: 'Anúncios', href: '/admin/ads', icon: DollarSign },
    { name: 'Páginas', href: '/admin/pages', icon: FileText },
    { name: 'Gamificação', href: '/admin/gamification', icon: Trophy },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg dark:bg-slate-800 bg-white border dark:border-white/10 border-gray-200 shadow-lg"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-[55]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-screen dark:bg-slate-900 bg-white border-r dark:border-white/10 border-gray-200 z-[60]
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b dark:border-white/10 border-gray-200">
                        <div className="flex items-center justify-between">
                            {!isCollapsed && (
                                <div>
                                    <h2 className="text-xl font-black dark:text-white text-gray-900">Admin</h2>
                                    <p className="text-xs dark:text-slate-400 text-gray-600">Facebrasil</p>
                                </div>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden lg:block p-2 rounded-lg dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100'
                                        }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t dark:border-white/10 border-gray-200 space-y-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg dark:text-slate-400 text-gray-600 dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {!isCollapsed && <span className="font-medium">Voltar ao Site</span>}
                        </Link>

                        {/* User Profile Section */}
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 ${isCollapsed ? 'justify-center p-2' : ''}`}>
                            <div className="size-8 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-primary/30 flex items-center justify-center">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-4 h-4 text-primary" />
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <p className="text-xs font-black dark:text-white text-gray-900 truncate uppercase tracking-tighter italic">
                                        {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold truncate">Administrador</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

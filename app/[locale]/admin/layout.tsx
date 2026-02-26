'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen dark:bg-slate-950 bg-gray-50">
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="lg:pl-64 transition-all duration-300">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 dark:bg-slate-900/95 bg-white/95 backdrop-blur-sm border-b dark:border-white/10 border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            {/* Breadcrumb or page title can go here */}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* User Profile / Logout */}
                            <SupabaseUserMenu />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SupabaseUserMenu() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (!user) return <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;

    return (
        <div className="flex items-center gap-3 pl-4 border-l dark:border-white/10 border-gray-200">
            <div className="hidden md:block text-right">
                <p className="text-xs font-bold dark:text-white text-gray-900 truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Logado</p>
            </div>

            <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                title="Sair"
            >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 dark:text-yellow-400 text-yellow-600" />
            ) : (
                <Moon className="w-5 h-5 text-slate-700" />
            )}
        </button>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, Sun, Moon, X, Trophy, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { LogoSVG } from '@/lib/constants';
import XPHUD from '@/components/XPHUD';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { SignedIn, SignedOut } from '@/components/auth/AuthWrappers';

const Navbar: React.FC = () => {
  const t = useTranslations('Navbar');
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { key: 'news', label: t('news'), href: '/fbr-news' },
    { key: 'health', label: t('categories.health'), href: '/category/saude' },
    { key: 'wellbeing', label: t('categories.wellbeing'), href: '/category/bem-estar' },
    { key: 'lifestyle', label: t('categories.lifestyle'), href: '/category/estilo-de-vida' },
    { key: 'business', label: t('categories.business'), href: '/category/negocios' },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-header h-16' : 'bg-transparent h-20'}`}>
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="size-8 text-primary group-hover:scale-110 transition-transform">
                <LogoSVG />
              </div>
              <h2 className="text-2xl font-black tracking-tighter dark:text-white text-gray-900">FACEBRASIL</h2>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link key={item.key} className="text-xs font-medium dark:text-slate-300 text-gray-700 dark:hover:text-primary hover:text-primary transition-colors" href={item.href}>
                  {item.label}
                </Link>
              ))}

              {/* Comunidade with Dropdown */}
              <div className="relative group">
                <div className="flex items-center gap-1">
                  <Link
                    href="/gamification"
                    className="text-xs font-medium dark:text-slate-300 text-gray-700 dark:hover:text-primary hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    {t('community')}
                  </Link>
                  <button className="text-gray-400 hover:text-primary transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2">
                    <Link href="/events" className="block px-4 py-2 text-xs dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                      {t('events')}
                    </Link>
                    <Link href="/category/face-brasil-na-america" className="block px-4 py-2 text-xs dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                      {t('categories.faceBrasilInAmerica')}
                    </Link>
                    <Link href="/category/imigracao" className="block px-4 py-2 text-xs dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                      {t('categories.immigration')}
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
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

            <SignedIn>
              <XPHUD />
            </SignedIn>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 transition-colors"
            >
              <Search className="w-5 h-5 dark:text-slate-300 text-gray-700" />
            </button>

            <SignedOut>
              <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/20">
                Entrar
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-full dark:hover:bg-slate-800 hover:bg-gray-100 transition-all">
                  <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <UserIcon className="w-5 h-5" />
                  </div>
                </button>

                {/* User Info Tooltip/Popup */}
                <div className="absolute top-full right-0 mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-white/5 border-gray-100">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold dark:text-white text-gray-900 truncate">
                          {user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Meu Dashboard
                      </Link>
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors">
                        <LogoSVG className="w-4 h-4 text-primary" />
                        Painel Admin
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-32 px-6">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsSearchOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar artigos..."
                className="w-full bg-white dark:bg-slate-900 border-2 border-primary rounded-2xl px-8 py-6 text-xl dark:text-white text-gray-900 focus:outline-none shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </form>
            <p className="mt-4 text-center text-slate-400 text-sm">
              Dica: Pressione ESC para fechar
            </p>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-10 right-10 p-4 text-white hover:text-primary transition-colors"
          >
            <X className="w-10 h-10" />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;

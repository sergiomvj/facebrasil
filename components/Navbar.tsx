"use client";

import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Search, Sun, Moon, X, Trophy, LayoutDashboard, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (isProfileOpen || isMobileMenuOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.profile-menu-container') && !target.closest('.mobile-menu-container')) {
          setIsProfileOpen(false);
          setIsMobileMenuOpen(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isMobileMenuOpen]);

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
            <div className="flex items-center gap-4 lg:gap-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg dark:hover:bg-slate-800 hover:bg-gray-100 transition-all mobile-menu-container"
              >
                {isMobileMenuOpen ? <X className="size-6 text-primary" /> : (
                  <div className="flex flex-col gap-1.5 w-6">
                    <div className="h-0.5 w-full bg-slate-400 rounded-full" />
                    <div className="h-0.5 w-full bg-slate-400 rounded-full" />
                    <div className="h-0.5 w-full bg-slate-400 rounded-full" />
                  </div>
                )}
              </button>

              <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                <div className="size-8 text-primary group-hover:scale-110 transition-transform">
                  <LogoSVG />
                </div>
                <h2 className="text-2xl font-black tracking-tighter dark:text-white text-gray-900">FACEBRASIL</h2>
              </Link>
            </div>
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
              <div className="hidden md:block">
                <Link href="/gamification">
                  <XPHUD />
                </Link>
              </div>
            </SignedIn>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 transition-colors"
            >
              <Search className="w-5 h-5 dark:text-slate-300 text-gray-700" />
            </button>

            <SignedOut>
              <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-4 md:px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/20 text-sm md:text-base">
                Entrar
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full dark:hover:bg-slate-800 hover:bg-gray-100 transition-all border border-transparent hover:border-primary/20"
                >
                  <div className="size-8 rounded-full bg-slate-800 border border-primary/30 overflow-hidden flex items-center justify-center text-primary">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* User Info Tooltip/Popup */}
                <div className={`absolute top-full right-0 mt-2 w-64 transition-all duration-200 z-50 ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-white/5 border-gray-100">
                      <div className="size-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-primary border border-primary/20">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold dark:text-white text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        Meu Dashboard
                      </Link>
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <LogoSVG className="w-4 h-4 text-primary" />
                        Painel Admin
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileOpen(false);
                        }}
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

      {/* Mobile Sidebar Menu */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="size-8 text-primary">
                <LogoSVG />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto pr-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-bold dark:text-slate-300 text-gray-700 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between"
                >
                  {item.label}
                  <ChevronRight className="size-4 opacity-30" />
                </Link>
              ))}

              <div className="my-4 h-px bg-gray-100 dark:bg-white/5" />

              <Link
                href="/gamification"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold dark:text-slate-300 text-gray-700 hover:bg-amber-500/10 hover:text-amber-500 transition-all flex items-center gap-3"
              >
                <Trophy className="size-5 text-amber-500" />
                Comunidade
              </Link>
            </nav>

            <div className="mt-auto pt-6 border-t dark:border-white/5 border-gray-100">
              <SignedIn>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                  <div className="size-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-primary border border-primary/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold dark:text-white text-gray-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Entrar na Conta
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>

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

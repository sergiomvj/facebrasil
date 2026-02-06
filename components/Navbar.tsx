"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Search, Sun, Moon } from 'lucide-react';
import { LogoSVG } from '@/lib/constants';
import XPHUD from '@/components/XPHUD';
import { generateSlug } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
            {['FBR-NEWS', 'Saúde', 'Bem Estar', 'Estilo de Vida', 'Negócios'].map((item) => (
              <Link key={item} className="text-sm font-medium dark:text-slate-300 text-gray-700 dark:hover:text-primary hover:text-primary transition-colors" href={item === 'FBR-NEWS' ? '/fbr-news' : `/category/${generateSlug(item)}`}>
                {item}
              </Link>
            ))}

            {/* Comunidade with Dropdown */}
            <div className="relative group">
              <Link
                href="/category/comunidade"
                className="text-sm font-medium dark:text-slate-300 text-gray-700 dark:hover:text-primary hover:text-primary transition-colors flex items-center gap-1"
              >
                Comunidade
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2">
                  <Link href="/events" className="block px-4 py-2 text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                    Eventos
                  </Link>
                  <Link href="/category/face-brasil-na-america" className="block px-4 py-2 text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                    Face Brasil na América
                  </Link>
                  <Link href="/category/imigracao" className="block px-4 py-2 text-sm dark:text-slate-300 text-gray-700 dark:hover:bg-slate-800 hover:bg-gray-100 dark:hover:text-primary hover:text-primary transition-colors">
                    Imigração
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

          <button className="p-2 rounded-full dark:bg-slate-800 bg-gray-200 dark:hover:bg-slate-700 hover:bg-gray-300 transition-colors">
            <Search className="w-5 h-5 dark:text-slate-300 text-gray-700" />
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/20">
                Entrar
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

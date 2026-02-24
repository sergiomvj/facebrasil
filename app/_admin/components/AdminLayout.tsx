'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Artigos', icon: FileText },
  { href: '/admin/categories', label: 'Categorias', icon: BarChart3 },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/moderation', label: 'Moderação', icon: MessageSquare },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-transform duration-300",
        sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FB</span>
            </div>
            <span className="font-semibold text-lg">FaceBrasil</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-red-50 text-red-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-red-600" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">SC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Sergio Castro</p>
              <p className="text-xs text-gray-500 truncate">Administrador</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-64"
      )}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Language Selector */}
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg">
                <span className="text-sm font-medium">PT</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

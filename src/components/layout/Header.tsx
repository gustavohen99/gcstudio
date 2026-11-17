'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  Plus,
  Sparkles,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenQuickCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenQuickCreate,
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 sm:h-16 border-b border-[#EAEAE4] bg-[#FFFFFF]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-2 px-3 sm:px-6">
      {/* Left: Mobile hamburger & current brand badge */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-700">G&C Studio Online</span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-600">Gestão Exclusiva</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md min-w-0 sm:mx-4">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-600 text-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-700 shrink-0" />
            <span className="text-zinc-600 truncate sm:hidden">Buscar...</span>
            <span className="text-zinc-600 truncate hidden sm:inline">
              Buscar clientes, eventos, propostas...
            </span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-white border border-zinc-200 rounded shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
        {/* Link to Public Portfolio */}
        <Link
          href="/portfolio"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium shadow-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Ver Portfólio</span>
        </Link>

        {/* Quick Create Button (visível também no mobile como ícone compacto) */}
        <button
          onClick={onOpenQuickCreate}
          className="inline-flex items-center gap-1.5 p-2 sm:py-1.5 sm:px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
          aria-label="Novo cadastro rápido"
        >
          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#C5A880]" />
          <span className="hidden sm:inline">Novo</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C5A880]" />
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-3 top-[3.75rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-zinc-900">Notificações</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#C5A880]/20 text-[#8B6E3F]">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400">
                    Nenhuma notificação no momento.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-zinc-50 transition-colors text-xs cursor-pointer ${
                        !n.read ? 'bg-[#FBFBF9]' : ''
                      }`}
                      onClick={() => markNotificationAsRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-zinc-900">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] mt-1 shrink-0" />}
                      </div>
                      <p className="text-zinc-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#C5A880] hover:underline"
                        >
                          Ver detalhes <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

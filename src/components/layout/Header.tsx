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
    <header className="h-16 border-b border-[#EAEAE4] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger & current brand badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
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
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 text-zinc-600 text-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-700" />
            <span className="text-zinc-600">Buscar clientes, eventos, propostas...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-white border border-zinc-200 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 relative">
        {/* Link to Public Portfolio */}
        <Link
          href="/portfolio"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium shadow-xs transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Ver Portfólio</span>
        </Link>

        {/* Quick Create Button */}
        <button
          onClick={onOpenQuickCreate}
          className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Novo</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C5A880]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
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

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Kanban,
  MoreHorizontal,
  X,
  FileSpreadsheet,
  DollarSign,
  ClipboardList,
  Image as ImageIcon,
  Truck,
  MessageSquare,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';

interface MobileNavProps {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onOpenQuickCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isMenuOpen,
  onCloseMenu,
  onOpenQuickCreate,
}) => {
  const pathname = usePathname();

  const primaryItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Eventos', href: '/eventos', icon: Calendar },
    { name: 'CRM', href: '/crm', icon: Kanban },
    { name: 'Clientes', href: '/clientes', icon: Users },
  ];

  const allMenuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'CRM (Kanban)', href: '/crm', icon: Kanban },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Eventos', href: '/eventos', icon: Calendar },
    { name: 'Orçamentos', href: '/orcamentos', icon: FileSpreadsheet },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Briefings', href: '/briefings', icon: ClipboardList },
    { name: 'Galerias de Fotos', href: '/galerias', icon: ImageIcon },
    { name: 'Entregas', href: '/entregas', icon: Truck },
    { name: 'Editar Site & Portfólio', href: '/portfolio/admin', icon: Globe },
    { name: 'Modelos de Mensagem', href: '/mensagens', icon: MessageSquare },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
    { name: 'Ver Site / Portfólio (Público)', href: '/portfolio', icon: Globe },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-40 px-3 flex items-center justify-around shadow-lg">
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                active ? 'text-[#C5A880] font-semibold' : 'text-zinc-600 hover:text-zinc-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        <button
          onClick={onCloseMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-zinc-600 hover:text-zinc-800 transition-colors"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Mais</span>
        </button>
      </div>

      {/* Drawer Overlay for Full Menu on Mobile */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCloseMenu}
          />
          <div className="relative w-72 max-w-[85%] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center p-1">
                  <img src="/logo-white.png" alt="G&C Studio" className="w-full h-full object-contain" />
                </div>
                <span className="font-serif-brand font-semibold text-zinc-900 text-base">
                  G&C Studio
                </span>
              </div>
              <button
                onClick={onCloseMenu}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action */}
            <div className="p-3">
              <button
                onClick={() => {
                  onCloseMenu();
                  onOpenQuickCreate();
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium text-center"
              >
                + Novo Registro
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {allMenuItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onCloseMenu}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? 'bg-zinc-100 text-zinc-950 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#C5A880]' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span className="text-xs text-zinc-500">G&C Studio Admin</span>
              <Link
                href="/login"
                onClick={onCloseMenu}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

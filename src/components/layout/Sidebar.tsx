'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ClipboardList,
  Image as ImageIcon,
  Truck,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  onOpenQuickCreate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickCreate }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'CRM', href: '/crm', icon: Kanban },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Eventos', href: '/eventos', icon: Calendar },
    { name: 'Orçamentos', href: '/orcamentos', icon: FileSpreadsheet },
    { name: 'Contratos', href: '/contratos', icon: FileText },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { name: 'Briefings', href: '/briefings', icon: ClipboardList },
    { name: 'Galerias', href: '/galerias', icon: ImageIcon },
    { name: 'Site & Portfólio', href: '/portfolio/admin', icon: Globe },
    { name: 'Entregas', href: '/entregas', icon: Truck },
    { name: 'Modelos de mensagem', href: '/mensagens', icon: MessageSquare },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#EAEAE4] bg-[#FFFFFF] h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#F2F2EE]">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 duration-200 shadow-sm border border-zinc-800">
            <img src="/logo-white.png" alt="G&C Studio" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-serif-brand text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors">
              G&C Studio
            </div>
            <div className="text-[10px] tracking-wider uppercase text-zinc-600 font-medium -mt-0.5">
              Fotografia & Cinema
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      {onOpenQuickCreate && (
        <div className="px-4 pt-4">
          <button
            onClick={onOpenQuickCreate}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>+ Novo Cadastro</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                active
                  ? 'bg-zinc-100/90 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  active ? 'text-[#C5A880]' : 'text-zinc-400 group-hover:text-zinc-600'
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />}
            </Link>
          );
        })}

        {/* Public Portfolio Link Card */}
        <div className="pt-3 pb-1 border-t border-zinc-100 mt-2">
          <Link
            href="/portfolio"
            target="_blank"
            className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white text-xs font-medium shadow-sm hover:from-black hover:to-zinc-900 transition-all border border-zinc-800"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-medium text-white flex items-center gap-1.5">
                  Ver Portfólio
                  <span className="text-[9px] px-1 py-0.5 rounded bg-[#C5A880]/20 text-[#D5B890] font-normal uppercase">Site</span>
                </div>
                <div className="text-[10px] text-zinc-400">Página pública de luxo</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#F2F2EE] bg-[#FAFAF8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300/80 flex items-center justify-center text-xs font-semibold text-zinc-700">
              GC
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-zinc-900 truncate">Administrador</p>
              <p className="text-[10px] text-zinc-600 truncate">G&C Studio</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sair do sistema"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { getWhatsAppUrl } from '@/lib/utils';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  ExternalLink,
  Filter,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';

export default function ClientsPage() {
  const { clients, events } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo' | 'concluido'>('todos');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.partner_name && c.partner_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Clientes G&C Studio
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Central de casais, aniversariantes e clientes da produtora.
            </p>
          </div>

          <button
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Novo Cliente</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar por nome, e-mail ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-400 text-xs flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {(['todos', 'ativo', 'concluido', 'inativo'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize whitespace-nowrap shrink-0 transition-colors ${
                  statusFilter === st
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table / Cards */}
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
            <Users className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-800">Nenhum cliente encontrado</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Tente redefinir a busca ou cadastre um novo cliente diretamente.
            </p>
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
            >
              + Novo cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const clientEvent = events.find((e) => e.client_id === client.id);
              const waUrl = getWhatsAppUrl(client.whatsapp, `Olá, ${client.name}! Tudo bem?`);

              return (
                <div
                  key={client.id}
                  className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                          {client.event_type}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors mt-1.5">
                          {client.name}
                        </h3>
                        {client.partner_name && (
                          <p className="text-xs text-zinc-500">& {client.partner_name}</p>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          client.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700'
                            : client.status === 'concluido'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{client.phone}</span>
                      </div>
                      {clientEvent && (
                        <div className="flex items-center gap-2 text-zinc-800 font-medium pt-1">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Evento em {clientEvent.date}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      href={`/clientes/${client.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-900 hover:text-[#C5A880] transition-colors"
                    >
                      <span>Ver perfil</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab="client"
      />
    </AppShell>
  );
}

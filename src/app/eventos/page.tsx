'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getEventStatusConfig, resolveEventPackage, sortEventsByProximity } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Plus,
  Filter,
  List,
  CalendarDays,
  ArrowRight,
  ExternalLink,
  Package as PackageIcon,
  ArrowUpDown,
} from 'lucide-react';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';
import { EventStatus } from '@/types';

export default function EventsPage() {
  const { events, packages } = useAppStore();
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortOrder, setSortOrder] = useState<'proximos' | 'recentes' | 'antigos'>('proximos');
  const [search, setSearch] = useState('');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.client_name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase()) ||
        e.type.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === 'todos') return true;
      if (filterStatus === 'proximos')
        return (
          e.status === 'confirmado' ||
          e.status === 'evento_proximo' ||
          e.status === 'contrato_enviado'
        );
      if (filterStatus === 'em_andamento')
        return e.status === 'realizado' || e.status === 'pos_producao' || e.status === 'entregando';
      if (filterStatus === 'concluidos') return e.status === 'concluido';
      if (filterStatus === 'cancelados') return e.status === 'cancelado';
      return true;
    });

    if (sortOrder === 'proximos') return sortEventsByProximity(filtered);

    const key = (e: { date?: string; time?: string }) => `${e.date || ''}T${e.time || '00:00'}`;
    return [...filtered].sort((a, b) =>
      sortOrder === 'recentes' ? key(b).localeCompare(key(a)) : key(a).localeCompare(key(b))
    );
  }, [events, search, filterStatus, sortOrder]);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Eventos G&C Studio
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Gerencie a cobertura audiovisual, cronogramas, checklists e entregas de cada produção.
            </p>
          </div>

          <button
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Novo Evento</span>
          </button>
        </div>

        {/* Controls: Search, Status Filter & View Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por evento, casal, local ou tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto text-xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'proximos', label: 'Próximos' },
                { id: 'em_andamento', label: 'Em Andamento' },
                { id: 'concluidos', label: 'Concluídos' },
                { id: 'cancelados', label: 'Cancelados' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    filterStatus === tab.id
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C5A880]" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'proximos' | 'recentes' | 'antigos')}
                className="bg-transparent font-medium text-zinc-800 focus:outline-hidden cursor-pointer"
              >
                <option value="proximos">Mais Próximos Primeiro</option>
                <option value="recentes">Data Mais Recente</option>
                <option value="antigos">Data Mais Antiga</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 shrink-0">
              <button
                onClick={() => setViewMode('lista')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'lista' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                }`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendario')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'calendario' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
                }`}
                title="Visualização em Calendário"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'lista' && (
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
                <Calendar className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-medium text-zinc-800">Nenhum evento encontrado</h3>
                <p className="text-xs text-zinc-500">Ajuste os filtros ou crie um novo evento.</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const statusCfg = getEventStatusConfig(event.status);
                const pkg = resolveEventPackage(
                  packages,
                  event.package_name,
                  event.package_id,
                  event.package_description
                );
                return (
                  <div
                    key={event.id}
                    className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-[#F7F3ED] border border-[#E8DEC8] flex flex-col items-center justify-center text-center shrink-0">
                        <span suppressHydrationWarning className="text-[10px] uppercase font-semibold text-[#8B6E3F]">
                          {new Date(event.date + 'T12:00:00')
                            .toLocaleDateString('pt-BR', { month: 'short' })
                            .replace('.', '')}
                        </span>
                        <span suppressHydrationWarning className="text-lg font-bold text-zinc-900 leading-none">
                          {new Date(event.date + 'T12:00:00').getDate()}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            {event.type}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                          {event.name}
                        </h3>

                        {event.description && (
                          <p className="text-xs text-zinc-600 line-clamp-2 max-w-xl">
                            {event.description}
                          </p>
                        )}

                        <p className="text-xs text-zinc-500">Cliente: {event.client_name}</p>

                        {event.package_name && (
                          <div className="text-xs bg-amber-50/60 border border-amber-200/70 rounded-xl p-2.5 max-w-xl space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-[#8B6E3F] text-xs">
                              <PackageIcon className="w-3.5 h-3.5" />
                              <span>Pacote: {event.package_name}</span>
                            </div>
                            {pkg?.description && (
                              <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                                <span className="font-medium text-zinc-700">Descrição do Pacote: </span>
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{event.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Value & link */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 gap-2">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-zinc-900 block">
                          {formatCurrency(event.value)}
                        </span>
                        {(event.deposit_value ?? 0) > 0 && (
                          <span className="text-[10px] text-emerald-700 font-medium block">
                            Entrada: {formatCurrency(event.deposit_value || 0)}
                          </span>
                        )}
                        {event.package_name && (
                          <span className="text-[11px] text-zinc-400 block truncate max-w-[200px]">
                            {event.package_name}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/eventos/${event.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                      >
                        <span>Gerenciar evento</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendario' && (
          <div className="p-6 bg-white rounded-2xl border border-[#EAEAE4] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <h3 className="font-serif-brand text-lg font-medium text-zinc-900">
                Grade de Eventos Cadastrados
              </h3>
              <span className="text-xs text-zinc-500">{filteredEvents.length} eventos nesta visão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/eventos/${evt.id}`}
                  className="p-4 rounded-xl border border-zinc-200 hover:border-[#C5A880] transition-colors space-y-2 group block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8B6E3F]">
                      {formatDate(evt.date)} • {evt.time}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                      {evt.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700">
                    {evt.name}
                  </h4>
                  <p className="text-xs text-zinc-500 truncate">{evt.location}</p>
                  {evt.package_name && (
                    <div className="pt-1 border-t border-zinc-100 text-[11px] text-[#8B6E3F] truncate">
                      Pacote: {evt.package_name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab="event"
      />
    </AppShell>
  );
}

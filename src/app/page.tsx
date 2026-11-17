'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';
import {
  formatCurrency,
  formatDate,
  getEventStatusConfig,
  getPaymentStatusConfig,
  sortEventsByProximity,
  buildAgendaEntries,
} from '@/lib/utils';
import { buildBriefingContext } from '@/lib/briefing-config';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  FileText,
  DollarSign,
  ClipboardList,
  Image as ImageIcon,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  Plus,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';

function DashboardContent() {
  const {
    events,
    payments,
    deliveries,
    contracts,
    briefings,
    galleries,
    packages,
  } = useAppStore();
  const today = useToday();

  const [agendaView, setAgendaView] = useState<'lista' | 'semana' | 'mes'>('lista');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateTab, setQuickCreateTab] = useState<'client' | 'lead' | 'event' | 'quote' | 'gallery' | 'delivery'>('client');

  const openQuickWithTab = (tab: 'client' | 'lead' | 'event' | 'quote' | 'gallery' | 'delivery') => {
    setQuickCreateTab(tab);
    setQuickCreateOpen(true);
  };

  // Metrics
  const activeEvents = useMemo(() => {
    return events.filter((e) => e.status !== 'cancelado');
  }, [events]);

  const agendaEntries = useMemo(() => {
    const sorted = sortEventsByProximity(buildAgendaEntries(activeEvents), today);
    if (!today || agendaView === 'lista') return sorted;

    if (agendaView === 'semana') {
      const [y, m, d] = today.split('-').map(Number);
      const endMs = Date.UTC(y, m - 1, d + 7);
      const endDate = new Date(endMs);
      const endStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}-${String(endDate.getUTCDate()).padStart(2, '0')}`;
      return sorted.filter((entry) => entry.date >= today && entry.date <= endStr);
    }

    // agendaView === 'mes'
    const currentMonth = today.slice(0, 7);
    return sorted.filter((entry) => entry.date.startsWith(currentMonth));
  }, [activeEvents, today, agendaView]);

  const pendingPayments = useMemo(() => {
    return payments.filter((p) => p.status === 'pendente' || p.status === 'atrasado');
  }, [payments]);

  const pendingDeliveries = useMemo(() => {
    return deliveries.filter((d) => d.status !== 'entregue');
  }, [deliveries]);

  // Financial summary
  const receivedThisMonth = useMemo(() => {
    return payments
      .filter((p) => p.status === 'pago')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [payments]);

  const toReceive = useMemo(() => {
    return pendingPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [pendingPayments]);

  // Attention Items (Pendências críticas)
  const attentionItems = useMemo(() => {
    const list: {
      id: string;
      title: string;
      desc: string;
      type: 'contrato' | 'pagamento' | 'briefing' | 'galeria' | 'entrega';
      link: string;
      badge: string;
    }[] = [];

    // Contratos aguardando assinatura
    contracts
      .filter((c) => c.status === 'enviado' || c.status === 'rascunho')
      .forEach((c) => {
        list.push({
          id: 'c-' + c.id,
          title: `Contrato: ${c.client_name}`,
          desc: `${c.template_title} aguarda assinatura do cliente`,
          type: 'contrato',
          link: '/contratos',
          badge: 'Aguardando assinatura',
        });
      });

    // Pagamentos atrasados
    payments
      .filter((p) => p.status === 'atrasado')
      .forEach((p) => {
        list.push({
          id: 'p-' + p.id,
          title: `Pagamento atrasado: ${p.client_name}`,
          desc: `${p.description} (${formatCurrency(p.amount)}) venceu em ${formatDate(p.due_date)}`,
          type: 'pagamento',
          link: '/financeiro',
          badge: 'Vencido',
        });
      });

    // Briefing não preenchido ou pendente
    briefings
      .filter((b) => b.status === 'nao_enviado' || b.status === 'em_preenchimento')
      .forEach((b) => {
        const ev = events.find((e) => e.id === b.event_id);
        const totalSteps = buildBriefingContext(ev, packages).steps.length;
        const step = Math.min(Math.max(1, b.current_step || 1), totalSteps);
        list.push({
          id: 'b-' + b.id,
          title: `Briefing: ${ev ? ev.name : 'Evento'}`,
          desc: `Status: ${b.status === 'nao_enviado' ? 'Não enviado ao cliente' : `Etapa ${step} de ${totalSteps}`}`,
          type: 'briefing',
          link: ev ? `/eventos/${ev.id}` : '/briefings',
          badge: 'Atenção briefing',
        });
      });

    // Galerias próximas da expiração
    const now = typeof window !== 'undefined' ? Date.now() : 1775520000000;
    galleries.forEach((g) => {
      const exp = new Date(g.expires_at).getTime();
      const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
      if (diffDays <= 15 && diffDays >= 0) {
        list.push({
          id: 'g-' + g.id,
          title: `Galeria expirando: ${g.title}`,
          desc: `Expira em ${diffDays} dias (${formatDate(g.expires_at)})`,
          type: 'galeria',
          link: '/galerias',
          badge: 'Expira em breve',
        });
      }
    });

    return list;
  }, [contracts, payments, briefings, events, galleries, packages]);

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Top Welcome & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAEAE4] text-xs font-medium text-zinc-600 mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Painel Central de Operações</span>
            </div>
            <h1 className="font-serif-brand text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
              Olá, G&C Studio
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Veja o que está acontecendo com seus eventos e entregas em tempo real.
            </p>
          </div>

          {/* Quick Action Shortcuts (Item 29) */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => openQuickWithTab('client')}
              className="px-3 py-2 rounded-xl bg-white border border-[#EAEAE4] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-medium shadow-xs transition-colors"
            >
              + Cliente
            </button>
            <button
              onClick={() => openQuickWithTab('lead')}
              className="px-3 py-2 rounded-xl bg-white border border-[#EAEAE4] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-medium shadow-xs transition-colors"
            >
              + Lead
            </button>
            <button
              onClick={() => openQuickWithTab('event')}
              className="px-3 py-2 rounded-xl bg-white border border-[#EAEAE4] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-medium shadow-xs transition-colors"
            >
              + Evento
            </button>
            <button
              onClick={() => openQuickWithTab('quote')}
              className="px-3 py-2 rounded-xl bg-white border border-[#EAEAE4] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-medium shadow-xs transition-colors"
            >
              + Orçamento
            </button>
            <button
              onClick={() => openQuickWithTab('gallery')}
              className="px-3 py-2 rounded-xl bg-white border border-[#EAEAE4] text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 text-xs font-medium shadow-xs transition-colors"
            >
              + Galeria
            </button>
            <button
              onClick={() => openQuickWithTab('delivery')}
              className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              + Entrega
            </button>
          </div>
        </div>

        {/* 3 Cards Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Próximos eventos</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#A8875B] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold text-zinc-900 font-serif-brand">
                {activeEvents.length}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">confirmados na temporada</p>
            </div>
            <Link
              href="/eventos"
              className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-[#C5A880] hover:text-[#9A7A4A]"
            >
              <span>Ver cronograma</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Pagamentos pendentes</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold text-zinc-900 font-serif-brand">
                {formatCurrency(toReceive)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{pendingPayments.length} parcelas abertas</p>
            </div>
            <Link
              href="/financeiro"
              className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-[#C5A880] hover:text-[#9A7A4A]"
            >
              <span>Conferir recebíveis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Entregas pendentes</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold text-zinc-900 font-serif-brand">
                {pendingDeliveries.length}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">álbuns, vídeos e fotos</p>
            </div>
            <Link
              href="/entregas"
              className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-medium text-[#C5A880] hover:text-[#9A7A4A]"
            >
              <span>Acompanhar prazos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Central Section: Próximos Eventos & Pendências */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximos Eventos (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                  Próximos Eventos
                </h2>
                <p className="text-xs text-zinc-500">
                  Agenda cronológica de coberturas fotográficas e filmagens
                </p>
              </div>

              {/* View Switcher: Lista / Semana / Mês */}
              <div className="flex items-center p-1 rounded-xl bg-white border border-zinc-200 text-xs">
                <button
                  onClick={() => setAgendaView('lista')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    agendaView === 'lista'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setAgendaView('semana')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    agendaView === 'semana'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setAgendaView('mes')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    agendaView === 'mes'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Mês
                </button>
              </div>
            </div>

            {/* List / Cards of upcoming events & extra sessions */}
            {agendaEntries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
                <CalendarDays className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-medium text-zinc-800">
                  {agendaView === 'lista'
                    ? 'Nenhum evento cadastrado'
                    : 'Nenhum evento agendado neste período'}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {agendaView === 'lista'
                    ? 'Comece criando seu primeiro evento ou convertendo um lead fechado do CRM.'
                    : 'Altere o filtro acima para "Lista" para ver todos os eventos da agenda.'}
                </p>
                <button
                  onClick={() => openQuickWithTab('event')}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-xs"
                >
                  + Criar evento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {agendaEntries.slice(0, 6).map((entry) => {
                  const evt = entry.event;
                  const statusCfg = getEventStatusConfig(evt.status);
                  return (
                    <div
                      key={entry.key}
                      className={`p-5 rounded-2xl border shadow-xs transition-all hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                        entry.isExtra
                          ? 'bg-amber-50/30 border-amber-200/80 hover:border-[#C5A880]'
                          : 'bg-white border-[#EAEAE4] hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Event Date Block */}
                        <div className="w-14 h-14 rounded-2xl bg-[#F7F3ED] border border-[#E8DEC8] flex flex-col items-center justify-center text-center shrink-0">
                          <span suppressHydrationWarning className="text-[10px] uppercase font-semibold text-[#8B6E3F]">
                            {new Date(entry.date + 'T12:00:00')
                              .toLocaleDateString('pt-BR', { month: 'short' })
                              .replace('.', '')}
                          </span>
                          <span suppressHydrationWarning className="text-lg font-bold text-zinc-900 leading-none">
                            {new Date(entry.date + 'T12:00:00').getDate()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                              {evt.type}
                            </span>
                            {entry.isExtra && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-[#8B6E3F] border border-amber-200">
                                {entry.sessionLabel}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                            {entry.isExtra ? `${evt.name} — ${entry.sessionLabel}` : evt.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              {entry.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="truncate max-w-[200px]">{entry.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                        <span className="text-xs font-semibold text-zinc-900">
                          {entry.isExtra ? `Evento: ${formatDate(evt.date)}` : formatCurrency(evt.value)}
                        </span>
                        <Link
                          href={`/eventos/${evt.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#C5A880] hover:text-[#9A7A4A] mt-1"
                        >
                          Ver evento <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Central de Pendências (Item 7) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Pendências do Studio
                </h2>
                <p className="text-xs text-zinc-500">
                  Ações que precisam da sua atenção imediata
                </p>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700">
                {attentionItems.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs divide-y divide-zinc-100 max-h-[460px] overflow-y-auto">
              {attentionItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p>Tudo em dia! Nenhuma pendência crítica encontrada.</p>
                </div>
              ) : (
                attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-zinc-50/80 -mx-2 px-2 rounded-xl transition-colors group"
                  >
                    <div className="mt-0.5">
                      {item.type === 'contrato' && (
                        <FileText className="w-4 h-4 text-indigo-500" />
                      )}
                      {item.type === 'pagamento' && (
                        <DollarSign className="w-4 h-4 text-rose-500" />
                      )}
                      {item.type === 'briefing' && (
                        <ClipboardList className="w-4 h-4 text-amber-500" />
                      )}
                      {item.type === 'galeria' && (
                        <ImageIcon className="w-4 h-4 text-sky-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-zinc-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Quick Financial Summary Box */}
            <div className="p-5 rounded-2xl bg-[#1A1A18] text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs text-zinc-400 font-medium">Financeiro em Destaque</span>
                <Link
                  href="/financeiro"
                  className="text-[11px] text-[#C5A880] hover:underline flex items-center gap-1"
                >
                  Abrir financeiro <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                    Recebido este mês
                  </span>
                  <p className="text-base font-semibold text-emerald-400 mt-0.5 font-serif-brand">
                    {formatCurrency(receivedThisMonth)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                    A Receber
                  </span>
                  <p className="text-base font-semibold text-[#C5A880] mt-0.5 font-serif-brand">
                    {formatCurrency(toReceive)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab={quickCreateTab}
      />
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando painel G&C Studio...
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}

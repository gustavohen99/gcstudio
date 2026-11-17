'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import {
  formatCurrency,
  formatDate,
  formatDateFull,
  getEventStatusConfig,
  getPaymentStatusConfig,
  getWhatsAppUrl,
  getBriefingStatusConfig,
  resolveEventPackage,
  getPackagesForEventType,
  getServicesForEventType,
  getSuggestedExtraSessions,
} from '@/lib/utils';
import { ExtraSessionsEditor } from '@/components/events/ExtraSessionsEditor';
import { buildBriefingContext } from '@/lib/briefing-config';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  MessageCircle,
  DollarSign,
  FileText,
  Image as ImageIcon,
  ClipboardList,
  Sparkles,
  Share2,
  Settings,
  Check,
  Package as PackageIcon,
  Camera,
  Video,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EventStatus, EventType, EventAddon, EventExtraSession } from '@/types';

function EventDetailContent() {
  const params = useParams();
  const eventId = (params?.id as string) || '';
  const router = useRouter();
  const { toast } = useToast();
  const {
    events,
    clients,
    packages,
    services,
    checklists,
    timelines,
    briefings,
    payments,
    galleries,
    updateEvent,
    deleteEvent,
    toggleChecklistTask,
    addChecklistTask,
    deleteChecklistTask,
    addTimelineMoment,
    deleteTimelineMoment,
    addPayment,
    updatePayment,
  } = useAppStore();

  const event = events.find((e) => e.id === eventId);
  const client = event ? clients.find((c) => c.id === event.client_id) : null;
  const currentPackageInfo = event
    ? resolveEventPackage(
        packages,
        event.package_name,
        event.package_id,
        event.package_description
      )
    : null;
  const briefingCtx = event ? buildBriefingContext(event, packages) : null;

  const [activeTab, setActiveTab] = useState<
    | 'resumo'
    | 'briefing'
    | 'cronograma'
    | 'checklist'
    | 'financeiro'
    | 'galeria'
  >('resumo');

  // Event configuration modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configForm, setConfigForm] = useState({
    name: '',
    type: 'Casamento' as EventType,
    date: '',
    time: '16:00',
    location: '',
    package_name: '',
    package_id: '',
    package_description: '',
    addons: [] as EventAddon[],
    extra_sessions: [] as EventExtraSession[],
    value: 0,
    deposit_value: 0,
    deposit_paid: true,
    description: '',
    notes: '',
  });

  // Checklist phase filter
  const [checklistPhase, setChecklistPhase] = useState<'todos' | 'antes' | 'durante' | 'pos'>('todos');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistPhase, setNewChecklistPhase] = useState<'antes' | 'durante' | 'pos'>('antes');

  // Timeline add modal
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [timelineForm, setTimelineForm] = useState({
    time: '16:00',
    title: '',
    location: '',
    description: '',
    responsible: 'Equipe G&C Studio',
    notes: '',
  });

  if (!event) {
    return (
      <AppShell>
        <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-4">
          <Calendar className="w-10 h-10 text-zinc-300 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-800">Evento não encontrado</h2>
          <p className="text-xs text-zinc-500">Este evento pode ter sido excluído.</p>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Eventos
          </Link>
        </div>
      </AppShell>
    );
  }

  const eventChecklist = checklists.filter((c) => c.event_id === event.id);
  const eventTimeline = timelines
    .filter((t) => t.event_id === event.id)
    .sort((a, b) => a.time.localeCompare(b.time));
  const eventBriefing = briefings.find((b) => b.event_id === event.id);
  const eventPayments = payments.filter((p) => p.event_id === event.id);
  const eventGalleries = galleries.filter((g) => g.event_id === event.id);

  const statusCfg = getEventStatusConfig(event.status);

  // Status options for item 37
  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: 'lead', label: 'Lead' },
    { value: 'orcamento_enviado', label: 'Orçamento Enviado' },
    { value: 'negociacao', label: 'Negociação' },
    { value: 'aguardando_contrato', label: 'Aguardando Contrato' },
    { value: 'contrato_enviado', label: 'Contrato Enviado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'evento_proximo', label: 'Evento Próximo' },
    { value: 'realizado', label: 'Realizado' },
    { value: 'pos_producao', label: 'Pós-Produção' },
    { value: 'entregando', label: 'Entregando' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  const handleStatusChange = (newStatus: EventStatus) => {
    updateEvent(event.id, { status: newStatus });
    toast(`Status do evento atualizado para "${newStatus}".`, 'info');
  };

  const openConfigModal = () => {
    const depPayment = eventPayments.find(
      (p) =>
        p.id.endsWith('-dep') ||
        p.description.toLowerCase().includes('entrada') ||
        p.description.toLowerCase().includes('sinal')
    );
    const resolved = resolveEventPackage(
      packages,
      event.package_name,
      event.package_id,
      event.package_description
    );
    setConfigForm({
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      location: event.location,
      package_name: event.package_name || resolved.name,
      package_id: event.package_id || resolved.id || '',
      package_description: event.package_description || resolved.description,
      addons: event.addons ? [...event.addons] : [],
      extra_sessions: event.extra_sessions ? event.extra_sessions.map((s) => ({ ...s })) : [],
      value: event.value || 0,
      deposit_value: event.deposit_value ?? (depPayment ? depPayment.amount : 0),
      deposit_paid:
        event.deposit_paid !== undefined
          ? event.deposit_paid
          : depPayment
          ? depPayment.status === 'pago'
          : true,
      description: event.description || '',
      notes: event.notes || '',
    });
    setConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveEventPackage(
      packages,
      configForm.package_name,
      configForm.package_id,
      configForm.package_description
    );
    updateEvent(event.id, {
      name: configForm.name,
      type: configForm.type,
      date: configForm.date,
      time: configForm.time,
      location: configForm.location,
      package_name: configForm.package_name || resolved.name,
      package_id: configForm.package_id || resolved.id || undefined,
      package_description: configForm.package_description || resolved.description,
      addons: configForm.addons,
      extra_sessions: configForm.extra_sessions
        .filter((s) => s.label.trim() || s.date || s.location.trim())
        .map((s) => ({ ...s, label: s.label.trim() || 'Sessão Extra' })),
      value: Number(configForm.value) || 0,
      deposit_value: Number(configForm.deposit_value) || 0,
      deposit_paid: configForm.deposit_paid,
      description: configForm.description,
      notes: configForm.notes,
    });
    setConfigModalOpen(false);
    toast('Configurações do evento e Financeiro atualizados!', 'success');
  };

  const handlePackageChange = (newPackageName: string) => {
    const addonsTotal = (event.addons || []).reduce((acc, a) => acc + (Number(a.price) || 0), 0);
    if (newPackageName === 'Personalizado') {
      updateEvent(event.id, {
        package_name: 'Personalizado',
        package_id: undefined,
        package_description: 'Pacote com especificações e entregas customizadas para este evento.',
      });
      toast('Pacote definido como Personalizado.', 'info');
      return;
    }
    const pkg = resolveEventPackage(packages, newPackageName);
    if (!pkg.is_custom) {
      const nextTotal = (Number(pkg.price) || 0) + addonsTotal;
      updateEvent(event.id, {
        package_name: pkg.name,
        package_id: pkg.id,
        package_description: pkg.description,
        value: nextTotal,
      });
      toast(
        `Pacote alterado para "${pkg.name}" (Total: ${formatCurrency(nextTotal)}) e atualizado no Financeiro!`,
        'success'
      );
    } else {
      updateEvent(event.id, {
        package_name: 'Personalizado',
        package_id: undefined,
        package_description: 'Pacote com especificações e entregas customizadas para este evento.',
      });
      toast('Pacote definido como Personalizado.', 'info');
    }
  };

  const handleAddChecklistTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistTask({
      event_id: event.id,
      phase: newChecklistPhase,
      title: newChecklistTitle.trim(),
      is_completed: false,
      is_custom: true,
    });
    setNewChecklistTitle('');
    toast('Tarefa adicionada ao checklist!', 'success');
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineForm.title.trim()) return;
    addTimelineMoment({
      event_id: event.id,
      ...timelineForm,
      sort_order: eventTimeline.length + 1,
    });
    setTimelineModalOpen(false);
    toast('Momento incluído no cronograma!', 'success');
  };

  const copyBriefingLink = () => {
    if (!eventBriefing) return;
    const url = `${window.location.origin}/briefing/${eventBriefing.token}`;
    navigator.clipboard.writeText(url);
    toast('Link exclusivo do briefing copiado para a área de transferência!', 'success');
  };

  const sendBriefingWhatsApp = () => {
    if (!eventBriefing || !client) return;
    const url = `${window.location.origin}/briefing/${eventBriefing.token}`;
    const msg = `Olá, ${client.name}! Tudo bem?\nPara alinharmos todos os detalhes da cobertura do seu ${event.type}, preparamos o seu Briefing Oficial:\n${url}\n\nVocê pode responder facilmente direto pelo celular!`;
    window.open(getWhatsAppUrl(client.whatsapp, msg), '_blank');
  };

  const handleDeleteEvent = () => {
    deleteEvent(event.id);
    setDeleteModalOpen(false);
    toast('Evento excluído com sucesso.', 'info');
    router.push('/eventos');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Eventos</span>
          </Link>

          {client && (
            <Link
              href={`/clientes/${client.id}`}
              className="text-xs text-[#C5A880] hover:underline flex items-center gap-1"
            >
              Ver perfil do cliente <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Master Event Header */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                {event.type}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8B6E3F] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                <PackageIcon className="w-3 h-3 text-[#C5A880]" />
                {event.package_name || currentPackageInfo?.name || 'Personalizado'}
              </span>
            </div>

            <h1 className="font-serif-brand text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-zinc-600">
              <span className="flex items-center gap-1.5 font-medium text-zinc-800">
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                {formatDateFull(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                {event.location}
              </span>
            </div>

            {currentPackageInfo?.description && (
              <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                <span className="font-medium text-zinc-700">Pacote: </span>
                {currentPackageInfo.description}
              </p>
            )}
          </div>

          {/* Right Header: Value, Single Config Button & Status Selector */}
          <div className="flex flex-col sm:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                Valor Total Contratado
              </span>
              <span className="text-xl font-bold text-zinc-900 font-serif-brand">
                {formatCurrency(event.value)}
              </span>
              {(event.deposit_value ?? 0) > 0 && (
                <span className="text-[11px] text-[#8B6E3F] block">
                  Entrada: {formatCurrency(event.deposit_value || 0)} ({event.deposit_paid ? 'Paga' : 'Pendente'})
                </span>
              )}
            </div>

            {/* Actions: Configurar Evento & Alterar Status */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openConfigModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Configurar Evento</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400">Status:</span>
                <select
                  value={event.status}
                  onChange={(e) => handleStatusChange(e.target.value as EventStatus)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 focus:outline-hidden focus:border-[#C5A880]"
                >
                  {statusOptions.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Excluir evento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Abas do Evento */}
        <div className="border-b border-zinc-200 flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar text-xs font-medium -mx-1 px-1">
          {[
            { id: 'resumo', label: 'Resumo', icon: Sparkles },
            { id: 'briefing', label: 'Briefing', icon: ClipboardList },
            { id: 'cronograma', label: `Cronograma (${eventTimeline.length})`, icon: Clock },
            { id: 'checklist', label: `Checklist (${eventChecklist.filter(c => c.is_completed).length}/${eventChecklist.length})`, icon: CheckCircle2 },
            { id: 'financeiro', label: `Financeiro (${eventPayments.length})`, icon: DollarSign },
            { id: 'galeria', label: `Galeria (${eventGalleries.length})`, icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#C5A880] text-zinc-950 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C5A880]' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* 1. RESUMO */}
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Resumo da Produção
                    </h3>
                    <span className="text-xs text-zinc-500">
                      Cliente: <strong className="text-zinc-800">{event.client_name}</strong>
                    </span>
                  </div>

                  {/* Pacote, Itens e Adicionais */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <PackageIcon className="w-4 h-4 text-[#8B6E3F]" />
                        <span>Pacote & Entregas ({event.type})</span>
                      </span>

                      {(() => {
                        const typePackages = getPackagesForEventType(packages, event.type);
                        const selectOptions =
                          currentPackageInfo &&
                          !currentPackageInfo.is_custom &&
                          !typePackages.some((p) => p.name === currentPackageInfo.name)
                            ? [
                                ...typePackages,
                                ...packages.filter((p) => p.name === currentPackageInfo.name),
                              ]
                            : typePackages;

                        return (
                          <select
                            aria-label="Alterar pacote"
                            value={
                              selectOptions.some((p) => p.name === event.package_name)
                                ? event.package_name
                                : currentPackageInfo?.name &&
                                  selectOptions.some((p) => p.name === currentPackageInfo.name)
                                ? currentPackageInfo.name
                                : 'Personalizado'
                            }
                            onChange={(e) => handlePackageChange(e.target.value)}
                            className="sm:w-64 px-3 py-1.5 rounded-xl border border-amber-200 bg-white font-semibold text-zinc-800 focus:outline-hidden focus:border-[#C5A880]"
                          >
                            {selectOptions.map((pkg) => (
                              <option key={pkg.id} value={pkg.name}>
                                {pkg.name} ({formatCurrency(pkg.price)})
                              </option>
                            ))}
                            <option value="Personalizado">
                              {event.package_name && !selectOptions.some((p) => p.name === event.package_name)
                                ? `${event.package_name} (Personalizado)`
                                : 'Personalizado'}
                            </option>
                          </select>
                        );
                      })()}
                    </div>

                    {currentPackageInfo?.features && currentPackageInfo.features.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {currentPackageInfo.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-zinc-700 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {event.addons && event.addons.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/50 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mr-1">
                          Adicionais:
                        </span>
                        {event.addons.map((addon) => (
                          <span
                            key={addon.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-amber-200/70 text-[11px] font-medium text-zinc-800"
                          >
                            {addon.name} (+{formatCurrency(addon.price)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Datas Extras na Agenda */}
                  {event.extra_sessions && event.extra_sessions.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-2 text-xs">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#C5A880]" />
                        Datas Extras na Agenda
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {event.extra_sessions.map((ex) => (
                          <div
                            key={ex.id}
                            className="p-2.5 rounded-lg bg-white border border-zinc-200/80 text-[11px] space-y-0.5"
                          >
                            <span className="font-semibold text-zinc-900 block">{ex.label}</span>
                            <span className="text-zinc-600 block">
                              {ex.date
                                ? `${formatDate(ex.date)} às ${ex.time || '16:00'}`
                                : 'Data a definir'}
                            </span>
                            {ex.location && (
                              <span className="text-zinc-500 block truncate">{ex.location}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Descrição & Notas do Evento */}
                  {(event.description || event.notes) && (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-zinc-500" />
                        Observações & Detalhes do Evento
                      </span>
                      {event.description && (
                        <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                          {event.description}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-zinc-500 leading-relaxed pt-1 border-t border-zinc-200/60">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Briefing Fast Card */}
                {eventBriefing && (
                  <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-zinc-900">Briefing dos Clientes</span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Status:{' '}
                        <span className="font-medium text-zinc-700">
                          {getBriefingStatusConfig(eventBriefing.status).label}
                        </span>
                        {briefingCtx && eventBriefing.status !== 'concluido' && (
                          <span>
                            {' '}
                            • {Math.min(eventBriefing.current_step || 1, briefingCtx.steps.length)} de{' '}
                            {briefingCtx.steps.length} etapas
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyBriefingLink}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar link
                      </button>
                      <button
                        onClick={() => setActiveTab('briefing')}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium"
                      >
                        Ver briefing completo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Resumo Financeiro + Checklist rápido */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] space-y-3 text-xs">
                  <h4 className="font-semibold text-zinc-900 flex items-center justify-between">
                    <span>Resumo Financeiro</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('financeiro')}
                      className="text-[11px] font-medium text-[#8B6E3F] hover:underline cursor-pointer"
                    >
                      Ver parcelas
                    </button>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-500">Valor Total</span>
                      <span className="font-bold text-zinc-900 font-serif-brand">
                        {formatCurrency(event.value)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <span className="text-zinc-500">
                        Entrada ({event.deposit_paid ? 'Paga' : 'Pendente'})
                      </span>
                      <span className="font-bold text-emerald-700 font-serif-brand">
                        {formatCurrency(event.deposit_value || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-500">Saldo Restante</span>
                      <span className="font-bold text-[#8B6E3F] font-serif-brand">
                        {formatCurrency(Math.max(0, event.value - (event.deposit_value || 0)))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-900 flex items-center justify-between">
                    <span>Progresso do Checklist</span>
                    <span className="text-[#C5A880]">
                      {eventChecklist.length > 0
                        ? `${Math.round(
                            (eventChecklist.filter((c) => c.is_completed).length /
                              eventChecklist.length) *
                              100
                          )}%`
                        : '0%'}
                    </span>
                  </h4>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C5A880] h-full transition-all duration-300"
                      style={{
                        width: `${
                          eventChecklist.length > 0
                            ? (eventChecklist.filter((c) => c.is_completed).length /
                                eventChecklist.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="pt-2 text-xs text-zinc-500 flex justify-between">
                    <span>{eventChecklist.filter((c) => c.is_completed).length} concluídas</span>
                    <span>{eventChecklist.filter((c) => !c.is_completed).length} pendentes</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className="w-full py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors text-center"
                  >
                    Gerenciar Checklist
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. BRIEFING (Adaptado ao tipo de evento e pacote) */}
          {activeTab === 'briefing' && (
            <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] space-y-6">
              {eventBriefing && briefingCtx ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-zinc-900">
                          Briefing de Cobertura do Evento
                        </h3>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            getBriefingStatusConfig(eventBriefing.status).bg
                          } ${getBriefingStatusConfig(eventBriefing.status).color}`}
                        >
                          {getBriefingStatusConfig(eventBriefing.status).label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Formulário adaptado automaticamente ao tipo de evento ({event.type}) e ao pacote contratado ({briefingCtx.steps.length} etapas).
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                          {event.type}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E6DFD3] text-[#8B6E3F] font-medium">
                          {briefingCtx.hasVideo ? (
                            <>
                              <Video className="w-3 h-3" /> Foto & Vídeo
                            </>
                          ) : (
                            <>
                              <Camera className="w-3 h-3" /> Somente Fotografia
                            </>
                          )}
                        </span>
                        {briefingCtx.hasMakingOf && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-medium">
                            Com Making Of
                          </span>
                        )}
                        {briefingCtx.hasEnsaio && briefingCtx.profile !== 'ensaio' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[#8B6E3F] font-medium">
                            Inclui {briefingCtx.sessionLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botões do Item 16 */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={sendBriefingWhatsApp}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar WhatsApp</span>
                      </button>

                      <button
                        onClick={copyBriefingLink}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1.5 shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </button>

                      <Link
                        href={`/briefing/${eventBriefing.token}`}
                        target="_blank"
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Visualizar Formulário</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                      </Link>
                    </div>
                  </div>

                  {/* Informações preenchidas adaptadas ao contexto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <h4 className="font-semibold text-zinc-900">Locais e Horários</h4>
                      {briefingCtx.hasMakingOf && (
                        <p>
                          <strong className="text-zinc-600">Making of:</strong>{' '}
                          {eventBriefing.event_info?.making_of_address || 'Não preenchido'}
                        </p>
                      )}
                      <p>
                        <strong className="text-zinc-600">{briefingCtx.copy.arrivalLabel}:</strong>{' '}
                        {eventBriefing.event_info?.team_arrival_time || '13:00'}
                      </p>
                      {briefingCtx.copy.showCeremonyTimeAndLocation && (
                        <p>
                          <strong className="text-zinc-600">Cerimônia:</strong>{' '}
                          {eventBriefing.event_info?.ceremony_location || event.location}
                          {eventBriefing.event_info?.ceremony_time
                            ? ` (${eventBriefing.event_info.ceremony_time})`
                            : ''}
                        </p>
                      )}
                      <p>
                        <strong className="text-zinc-600">
                          {briefingCtx.copy.receptionLocationLabel}:
                        </strong>{' '}
                        {eventBriefing.event_info?.reception_location || event.location}
                        {eventBriefing.event_info?.reception_time
                          ? ` (${eventBriefing.event_info.reception_time})`
                          : ''}
                      </p>
                    </div>

                    {briefingCtx.hasCeremony && (
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <h4 className="font-semibold text-zinc-900">
                          {briefingCtx.profile === '15_anos'
                            ? 'Cerimonial & Protocolo'
                            : 'Cerimônia e Entradas'}
                        </h4>
                        <p>
                          <strong className="text-zinc-600">
                            {briefingCtx.copy.celebrantLabel}:
                          </strong>{' '}
                          {eventBriefing.ceremony_info?.celebrant || 'A definir'}
                        </p>
                        <p>
                          <strong className="text-zinc-600">
                            {briefingCtx.copy.specialEntrancesLabel}:
                          </strong>{' '}
                          {eventBriefing.ceremony_info?.special_entrances || 'Nenhuma registrada'}
                        </p>
                        <p>
                          <strong className="text-zinc-600">Observações:</strong>{' '}
                          {eventBriefing.ceremony_info?.notes || 'Nenhuma'}
                        </p>
                      </div>
                    )}

                    {(briefingCtx.hasSpecialMoments || briefingCtx.hasParty) && (
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                        <h4 className="font-semibold text-zinc-900">Momentos & Festa</h4>
                        {briefingCtx.hasSpecialMoments && (
                          <>
                            <p>
                              <strong className="text-zinc-600">Surpresas:</strong>{' '}
                              {eventBriefing.special_moments?.surprise_details || 'Nenhuma informada'}
                            </p>
                            <p>
                              <strong className="text-zinc-600">Homenagens / Discursos:</strong>{' '}
                              {eventBriefing.special_moments?.tribute_details ||
                                eventBriefing.special_moments?.speech_details ||
                                'Nenhum informado'}
                            </p>
                          </>
                        )}
                        {briefingCtx.hasParty && (
                          <p>
                            <strong className="text-zinc-600">Atrações / Dinâmicas:</strong>{' '}
                            {eventBriefing.party_info?.attractions ||
                              eventBriefing.party_info?.games ||
                              'Não informado'}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <h4 className="font-semibold text-zinc-900">Preferências Fotográficas</h4>
                      <p>
                        <strong className="text-zinc-600">Estilo preferido:</strong>{' '}
                        <span className="capitalize">
                          {eventBriefing.preferences?.style || 'misto'}
                        </span>
                      </p>
                      <p>
                        <strong className="text-zinc-600">O que mais valorizam:</strong>{' '}
                        {eventBriefing.preferences?.photography_favorites || 'Não preenchido'}
                      </p>
                      {eventBriefing.preferences?.dislikes && (
                        <p>
                          <strong className="text-zinc-600">Evitar:</strong>{' '}
                          {eventBriefing.preferences.dislikes}
                        </p>
                      )}
                    </div>

                    {briefingCtx.hasEnsaio && (
                      <div className="p-4 rounded-xl bg-[#FAF7F2]/80 border border-[#E6DFD3] space-y-2 md:col-span-2">
                        <h4 className="font-semibold text-zinc-900 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#C5A880]" />
                          Direção do Ensaio ({briefingCtx.sessionLabel})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          <p>
                            <strong className="text-zinc-600">Clima / Estilo:</strong>{' '}
                            {eventBriefing.session_info?.session_vibe || 'Não informado'}
                          </p>
                          <p>
                            <strong className="text-zinc-600">Troca de roupas:</strong>{' '}
                            {eventBriefing.session_info
                              ? eventBriefing.session_info.has_outfit_changes
                                ? `Sim${
                                    eventBriefing.session_info.outfit_changes_details
                                      ? ` (${eventBriefing.session_info.outfit_changes_details})`
                                      : ''
                                  }`
                                : eventBriefing.session_info.outfit_changes_details
                                  ? `Não (${eventBriefing.session_info.outfit_changes_details})`
                                  : 'Não informado / 1 look'
                              : 'Não preenchido'}
                          </p>
                          <p>
                            <strong className="text-zinc-600">Partes do corpo / ângulos a evitar:</strong>{' '}
                            <span
                              className={
                                eventBriefing.session_info?.body_insecurities
                                  ? 'text-rose-700 font-medium'
                                  : ''
                              }
                            >
                              {eventBriefing.session_info?.body_insecurities || 'Nenhuma restrição'}
                            </span>
                          </p>
                          <p>
                            <strong className="text-zinc-600">Poses preferidas:</strong>{' '}
                            {eventBriefing.session_info?.preferred_poses || 'Não preenchido'}
                          </p>
                          <p>
                            <strong className="text-zinc-600">Poses a evitar:</strong>{' '}
                            {eventBriefing.session_info?.avoid_poses || 'Nenhuma'}
                          </p>
                          <p>
                            <strong className="text-zinc-600">Objetos / Acessórios / Pet:</strong>{' '}
                            {eventBriefing.session_info?.props_or_elements || 'Nenhum'}
                          </p>
                        </div>
                        {eventBriefing.session_info?.notes && (
                          <p className="pt-1 border-t border-[#E6DFD3]/70">
                            <strong className="text-zinc-600">Observações do ensaio:</strong>{' '}
                            {eventBriefing.session_info.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {briefingCtx.hasVideo && (
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 md:col-span-2">
                        <h4 className="font-semibold text-zinc-900 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-[#C5A880]" />
                          Direção de Vídeo & Cinema
                        </h4>
                        <p>
                          <strong className="text-zinc-600">Música especial:</strong>{' '}
                          {eventBriefing.video_info?.important_music || 'A definir'}
                        </p>
                        <p>
                          <strong className="text-zinc-600">Cenas essenciais no filme:</strong>{' '}
                          {eventBriefing.video_info?.essential_film_moments || 'Não preenchido'}
                        </p>
                        <p>
                          <strong className="text-zinc-600">Depoimentos durante o evento:</strong>{' '}
                          {eventBriefing.video_info?.record_testimonials ? 'Sim' : 'Não'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pessoas Importantes */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Pessoas Importantes Cadastradas
                    </h4>
                    {eventBriefing.people && eventBriefing.people.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {eventBriefing.people.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 rounded-xl border border-zinc-200 bg-white text-xs flex justify-between"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900">{p.name}</span>
                              <span className="block text-[11px] text-[#8B6E3F]">
                                {p.category}
                              </span>
                              {p.notes && <p className="text-zinc-500 mt-1">{p.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        Nenhuma pessoa cadastrada ainda pelo cliente.
                      </p>
                    )}
                  </div>

                  {/* Fotos Obrigatórias */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Fotos Que Não Podem Faltar
                    </h4>
                    {eventBriefing.required_photos && eventBriefing.required_photos.length > 0 ? (
                      <div className="space-y-2">
                        {eventBriefing.required_photos.map((rp) => (
                          <div
                            key={rp.id}
                            className="p-3 rounded-xl border border-zinc-200 bg-white text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-semibold text-zinc-900">{rp.description}</span>
                              {rp.people_involved && (
                                <span className="ml-2 text-[11px] text-zinc-500">
                                  ({rp.people_involved})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        Nenhuma foto obrigatória cadastrada ainda.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Nenhum briefing configurado para este evento.
                </div>
              )}
            </div>
          )}

          {/* 3. CRONOGRAMA (Item 18) */}
          {activeTab === 'cronograma' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Cronograma do Dia</h3>
                  <p className="text-xs text-zinc-500">
                    Sequência detalhada de horários e responsabilidades
                  </p>
                </div>
                <button
                  onClick={() => setTimelineModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>+ Adicionar Momento</span>
                </button>
              </div>

              {eventTimeline.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhum momento cadastrado no cronograma.
                </div>
              ) : (
                <div className="space-y-2">
                  {eventTimeline.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-[#EAEAE4] flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="px-3 py-1.5 rounded-xl bg-[#F7F3ED] border border-[#E8DEC8] text-center font-bold text-xs text-[#8B6E3F] shrink-0 font-mono">
                          {item.time}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-zinc-900">{item.title}</h4>
                          <p className="text-[11px] text-zinc-500">
                            {item.location && <span className="font-medium">{item.location} • </span>}
                            {item.description}
                          </p>
                          {item.responsible && (
                            <span className="inline-block text-[10px] text-zinc-400">
                              Responsável: {item.responsible}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTimelineMoment(item.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 transition-opacity shrink-0"
                        title="Excluir momento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. CHECKLIST (Item 17) */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Checklist Operacional</h3>
                  <p className="text-xs text-zinc-500">
                    Controle de equipamentos, baterias, coberturas e pós-produção
                  </p>
                </div>

                {/* Phase tabs */}
                <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'antes', label: 'Antes do Evento' },
                    { id: 'durante', label: 'No Evento' },
                    { id: 'pos', label: 'Pós-Evento' },
                  ].map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => setChecklistPhase(phase.id as typeof checklistPhase)}
                      className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-colors ${
                        checklistPhase === phase.id
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Task Input */}
              <form
                onSubmit={handleAddChecklistTask}
                className="p-3 bg-white rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
              >
                <select
                  value={newChecklistPhase}
                  onChange={(e) =>
                    setNewChecklistPhase(e.target.value as 'antes' | 'durante' | 'pos')
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800"
                >
                  <option value="antes">Antes do Evento</option>
                  <option value="durante">No Evento</option>
                  <option value="pos">Pós-Evento</option>
                </select>
                <input
                  type="text"
                  placeholder="Nova tarefa personalizada (ex: Separar filtro polarizador)..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-zinc-900 text-white font-medium"
                >
                  Adicionar
                </button>
              </form>

              {/* Checklist Tasks List */}
              <div className="p-4 bg-white rounded-2xl border border-[#EAEAE4] divide-y divide-zinc-100">
                {eventChecklist
                  .filter((item) =>
                    checklistPhase === 'todos' ? true : item.phase === checklistPhase
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleChecklistTask(task.id)}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-zinc-50/60 -mx-2 px-2 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {task.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-300 group-hover:text-zinc-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            task.is_completed
                              ? 'line-through text-zinc-400'
                              : 'text-zinc-800 font-medium'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-0.5 rounded bg-zinc-100">
                          {task.phase}
                        </span>
                        {task.is_custom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChecklistTask(task.id);
                            }}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 5. FINANCEIRO (Item 13) */}
          {activeTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-[11px] sm:text-xs text-zinc-400">Valor Total</span>
                  <p className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5 font-serif-brand">
                    {formatCurrency(event.value)}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-[11px] sm:text-xs text-zinc-400">Valor de Entrada</span>
                  <p className="text-base sm:text-lg font-bold text-zinc-900 mt-0.5 font-serif-brand">
                    {formatCurrency(event.deposit_value || 0)}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-[11px] sm:text-xs text-zinc-400">Total Recebido</span>
                  <p className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5 font-serif-brand">
                    {formatCurrency(
                      eventPayments
                        .filter((p) => p.status === 'pago')
                        .reduce((acc, p) => acc + p.amount, 0)
                    )}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-[11px] sm:text-xs text-zinc-400">Saldo a Receber</span>
                  <p className="text-base sm:text-lg font-bold text-[#8B6E3F] mt-0.5 font-serif-brand">
                    {formatCurrency(
                      eventPayments
                        .filter((p) => p.status !== 'pago')
                        .reduce((acc, p) => acc + p.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Installments table */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#EAEAE4] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-zinc-900">Parcelas e Recebimentos</h4>
                  <button
                    onClick={openConfigModal}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer self-start sm:self-auto"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Configurar Valor e Entrada</span>
                  </button>
                </div>
                {eventPayments.length === 0 ? (
                  <p className="text-xs text-zinc-400">Nenhum lançamento financeiro para este evento.</p>
                ) : (
                  <div className="space-y-2">
                    {eventPayments.map((p) => {
                      const pCfg = getPaymentStatusConfig(p.status);
                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-zinc-900">{p.description}</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Vencimento: {formatDate(p.due_date)} • {p.payment_method || 'PIX'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                            <span className="font-bold text-zinc-900">{formatCurrency(p.amount)}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pCfg.bg} ${pCfg.color}`}
                              >
                                {pCfg.label}
                              </span>
                            {p.status !== 'pago' && (
                              <button
                                onClick={() => {
                                  updatePayment(p.id, {
                                    status: 'pago',
                                    paid_at: new Date().toISOString(),
                                  });
                                  toast('Pagamento confirmado como PAGO!', 'success');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Baixar
                              </button>
                            )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. GALERIA (Item 19) */}
          {activeTab === 'galeria' && (
            <div className="space-y-4">
              {eventGalleries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400 space-y-3">
                  <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p>Nenhuma galeria associada a este evento ainda.</p>
                  <Link
                    href="/galerias"
                    className="inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
                  >
                    Ir para Central de Galerias
                  </Link>
                </div>
              ) : (
                eventGalleries.map((g) => (
                  <div
                    key={g.id}
                    className="p-5 bg-white rounded-2xl border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">{g.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {g.photos_count} fotos disponíveis • Expiração: {formatDate(g.expires_at)}
                      </p>
                      <p className="text-[11px] text-[#8B6E3F] mt-0.5">
                        {g.selected_count} fotos selecionadas pelo cliente
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/galeria/${g.token}`}
                        target="_blank"
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium flex items-center gap-1.5"
                      >
                        <span>Abrir Galeria Pública</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Adicionar Momento no Cronograma */}
        <Modal
          isOpen={timelineModalOpen}
          onClose={() => setTimelineModalOpen(false)}
          title="Novo Momento no Cronograma"
        >
          <form onSubmit={handleAddTimeline} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Horário *</label>
                <input
                  type="time"
                  required
                  value={timelineForm.time}
                  onChange={(e) => setTimelineForm({ ...timelineForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Título do Momento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Making of Noiva"
                  value={timelineForm.title}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Quarto da Noiva / Igreja"
                  value={timelineForm.location}
                  onChange={(e) => setTimelineForm({ ...timelineForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Fotógrafo 1 + Drone"
                  value={timelineForm.responsible}
                  onChange={(e) => setTimelineForm({ ...timelineForm, responsible: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição e Detalhes</label>
              <textarea
                rows={2}
                placeholder="Detalhes sobre a iluminação, lentes, etc."
                value={timelineForm.description}
                onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTimelineModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Adicionar ao Cronograma
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Configurar Evento (Pacote, Valor Total e Valor de Entrada) */}
        <Modal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          title="Configuração do Evento"
          subtitle="Altere o pacote escolhido, o valor de entrada e os dados do evento"
          maxWidth="xl"
        >
          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  value={configForm.name}
                  onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Tipo de Evento</label>
                <select
                  value={configForm.type}
                  onChange={(e) => {
                    const nextType = e.target.value as EventType;
                    const typePkgs = getPackagesForEventType(packages, nextType);
                    const validSrvs = getServicesForEventType(services, nextType);
                    const nextAddons = configForm.addons.filter((a) =>
                      validSrvs.some((s) => s.id === a.id)
                    );
                    const nextAddonsSum = nextAddons.reduce(
                      (acc, a) => acc + (Number(a.price) || 0),
                      0
                    );
                    const firstPkg = typePkgs[0];
                    setConfigForm({
                      ...configForm,
                      type: nextType,
                      addons: nextAddons,
                      ...(firstPkg
                        ? {
                            package_name: firstPkg.name,
                            package_id: firstPkg.id,
                            package_description: firstPkg.description,
                            value: (Number(firstPkg.price) || 0) + nextAddonsSum,
                          }
                        : {
                            package_name: 'Personalizado',
                            package_id: '',
                            package_description:
                              'Pacote com especificações e entregas customizadas para este evento.',
                            value: nextAddonsSum,
                          }),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                >
                  <option value="Casamento">Casamento</option>
                  <option value="15 anos">15 anos</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Ensaio">Ensaio</option>
                  <option value="Aniversário">Aniversário</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Esportivo">Esportivo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Pacote Escolhido ({configForm.type})
              </label>
              {(() => {
                const typePackages = getPackagesForEventType(packages, configForm.type);
                const addonsSum = configForm.addons.reduce(
                  (acc, a) => acc + (Number(a.price) || 0),
                  0
                );
                return (
                  <select
                    value={configForm.package_name}
                    onChange={(e) => {
                      if (e.target.value === 'Personalizado') {
                        setConfigForm({
                          ...configForm,
                          package_name: 'Personalizado',
                          package_id: '',
                          package_description:
                            'Pacote com especificações e entregas customizadas para este evento.',
                        });
                        return;
                      }
                      const pkgInfo = resolveEventPackage(typePackages, e.target.value);
                      setConfigForm({
                        ...configForm,
                        package_name: pkgInfo.name,
                        package_id: pkgInfo.id || '',
                        package_description: pkgInfo.description,
                        value: (Number(pkgInfo.price) || 0) + addonsSum,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white font-medium"
                  >
                    {typePackages.map((pkg) => (
                      <option key={pkg.id} value={pkg.name}>
                        {pkg.name} ({formatCurrency(pkg.price)})
                      </option>
                    ))}
                    <option value="Personalizado">Personalizado</option>
                  </select>
                );
              })()}

              {/* Prévia da Descrição do Pacote Escolhido */}
              {(() => {
                const selectedPkg = resolveEventPackage(
                  packages,
                  configForm.package_name,
                  configForm.package_id,
                  configForm.package_description
                );
                return (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">
                        Descrição do Pacote: {selectedPkg.name}
                      </span>
                      {selectedPkg.price > 0 && (
                        <span className="font-bold text-[#8B6E3F] font-serif-brand">
                          {formatCurrency(selectedPkg.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 leading-relaxed">{selectedPkg.description}</p>
                    {selectedPkg.features && selectedPkg.features.length > 0 && (
                      <div className="pt-1 border-t border-amber-200/40 text-[11px] text-zinc-600">
                        <strong>Itens inclusos:</strong> {selectedPkg.features.join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Adicionais do Evento */}
            {(() => {
              const availableSrvs = getServicesForEventType(services, configForm.type);
              if (availableSrvs.length === 0) return null;
              const addonsSum = configForm.addons.reduce(
                (acc, a) => acc + (Number(a.price) || 0),
                0
              );
              return (
                <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">
                      Adicionais (soma automática)
                    </span>
                    {addonsSum > 0 && (
                      <span className="text-[11px] font-semibold text-[#8B6E3F]">
                        + {formatCurrency(addonsSum)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableSrvs.map((srv) => {
                      const isSelected = configForm.addons.some((a) => a.id === srv.id);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => {
                            const nextAddons = isSelected
                              ? configForm.addons.filter((a) => a.id !== srv.id)
                              : [
                                  ...configForm.addons,
                                  { id: srv.id, name: srv.name, price: srv.price },
                                ];
                            setConfigForm({
                              ...configForm,
                              addons: nextAddons,
                              value: Math.max(
                                0,
                                (Number(configForm.value) || 0) +
                                  (isSelected ? -srv.price : srv.price)
                              ),
                            });
                          }}
                          className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/70 border-[#C5A880]'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-[#C5A880] border-[#C5A880] text-zinc-950'
                                  : 'border-zinc-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className="font-medium text-zinc-900 truncate">{srv.name}</span>
                          </div>
                          <span className="font-semibold text-[#8B6E3F] whitespace-nowrap">
                            + {formatCurrency(srv.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Datas Extras na Agenda */}
            <ExtraSessionsEditor
              sessions={configForm.extra_sessions}
              onChange={(next) => setConfigForm({ ...configForm, extra_sessions: next })}
              suggestedLabels={getSuggestedExtraSessions(
                configForm.package_name,
                configForm.package_description,
                configForm.addons
              )}
            />

            <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 uppercase tracking-wider text-[11px]">
                  Valores e Entrada do Evento (Sincronizado com o Financeiro)
                </span>
                <span className="text-[11px] font-semibold text-[#8B6E3F]">
                  Saldo restante:{' '}
                  {formatCurrency(Math.max(0, Number(configForm.value) - Number(configForm.deposit_value)))}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={configForm.value}
                    onChange={(e) => setConfigForm({ ...configForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Valor de Entrada (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={configForm.deposit_value}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, deposit_value: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Status da Entrada</label>
                  <select
                    value={configForm.deposit_paid ? 'pago' : 'pendente'}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, deposit_paid: e.target.value === 'pago' })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900"
                  >
                    <option value="pago">Entrada Paga</option>
                    <option value="pendente">Entrada Pendente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Data do Evento *</label>
                <input
                  type="date"
                  required
                  value={configForm.date}
                  onChange={(e) => setConfigForm({ ...configForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Horário</label>
                <input
                  type="time"
                  value={configForm.time}
                  onChange={(e) => setConfigForm({ ...configForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Local da Cobertura</label>
              <input
                type="text"
                value={configForm.location}
                onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição do Evento</label>
              <textarea
                rows={3}
                placeholder="Ex: Cerimônia religiosa com recepção para 200 convidados e ensaio externo..."
                value={configForm.description}
                onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Observações / Notas Internas</label>
              <textarea
                rows={2}
                placeholder="Notas de assessoria, preferências, etc."
                value={configForm.notes}
                onChange={(e) => setConfigForm({ ...configForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfigModalOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Evento</span>
              </button>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal Confirmar Exclusão do Evento */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Excluir Evento"
          subtitle="Esta ação não pode ser desfeita"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Tem certeza que deseja excluir o evento{' '}
              <strong className="text-zinc-900">{event.name}</strong>? Todos os dados vinculados a ele
              (briefing, cronograma, checklist, lançamentos financeiros e galerias) também serão removidos.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Evento</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

export default function EventDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando dados do evento...
        </div>
      }
    >
      <EventDetailContent />
    </React.Suspense>
  );
}

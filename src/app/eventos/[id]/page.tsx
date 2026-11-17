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
  getDeliveryStatusConfig,
  resolveEventPackage,
} from '@/lib/utils';
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
  Truck,
  FolderOpen,
  History,
  ClipboardList,
  Sparkles,
  Share2,
  Printer,
  Settings,
  Check,
  Package as PackageIcon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EventStatus, DeliveryStatus, EventType } from '@/types';

function EventDetailContent() {
  const params = useParams();
  const eventId = (params?.id as string) || '';
  const router = useRouter();
  const { toast } = useToast();
  const {
    events,
    clients,
    packages,
    checklists,
    timelines,
    briefings,
    payments,
    contracts,
    galleries,
    deliveries,
    updateEvent,
    deleteEvent,
    toggleChecklistTask,
    addChecklistTask,
    deleteChecklistTask,
    addTimelineMoment,
    deleteTimelineMoment,
    addPayment,
    updatePayment,
    addDelivery,
    updateDelivery,
    updateContract,
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

  const [activeTab, setActiveTab] = useState<
    | 'resumo'
    | 'briefing'
    | 'cronograma'
    | 'checklist'
    | 'financeiro'
    | 'contrato'
    | 'galeria'
    | 'entregas'
    | 'documentos'
    | 'historico'
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
  const [timelineForm, setTimelineForm] = useState({
    time: '16:00',
    title: '',
    location: '',
    description: '',
    responsible: 'Equipe G&C Studio',
    notes: '',
  });

  // Delivery add modal
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    name: 'Fotografias em Alta Resolução',
    deadline: '',
    notes: '',
    status: 'a_fazer' as DeliveryStatus,
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
  const eventContracts = contracts.filter((c) => c.event_id === event.id);
  const eventGalleries = galleries.filter((g) => g.event_id === event.id);
  const eventDeliveries = deliveries.filter((d) => d.event_id === event.id);

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
    const pkg = resolveEventPackage(packages, newPackageName);
    if (!pkg.is_custom) {
      updateEvent(event.id, {
        package_name: pkg.name,
        package_id: pkg.id,
        package_description: pkg.description,
        value: pkg.price,
      });
      toast(
        `Pacote alterado para "${pkg.name}" (${formatCurrency(pkg.price)}) e atualizado no Financeiro!`,
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

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.deadline) {
      toast('Informe o prazo da entrega.', 'error');
      return;
    }
    addDelivery({
      event_id: event.id,
      event_name: event.name,
      name: deliveryForm.name,
      deadline: deliveryForm.deadline,
      notes: deliveryForm.notes,
      status: deliveryForm.status,
    });
    setDeliveryModalOpen(false);
    toast('Entrega registrada para a produção!', 'success');
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
        <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                {event.type}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
            </div>

            <h1 className="font-serif-brand text-3xl sm:text-4xl font-normal text-zinc-900 tracking-tight">
              {event.name}
            </h1>

            {event.description && (
              <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed pt-0.5">
                {event.description}
              </p>
            )}

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

            {/* Descrição do Pacote no Painel do Evento */}
            <div className="pt-2 border-t border-zinc-100 max-w-2xl">
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                    <PackageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>
                      Pacote Contratado:{' '}
                      <strong className="text-[#8B6E3F]">
                        {event.package_name || currentPackageInfo?.name || 'Personalizado'}
                      </strong>
                    </span>
                  </span>
                  {currentPackageInfo && currentPackageInfo.price > 0 && (
                    <span className="text-xs font-bold text-[#8B6E3F] font-serif-brand">
                      {formatCurrency(currentPackageInfo.price)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed">
                  <span className="font-semibold text-zinc-800">Descrição do Pacote: </span>
                  {currentPackageInfo?.description ||
                    'Pacote com especificações e entregas customizadas para este evento.'}
                </p>

                {currentPackageInfo?.features && currentPackageInfo.features.length > 0 && (
                  <div className="pt-1.5 border-t border-amber-200/50 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                    {currentPackageInfo.features.map((feat, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: Status Selector, Value & Config Button */}
          <div className="flex flex-col sm:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
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
            </div>
          </div>
        </div>

        {/* 10 Abas do Evento */}
        <div className="border-b border-zinc-200 flex gap-1 sm:gap-2 overflow-x-auto text-xs font-medium">
          {[
            { id: 'resumo', label: 'Resumo', icon: Sparkles },
            { id: 'briefing', label: 'Briefing', icon: ClipboardList },
            { id: 'cronograma', label: `Cronograma (${eventTimeline.length})`, icon: Clock },
            { id: 'checklist', label: `Checklist (${eventChecklist.filter(c => c.is_completed).length}/${eventChecklist.length})`, icon: CheckCircle2 },
            { id: 'financeiro', label: `Financeiro (${eventPayments.length})`, icon: DollarSign },
            { id: 'contrato', label: `Contrato (${eventContracts.length})`, icon: FileText },
            { id: 'galeria', label: `Galeria (${eventGalleries.length})`, icon: ImageIcon },
            { id: 'entregas', label: `Entregas (${eventDeliveries.length})`, icon: Truck },
            { id: 'documentos', label: 'Documentos', icon: FolderOpen },
            { id: 'historico', label: 'Histórico', icon: History },
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
                    <h3 className="text-sm font-semibold text-zinc-900">Visão Geral & Configuração da Produção</h3>
                    <button
                      onClick={openConfigModal}
                      className="text-xs font-medium text-[#8B6E3F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar configurações
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400 block mb-1">Cliente Contratante</span>
                      <span className="font-semibold text-zinc-800">{event.client_name}</span>
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Pacote Escolhido (Alterar Pacote)</label>
                      <select
                        value={
                          packages.some((p) => p.name === event.package_name)
                            ? event.package_name
                            : currentPackageInfo?.name && packages.some((p) => p.name === currentPackageInfo.name)
                            ? currentPackageInfo.name
                            : 'Personalizado'
                        }
                        onChange={(e) => handlePackageChange(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-800 focus:outline-hidden focus:border-[#C5A880]"
                      >
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.name}>
                            {pkg.name} ({formatCurrency(pkg.price)})
                          </option>
                        ))}
                        <option value="Personalizado">
                          {event.package_name && !packages.some((p) => p.name === event.package_name)
                            ? `${event.package_name} (Personalizado)`
                            : 'Personalizado'}
                        </option>
                      </select>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Data e Horário</span>
                      <span className="font-semibold text-zinc-800">
                        {formatDate(event.date)} às {event.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Local da Cobertura</span>
                      <span className="font-semibold text-zinc-800">{event.location}</span>
                    </div>
                  </div>

                  {/* Descrição do Pacote Escolhido */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <PackageIcon className="w-4 h-4 text-[#8B6E3F]" />
                        Descrição do Pacote: {event.package_name || currentPackageInfo?.name || 'Personalizado'}
                      </span>
                      {currentPackageInfo && currentPackageInfo.price > 0 && (
                        <span className="text-xs font-bold text-[#8B6E3F] font-serif-brand">
                          {formatCurrency(currentPackageInfo.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-700 leading-relaxed">
                      {currentPackageInfo?.description ||
                        'Pacote com especificações e entregas customizadas para este evento.'}
                    </p>
                    {currentPackageInfo?.features && currentPackageInfo.features.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/50 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          Itens e Entregas Inclusas no Pacote:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                          {currentPackageInfo.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-zinc-700 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Descrição do Evento */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-zinc-600" />
                        Descrição do Evento
                      </span>
                      <button
                        onClick={openConfigModal}
                        className="text-[11px] text-[#8B6E3F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                    </div>
                    {event.description ? (
                      <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between text-zinc-400 italic py-0.5">
                        <span>Nenhuma descrição cadastrada para este evento.</span>
                        <button
                          onClick={openConfigModal}
                          className="not-italic text-[11px] font-medium text-zinc-700 hover:text-zinc-950 underline cursor-pointer"
                        >
                          + Adicionar descrição do evento
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Configuração rápida do Valor de Entrada e Valor do Evento */}
                  <div className="p-4 rounded-xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">
                        Valores & Entrada do Evento (Sincronizado com o Financeiro)
                      </span>
                      <button
                        onClick={openConfigModal}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 cursor-pointer"
                      >
                        Alterar Entrada / Valor
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 uppercase block">Valor Total</span>
                        <span className="text-sm font-bold text-zinc-900 font-serif-brand">
                          {formatCurrency(event.value)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 uppercase block">Valor de Entrada</span>
                        <span className="text-sm font-bold text-emerald-700 font-serif-brand">
                          {formatCurrency(event.deposit_value || 0)}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1.5">
                          ({event.deposit_paid ? 'Paga' : 'Pendente'})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-zinc-200/80">
                        <span className="text-[10px] text-zinc-400 uppercase block">Saldo Restante</span>
                        <span className="text-sm font-bold text-[#8B6E3F] font-serif-brand">
                          {formatCurrency(Math.max(0, event.value - (event.deposit_value || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.notes && (
                    <div className="pt-3 border-t border-zinc-100 text-xs">
                      <span className="text-zinc-400 block mb-1">Notas do Evento</span>
                      <p className="p-3 bg-zinc-50 rounded-xl text-zinc-700 leading-relaxed">
                        {event.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Briefing Fast Card */}
                {eventBriefing && (
                  <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-900">Briefing dos Clientes</span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Status atual: <span className="font-medium text-zinc-700">{eventBriefing.status}</span>
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

              {/* Sidebar: Checklist rápido */}
              <div className="space-y-4">
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

          {/* 2. BRIEFING (Item 16) */}
          {activeTab === 'briefing' && (
            <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] space-y-6">
              {eventBriefing ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2">
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
                        Link público sem necessidade de login para os clientes responderem via celular.
                      </p>
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

                  {/* Informações preenchidas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <h4 className="font-semibold text-zinc-900">Locais e Horários</h4>
                      <p>
                        <strong className="text-zinc-600">Making of:</strong>{' '}
                        {eventBriefing.event_info?.making_of_address || 'Não preenchido'}
                      </p>
                      <p>
                        <strong className="text-zinc-600">Chegada da Equipe:</strong>{' '}
                        {eventBriefing.event_info?.team_arrival_time || '13:00'}
                      </p>
                      <p>
                        <strong className="text-zinc-600">Cerimônia:</strong>{' '}
                        {eventBriefing.event_info?.ceremony_location || event.location}
                      </p>
                      <p>
                        <strong className="text-zinc-600">Recepção:</strong>{' '}
                        {eventBriefing.event_info?.reception_location || event.location}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                      <h4 className="font-semibold text-zinc-900">Cerimônia e Entradas</h4>
                      <p>
                        <strong className="text-zinc-600">Celebrante:</strong>{' '}
                        {eventBriefing.ceremony_info?.celebrant || 'A definir'}
                      </p>
                      <p>
                        <strong className="text-zinc-600">Entradas especiais:</strong>{' '}
                        {eventBriefing.ceremony_info?.special_entrances || 'Nenhuma registrada'}
                      </p>
                      <p>
                        <strong className="text-zinc-600">Observações:</strong>{' '}
                        {eventBriefing.ceremony_info?.notes || 'Nenhuma'}
                      </p>
                    </div>
                  </div>

                  {/* Pessoas Importantes (Item 15 - Etapa 3) */}
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

                  {/* Fotos Obrigatórias (Item 15 - Etapa 4) */}
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
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 transition-opacity"
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
                <div className="flex items-center gap-1.5 text-xs">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'antes', label: 'Antes do Evento' },
                    { id: 'durante', label: 'No Evento' },
                    { id: 'pos', label: 'Pós-Evento' },
                  ].map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => setChecklistPhase(phase.id as typeof checklistPhase)}
                      className={`px-3 py-1 rounded-xl font-medium transition-colors ${
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
                className="p-3 bg-white rounded-2xl border border-zinc-200 flex items-center gap-2 text-xs"
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
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 transition-opacity"
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
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-xs text-zinc-400">Valor Total do Evento</span>
                  <p className="text-lg font-bold text-zinc-900 mt-0.5 font-serif-brand">
                    {formatCurrency(event.value)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-xs text-zinc-400">Valor de Entrada Configurado</span>
                  <p className="text-lg font-bold text-zinc-900 mt-0.5 font-serif-brand">
                    {formatCurrency(event.deposit_value || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-xs text-zinc-400">Total Recebido</span>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5 font-serif-brand">
                    {formatCurrency(
                      eventPayments
                        .filter((p) => p.status === 'pago')
                        .reduce((acc, p) => acc + p.amount, 0)
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4]">
                  <span className="text-xs text-zinc-400">Saldo a Receber</span>
                  <p className="text-lg font-bold text-[#8B6E3F] mt-0.5 font-serif-brand">
                    {formatCurrency(
                      eventPayments
                        .filter((p) => p.status !== 'pago')
                        .reduce((acc, p) => acc + p.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Installments table */}
              <div className="p-5 bg-white rounded-2xl border border-[#EAEAE4] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-zinc-900">Parcelas e Recebimentos</h4>
                  <button
                    onClick={openConfigModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer"
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
                          className="p-3 rounded-xl border border-zinc-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-zinc-900">{p.description}</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Vencimento: {formatDate(p.due_date)} • {p.payment_method || 'PIX'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-zinc-900">{formatCurrency(p.amount)}</span>
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. CONTRATO (Item 12) */}
          {activeTab === 'contrato' && (
            <div className="p-6 bg-white rounded-2xl border border-[#EAEAE4] space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-zinc-900">Contrato de Prestação de Serviços</h3>
              {eventContracts.length === 0 ? (
                <div className="p-8 text-center text-zinc-400">
                  Nenhum contrato gerado para este evento.
                </div>
              ) : (
                eventContracts.map((c) => (
                  <div key={c.id} className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
                      <div>
                        <span className="font-semibold text-zinc-900">{c.template_title}</span>
                        <p className="text-zinc-500 mt-0.5">
                          Status: <strong className="capitalize">{c.status}</strong>
                          {c.signed_at && ` • Assinado em ${formatDate(c.signed_at)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* WhatsApp send button */}
                        <button
                          onClick={() => {
                            if (!client?.whatsapp) {
                              toast('Cliente sem WhatsApp cadastrado.', 'error');
                              return;
                            }
                            const msg = `Olá, ${client.name}! Tudo bem?\n\nAqui é da G&C Studio. Segue o contrato de prestação de serviços referente ao seu evento "${event.name}".\n\n${
                              c.external_url ? `Link para assinatura digital:\n${c.external_url}\n\n` : ''
                            }Ficamos à disposição para quaisquer dúvidas e para confirmar a reserva oficial!\n\nG&C Studio • Fotografia & Cinema`;
                            window.open(getWhatsAppUrl(client.whatsapp, msg), '_blank');
                            if (c.status === 'rascunho') updateContract(c.id, { status: 'enviado' });
                            toast('WhatsApp aberto para envio do contrato!', 'success');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enviar WhatsApp</span>
                        </button>

                        {/* Print / Save PDF button */}
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Imprimir / PDF</span>
                        </button>

                        {c.external_url && (
                          <a
                            href={c.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#C5A880]/15 text-[#8B6E3F] border border-[#C5A880]/30 transition-colors flex items-center gap-1.5 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Assinar Online</span>
                          </a>
                        )}

                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-xl font-mono text-[11px] text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {c.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 7. GALERIA (Item 19) */}
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

          {/* 8. ENTREGAS (Item 20) */}
          {activeTab === 'entregas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Entregas do Evento</h3>
                  <p className="text-xs text-zinc-500">
                    Controle de prazos de edição, teasers, filmes e álbuns
                  </p>
                </div>
                <button
                  onClick={() => setDeliveryModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>+ Nova Entrega</span>
                </button>
              </div>

              {eventDeliveries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhuma entrega cadastrada para este evento.
                </div>
              ) : (
                <div className="space-y-2">
                  {eventDeliveries.map((del) => {
                    const delCfg = getDeliveryStatusConfig(del.status);
                    return (
                      <div
                        key={del.id}
                        className="p-4 rounded-2xl bg-white border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-zinc-900">{del.name}</span>
                          <p className="text-zinc-500 mt-0.5">
                            Prazo: {formatDate(del.deadline)} {del.notes && `• ${del.notes}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={del.status}
                            onChange={(e) =>
                              updateDelivery(del.id, {
                                status: e.target.value as DeliveryStatus,
                              })
                            }
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border border-zinc-200 bg-white ${delCfg.color}`}
                          >
                            <option value="a_fazer">A Fazer</option>
                            <option value="em_producao">Em Produção</option>
                            <option value="em_revisao">Em Revisão</option>
                            <option value="pronto">Pronto</option>
                            <option value="entregue">Entregue</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 9. DOCUMENTOS (Item 21) */}
          {activeTab === 'documentos' && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400 space-y-2">
              <FolderOpen className="w-8 h-8 text-zinc-300 mx-auto" />
              <p>Nenhum documento anexado ainda a este evento.</p>
            </div>
          )}

          {/* 10. HISTÓRICO */}
          {activeTab === 'historico' && (
            <div className="p-6 bg-white rounded-2xl border border-[#EAEAE4] space-y-3 text-xs text-zinc-600">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                <span>Evento criado e registrado no sistema em {formatDate(event.created_at)}</span>
              </div>
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

        {/* Modal Adicionar Entrega */}
        <Modal
          isOpen={deliveryModalOpen}
          onClose={() => setDeliveryModalOpen(false)}
          title="Nova Entrega do Evento"
        >
          <form onSubmit={handleAddDelivery} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Item da Entrega *</label>
              <select
                value={deliveryForm.name}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="Fotografias em Alta Resolução">Fotografias em Alta Resolução</option>
                <option value="Vídeo Teaser (Instagram)">Vídeo Teaser (Instagram)</option>
                <option value="Filme Completo Documental">Filme Completo Documental</option>
                <option value="Reels Making Of">Reels Making Of</option>
                <option value="Álbum Fine Art">Álbum Fine Art</option>
                <option value="Quadro de Recepção">Quadro de Recepção</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Prazo de Conclusão *</label>
              <input
                type="date"
                required
                value={deliveryForm.deadline}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Observações</label>
              <input
                type="text"
                value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeliveryModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Salvar Entrega
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
                  onChange={(e) => setConfigForm({ ...configForm, type: e.target.value as EventType })}
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
              <label className="block font-medium text-zinc-700 mb-1">Pacote Escolhido</label>
              <select
                value={configForm.package_name}
                onChange={(e) => {
                  const pkgInfo = resolveEventPackage(packages, e.target.value);
                  setConfigForm({
                    ...configForm,
                    package_name: pkgInfo.name,
                    package_id: pkgInfo.id || '',
                    package_description: pkgInfo.description,
                    value: pkgInfo.price || configForm.value,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white font-medium"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.name}>
                    {pkg.name} ({formatCurrency(pkg.price)})
                  </option>
                ))}
                <option value="Personalizado">Personalizado</option>
              </select>

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

            <div className="flex justify-end gap-2 pt-2">
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
          </form>
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

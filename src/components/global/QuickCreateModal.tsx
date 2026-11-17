'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';
import { useToast } from '@/components/ui/Toast';
import {
  Users,
  Kanban,
  Calendar,
  FileSpreadsheet,
  Image as ImageIcon,
  Truck,
} from 'lucide-react';
import { EventType, LeadStatus } from '@/types';
import { formatPhoneInput, extractNationalDigits, resolveEventPackage, sortEventsByProximity } from '@/lib/utils';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'client' | 'lead' | 'event' | 'quote' | 'gallery' | 'delivery';
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'client',
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'lead' | 'event' | 'quote' | 'gallery' | 'delivery'>(defaultTab);
  const { toast } = useToast();
  const {
    clients,
    events,
    packages,
    addClient,
    addLead,
    addEvent,
    addQuote,
    addGallery,
    addDelivery,
  } = useAppStore();
  const today = useToday();

  const sortedEvents = React.useMemo(() => sortEventsByProximity(events, today), [events, today]);

  // Client form state
  const [clientPhoneInput, setClientPhoneInput] = useState('');
  const [leadPhoneInput, setLeadPhoneInput] = useState('');
  const [clientForm, setClientForm] = useState({
    name: '',
    partner_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    event_type: 'Casamento' as EventType,
    notes: '',
  });

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    event_type: 'Casamento' as EventType,
    event_date: '',
    location: '',
    guest_count: 150,
    estimated_value: 8000,
    origin: 'Instagram',
    notes: '',
    status: 'NOVO CONTATO' as LeadStatus,
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    client_id: '',
    name: '',
    type: 'Casamento' as EventType,
    date: '',
    time: '16:00',
    location: '',
    package_name: packages[0]?.name || 'PACOTE 1 — Fotografia',
    package_id: packages[0]?.id || 'pkg-1',
    package_description:
      packages[0]?.description ||
      'Cobertura da Cerimônia + Recepção + 1h festa. Todas as fotos em alta resolução.',
    value: packages[0]?.price || 1000,
    deposit_value: 300,
    deposit_paid: true,
    description: '',
    notes: '',
  });

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    client_id: '',
    package_name: 'Essência — Fotografia',
    total_value: 6800,
    deposit_value: 2000,
    installments_count: 4,
    payment_method: 'Sinal 30% + Saldo até o evento',
    validity_date: '',
    notes: '',
  });

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    event_id: '',
    title: '',
    cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    description: '',
    expiration_days: 60,
    selection_max: 80,
    video_url: '',
    video_title: 'Teaser Cinematográfico 4K',
  });

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    event_id: '',
    name: 'Fotografias em Alta Resolução',
    deadline: '',
    notes: '',
  });

  // Submits
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nationalDigits = extractNationalDigits(clientPhoneInput);
    if (!clientForm.name.trim() || nationalDigits.length < 10) {
      toast('Preencha o nome e o WhatsApp com DDD e número válido.', 'error');
      return;
    }
    const fullWa = '55' + nationalDigits;
    const formattedPhone = formatPhoneInput(nationalDigits);
    addClient({
      ...clientForm,
      phone: formattedPhone,
      whatsapp: fullWa,
      status: 'ativo',
    });
    toast('Cliente cadastrado com sucesso!', 'success');
    setClientPhoneInput('');
    setClientForm({
      name: '',
      partner_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      event_type: 'Casamento',
      notes: '',
    });
    onClose();
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nationalDigits = extractNationalDigits(leadPhoneInput);
    if (!leadForm.name.trim() || nationalDigits.length < 10) {
      toast('Preencha o nome e o WhatsApp do lead com DDD e número válido.', 'error');
      return;
    }
    addLead({
      ...leadForm,
      whatsapp: '55' + nationalDigits,
    });
    toast('Lead registrado no CRM!', 'success');
    setLeadPhoneInput('');
    onClose();
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.date || !eventForm.client_id) {
      toast('Selecione um cliente e informe nome e data do evento.', 'error');
      return;
    }
    const selectedClient = clients.find((c) => c.id === eventForm.client_id);
    const resolved = resolveEventPackage(
      packages,
      eventForm.package_name,
      eventForm.package_id,
      eventForm.package_description
    );
    addEvent({
      ...eventForm,
      package_name: eventForm.package_name || resolved.name,
      package_id: eventForm.package_id || resolved.id,
      package_description: eventForm.package_description || resolved.description,
      client_name: selectedClient ? selectedClient.name : 'Cliente',
      status: 'confirmado',
    });
    toast('Evento criado e valores lançados automaticamente no Financeiro!', 'success');
    onClose();
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.client_id) {
      toast('Selecione um cliente para a proposta.', 'error');
      return;
    }
    const client = clients.find((c) => c.id === quoteForm.client_id);
    if (!client) return;
    addQuote({
      client_id: client.id,
      client_name: client.name,
      event_name: client.name,
      event_type: client.event_type,
      event_date: new Date().toISOString().split('T')[0],
      package_name: quoteForm.package_name,
      services: [],
      total_value: Number(quoteForm.total_value),
      deposit_value: Number(quoteForm.deposit_value),
      installments_count: Number(quoteForm.installments_count),
      payment_method: quoteForm.payment_method,
      validity_date: quoteForm.validity_date || new Date().toISOString().split('T')[0],
      notes: quoteForm.notes,
      status: 'enviado',
    });
    toast('Orçamento gerado e link público disponível!', 'success');
    onClose();
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.event_id || !galleryForm.title) {
      toast('Preencha o título e selecione o evento.', 'error');
      return;
    }
    const event = events.find((ev) => ev.id === galleryForm.event_id);
    if (!event) return;
    const expires = new Date();
    expires.setDate(expires.getDate() + Number(galleryForm.expiration_days));

    addGallery({
      event_id: event.id,
      client_id: event.client_id,
      client_name: event.client_name,
      title: galleryForm.title,
      cover_url: galleryForm.cover_url,
      description: galleryForm.description,
      expires_at: expires.toISOString(),
      download_enabled: true,
      favorites_enabled: true,
      selection_enabled: true,
      selection_max: Number(galleryForm.selection_max),
      video_url: galleryForm.video_url.trim() || undefined,
      video_title: galleryForm.video_title.trim() || undefined,
    });
    toast('Galeria criada e pronta para receber fotos!', 'success');
    onClose();
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.event_id || !deliveryForm.deadline) {
      toast('Selecione o evento e defina o prazo.', 'error');
      return;
    }
    const event = events.find((ev) => ev.id === deliveryForm.event_id);
    if (!event) return;
    addDelivery({
      event_id: event.id,
      event_name: event.name,
      name: deliveryForm.name,
      deadline: deliveryForm.deadline,
      notes: deliveryForm.notes,
      status: 'a_fazer',
    });
    toast('Entrega agendada no painel!', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Cadastro — G&C Studio"
      subtitle="Crie rapidamente qualquer registro no sistema"
      maxWidth="2xl"
    >
      {/* Tab Selector */}
      <div className="flex border-b border-zinc-200 pb-3 gap-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('client')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'client'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Cliente
        </button>
        <button
          onClick={() => setActiveTab('lead')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'lead'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" /> Lead (CRM)
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'event'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Evento
        </button>
        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'quote'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Orçamento
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'gallery'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Galeria
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'delivery'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> Entrega
        </button>
      </div>

      <div className="pt-4">
        {/* CLIENT FORM */}
        {activeTab === 'client' && (
          <form onSubmit={handleClientSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Nome Principal / Casal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Larissa & Gabriel"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Cônjuge / Parceiro (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Gabriel Souza"
                  value={clientForm.partner_name}
                  onChange={(e) => setClientForm({ ...clientForm, partner_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">WhatsApp / Celular *</label>
                <div className="flex items-center rounded-xl border border-zinc-200 bg-white overflow-hidden focus-within:border-[#C5A880] focus-within:ring-1 focus-within:ring-[#C5A880]/20">
                  <span className="px-3 py-2 bg-zinc-100 border-r border-zinc-200 text-zinc-700 font-semibold text-xs select-none flex items-center gap-1.5 shrink-0">
                    <span>🇧🇷</span> +55
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="(41) 99999-8888"
                    value={clientPhoneInput}
                    onChange={(e) => setClientPhoneInput(formatPhoneInput(e.target.value))}
                    className="w-full px-3 py-2 text-xs text-zinc-900 focus:outline-hidden bg-transparent"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Digite apenas o DDD e o número.</p>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Tipo de Evento</label>
                <select
                  value={clientForm.event_type}
                  onChange={(e) => setClientForm({ ...clientForm, event_type: e.target.value as EventType })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="Casamento">Casamento</option>
                  <option value="15 anos">15 anos</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Ensaio">Ensaio</option>
                  <option value="Aniversário">Aniversário</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Observações Internas</label>
              <input
                type="text"
                placeholder="Notas, preferências, etc."
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Cadastrar Cliente
              </button>
            </div>
          </form>
        )}

        {/* LEAD FORM */}
        {activeTab === 'lead' && (
          <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Nome do Lead / Casal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda & Roberto"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">WhatsApp / Celular *</label>
                <div className="flex items-center rounded-xl border border-zinc-200 bg-white overflow-hidden focus-within:border-[#C5A880] focus-within:ring-1 focus-within:ring-[#C5A880]/20">
                  <span className="px-3 py-2 bg-zinc-100 border-r border-zinc-200 text-zinc-700 font-semibold text-xs select-none flex items-center gap-1.5 shrink-0">
                    <span>🇧🇷</span> +55
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="(41) 99999-8888"
                    value={leadPhoneInput}
                    onChange={(e) => setLeadPhoneInput(formatPhoneInput(e.target.value))}
                    className="w-full px-3 py-2 text-xs text-zinc-900 focus:outline-hidden bg-transparent"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Digite apenas o DDD e o número.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Tipo de Evento</label>
                <select
                  value={leadForm.event_type}
                  onChange={(e) => setLeadForm({ ...leadForm, event_type: e.target.value as EventType })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="Casamento">Casamento</option>
                  <option value="15 anos">15 anos</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Ensaio">Ensaio</option>
                  <option value="Corporativo">Corporativo</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Data Prevista</label>
                <input
                  type="date"
                  value={leadForm.event_date}
                  onChange={(e) => setLeadForm({ ...leadForm, event_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Valor Estimado (R$)</label>
                <input
                  type="number"
                  value={leadForm.estimated_value}
                  onChange={(e) => setLeadForm({ ...leadForm, estimated_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Origem do Contato</label>
                <input
                  type="text"
                  placeholder="Ex: Instagram, Indicação, Google"
                  value={leadForm.origin}
                  onChange={(e) => setLeadForm({ ...leadForm, origin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Local do Evento</label>
                <input
                  type="text"
                  placeholder="Ex: Espaço Serra do Mar"
                  value={leadForm.location}
                  onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Criar Lead no CRM
              </button>
            </div>
          </form>
        )}

        {/* EVENT FORM */}
        {activeTab === 'event' && (
          <form onSubmit={handleEventSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Vincular a Cliente *</label>
                <select
                  required
                  value={eventForm.client_id}
                  onChange={(e) => {
                    const c = clients.find((cli) => cli.id === e.target.value);
                    const categoryPkg = c
                      ? packages.find((p) => p.category === c.event_type)
                      : undefined;
                    setEventForm({
                      ...eventForm,
                      client_id: e.target.value,
                      name: c ? c.name : eventForm.name,
                      type: c ? c.event_type : eventForm.type,
                      ...(categoryPkg
                        ? {
                            package_name: categoryPkg.name,
                            package_id: categoryPkg.id,
                            package_description: categoryPkg.description,
                            value: categoryPkg.price,
                          }
                        : {}),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.event_type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Casamento Jéssica & Pedro"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Pacote Escolhido</label>
                <select
                  value={eventForm.package_name}
                  onChange={(e) => {
                    const pkgInfo = resolveEventPackage(packages, e.target.value);
                    setEventForm({
                      ...eventForm,
                      package_name: pkgInfo.name,
                      package_id: pkgInfo.id || '',
                      package_description: pkgInfo.description,
                      value: pkgInfo.price || eventForm.value,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (R$ {p.price.toLocaleString('pt-BR')})
                    </option>
                  ))}
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Data do Evento *</label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Horário de Início</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            {/* Descrição do Pacote Selecionado */}
            {(() => {
              const selectedPkg = resolveEventPackage(
                packages,
                eventForm.package_name,
                eventForm.package_id,
                eventForm.package_description
              );
              return (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">
                      Descrição do Pacote: {selectedPkg.name}
                    </span>
                    {selectedPkg.price > 0 && (
                      <span className="font-bold text-[#8B6E3F] font-serif-brand">
                        R$ {selectedPkg.price.toLocaleString('pt-BR')}
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

            {/* Descrição do Evento */}
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição do Evento</label>
              <textarea
                rows={2}
                placeholder="Ex: Cerimônia religiosa com recepção para 150 convidados e ensaio externo..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            {/* Configuração Financeira do Evento (Valor Total + Entrada) */}
            <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-800 uppercase tracking-wider">
                  Configuração Financeira (Vai direto para o Financeiro)
                </span>
                <span className="text-[11px] text-[#8B6E3F] font-medium">
                  Saldo restante: R$ {Math.max(0, Number(eventForm.value) - Number(eventForm.deposit_value)).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Valor Total do Evento (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.value}
                    onChange={(e) => setEventForm({ ...eventForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Valor de Entrada / Sinal (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={eventForm.deposit_value}
                    onChange={(e) => setEventForm({ ...eventForm, deposit_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Status da Entrada</label>
                  <select
                    value={eventForm.deposit_paid ? 'pago' : 'pendente'}
                    onChange={(e) => setEventForm({ ...eventForm, deposit_paid: e.target.value === 'pago' })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                  >
                    <option value="pago">Entrada já paga (Recebida)</option>
                    <option value="pendente">Entrada pendente (A receber)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Local / Endereço Completo</label>
              <input
                type="text"
                placeholder="Ex: Casa Petra - Av. Aratãs, 1010 - Moema, SP"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Criar Evento
              </button>
            </div>
          </form>
        )}

        {/* QUOTE FORM */}
        {activeTab === 'quote' && (
          <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Cliente *</label>
                <select
                  required
                  value={quoteForm.client_id}
                  onChange={(e) => {
                    const c = clients.find((cli) => cli.id === e.target.value);
                    const categoryPkg = c
                      ? packages.find((p) => p.category === c.event_type)
                      : undefined;
                    setQuoteForm({
                      ...quoteForm,
                      client_id: e.target.value,
                      ...(categoryPkg
                        ? {
                            package_name: categoryPkg.name,
                            total_value: categoryPkg.price,
                          }
                        : {}),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="">Selecione...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Pacote Base</label>
                <select
                  value={quoteForm.package_name}
                  onChange={(e) => {
                    const pkg = packages.find((p) => p.name === e.target.value);
                    setQuoteForm({
                      ...quoteForm,
                      package_name: e.target.value,
                      total_value: pkg ? pkg.price : quoteForm.total_value,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (R$ {p.price.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  value={quoteForm.total_value}
                  onChange={(e) => setQuoteForm({ ...quoteForm, total_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Entrada / Sinal (R$)</label>
                <input
                  type="number"
                  value={quoteForm.deposit_value}
                  onChange={(e) => setQuoteForm({ ...quoteForm, deposit_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Número de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={quoteForm.installments_count}
                  onChange={(e) => setQuoteForm({ ...quoteForm, installments_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Gerar Proposta
              </button>
            </div>
          </form>
        )}

        {/* GALLERY FORM */}
        {activeTab === 'gallery' && (
          <form onSubmit={handleGallerySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Vincular ao Evento *</label>
                <select
                  required
                  value={galleryForm.event_id}
                  onChange={(e) => {
                    const ev = events.find((item) => item.id === e.target.value);
                    setGalleryForm({
                      ...galleryForm,
                      event_id: e.target.value,
                      title: ev ? `${ev.name} — Galeria Oficial` : galleryForm.title,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="">Selecione o evento...</option>
                  {sortedEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Título da Galeria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luísa & Felipe — Casamento"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Prazo de Expiração (Dias)</label>
                <select
                  value={galleryForm.expiration_days}
                  onChange={(e) => setGalleryForm({ ...galleryForm, expiration_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="30">30 dias</option>
                  <option value="60">60 dias</option>
                  <option value="90">90 dias</option>
                  <option value="180">180 dias</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Limite de Fotos para Álbum</label>
                <input
                  type="number"
                  value={galleryForm.selection_max}
                  onChange={(e) => setGalleryForm({ ...galleryForm, selection_max: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Foto de Capa (URL)</label>
              <input
                type="text"
                value={galleryForm.cover_url}
                onChange={(e) => setGalleryForm({ ...galleryForm, cover_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Link do Vídeo / Teaser (Opcional — YouTube, Vimeo ou MP4)
              </label>
              <input
                type="text"
                placeholder="Ex: https://vimeo.com/... ou https://youtu.be/..."
                value={galleryForm.video_url}
                onChange={(e) => setGalleryForm({ ...galleryForm, video_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Criar Galeria
              </button>
            </div>
          </form>
        )}

        {/* DELIVERY FORM */}
        {activeTab === 'delivery' && (
          <form onSubmit={handleDeliverySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Evento *</label>
                <select
                  required
                  value={deliveryForm.event_id}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, event_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="">Selecione o evento...</option>
                  {sortedEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Tipo de Entrega *</label>
                <select
                  value={deliveryForm.name}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="Fotografias em Alta Resolução">Fotografias em Alta Resolução</option>
                  <option value="Vídeo Teaser (Instagram)">Vídeo Teaser (Instagram)</option>
                  <option value="Filme Completo Documental">Filme Completo Documental</option>
                  <option value="Reels Making Of">Reels Making Of</option>
                  <option value="Álbum Fine Art">Álbum Fine Art</option>
                  <option value="Quadro de Recepção">Quadro de Recepção</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Prazo de Conclusão *</label>
              <input
                type="date"
                required
                value={deliveryForm.deadline}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
              >
                Agendar Entrega
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

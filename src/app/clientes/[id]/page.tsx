'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';
import {
  formatCurrency,
  formatDate,
  getWhatsAppUrl,
  getEventStatusConfig,
  getPaymentStatusConfig,
  formatPhoneInput,
  extractNationalDigits,
  resolveEventPackage,
  sortEventsByProximity,
} from '@/lib/utils';
import {
  Users,
  Phone,
  Mail,
  MessageCircle,
  Edit3,
  Calendar,
  FileSpreadsheet,
  DollarSign,
  Image as ImageIcon,
  FolderOpen,
  History,
  ArrowLeft,
  Plus,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

function ClientProfileContent() {
  const params = useParams();
  const clientId = (params?.id as string) || '';
  const router = useRouter();
  const { toast } = useToast();
  const {
    clients,
    events,
    packages,
    quotes,
    payments,
    galleries,
    updateClient,
    deleteClient,
  } = useAppStore();
  const today = useToday();

  const client = clients.find((c) => c.id === clientId);
  const [activeTab, setActiveTab] = useState<
    'visao_geral' | 'eventos' | 'orcamentos' | 'financeiro' | 'galerias' | 'documentos' | 'historico'
  >('visao_geral');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPhoneInput, setEditPhoneInput] = useState('');
  const [editForm, setEditForm] = useState({
    name: client?.name || '',
    partner_name: client?.partner_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    whatsapp: client?.whatsapp || '',
    status: client?.status || 'ativo',
    notes: client?.notes || '',
  });

  if (!client) {
    return (
      <AppShell>
        <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-4">
          <Users className="w-10 h-10 text-zinc-300 mx-auto" />
          <h2 className="text-base font-semibold text-zinc-800">Cliente não encontrado</h2>
          <p className="text-xs text-zinc-500">Este cliente pode ter sido removido ou o ID é inválido.</p>
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
          </Link>
        </div>
      </AppShell>
    );
  }

  const clientEvents = sortEventsByProximity(events.filter((e) => e.client_id === client.id), today);
  const clientQuotes = quotes.filter((q) => q.client_id === client.id);
  const clientPayments = payments.filter((p) => p.client_id === client.id);
  const clientGalleries = galleries.filter((g) => g.client_id === client.id);

  const waUrl = getWhatsAppUrl(
    client.whatsapp,
    `Olá, ${client.name}! Estamos entrando em contato da G&C Studio.`
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nationalDigits = extractNationalDigits(editPhoneInput);
    if (!editForm.name.trim() || nationalDigits.length < 10) {
      toast('Preencha o nome e o WhatsApp com DDD e número válido.', 'error');
      return;
    }
    const fullWa = '55' + nationalDigits;
    const formattedPhone = formatPhoneInput(nationalDigits);
    updateClient(client.id, {
      ...editForm,
      whatsapp: fullWa,
      phone: formattedPhone,
    });
    toast('Dados do cliente atualizados!', 'success');
    setEditModalOpen(false);
  };

  const handleDeleteClient = () => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      deleteClient(client.id);
      toast('Cliente excluído.', 'info');
      router.push('/clientes');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Back Link */}
        <div>
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Clientes</span>
          </Link>
        </div>

        {/* Client Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-[#C5A880] font-serif-brand font-semibold text-xl shrink-0 shadow-xs">
              {client.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                  {client.event_type}
                </span>
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
              <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 mt-1">
                {client.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2 self-start md:self-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => {
                const digits = extractNationalDigits(client.whatsapp || client.phone || '');
                setEditPhoneInput(formatPhoneInput(digits));
                setEditForm({
                  name: client.name,
                  partner_name: client.partner_name || '',
                  email: client.email || '',
                  phone: client.phone,
                  whatsapp: client.whatsapp,
                  status: client.status,
                  notes: client.notes || '',
                });
                setEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-medium shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={handleDeleteClient}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Excluir cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Abas do Cliente */}
        <div className="border-b border-zinc-200 flex gap-2 overflow-x-auto no-scrollbar text-xs font-medium">
          {[
            { id: 'visao_geral', label: 'Visão Geral', icon: Users },
            { id: 'eventos', label: `Eventos (${clientEvents.length})`, icon: Calendar },
            { id: 'orcamentos', label: `Orçamentos (${clientQuotes.length})`, icon: FileSpreadsheet },
            { id: 'financeiro', label: `Financeiro (${clientPayments.length})`, icon: DollarSign },
            { id: 'galerias', label: `Galerias (${clientGalleries.length})`, icon: ImageIcon },
            { id: 'documentos', label: 'Documentos', icon: FolderOpen },
            { id: 'historico', label: 'Histórico', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
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
          {/* 1. VISÃO GERAL */}
          {activeTab === 'visao_geral' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900">Resumo do Perfil</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Nome do Cliente</span>
                      <span className="font-medium text-zinc-800">{client.name}</span>
                    </div>
                    {client.partner_name && (
                      <div>
                        <span className="text-zinc-400 block mb-0.5">Cônjuge / Parceiro</span>
                        <span className="font-medium text-zinc-800">{client.partner_name}</span>
                      </div>
                    )}
                    {client.email && (
                      <div>
                        <span className="text-zinc-400 block mb-0.5">E-mail</span>
                        <span className="font-medium text-zinc-800">{client.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-400 block mb-0.5">WhatsApp / Celular</span>
                      <span className="font-medium text-zinc-800">{client.whatsapp}</span>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="pt-3 border-t border-zinc-100 text-xs">
                      <span className="text-zinc-400 block mb-1">Observações Internas</span>
                      <p className="p-3 bg-zinc-50 rounded-xl text-zinc-700 leading-relaxed">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Próximo Evento do Cliente */}
                {clientEvents.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900">Evento Vinculado</h3>
                    {clientEvents.map((ev) => {
                      const pkg = resolveEventPackage(
                        packages,
                        ev.package_name,
                        ev.package_id,
                        ev.package_description
                      );
                      return (
                        <div
                          key={ev.id}
                          className="p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-900">{ev.name}</span>
                            <p className="text-xs text-zinc-500">
                              {formatDate(ev.date)} às {ev.time} • {ev.location}
                            </p>
                            <div className="text-[11px] text-zinc-600 bg-amber-50/60 border border-amber-200/70 rounded-lg p-2 max-w-md">
                              <span className="font-semibold text-[#8B6E3F]">
                                Pacote: {ev.package_name || pkg.name}
                              </span>
                              {pkg.description && (
                                <p className="text-[11px] text-zinc-600 line-clamp-2 mt-0.5">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/eventos/${ev.id}`}
                            className="text-xs font-medium text-[#C5A880] hover:underline flex items-center gap-1 shrink-0"
                          >
                            Ver painel do evento <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Coluna Direita: Status Financeiro Rápido */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] space-y-3 text-xs">
                  <h4 className="font-semibold text-zinc-900">Métricas do Cliente</h4>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-500">Eventos</span>
                    <span className="font-semibold text-zinc-900">{clientEvents.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-500">Orçamentos</span>
                    <span className="font-semibold text-zinc-900">{clientQuotes.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100">
                    <span className="text-zinc-500">Galerias</span>
                    <span className="font-semibold text-zinc-900">{clientGalleries.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-500">Total Contratado</span>
                    <span className="font-semibold text-zinc-900">
                      {formatCurrency(
                        clientEvents.reduce((acc, ev) => acc + (ev.value || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="space-y-3">
              {clientEvents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhum evento vinculado a este cliente.
                </div>
              ) : (
                clientEvents.map((ev) => {
                  const pkg = resolveEventPackage(
                    packages,
                    ev.package_name,
                    ev.package_id,
                    ev.package_description
                  );
                  return (
                    <div
                      key={ev.id}
                      className="p-5 bg-white rounded-2xl border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-semibold text-zinc-900">{ev.name}</h4>
                        <p className="text-xs text-zinc-500">
                          {formatDate(ev.date)} • {ev.time} • {ev.location}
                        </p>
                        <div className="text-xs text-zinc-600 bg-amber-50/60 border border-amber-200/70 rounded-xl p-2.5 max-w-xl space-y-0.5">
                          <span className="font-semibold text-[#8B6E3F] text-[11px] block">
                            Pacote: {ev.package_name || pkg.name}
                          </span>
                          {pkg.description && (
                            <p className="text-[11px] text-zinc-600 leading-relaxed">
                              <strong className="text-zinc-700">Descrição:</strong> {pkg.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/eventos/${ev.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium self-start sm:self-auto hover:bg-zinc-800 transition-colors"
                      >
                        Acessar painel do evento
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. ORÇAMENTOS */}
          {activeTab === 'orcamentos' && (
            <div className="space-y-3">
              {clientQuotes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhum orçamento emitido para este cliente.
                </div>
              ) : (
                clientQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">
                        Proposta: Pacote {q.package_name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Valor: {formatCurrency(q.total_value)} • Status: {q.status}
                      </p>
                    </div>
                    <Link
                      href={`/orcamento/${q.token}`}
                      target="_blank"
                      className="text-xs font-medium text-[#C5A880] hover:underline flex items-center gap-1"
                    >
                      Ver proposta pública <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. FINANCEIRO */}
          {activeTab === 'financeiro' && (
            <div className="space-y-3">
              {clientPayments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhum pagamento registrado para este cliente.
                </div>
              ) : (
                clientPayments.map((p) => {
                  const pCfg = getPaymentStatusConfig(p.status);
                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-white rounded-2xl border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900">{p.description}</span>
                        <p className="text-zinc-500 mt-0.5">Vencimento: {formatDate(p.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-zinc-900">
                          {formatCurrency(p.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pCfg.bg} ${pCfg.color}`}
                        >
                          {pCfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 6. GALERIAS */}
          {activeTab === 'galerias' && (
            <div className="space-y-3">
              {clientGalleries.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400">
                  Nenhuma galeria criada para este cliente.
                </div>
              ) : (
                clientGalleries.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-[#EAEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">{g.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {g.photos_count} fotos • Expira em {formatDate(g.expires_at)}
                      </p>
                    </div>
                    <Link
                      href={`/galeria/${g.token}`}
                      target="_blank"
                      className="text-xs font-medium text-[#C5A880] hover:underline flex items-center gap-1"
                    >
                      Abrir galeria pública <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 7. DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAE4] text-xs text-zinc-400 space-y-2">
              <FolderOpen className="w-8 h-8 text-zinc-300 mx-auto" />
              <p>Nenhum documento anexado ainda.</p>
            </div>
          )}

          {/* 8. HISTÓRICO */}
          {activeTab === 'historico' && (
            <div className="p-6 bg-white rounded-2xl border border-[#EAEAE4] space-y-3 text-xs text-zinc-600">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                <span>Cliente cadastrado no sistema em {formatDate(client.created_at)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Dados do Cliente"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Nome Principal *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Cônjuge / Parceiro</label>
              <input
                type="text"
                value={editForm.partner_name}
                onChange={(e) => setEditForm({ ...editForm, partner_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    value={editPhoneInput}
                    onChange={(e) => setEditPhoneInput(formatPhoneInput(e.target.value))}
                    className="w-full px-3 py-2 text-xs text-zinc-900 focus:outline-hidden bg-transparent"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Digite apenas o DDD e o número.</p>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'ativo' | 'inativo' | 'concluido' })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Observações</label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

export default function ClientProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando dados do cliente...
        </div>
      }
    >
      <ClientProfileContent />
    </React.Suspense>
  );
}

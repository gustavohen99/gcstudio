'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';
import { formatDate, getWhatsAppUrl, sortEventsByProximity } from '@/lib/utils';
import {
  FileText,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  Search,
  Filter,
  MessageCircle,
  Printer,
  Copy,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Contract, ContractStatus } from '@/types';

export default function ContractsPage() {
  const { toast } = useToast();
  const { contracts, clients, events, addContract, updateContract } = useAppStore();
  const today = useToday();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ContractStatus>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  const handleSendWhatsApp = (ctr: Contract) => {
    const client = clients.find((c) => c.id === ctr.client_id);
    if (!client || !client.whatsapp) {
      toast('Cliente sem número de WhatsApp cadastrado.', 'error');
      return;
    }

    const message = `Olá, ${client.name}! Tudo bem?\n\nAqui é da G&C Studio. Segue o contrato de prestação de serviços referente ao seu evento "${ctr.event_name}".\n\n${
      ctr.external_url
        ? `Acesse o link seguro para assinatura digital:\n${ctr.external_url}\n\n`
        : ''
    }Ficamos à disposição para quaisquer dúvidas e para garantir a sua data em definitivo!\n\nG&C Studio • Fotografia & Cinema`;

    const url = getWhatsAppUrl(client.whatsapp, message);
    window.open(url, '_blank');

    if (ctr.status === 'rascunho') {
      updateContract(ctr.id, { status: 'enviado' });
    }
    toast('Conversa aberta no WhatsApp para envio do contrato!', 'success');
  };

  const [form, setForm] = useState({
    client_id: '',
    event_id: '',
    template_title: 'Contrato de Cobertura Fotográfica e Cinematográfica',
    external_url: '',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS E AUDIOVISUAIS

Pelo presente instrumento particular, de um lado G&C STUDIO PRODUÇÕES AUDIOVISUAIS LTDA, doravante denominada CONTRATADA, e de outro lado o(a) CONTRATANTE identificado(a) neste cadastro, têm entre si justo e acordado o seguinte:

CLÁUSULA 1ª — DO OBJETO
A CONTRATADA compromete-se a realizar a cobertura fotográfica e cinematográfica do evento especificado, observando os melhores padrões técnicos e artísticos da profissão.

CLÁUSULA 2ª — DAS ENTREGAS
As fotografias serão disponibilizadas através de galeria online para seleção dos noivos/clientes. Os prazos de tratamento e pós-produção seguirão o cronograma estipulado pela G&C Studio.

CLÁUSULA 3ª — DO VALOR E FORMA DE PAGAMENTO
O valor total pactuado e as parcelas constam discriminados no módulo financeiro vinculado a este evento.

E por estarem justos e contratados, assinam eletronicamente o presente instrumento.`,
  });

  const filteredContracts = contracts.filter((c) => {
    const matchSearch =
      c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.template_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.event_id) {
      toast('Selecione cliente e evento para o contrato.', 'error');
      return;
    }
    const c = clients.find((item) => item.id === form.client_id);
    const ev = events.find((item) => item.id === form.event_id);
    if (!c || !ev) return;

    addContract({
      client_id: c.id,
      client_name: c.name,
      event_id: ev.id,
      event_name: ev.name,
      template_title: form.template_title,
      content: form.content,
      external_url: form.external_url,
      status: 'enviado',
    });
    setModalOpen(false);
    toast('Contrato gerado com sucesso!', 'success');
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'assinado':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">Assinado</span>;
      case 'enviado':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px]">Enviado</span>;
      case 'visualizado':
        return <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold text-[10px]">Visualizado</span>;
      case 'rascunho':
        return <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-semibold text-[10px]">Rascunho</span>;
      case 'cancelado':
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px]">Cancelado</span>;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Gestão de Contratos
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Controle jurídico, assinaturas digitais e modelos de prestação de serviços.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Novo Contrato</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, evento ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {(['todos', 'assinado', 'enviado', 'rascunho', 'cancelado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-colors ${
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

        {/* List */}
        <div className="space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
              <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-medium text-zinc-800">Nenhum contrato cadastrado</h3>
              <p className="text-xs text-zinc-500">Gere um novo contrato a partir dos eventos cadastrados.</p>
            </div>
          ) : (
            filteredContracts.map((ctr) => (
              <div
                key={ctr.id}
                className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900">{ctr.template_title}</h3>
                    {getStatusBadge(ctr.status)}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Cliente: <strong>{ctr.client_name}</strong> • Evento: {ctr.event_name}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Emitido em {formatDate(ctr.created_at)}
                    {ctr.signed_at && ` • Assinado em ${formatDate(ctr.signed_at)}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* WhatsApp direct send */}
                  <button
                    onClick={() => handleSendWhatsApp(ctr)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    title="Enviar contrato diretamente pelo WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="hidden md:inline">Enviar WhatsApp</span>
                  </button>

                  {/* Print / Preview PDF */}
                  <button
                    onClick={() => setPreviewContract(ctr)}
                    className="p-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    title="Visualizar minuta / Imprimir ou Salvar PDF"
                  >
                    <Printer className="w-4 h-4 text-[#C5A880]" />
                    <span className="hidden md:inline">Imprimir PDF</span>
                  </button>

                  {/* External signature URL */}
                  {ctr.external_url && (
                    <a
                      href={ctr.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#8B6E3F] border border-[#C5A880]/30 transition-colors flex items-center gap-1.5 text-xs font-medium"
                      title="Abrir link de assinatura digital (Clicksign / Autentique / ZapSign)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Assinar Online</span>
                    </a>
                  )}

                  <select
                    value={ctr.status}
                    onChange={(e) =>
                      updateContract(ctr.id, {
                        status: e.target.value as ContractStatus,
                        signed_at:
                          e.target.value === 'assinado' ? new Date().toISOString() : undefined,
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="enviado">Enviado</option>
                    <option value="visualizado">Visualizado</option>
                    <option value="assinado">Assinado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  <Link
                    href={`/eventos/${ctr.event_id}`}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors shrink-0"
                  >
                    Ver Evento
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Novo Contrato */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Novo Contrato de Prestação de Serviços"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Cliente *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => {
                    const matchedEvent = events.find((ev) => ev.client_id === e.target.value);
                    setForm({
                      ...form,
                      client_id: e.target.value,
                      event_id: matchedEvent ? matchedEvent.id : '',
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
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
                <label className="block font-medium text-zinc-700 mb-1">Evento *</label>
                <select
                  required
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                >
                  <option value="">Selecione...</option>
                  {sortEventsByProximity(events, today).map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.date})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Modelo do Contrato</label>
              <input
                type="text"
                value={form.template_title}
                onChange={(e) => setForm({ ...form, template_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Link Externo de Assinatura (Autentique, ZapSign ou Clicksign)
              </label>
              <input
                type="url"
                placeholder="https://app.autentique.com.br/documento/..."
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Minuta Contratual</label>
              <textarea
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 font-mono text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Emitir Contrato
              </button>
            </div>
          </form>
        </Modal>
        {/* Modal: Visualizar e Imprimir Contrato em PDF */}
        <Modal
          isOpen={Boolean(previewContract)}
          onClose={() => setPreviewContract(null)}
          title="Minuta do Contrato — Impressão & Assinatura"
          subtitle={previewContract ? `${previewContract.template_title} • ${previewContract.client_name}` : ''}
          maxWidth="4xl"
        >
          {previewContract && (
            <div className="space-y-6 text-xs text-zinc-800">
              {/* Actions Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-600">Status atual:</span>
                  {getStatusBadge(previewContract.status)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(previewContract)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enviar no WhatsApp</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Imprimir / Salvar PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Contract Sheet */}
              <div className="p-8 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-6 max-h-[60vh] overflow-y-auto leading-relaxed print:m-0 print:border-none print:shadow-none">
                {/* Header Timbre */}
                <div className="flex justify-between items-start border-b border-zinc-200 pb-4">
                  <div>
                    <h2 className="font-serif-brand text-2xl font-bold text-zinc-900 tracking-wide">
                      G&C STUDIO PRODUÇÕES
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                      Fotografia & Cinema de Eventos
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      CNPJ: 45.123.890/0001-92 • São Paulo - SP
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 font-mono text-zinc-600">
                      ID: {previewContract.id}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Data: {formatDate(previewContract.created_at)}
                    </p>
                  </div>
                </div>

                {/* Qualification Header */}
                <div className="p-3 bg-zinc-50 rounded-xl space-y-1 text-[11px] border border-zinc-100">
                  <p>
                    <strong>CONTRATANTE:</strong> {previewContract.client_name}
                  </p>
                  <p>
                    <strong>EVENTO:</strong> {previewContract.event_name}
                  </p>
                </div>

                {/* Contract Body */}
                <div className="font-serif text-[13px] text-zinc-800 whitespace-pre-wrap leading-relaxed space-y-4">
                  {previewContract.content}
                </div>

                {/* Signatures */}
                <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[11px] text-zinc-600 border-t border-zinc-200 mt-8">
                  <div className="space-y-1">
                    <div className="border-b border-zinc-400 w-48 mx-auto pb-6" />
                    <p className="font-medium text-zinc-900 pt-2">G&C STUDIO PRODUÇÕES</p>
                    <p className="text-[10px] text-zinc-400">CONTRATADA</p>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-zinc-400 w-48 mx-auto pb-6" />
                    <p className="font-medium text-zinc-900 pt-2">{previewContract.client_name}</p>
                    <p className="text-[10px] text-zinc-400">CONTRATANTE</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}

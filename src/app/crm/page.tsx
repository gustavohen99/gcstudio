'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getWhatsAppUrl, getLeadStatusConfig } from '@/lib/utils';
import {
  Kanban,
  Plus,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Lead, LeadStatus, EventType } from '@/types';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';

const COLUMNS: LeadStatus[] = [
  'NOVO CONTATO',
  'ORÇAMENTO ENVIADO',
  'NEGOCIAÇÃO',
  'AGUARDANDO RESPOSTA',
  'FECHADO',
  'PERDIDO',
];

export default function CRMPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { leads, updateLead, convertLeadToClient, deleteLead } = useAppStore();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedLeadId(id);
  };

  const handleDrop = (status: LeadStatus) => {
    if (draggedLeadId) {
      updateLead(draggedLeadId, { status });
      toast(`Lead movido para "${status}".`, 'info');
      setDraggedLeadId(null);
    }
  };

  const handleConvertLead = (leadId: string) => {
    const result = convertLeadToClient(leadId);
    if (result) {
      toast(`Lead convertido com sucesso em Cliente e Evento!`, 'success');
      setSelectedLead(null);
      router.push(`/clientes/${result.client.id}`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              CRM de Vendas & Leads
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Funil comercial da G&C Studio. Acompanhe cada oportunidade do primeiro contato ao fechamento.
            </p>
          </div>

          <button
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Novo Lead</span>
          </button>
        </div>

        {/* Kanban Board (Horizontal Scrolling on small screens) */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[640px]">
          {COLUMNS.map((colStatus) => {
            const colLeads = leads.filter((l) => l.status === colStatus);
            const totalValue = colLeads.reduce((acc, l) => acc + (l.estimated_value || 0), 0);
            const cfg = getLeadStatusConfig(colStatus);

            return (
              <div
                key={colStatus}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(colStatus)}
                className="w-72 sm:w-80 shrink-0 bg-[#F5F5F1]/80 rounded-2xl p-3 border border-[#EAEAE4] flex flex-col"
              >
                {/* Column Header */}
                <div className="px-2 py-2 mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-800 tracking-tight">
                      {colStatus}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white text-zinc-600 border border-zinc-200">
                      {colLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">
                    {formatCurrency(totalValue)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      onClick={() => setSelectedLead(lead)}
                      className="p-4 rounded-xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                          {lead.event_type}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Origem: {lead.origin}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                        {lead.name}
                      </h4>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
                        <span className="font-bold text-zinc-900 font-serif-brand">
                          {formatCurrency(lead.estimated_value)}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {lead.event_date ? formatDate(lead.event_date) : 'Data indefinida'}
                        </span>
                      </div>

                      {/* Quick Move Trigger for mobile / non-drag users */}
                      <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                        <span>Última interação: {formatDate(lead.last_interaction)}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500" />
                      </div>
                    </div>
                  ))}

                  {colLeads.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-xl">
                      Nenhum lead nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Details & Conversion Modal */}
        {selectedLead && (
          <Modal
            isOpen={Boolean(selectedLead)}
            onClose={() => setSelectedLead(null)}
            title="Detalhes da Oportunidade"
            subtitle={`Lead no estágio: ${selectedLead.status}`}
            maxWidth="xl"
          >
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{selectedLead.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedLead.event_type} • Origem: {selectedLead.origin}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Valor Estimado</span>
                  <span className="text-base font-bold text-zinc-900 font-serif-brand">
                    {formatCurrency(selectedLead.estimated_value)}
                  </span>
                </div>
              </div>

              {/* Lead Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-400 block mb-0.5">WhatsApp</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-800">{selectedLead.whatsapp}</span>
                    <a
                      href={getWhatsAppUrl(selectedLead.whatsapp, `Olá, ${selectedLead.name}! Tudo bem?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">E-mail</span>
                  <span className="font-medium text-zinc-800">{selectedLead.email || 'Não informado'}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Data Prevista</span>
                  <span className="font-medium text-zinc-800">
                    {selectedLead.event_date ? formatDate(selectedLead.event_date) : 'A definir'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Local do Evento</span>
                  <span className="font-medium text-zinc-800">{selectedLead.location || 'A definir'}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Convidados Estimados</span>
                  <span className="font-medium text-zinc-800">{selectedLead.guest_count || 'Não informado'}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-0.5">Alterar Coluna / Status</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as LeadStatus;
                      updateLead(selectedLead.id, { status: newStatus });
                      setSelectedLead({ ...selectedLead, status: newStatus });
                      toast(`Status alterado para ${newStatus}.`, 'info');
                    }}
                    className="w-full px-2 py-1 rounded-lg border border-zinc-200 bg-white"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <span className="text-zinc-400 block mb-1">Observações da Negociação</span>
                  <p className="p-3 bg-zinc-50 rounded-xl text-zinc-700 leading-relaxed">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Botão Especial: Converter em Cliente (Item 8) */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja excluir este lead?`)) {
                      deleteLead(selectedLead.id);
                      setSelectedLead(null);
                      toast('Lead removido.', 'info');
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Excluir Lead
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConvertLead(selectedLead.id)}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Converter em Cliente</span>
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab="lead"
      />
    </AppShell>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatDate, getDeliveryStatusConfig } from '@/lib/utils';
import {
  Truck,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DeliveryStatus } from '@/types';

export default function DeliveriesPage() {
  const { toast } = useToast();
  const { deliveries, events, addDelivery, updateDelivery, deleteDelivery } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<'todos' | DeliveryStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    event_id: '',
    name: 'Fotografias em Alta Resolução',
    description: '',
    deadline: '',
    notes: '',
  });

  const filteredDeliveries = deliveries.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_id || !form.deadline) {
      toast('Selecione o evento e defina o prazo.', 'error');
      return;
    }
    const ev = events.find((item) => item.id === form.event_id);
    if (!ev) return;

    addDelivery({
      event_id: ev.id,
      event_name: ev.name,
      name: form.name,
      description: form.description,
      deadline: form.deadline,
      notes: form.notes,
      status: 'a_fazer',
    });
    setModalOpen(false);
    toast('Entrega registrada na fila de produção!', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Controle de Entregas & Pós-Produção
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Acompanhe o status e prazos de fotografias, filmes documentais, teasers e álbuns encadernados.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Nova Entrega</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por entrega ou evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {(['todos', 'a_fazer', 'em_producao', 'em_revisao', 'pronto', 'entregue'] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-3">
          {filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
              <Truck className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="text-sm font-medium text-zinc-800">Nenhuma entrega encontrada</h3>
              <p className="text-xs text-zinc-500">Cadastre as entregas de cada cobertura realizada.</p>
            </div>
          ) : (
            filteredDeliveries.map((del) => {
              const delCfg = getDeliveryStatusConfig(del.status);
              return (
                <div
                  key={del.id}
                  className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900">{del.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${delCfg.bg} ${delCfg.color}`}
                      >
                        {delCfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500">
                      Evento: <strong>{del.event_name}</strong> • Prazo final: {formatDate(del.deadline)}
                    </p>

                    {del.description && (
                      <p className="text-[11px] text-zinc-400">{del.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={del.status}
                      onChange={(e) =>
                        updateDelivery(del.id, {
                          status: e.target.value as DeliveryStatus,
                          completed_at:
                            e.target.value === 'entregue' ? new Date().toISOString() : undefined,
                        })
                      }
                      className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800"
                    >
                      <option value="a_fazer">A Fazer</option>
                      <option value="em_producao">Em Produção</option>
                      <option value="em_revisao">Em Revisão</option>
                      <option value="pronto">Pronto</option>
                      <option value="entregue">Entregue</option>
                    </select>

                    <Link
                      href={`/eventos/${del.event_id}`}
                      className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      title="Ver evento"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Nova Entrega */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Nova Entrega de Pós-Produção"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Evento *</label>
              <select
                required
                value={form.event_id}
                onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="">Selecione o evento...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.client_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Tipo de Entrega *</label>
              <select
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="Fotografias em Alta Resolução">Fotografias em Alta Resolução</option>
                <option value="Vídeo Teaser (Instagram)">Vídeo Teaser (Instagram)</option>
                <option value="Filme Completo Documental">Filme Completo Documental</option>
                <option value="Reels Making Of">Reels Making Of</option>
                <option value="Álbum Fine Art">Álbum Fine Art</option>
                <option value="Quadro de Recepção">Quadro de Recepção</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Prazo de Conclusão *</label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
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
                Agendar Entrega
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

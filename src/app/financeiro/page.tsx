'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getPaymentStatusConfig, sortEventsByProximity } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PaymentStatus } from '@/types';

export default function FinancePage() {
  const { toast } = useToast();
  const { payments, events, clients, addPayment, updatePayment } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    event_id: '',
    description: '',
    amount: 2500,
    due_date: '',
    payment_method: 'PIX',
    notes: '',
  });

  // Financial Metrics
  const metrics = useMemo(() => {
    let received = 0;
    let pending = 0;
    let overdue = 0;

    payments.forEach((p) => {
      if (p.status === 'pago') received += p.amount;
      if (p.status === 'pendente') pending += p.amount;
      if (p.status === 'atrasado') overdue += p.amount;
    });

    const eventsTotal = events
      .filter((e) => e.status !== 'cancelado')
      .reduce((acc, e) => acc + (Number(e.value) || 0), 0);

    return {
      received,
      pending,
      overdue,
      totalForecast: Math.max(received + pending + overdue, eventsTotal),
    };
  }, [payments, events]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const matchSearch =
          p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.due_date || a.created_at || '1970-01-01').getTime();
        const timeB = new Date(b.due_date || b.created_at || '1970-01-01').getTime();
        return timeB - timeA;
      });
  }, [payments, searchTerm, statusFilter]);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_id || !form.description) {
      toast('Selecione o evento e informe a descrição.', 'error');
      return;
    }
    const ev = events.find((item) => item.id === form.event_id);
    if (!ev) return;

    addPayment({
      event_id: ev.id,
      event_name: ev.name,
      client_id: ev.client_id,
      client_name: ev.client_name,
      description: form.description,
      amount: Number(form.amount),
      due_date: form.due_date,
      payment_method: form.payment_method,
      status: 'pendente',
      notes: form.notes,
    });
    setModalOpen(false);
    toast('Parcela adicionada com sucesso!', 'success');
  };

  const handleMarkAsPaid = (paymentId: string) => {
    updatePayment(paymentId, {
      status: 'pago',
      paid_at: new Date().toISOString(),
    });
    toast('Pagamento confirmado como PAGO!', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Gestão Financeira & Caixa
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Controle de parcelas, entradas, recebimentos e previsão de caixa da G&C Studio.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Nova Parcela</span>
          </button>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs">
            <span className="text-xs text-zinc-500">Receita Recebida</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-serif-brand">
              {formatCurrency(metrics.received)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">total já liquidado</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs">
            <span className="text-xs text-zinc-500">Receita Prevista (Total)</span>
            <div className="text-2xl font-bold text-zinc-900 mt-1 font-serif-brand">
              {formatCurrency(metrics.totalForecast)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">contratos confirmados</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs">
            <span className="text-xs text-zinc-500">Total a Receber</span>
            <div className="text-2xl font-bold text-[#8B6E3F] mt-1 font-serif-brand">
              {formatCurrency(metrics.pending)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">parcelas futuras abertas</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs">
            <span className="text-xs text-zinc-500">Total em Atraso</span>
            <div className="text-2xl font-bold text-rose-600 mt-1 font-serif-brand">
              {formatCurrency(metrics.overdue)}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">requer contato com cliente</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, evento ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {(['todos', 'pendente', 'pago', 'atrasado', 'cancelado'] as const).map((st) => (
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

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-[#EAEAE4] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Lançamentos & Parcelas ({filteredPayments.length})
            </h3>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400">
              Nenhuma parcela encontrada para os filtros aplicados.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredPayments.map((p) => {
                const pCfg = getPaymentStatusConfig(p.status);
                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900">{p.description}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${pCfg.bg} ${pCfg.color}`}
                        >
                          {pCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {p.client_name} • {p.event_name}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-0.5">
                        <span>Vencimento: {formatDate(p.due_date)}</span>
                        <span>•</span>
                        <span>Forma: {p.payment_method || 'PIX'}</span>
                        {p.paid_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700">
                              Pago em {formatDate(p.paid_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100">
                      <span className="text-sm font-bold text-zinc-900 font-serif-brand">
                        {formatCurrency(p.amount)}
                      </span>

                      {p.status !== 'pago' && (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Baixar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Nova Parcela */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Nova Parcela / Lançamento Financeiro"
        >
          <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Evento *</label>
              <select
                required
                value={form.event_id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const ev = events.find((item) => item.id === selectedId);
                  if (ev) {
                    const existingSum = payments
                      .filter((p) => p.event_id === ev.id && p.status !== 'cancelado')
                      .reduce((acc, p) => acc + p.amount, 0);
                    const suggestedAmount = Math.max(0, ev.value - existingSum) || ev.value;
                    setForm({
                      ...form,
                      event_id: selectedId,
                      amount: suggestedAmount,
                      due_date: ev.date || form.due_date,
                      description: form.description || `Parcela — ${ev.name}`,
                    });
                  } else {
                    setForm({ ...form, event_id: selectedId });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="">Selecione o evento...</option>
                {sortEventsByProximity(events).map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.client_name}) — {formatCurrency(ev.value)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição *</label>
              <input
                type="text"
                required
                placeholder="Ex: Parcela 2 de 4 ou Sinal de Reserva"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Vencimento *</label>
                <input
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Forma de Pagamento</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Chave PIX informada"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
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
                Salvar Parcela
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

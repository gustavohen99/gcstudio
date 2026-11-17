'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getWhatsAppUrl, resolveEventPackage } from '@/lib/utils';
import {
  FileSpreadsheet,
  Plus,
  ExternalLink,
  Copy,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';
import { Quote } from '@/types';

export default function QuotesPage() {
  const { toast } = useToast();
  const { quotes, clients, packages, deleteQuote } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'enviado' | 'aceito' | 'recusado' | 'rascunho'>('todos');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch =
      q.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const copyProposalLink = (token: string) => {
    const url = `${window.location.origin}/orcamento/${token}`;
    navigator.clipboard.writeText(url);
    toast('Link da proposta pública copiado com sucesso!', 'success');
  };

  const sendProposalWhatsApp = (token: string, clientName: string, clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    const url = `${window.location.origin}/orcamento/${token}`;
    const msg = `Olá, ${clientName}! Tudo bem?\nPreparamos a sua proposta personalizada para a cobertura do seu evento:\n${url}\n\nVocê pode conferir todos os detalhes e aprovar diretamente pela página!`;
    const phone = client ? client.whatsapp : '5511999999999';
    window.open(getWhatsAppUrl(phone, msg), '_blank');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Orçamentos & Propostas
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Gere propostas comerciais elegantes com links públicos interativos e aceite online registrado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/orcamento"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 text-xs font-medium transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Ver Modelo da Página</span>
            </Link>

            <button
              onClick={() => setQuickCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#C5A880]" />
              <span>+ Novo Orçamento</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EAEAE4] shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Buscar por cliente ou pacote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar text-xs">
            {(['todos', 'enviado', 'aceito', 'rascunho'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-medium capitalize whitespace-nowrap shrink-0 transition-colors ${
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

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-800">Nenhum orçamento encontrado</h3>
            <p className="text-xs text-zinc-500">Crie uma nova proposta comercial para o cliente.</p>
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
            >
              + Novo Orçamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                        {quote.event_type}
                      </span>
                      <h3 className="text-base font-semibold text-zinc-900 mt-1">
                        Proposta para {quote.client_name}
                      </h3>
                      {(() => {
                        const pkg = resolveEventPackage(packages, quote.package_name);
                        return (
                          <div className="text-xs bg-amber-50/60 border border-amber-200/70 rounded-lg p-2 mt-1 space-y-0.5">
                            <span className="font-semibold text-[#8B6E3F] text-[11px] block">
                              Pacote: {quote.package_name || pkg.name}
                            </span>
                            {pkg.description && (
                              <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        quote.status === 'aceito'
                          ? 'bg-emerald-50 text-emerald-700'
                          : quote.status === 'enviado'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100">
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Valor Total</span>
                      <span className="text-base font-bold text-zinc-900 font-sans tabular-nums tracking-tight">
                        {formatCurrency(quote.total_value)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[11px]">Forma de Pagamento</span>
                      <span className="text-zinc-700 font-medium truncate block">
                        {quote.payment_method}
                      </span>
                    </div>
                  </div>

                  {quote.accepted_at && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Aceito pelo cliente em: <strong>{formatDate(quote.accepted_at)}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Bottom */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        sendProposalWhatsApp(quote.token, quote.client_name, quote.client_id)
                      }
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Enviar via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyProposalLink(quote.token)}
                      className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors"
                      title="Copiar link público"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuoteToDelete(quote)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/orcamento/${quote.token}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
                  >
                    <span>Ver Proposta Pública</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab="quote"
      />

      <Modal
        isOpen={Boolean(quoteToDelete)}
        onClose={() => setQuoteToDelete(null)}
        title="Excluir Orçamento"
        subtitle="Esta ação não pode ser desfeita"
        maxWidth="md"
      >
        {quoteToDelete && (
          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Tem certeza que deseja excluir o orçamento de{' '}
              <strong className="text-zinc-900">{quoteToDelete.client_name}</strong> (
              {quoteToDelete.package_name || quoteToDelete.event_type})? O link público da proposta
              deixará de funcionar.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteQuote(quoteToDelete.id);
                  setQuoteToDelete(null);
                  toast('Orçamento excluído com sucesso.', 'info');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Orçamento</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

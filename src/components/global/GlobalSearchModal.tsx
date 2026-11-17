'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Users,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';
import { formatCurrency, formatDate, sortEventsByProximity } from '@/lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { clients, events, quotes, contracts, payments, galleries } = useAppStore();
  const today = useToday();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedClients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.partner_name && c.partner_name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.phone.includes(q)
    );

    const matchedEvents = sortEventsByProximity(
      events.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.client_name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q)
      ),
      today
    );

    const matchedQuotes = quotes.filter(
      (qt) =>
        qt.client_name.toLowerCase().includes(q) ||
        qt.event_name.toLowerCase().includes(q) ||
        qt.package_name.toLowerCase().includes(q)
    );

    const matchedContracts = contracts.filter(
      (ct) =>
        ct.client_name.toLowerCase().includes(q) ||
        ct.event_name.toLowerCase().includes(q) ||
        ct.template_title.toLowerCase().includes(q)
    );

    const matchedPayments = payments.filter(
      (p) =>
        p.client_name.toLowerCase().includes(q) ||
        p.event_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    const matchedGalleries = galleries.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.client_name.toLowerCase().includes(q)
    );

    const total =
      matchedClients.length +
      matchedEvents.length +
      matchedQuotes.length +
      matchedContracts.length +
      matchedPayments.length +
      matchedGalleries.length;

    return {
      total,
      clients: matchedClients,
      events: matchedEvents,
      quotes: matchedQuotes,
      contracts: matchedContracts,
      payments: matchedPayments,
      galleries: matchedGalleries,
    };
  }, [query, clients, events, quotes, contracts, payments, galleries, today]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar clientes, eventos, orçamentos, galerias..."
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 bg-white border border-zinc-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!results ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <p>Digite pelo menos uma letra para pesquisar em toda a base da G&C Studio.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span
                  onClick={() => setQuery('Mariana')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                >
                  Exemplo: &ldquo;Mariana&rdquo;
                </span>
                <span
                  onClick={() => setQuery('Casamento')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                >
                  Exemplo: &ldquo;Casamento&rdquo;
                </span>
                <span
                  onClick={() => setQuery('15 anos')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                >
                  Exemplo: &ldquo;15 anos&rdquo;
                </span>
              </div>
            </div>
          ) : results.total === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              Nenhum resultado encontrado para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Clientes */}
              {results.clients.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" /> Clientes ({results.clients.length})
                  </div>
                  <div className="space-y-1">
                    {results.clients.map((c) => (
                      <Link
                        key={c.id}
                        href={`/clientes/${c.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-medium text-zinc-900 group-hover:text-zinc-950">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-zinc-600">
                            {c.email} • {c.phone}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Eventos */}
              {results.events.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A880]" /> Eventos ({results.events.length})
                  </div>
                  <div className="space-y-1">
                    {results.events.map((e) => (
                      <Link
                        key={e.id}
                        href={`/eventos/${e.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-medium text-zinc-900">
                            {e.name} ({e.type})
                          </div>
                          <div className="text-[11px] text-zinc-600">
                            {formatDate(e.date)} • {e.location}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                          {formatCurrency(e.value)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Orçamentos */}
              {results.quotes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A880]" /> Orçamentos ({results.quotes.length})
                  </div>
                  <div className="space-y-1">
                    {results.quotes.map((q) => (
                      <Link
                        key={q.id}
                        href="/orcamentos"
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-medium text-zinc-900">
                            Proposta para {q.client_name}
                          </div>
                          <div className="text-[11px] text-zinc-600">
                            Pacote {q.package_name} • {formatCurrency(q.total_value)}
                          </div>
                        </div>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full capitalize">
                          {q.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Galerias */}
              {results.galleries.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold tracking-wider text-zinc-600 uppercase mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" /> Galerias ({results.galleries.length})
                  </div>
                  <div className="space-y-1">
                    {results.galleries.map((g) => (
                      <Link
                        key={g.id}
                        href={`/galerias`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-medium text-zinc-900">{g.title}</div>
                          <div className="text-[11px] text-zinc-600">
                            {g.photos_count} fotos • Expira em {formatDate(g.expires_at)}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

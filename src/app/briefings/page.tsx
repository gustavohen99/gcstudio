'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatDate, getWhatsAppUrl, getBriefingStatusConfig } from '@/lib/utils';
import {
  ClipboardList,
  Copy,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function BriefingsDashboardPage() {
  const { toast } = useToast();
  const { briefings, events, clients } = useAppStore();

  const copyBriefingLink = (token: string) => {
    const url = `${window.location.origin}/briefing/${token}`;
    navigator.clipboard.writeText(url);
    toast('Link exclusivo do briefing copiado!', 'success');
  };

  const sendWhatsApp = (token: string, clientId: string, eventName: string) => {
    const client = clients.find((c) => c.id === clientId);
    const url = `${window.location.origin}/briefing/${token}`;
    const msg = `Olá, ${client ? client.name : 'Cliente'}! Tudo bem?\nPara alinharmos cada detalhe da cobertura de ${eventName}, preparamos o seu formulário oficial de Briefing:\n${url}\n\nVocê pode responder tranquilamente direto pelo seu smartphone!`;
    const phone = client ? client.whatsapp : '5511999999999';
    window.open(getWhatsAppUrl(phone, msg), '_blank');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
            Central de Briefings dos Eventos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Formulários interativos para casais e clientes definirem horários, pessoas importantes, fotos obrigatórias e preferências.
          </p>
        </div>

        {/* Briefings Grid */}
        {briefings.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
            <ClipboardList className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-800">Nenhum briefing configurado</h3>
            <p className="text-xs text-zinc-500">
              Briefings são criados automaticamente ao cadastrar novos eventos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefings.map((briefing) => {
              const event = events.find((e) => e.id === briefing.event_id);
              const client = clients.find((c) => c.id === briefing.client_id);
              const statusCfg = getBriefingStatusConfig(briefing.status);

              return (
                <div
                  key={briefing.id}
                  className="p-5 rounded-2xl bg-white border border-[#EAEAE4] hover:border-zinc-300 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                          {event ? event.type : 'Evento'}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-900 mt-1">
                          {event ? event.name : 'Evento'}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          Cliente: {client ? client.name : 'Não informado'}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="p-3 bg-zinc-50 rounded-xl space-y-1.5 border border-zinc-200/60 text-xs">
                      <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                        <span>Progresso do Formulário</span>
                        <span>
                          {briefing.status === 'concluido'
                            ? '100% Concluído'
                            : `Etapa ${briefing.current_step || 1} de 8`}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C5A880] h-full"
                          style={{
                            width:
                              briefing.status === 'concluido'
                                ? '100%'
                                : `${((briefing.current_step || 1) / 8) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {briefing.completed_at && (
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Preenchido pelo cliente em {formatDate(briefing.completed_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom (Item 16) */}
                  <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          sendWhatsApp(
                            briefing.token,
                            briefing.client_id,
                            event ? event.name : 'seu evento'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        title="Enviar link do briefing no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enviar WhatsApp</span>
                      </button>

                      <button
                        onClick={() => copyBriefingLink(briefing.token)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        title="Copiar link do briefing"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {event && (
                        <Link
                          href={`/eventos/${event.id}`}
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50"
                        >
                          Ver no Evento
                        </Link>
                      )}
                      <Link
                        href={`/briefing/${briefing.token}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 flex items-center gap-1"
                      >
                        <span>Abrir Formulário</span>
                        <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

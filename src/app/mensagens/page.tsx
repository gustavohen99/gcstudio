'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { getWhatsAppUrl } from '@/lib/utils';
import {
  MessageSquare,
  MessageCircle,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Send,
  Users,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MessageTemplate } from '@/types';

export default function MessageTemplatesPage() {
  const { toast } = useToast();
  const {
    messageTemplates,
    clients,
    events,
    briefings,
    galleries,
    addMessageTemplate,
    deleteMessageTemplate,
  } = useAppStore();

  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(
    messageTemplates[0] || null
  );
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Template Form
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    category: 'Geral',
    content: '',
  });

  // Calculate parsed message
  const getProcessedMessage = () => {
    if (!selectedTemplate) return '';
    let text = customMessage || selectedTemplate.content;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const selectedEvent = selectedClient
      ? events.find((e) => e.client_id === selectedClient.id)
      : null;
    const selectedBriefing = selectedEvent
      ? briefings.find((b) => b.event_id === selectedEvent.id)
      : null;
    const selectedGallery = selectedEvent
      ? galleries.find((g) => g.event_id === selectedEvent.id)
      : null;

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    if (selectedClient) {
      text = text.replace(/{{nome_cliente}}/g, selectedClient.name);
    }
    if (selectedEvent) {
      text = text.replace(/{{tipo_evento}}/g, selectedEvent.type);
      text = text.replace(/{{data_evento}}/g, selectedEvent.date);
      text = text.replace(/{{valor}}/g, `R$ ${selectedEvent.value.toLocaleString('pt-BR')}`);
    }

    if (selectedBriefing) {
      text = text.replace(/{{link}}/g, `${appOrigin}/briefing/${selectedBriefing.token}`);
    } else if (selectedGallery) {
      text = text.replace(/{{link}}/g, `${appOrigin}/galeria/${selectedGallery.token}`);
    } else {
      text = text.replace(/{{link}}/g, `${appOrigin}/`);
    }

    text = text.replace(/{{data_vencimento}}/g, '10/11/2026');
    text = text.replace(/{{dias_restantes}}/g, '15');
    text = text.replace(/{{data_expiracao}}/g, '25/11/2026');

    return text;
  };

  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    setCustomMessage(tpl.content);
  };

  const handleSendWhatsApp = () => {
    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const phone = selectedClient ? selectedClient.whatsapp : '5511999998888';
    const message = getProcessedMessage();
    const url = getWhatsAppUrl(phone, message);
    window.open(url, '_blank');
    toast('WhatsApp aberto com a mensagem pronta!', 'success');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getProcessedMessage());
    toast('Mensagem copiada para a área de transferência!', 'success');
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.content) {
      toast('Preencha o nome e o conteúdo do modelo.', 'error');
      return;
    }
    const newTpl = addMessageTemplate({
      name: newTemplateForm.name,
      category: newTemplateForm.category,
      content: newTemplateForm.content,
      variables: ['nome_cliente', 'link'],
    });
    setModalOpen(false);
    setSelectedTemplate(newTpl);
    setCustomMessage(newTpl.content);
    toast('Novo modelo de mensagem salvo!', 'success');
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Modelos de Mensagens & WhatsApp
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Envie mensagens padronizadas e personalizadas no WhatsApp com 1 clique (sem necessidade de API oficial).
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Novo Modelo</span>
          </button>
        </div>

        {/* 2 Columns: Templates Library on Left, Live Editor & Dispatch on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Library */}
          <div className="space-y-2 lg:col-span-1">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider px-1">
              Biblioteca de Modelos ({messageTemplates.length})
            </h3>

            <div className="space-y-2 max-h-56 lg:max-h-[640px] overflow-y-auto no-scrollbar pr-1">
              {messageTemplates.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-800 border-[#EAEAE4] hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{tpl.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                          isSelected
                            ? 'bg-zinc-800 text-[#C5A880]'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {tpl.category}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-500'
                      }`}
                    >
                      {tpl.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Editor & WhatsApp Dispatcher */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#EAEAE4] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {selectedTemplate ? selectedTemplate.name : 'Selecione um modelo'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Substitua variáveis e visualize antes de enviar ao cliente.
                  </p>
                </div>

                {/* Client Selector for auto-variables */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-zinc-500 whitespace-nowrap">Preencher com:</span>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-800 flex-1 sm:flex-none w-full sm:max-w-[200px]"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message text area */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Mensagem (Edite se desejar antes de abrir o WhatsApp):
                </label>
                <textarea
                  rows={8}
                  value={getProcessedMessage()}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-zinc-200 text-xs text-zinc-900 font-sans leading-relaxed bg-[#FBFBF9] focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>

              {/* Available variables badge list */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-400 block">
                  Variáveis suportadas:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{nome_cliente}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{data_evento}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{tipo_evento}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{valor}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{link}}'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {'{{data_vencimento}}'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Mensagem</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar WhatsApp (wa.me)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Novo Modelo */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Novo Modelo de Mensagem"
        >
          <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Nome do Modelo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Confirmação de Reunião"
                value={newTemplateForm.name}
                onChange={(e) =>
                  setNewTemplateForm({ ...newTemplateForm, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Categoria</label>
              <select
                value={newTemplateForm.category}
                onChange={(e) =>
                  setNewTemplateForm({ ...newTemplateForm, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
              >
                <option value="Comercial">Comercial</option>
                <option value="Produção">Produção</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Entrega">Entrega</option>
                <option value="Relacionamento">Relacionamento</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Texto com Variáveis *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Olá, {{nome_cliente}}! ..."
                value={newTemplateForm.content}
                onChange={(e) =>
                  setNewTemplateForm({ ...newTemplateForm, content: e.target.value })
                }
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
                Salvar Modelo
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

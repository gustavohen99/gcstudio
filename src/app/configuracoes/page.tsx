'use client';

import React, { useState, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  Settings,
  Building2,
  CreditCard,
  Package as PackageIcon,
  Plus,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Database,
  CheckCircle2,
  Save,
  Download,
  Upload,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsPage() {
  const { toast } = useToast();
  const {
    settings,
    packages,
    services,
    events,
    clients,
    updateSettings,
    addPackage,
    deletePackage,
    addService,
    deleteService,
    resetToDemoData,
    clearAllUserData,
    exportStoreData,
    importStoreData,
  } = useAppStore();
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'studio' | 'pacotes' | 'bancario' | 'dados' | 'supabase'>('studio');

  // Studio form
  const [studioForm, setStudioForm] = useState({
    name: settings.name,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    instagram: settings.instagram,
    website: settings.website,
    address: settings.address,
  });

  // Bank details form
  const [bankForm, setBankForm] = useState({
    bank: settings.bank_details.bank,
    agency: settings.bank_details.agency,
    account: settings.bank_details.account,
    pix_key: settings.bank_details.pix_key,
    beneficiary: settings.bank_details.beneficiary,
  });

  // Package Modal
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [newPkg, setNewPkg] = useState({
    name: '',
    description: '',
    price: 5000,
    category: 'Casamento',
    features: ['Cobertura completa', 'Galeria online'],
  });

  // Service Modal
  const [srvModalOpen, setSrvModalOpen] = useState(false);
  const [newSrv, setNewSrv] = useState({
    name: '',
    description: '',
    price: 1200,
    category: 'Adicionais',
  });

  const handleSaveStudio = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ ...studioForm });
    toast('Dados do estúdio atualizados!', 'success');
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ bank_details: { ...bankForm } });
    toast('Dados bancários e PIX atualizados!', 'success');
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.name) return;
    addPackage({
      name: newPkg.name,
      description: newPkg.description,
      price: Number(newPkg.price),
      category: newPkg.category,
      features: newPkg.features,
      is_active: true,
    });
    setPkgModalOpen(false);
    toast('Pacote cadastrado com sucesso!', 'success');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrv.name) return;
    addService({
      name: newSrv.name,
      description: newSrv.description,
      price: Number(newSrv.price),
      category: newSrv.category,
      is_active: true,
    });
    setSrvModalOpen(false);
    toast('Serviço adicional cadastrado!', 'success');
  };

  const handleResetDemo = () => {
    if (confirm('Restaurar todos os dados demonstrativos do estúdio?')) {
      resetToDemoData();
      toast('Dados demonstrativos restaurados!', 'info');
    }
  };

  const handleClearData = () => {
    if (confirm('ATENÇÃO: Deseja apagar todos os eventos, clientes, orçamentos e galerias demo para começar do zero com base limpa?')) {
      clearAllUserData();
      toast('Todos os dados foram limpos com sucesso. O sistema está pronto para produção real!', 'success');
    }
  };

  const handleExportBackup = () => {
    const payload = exportStoreData();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const todayStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `gcstudio-backup-${todayStr}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast(`Backup exportado com ${events.length} evento(s) e ${clients.length} cliente(s)!`, 'success');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        !confirm(
          'Deseja substituir os dados atuais deste navegador pelos registros deste arquivo de backup?'
        )
      ) {
        return;
      }
      const result = importStoreData(parsed);
      toast(
        `Backup importado: ${result.events} evento(s) e ${result.clients} cliente(s) restaurados!`,
        'success'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao ler o arquivo de backup.';
      toast(message, 'error');
    }
  };

  const isSupabaseReady = isSupabaseConfigured();

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
            Configurações do Studio
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Personalize dados da marca, dados bancários, pacotes de fotografia e cinema, e banco de dados.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="border-b border-zinc-200 flex gap-2 overflow-x-auto text-xs font-medium">
          {[
            { id: 'studio', label: 'Dados da G&C Studio', icon: Building2 },
            { id: 'pacotes', label: 'Pacotes & Serviços', icon: PackageIcon },
            { id: 'bancario', label: 'Dados Bancários & PIX', icon: CreditCard },
            { id: 'dados', label: 'Dados & Backup', icon: RotateCcw },
            { id: 'supabase', label: 'Conexão Supabase', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
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
          {/* 1. STUDIO */}
          {activeTab === 'studio' && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAEAE4] shadow-xs max-w-2xl">
              <form onSubmit={handleSaveStudio} className="space-y-4 text-xs">
                <h3 className="text-sm font-semibold text-zinc-900">Identidade do Estúdio</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Nome da Empresa</label>
                    <input
                      type="text"
                      value={studioForm.name}
                      onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Slogan / Tagline</label>
                    <input
                      type="text"
                      value={studioForm.tagline}
                      onChange={(e) => setStudioForm({ ...studioForm, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={studioForm.phone}
                      onChange={(e) => setStudioForm({ ...studioForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">WhatsApp Oficial</label>
                    <input
                      type="text"
                      value={studioForm.whatsapp}
                      onChange={(e) => setStudioForm({ ...studioForm, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={studioForm.email}
                      onChange={(e) => setStudioForm({ ...studioForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Instagram</label>
                    <input
                      type="text"
                      value={studioForm.instagram}
                      onChange={(e) => setStudioForm({ ...studioForm, instagram: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Endereço Físico</label>
                  <input
                    type="text"
                    value={studioForm.address}
                    onChange={(e) => setStudioForm({ ...studioForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4 text-[#C5A880]" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. PACOTES & SERVIÇOS (Item 40) */}
          {activeTab === 'pacotes' && (
            <div className="space-y-6">
              {/* Pacotes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Pacotes Oficiais</h3>
                    <p className="text-xs text-zinc-500">
                      Configuração padrão usada na elaboração de orçamentos e propostas.
                    </p>
                  </div>
                  <button
                    onClick={() => setPkgModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>+ Novo Pacote</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-5 rounded-2xl bg-white border border-[#EAEAE4] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900">{pkg.name}</span>
                          <span className="text-xs font-bold text-zinc-900 font-serif-brand">
                            {formatCurrency(pkg.price)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">{pkg.description}</p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {pkg.category}
                        </span>
                        <button
                          onClick={() => deletePackage(pkg.id)}
                          className="text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Serviços Adicionais */}
              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Serviços Adicionais</h3>
                    <p className="text-xs text-zinc-500">
                      Itens avulsos (Drone, Storymaker, Horas extras, etc.)
                    </p>
                  </div>
                  <button
                    onClick={() => setSrvModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>+ Novo Serviço</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-xl bg-white border border-[#EAEAE4] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900 block">{srv.name}</span>
                        <span className="text-zinc-500">{formatCurrency(srv.price)}</span>
                      </div>
                      <button
                        onClick={() => deleteService(srv.id)}
                        className="text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. BANCÁRIO */}
          {activeTab === 'bancario' && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAEAE4] shadow-xs max-w-xl">
              <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
                <h3 className="text-sm font-semibold text-zinc-900">Dados de Pagamento & PIX</h3>
                <p className="text-zinc-500 text-xs">
                  Estes dados são enviados automaticamente nos lembretes de pagamento e contratos.
                </p>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Chave PIX Oficial</label>
                  <input
                    type="text"
                    value={bankForm.pix_key}
                    onChange={(e) => setBankForm({ ...bankForm, pix_key: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Beneficiário / Razão Social</label>
                  <input
                    type="text"
                    value={bankForm.beneficiary}
                    onChange={(e) => setBankForm({ ...bankForm, beneficiary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Banco</label>
                    <input
                      type="text"
                      value={bankForm.bank}
                      onChange={(e) => setBankForm({ ...bankForm, bank: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Agência</label>
                    <input
                      type="text"
                      value={bankForm.agency}
                      onChange={(e) => setBankForm({ ...bankForm, agency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Conta Corrente</label>
                    <input
                      type="text"
                      value={bankForm.account}
                      onChange={(e) => setBankForm({ ...bankForm, account: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4 text-[#C5A880]" />
                    <span>Salvar Dados Bancários</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. GERENCIAMENTO DE DADOS (Item 41) */}
          {activeTab === 'dados' && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAEAE4] shadow-xs max-w-2xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Gerenciamento de Dados do Sistema
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Exporte seus eventos e clientes para levar do localhost para a Vercel, ou limpe/restaure os registros de demonstração.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <Database className="w-4 h-4 text-[#A8875B]" />
                    <span>Transferir Dados (Localhost ↔ Vercel / Backup)</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {events.length} eventos • {clients.length} clientes
                  </span>
                </div>
                <p className="text-amber-900/80 leading-relaxed">
                  Sem o Supabase em nuvem conectado, cada navegador/endereço salva os dados separadamente. Exporte o arquivo aqui no localhost e importe na Vercel (ou em outro aparelho) para transferir tudo em segundos.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Exportar Backup (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => importFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-medium shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#A8875B]" />
                    <span>Importar Backup (.json)</span>
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Limpeza Completa dos Dados Demonstrativos</span>
                </div>
                <p className="text-rose-700 leading-relaxed">
                  Remove todos os clientes, eventos, leads, orçamentos e galerias de teste para deixar o painel completamente limpo e pronto para a operação real da G&C Studio.
                </p>
                <button
                  type="button"
                  onClick={handleClearData}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs cursor-pointer"
                >
                  Limpar Todos os Dados Demo (Iniciar do Zero)
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                  <RotateCcw className="w-4 h-4 text-[#C5A880]" />
                  <span>Restaurar Dados Demonstrativos</span>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  Recarrega o conjunto de clientes e eventos de exemplo para demonstração e treinamento da equipe.
                </p>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs cursor-pointer"
                >
                  Restaurar Conjunto Demonstrativo
                </button>
              </div>
            </div>
          )}

          {/* 5. SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAEAE4] shadow-xs max-w-2xl space-y-6 text-xs">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Status do Banco de Dados</h3>
                <p className="text-zinc-500 mt-1">
                  Integração em nuvem com Supabase (PostgreSQL, Autenticação e Storage).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-900 block">Modo de Operação Ativo</span>
                    <span className="text-zinc-500">
                      {isSupabaseReady
                        ? 'Conectado ao Supabase na nuvem'
                        : 'Modo Local Integrado com Persistência em Tempo Real'}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  100% OPERACIONAL
                </span>
              </div>

              <div className="space-y-3 text-zinc-600 leading-relaxed border-t border-zinc-100 pt-4">
                <p className="font-semibold text-zinc-800">
                  Como conectar ao seu projeto Supabase na nuvem:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-600">
                  <li>
                    Crie um projeto gratuito em <strong>supabase.com</strong>.
                  </li>
                  <li>
                    Abra o <strong>SQL Editor</strong> do Supabase e execute o script gerado em{' '}
                    <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                      supabase/schema.sql
                    </code>
                    .
                  </li>
                  <li>
                    Copie a URL do projeto e a chave anônima (anon key) no seu arquivo{' '}
                    <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                      .env.local
                    </code>
                    .
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Novo Pacote */}
        <Modal
          isOpen={pkgModalOpen}
          onClose={() => setPkgModalOpen(false)}
          title="Cadastrar Novo Pacote"
        >
          <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Nome do Pacote *</label>
              <input
                type="text"
                required
                placeholder="Ex: Diamond — Foto + Vídeo + Álbum"
                value={newPkg.name}
                onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Preço (R$) *</label>
                <input
                  type="number"
                  required
                  value={newPkg.price}
                  onChange={(e) => setNewPkg({ ...newPkg, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Categoria</label>
                <select
                  value={newPkg.category}
                  onChange={(e) => setNewPkg({ ...newPkg, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                >
                  <option value="Casamento">Casamento</option>
                  <option value="15 anos">15 anos</option>
                  <option value="Ensaio">Ensaio</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Corporativo">Corporativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Descrição</label>
              <textarea
                rows={2}
                value={newPkg.description}
                onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPkgModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Salvar Pacote
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Novo Serviço */}
        <Modal
          isOpen={srvModalOpen}
          onClose={() => setSrvModalOpen(false)}
          title="Cadastrar Serviço Adicional"
        >
          <form onSubmit={handleCreateService} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Nome do Serviço *</label>
              <input
                type="text"
                required
                placeholder="Ex: Painel LED ou Filmagem Subaquática"
                value={newSrv.name}
                onChange={(e) => setNewSrv({ ...newSrv, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Preço (R$) *</label>
              <input
                type="number"
                required
                value={newSrv.price}
                onChange={(e) => setNewSrv({ ...newSrv, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSrvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium"
              >
                Salvar Serviço
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

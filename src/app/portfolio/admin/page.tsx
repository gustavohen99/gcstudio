'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import {
  Globe,
  Layout,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Video,
  Star,
  Layers,
  Palette,
  Phone,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Shield,
  Film,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PortfolioItem, PortfolioTestimonial, PortfolioPageConfig } from '@/types';

function PortfolioAdminContent() {
  const { toast } = useToast();
  const {
    galleries,
    portfolioConfig,
    portfolioItems,
    portfolioTestimonials,
    updatePortfolioConfig,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    reorderPortfolioItems,
    addPortfolioTestimonial,
    updatePortfolioTestimonial,
    deletePortfolioTestimonial,
    resetToDemoData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'trabalhos' | 'hero' | 'sobre' | 'depoimentos' | 'aparencia'>('trabalhos');

  // Local states for forms
  const [heroForm, setHeroForm] = useState(portfolioConfig.hero);
  const [aboutForm, setAboutForm] = useState(portfolioConfig.about);
  const [sectionsForm, setSectionsForm] = useState(portfolioConfig.sections_enabled);
  const [socialsForm, setSocialsForm] = useState(portfolioConfig.socials);
  const [typography, setTypography] = useState(portfolioConfig.typography);
  const [theme, setTheme] = useState(portfolioConfig.theme);

  // Modal State for Portfolio Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [itemForm, setItemForm] = useState<{
    title: string;
    category: string;
    subtitle: string;
    image: string;
    location: string;
    isVideo: boolean;
    video_url: string;
    event_date: string;
    story: string;
    gallery_photos: string[];
    gallery_id: string;
  }>({
    title: '',
    category: 'Casamentos',
    subtitle: '',
    image: '',
    location: '',
    isVideo: false,
    video_url: '',
    event_date: '',
    story: '',
    gallery_photos: [],
    gallery_id: '',
  });

  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [bulkPhotosInput, setBulkPhotosInput] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  // Modal State for Testimonial
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<PortfolioTestimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<{
    name: string;
    event: string;
    quote: string;
    rating: number;
  }>({
    name: '',
    event: '',
    quote: '',
    rating: 5,
  });

  // Open Item Modal
  const handleOpenItemModal = (item?: PortfolioItem) => {
    setNewPhotoInput('');
    setBulkPhotosInput('');
    setShowBulkAdd(false);

    if (item) {
      setEditingItem(item);
      setItemForm({
        title: item.title,
        category: item.category,
        subtitle: item.subtitle,
        image: item.image,
        location: item.location,
        isVideo: !!item.isVideo,
        video_url: item.video_url || '',
        event_date: item.event_date || '',
        story: item.story || item.subtitle || '',
        gallery_photos: item.gallery_photos && item.gallery_photos.length > 0 ? [...item.gallery_photos] : [item.image],
        gallery_id: item.gallery_id || '',
      });
    } else {
      setEditingItem(null);
      setItemForm({
        title: '',
        category: 'Casamentos',
        subtitle: '',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
        location: 'São Paulo, SP',
        isVideo: false,
        video_url: '',
        event_date: '',
        story: '',
        gallery_photos: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85'],
        gallery_id: '',
      });
    }
    setIsItemModalOpen(true);
  };

  // Add photo to current item's gallery
  const handleAddPhotoToItem = () => {
    if (!newPhotoInput.trim()) return;
    setItemForm((prev) => ({
      ...prev,
      gallery_photos: [...prev.gallery_photos, newPhotoInput.trim()],
    }));
    setNewPhotoInput('');
  };

  // Bulk add photos
  const handleBulkAddPhotos = () => {
    if (!bulkPhotosInput.trim()) return;
    const urls = bulkPhotosInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 5);
    if (urls.length === 0) return;

    setItemForm((prev) => ({
      ...prev,
      gallery_photos: [...prev.gallery_photos, ...urls],
    }));
    setBulkPhotosInput('');
    setShowBulkAdd(false);
  };

  // Remove photo from current item's gallery
  const handleRemovePhotoFromItem = (index: number) => {
    setItemForm((prev) => ({
      ...prev,
      gallery_photos: prev.gallery_photos.filter((_, idx) => idx !== index),
    }));
  };

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title || !itemForm.image) {
      toast('Por favor, informe ao menos o título e a URL da foto do trabalho.', 'error');
      return;
    }

    const cleanedPhotos = itemForm.gallery_photos.length > 0 ? itemForm.gallery_photos : [itemForm.image];

    if (editingItem) {
      updatePortfolioItem(editingItem.id, {
        title: itemForm.title,
        category: itemForm.category,
        subtitle: itemForm.subtitle,
        image: itemForm.image,
        location: itemForm.location,
        isVideo: itemForm.isVideo,
        video_url: itemForm.video_url,
        event_date: itemForm.event_date,
        story: itemForm.story,
        gallery_photos: cleanedPhotos,
        gallery_id: itemForm.gallery_id,
      });
      toast(`O projeto "${itemForm.title}" foi atualizado com sucesso!`, 'success');
    } else {
      addPortfolioItem({
        title: itemForm.title,
        category: itemForm.category,
        subtitle: itemForm.subtitle,
        image: itemForm.image,
        location: itemForm.location,
        isVideo: itemForm.isVideo,
        video_url: itemForm.video_url,
        event_date: itemForm.event_date,
        story: itemForm.story,
        gallery_photos: cleanedPhotos,
        gallery_id: itemForm.gallery_id,
      });
      toast(`"${itemForm.title}" já está disponível na vitrine do portfólio.`, 'success');
    }
    setIsItemModalOpen(false);
  };

  // Move item up/down
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolioItems.length) return;

    const reordered = [...portfolioItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    reorderPortfolioItems(reordered);
    toast('A ordem dos trabalhos foi atualizada.', 'success');
  };

  // Delete item
  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${title}" do portfólio?`)) {
      deletePortfolioItem(id);
      toast(`O projeto "${title}" foi removido do portfólio.`, 'info');
    }
  };

  // Open Testimonial Modal
  const handleOpenTestimonialModal = (t?: PortfolioTestimonial) => {
    if (t) {
      setEditingTestimonial(t);
      setTestimonialForm({
        name: t.name,
        event: t.event,
        quote: t.quote,
        rating: t.rating,
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        name: '',
        event: 'Casamento com ...',
        quote: '',
        rating: 5,
      });
    }
    setIsTestimonialModalOpen(true);
  };

  // Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.quote) {
      toast('Informe o nome do cliente e a mensagem do depoimento.', 'error');
      return;
    }

    if (editingTestimonial) {
      updatePortfolioTestimonial(editingTestimonial.id, testimonialForm);
      toast('Depoimento atualizado com sucesso!', 'success');
    } else {
      addPortfolioTestimonial(testimonialForm);
      toast('Novo depoimento adicionado ao site!', 'success');
    }
    setIsTestimonialModalOpen(false);
  };

  // Delete Testimonial
  const handleDeleteTestimonial = (id: string, name: string) => {
    if (confirm(`Remover depoimento de "${name}"?`)) {
      deletePortfolioTestimonial(id);
      toast('Depoimento removido com sucesso.', 'info');
    }
  };

  // Save Hero Tab
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortfolioConfig({ hero: heroForm });
    toast('Cabeçalho Hero salvo com sucesso!', 'success');
  };

  // Save About Tab
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortfolioConfig({ about: aboutForm });
    toast('Seção Sobre Nós salva com sucesso!', 'success');
  };

  // Save Appearance & Settings
  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortfolioConfig({
      sections_enabled: sectionsForm,
      socials: socialsForm,
      typography,
      theme,
    });
    toast('Configurações de layout e contatos salvas!', 'success');
  };

  // Metric update helper
  const handleMetricChange = (index: number, field: 'number' | 'label', val: string) => {
    const newMetrics = [...heroForm.metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: val };
    setHeroForm({ ...heroForm, metrics: newMetrics });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title and Quick Link to Live Site */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#EAEAE4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A880]/15 text-[#9E7D4C] text-[11px] font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> CMS do Site Oficial
          </div>
          <h1 className="font-serif-brand text-3xl font-light text-zinc-900 tracking-tight">
            Gestão & Edição do Portfólio
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
            Edite todos os elementos da página pública: fotos de destaque, textos do cabeçalho, história da marca, depoimentos de clientes e seções ativas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portfolio"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Ver Site ao Vivo</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#EAEAE4] pb-px">
        {[
          { id: 'trabalhos', label: 'Trabalhos & Vitrine', icon: ImageIcon, count: portfolioItems.length },
          { id: 'hero', label: 'Cabeçalho & Hero', icon: Layout },
          { id: 'sobre', label: 'Sobre & Filosofia', icon: Film },
          { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquare, count: portfolioTestimonials.length },
          { id: 'aparencia', label: 'Seções, Estilo & Contatos', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-[#C5A880] text-zinc-950 font-semibold bg-[#FAFAF7]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#C5A880]' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-[#C5A880]/20 text-[#8C6D3F]' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: TRABALHOS (PORTFOLIO ITEMS) */}
      {activeTab === 'trabalhos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAEAE4] shadow-xs">
            <div>
              <h2 className="font-semibold text-sm text-zinc-900">
                Projetos em Destaque no Portfólio ({portfolioItems.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Estes são os trabalhos exibidos na galeria principal. Você pode reordenar a posição deles ou adicionar novas produções.
              </p>
            </div>
            <button
              onClick={() => handleOpenItemModal()}
              className="px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Trabalho</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-[#EAEAE4] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Preview with Aspect Ratio */}
                  <div className="relative aspect-4/3 bg-zinc-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#E8D1B2] border border-white/10">
                        {item.category}
                      </span>
                      {item.isVideo && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C5A880] text-zinc-950 text-[10px] font-bold flex items-center gap-1">
                          <Film className="w-3 h-3" /> Vídeo
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] text-[#C5A880] font-medium">{item.location}</div>
                      <h3 className="font-serif-brand text-lg font-normal truncate">{item.title}</h3>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {item.subtitle || 'Sem descrição adicional.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1 font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                        <ImageIcon className="w-3 h-3 text-[#C5A880]" />
                        {(item.gallery_photos && item.gallery_photos.length) || 1} fotos na galeria
                      </span>
                      {item.event_date && (
                        <span className="text-zinc-400 truncate">• {item.event_date}</span>
                      )}
                    </div>

                    {item.video_url && (
                      <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 pt-1">
                        <Film className="w-3 h-3 text-[#C5A880] shrink-0" />
                        <span className="truncate">{item.video_url}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Reorder, Edit, Delete */}
                <div className="p-3 border-t border-[#F2F2EE] bg-[#FAFAF8] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, 'up')}
                      title="Mover para cima / início"
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === portfolioItems.length - 1}
                      onClick={() => handleMoveItem(index, 'down')}
                      title="Mover para baixo / fim"
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-zinc-400 font-mono ml-1">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal(item)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs font-medium flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-zinc-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir trabalho"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HERO & TEXTOS PRINCIPAIS */}
      {activeTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="bg-white rounded-2xl border border-[#EAEAE4] p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="font-semibold text-base text-zinc-900">Cabeçalho & Hero Banner</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Esta é a primeira impressão dos visitantes ao abrir o site. Configure a frase de impacto, o subtítulo, a foto de fundo e os botões de ação.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Badge Superior (Etiqueta de Destaque)</label>
              <input
                type="text"
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-[#C5A880] text-zinc-900"
                placeholder="Ex: Cobertura Audiovisual Autêntica & Atemporal"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Título Principal H1</label>
              <textarea
                rows={2}
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-[#C5A880] text-zinc-900 font-serif-brand text-lg"
                placeholder="Ex: Memórias que resistem ao tempo com arte e sofisticação."
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Subtítulo Descritivo</label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-[#C5A880] text-zinc-900 leading-relaxed"
                placeholder="Ex: Fotografia documental e cinematografia poética para casamentos..."
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">URL da Imagem de Fundo (Capa Heroica)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  value={heroForm.bg_image}
                  onChange={(e) => setHeroForm({ ...heroForm, bg_image: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-[#C5A880] text-zinc-900"
                  placeholder="https://images.unsplash.com/..."
                />
                {heroForm.bg_image && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                    <img src={heroForm.bg_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-100 bg-[#FAFAF8] space-y-3">
                <span className="font-semibold text-zinc-800 block text-xs">Botão Primário</span>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={heroForm.button_primary_text}
                    onChange={(e) => setHeroForm({ ...heroForm, button_primary_text: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Link de Destino</label>
                  <input
                    type="text"
                    value={heroForm.button_primary_link}
                    onChange={(e) => setHeroForm({ ...heroForm, button_primary_link: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-100 bg-[#FAFAF8] space-y-3">
                <span className="font-semibold text-zinc-800 block text-xs">Botão Secundário</span>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    value={heroForm.button_secondary_text}
                    onChange={(e) => setHeroForm({ ...heroForm, button_secondary_text: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Link de Destino</label>
                  <input
                    type="text"
                    value={heroForm.button_secondary_link}
                    onChange={(e) => setHeroForm({ ...heroForm, button_secondary_link: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="pt-4 border-t border-zinc-100">
              <span className="font-semibold text-zinc-800 block mb-3">4 Métricas de Autoridade (Exibidas sob o banner)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {heroForm.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-zinc-200 space-y-2 bg-white">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block">Número / Destaque</label>
                      <input
                        type="text"
                        value={m.number}
                        onChange={(e) => handleMetricChange(idx, 'number', e.target.value)}
                        className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block">Rótulo / Descrição</label>
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                        className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#C5A880]" />
              <span>Salvar Alterações do Cabeçalho</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SOBRE NÓS & FILOSOFIA */}
      {activeTab === 'sobre' && (
        <form onSubmit={handleSaveAbout} className="bg-white rounded-2xl border border-[#EAEAE4] p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="font-semibold text-base text-zinc-900">Seção Sobre Nós & Filosofia Artística</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Conte a história do seu estúdio, sua abordagem fotográfica e os diferenciais que encantam noivos e debutantes.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">Badge da Seção</label>
                <input
                  type="text"
                  value={aboutForm.badge}
                  onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">URL da Foto do Estúdio / Ação</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={aboutForm.image}
                    onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                    className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                  />
                  {aboutForm.image && (
                    <div className="w-12 h-10 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                      <img src={aboutForm.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Título da Seção</label>
              <input
                type="text"
                value={aboutForm.title}
                onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 font-serif-brand text-base"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Parágrafo 1 (Apresentação)</label>
              <textarea
                rows={3}
                value={aboutForm.p1}
                onChange={(e) => setAboutForm({ ...aboutForm, p1: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Parágrafo 2 (Abordagem no Evento)</label>
              <textarea
                rows={3}
                value={aboutForm.p2}
                onChange={(e) => setAboutForm({ ...aboutForm, p2: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Frase em Destaque (Citação sobre a foto)</label>
              <input
                type="text"
                value={aboutForm.quote}
                onChange={(e) => setAboutForm({ ...aboutForm, quote: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 italic"
              />
            </div>

            {/* Diferenciais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-200 bg-[#FAFAF8] space-y-3">
                <span className="font-semibold text-zinc-800 block text-xs">Diferencial 1</span>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Título</label>
                  <input
                    type="text"
                    value={aboutForm.feat1_title}
                    onChange={(e) => setAboutForm({ ...aboutForm, feat1_title: e.target.value })}
                    className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={aboutForm.feat1_desc}
                    onChange={(e) => setAboutForm({ ...aboutForm, feat1_desc: e.target.value })}
                    className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-[#FAFAF8] space-y-3">
                <span className="font-semibold text-zinc-800 block text-xs">Diferencial 2</span>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Título</label>
                  <input
                    type="text"
                    value={aboutForm.feat2_title}
                    onChange={(e) => setAboutForm({ ...aboutForm, feat2_title: e.target.value })}
                    className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 text-[11px] mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={aboutForm.feat2_desc}
                    onChange={(e) => setAboutForm({ ...aboutForm, feat2_desc: e.target.value })}
                    className="w-full p-2 rounded-lg border border-zinc-200 text-zinc-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#C5A880]" />
              <span>Salvar Seção Sobre Nós</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: DEPOIMENTOS */}
      {activeTab === 'depoimentos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EAEAE4] shadow-xs">
            <div>
              <h2 className="font-semibold text-sm text-zinc-900">
                Depoimentos dos Clientes ({portfolioTestimonials.length})
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Avaliações de casais e formandos exibidas na seção de prova social do site.
              </p>
            </div>
            <button
              onClick={() => handleOpenTestimonialModal()}
              className="px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Depoimento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-[#EAEAE4] p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#C5A880]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C5A880]" />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-600 font-light italic leading-relaxed line-clamp-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 block">{t.name}</span>
                    <span className="text-[11px] text-zinc-400">{t.event}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenTestimonialModal(t)}
                      className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors"
                      title="Editar depoimento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTestimonial(t.id, t.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Excluir depoimento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: APARÊNCIA, SEÇÕES & CONTATOS */}
      {activeTab === 'aparencia' && (
        <form onSubmit={handleSaveAppearance} className="bg-white rounded-2xl border border-[#EAEAE4] p-6 sm:p-8 space-y-8 shadow-xs max-w-4xl">
          {/* Seções Ativas */}
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3">
              <h2 className="font-semibold text-base text-zinc-900">Seções Visíveis no Site</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Você pode ligar ou desligar blocos inteiros do site conforme a necessidade do momento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'hero', label: 'Cabeçalho / Hero Banner', desc: 'Banner inicial com foto e chamada' },
                { key: 'portfolio', label: 'Vitrine de Trabalhos', desc: 'Grid com os projetos cadastrados' },
                { key: 'about', label: 'Sobre & Filosofia', desc: 'História e diferencial do estúdio' },
                { key: 'packages', label: 'Tabela de Pacotes', desc: 'Planos cadastrados no sistema' },
                { key: 'testimonials', label: 'Depoimentos de Casais', desc: 'Avaliações com estrelas' },
                { key: 'contact', label: 'Formulário de Orçamento', desc: 'Captação direta para o CRM' },
              ].map((sec) => (
                <label
                  key={sec.key}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    (sectionsForm as any)[sec.key]
                      ? 'border-[#C5A880] bg-[#FAF8F5]'
                      : 'border-zinc-200 bg-zinc-50/50 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(sectionsForm as any)[sec.key]}
                    onChange={(e) =>
                      setSectionsForm({
                        ...sectionsForm,
                        [sec.key]: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded text-[#C5A880] focus:ring-[#C5A880]"
                  />
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 block">{sec.label}</span>
                    <span className="text-[11px] text-zinc-500">{sec.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tipografia & Estilo */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div>
              <h2 className="font-semibold text-base text-zinc-900">Tipografia & Estética</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Escolha o estilo das fontes dos títulos principais do portfólio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-2">Estilo Tipográfico (Títulos)</label>
                <select
                  value={typography}
                  onChange={(e) => setTypography(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="cormorant">Cormorant Garamond — Clássica Editorial de Alto Padrão</option>
                  <option value="cinzel">Cinzel — Romana Esculpida e Solene</option>
                  <option value="playfair">Playfair Display — Editorial Contemporânea</option>
                  <option value="inter">Inter / Modern Sans — Minimalista Clean</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-2">Tema de Fundo</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                >
                  <option value="dark">Dark Luxury (Fundo Preto Nobre com Dourado)</option>
                  <option value="light">Light Fine Art (Fundo Claro Editorial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Redes & Contato */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div>
              <h2 className="font-semibold text-base text-zinc-900">Canais de Contato Exibidos no Rodapé</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Estes dados são usados nos links de WhatsApp, Instagram e no formulário de orçamento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">WhatsApp (apenas números com DDD)</label>
                <input
                  type="text"
                  value={socialsForm.whatsapp}
                  onChange={(e) => setSocialsForm({ ...socialsForm, whatsapp: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                  placeholder="5511987654321"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">Instagram (@ ou link)</label>
                <input
                  type="text"
                  value={socialsForm.instagram}
                  onChange={(e) => setSocialsForm({ ...socialsForm, instagram: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                  placeholder="@gcstudio"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">E-mail de Contato Público</label>
                <input
                  type="email"
                  value={socialsForm.email}
                  onChange={(e) => setSocialsForm({ ...socialsForm, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                  placeholder="contato@gcstudio.com.br"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1.5">Endereço do Estúdio (Rodapé)</label>
                <input
                  type="text"
                  value={socialsForm.address}
                  onChange={(e) => setSocialsForm({ ...socialsForm, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900"
                  placeholder="Av. Paulista, 1000 - São Paulo, SP"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#C5A880]" />
              <span>Salvar Configurações Gerais</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL: ITEM DO PORTFOLIO */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Editar Trabalho do Portfólio' : 'Novo Trabalho no Portfólio'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Título do Projeto *</label>
              <input
                type="text"
                required
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                placeholder="Ex: Mariana & Lucas"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Categoria *</label>
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              >
                <option value="Casamentos">Casamentos</option>
                <option value="Filmes">Filmes</option>
                <option value="15 Anos">15 Anos</option>
                <option value="Ensaios">Ensaios</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Local do Evento / Cidade</label>
              <input
                type="text"
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                placeholder="Ex: Casa Bisutti — São Paulo, SP"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Data do Evento (para exibição)</label>
              <input
                type="text"
                value={itemForm.event_date}
                onChange={(e) => setItemForm({ ...itemForm, event_date: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                placeholder="Ex: 21 de Novembro de 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">Subtítulo Resumido (Vitrine)</label>
            <input
              type="text"
              value={itemForm.subtitle}
              onChange={(e) => setItemForm({ ...itemForm, subtitle: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              placeholder="Ex: Cerimônia ao entardecer com luz dourada natural e recepção intimista..."
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">História & Narrativa da Produção (Exibida ao abrir a galeria)</label>
            <textarea
              rows={3}
              value={itemForm.story}
              onChange={(e) => setItemForm({ ...itemForm, story: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880] leading-relaxed"
              placeholder="Conte detalhes sobre os noivos, a atmosfera do casamento, escolhas de iluminação, momentos marcantes da cerimônia..."
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">URL da Foto de Capa Principal *</label>
            <input
              type="url"
              required
              value={itemForm.image}
              onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              placeholder="https://images.unsplash.com/photo-..."
            />
            {itemForm.image && (
              <div className="mt-2 h-36 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900">
                <img src={itemForm.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* VINCULAR GALERIA DE CLIENTE */}
          {galleries && galleries.length > 0 && (
            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">Vincular a uma Galeria de Cliente do Sistema (Opcional)</label>
              <select
                value={itemForm.gallery_id}
                onChange={(e) => setItemForm({ ...itemForm, gallery_id: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              >
                <option value="">Nenhuma galeria vinculada</option>
                {galleries.map((gal) => (
                  <option key={gal.id} value={gal.id}>
                    {gal.title} ({gal.client_name}) — {gal.photos_count} fotos
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SEÇÃO DE FOTOS DA GALERIA DO EVENTO */}
          <div className="p-4 rounded-2xl border border-zinc-200 bg-[#FAFAF8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-900 block text-xs">
                  Fotos da Galeria deste Evento ({itemForm.gallery_photos.length} fotos)
                </span>
                <p className="text-[11px] text-zinc-500">
                  Estas são as imagens que o visitante verá ao clicar no evento no portfólio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className="text-[11px] text-[#9E7D4C] hover:underline font-medium cursor-pointer"
              >
                {showBulkAdd ? 'Adicionar foto individual' : '+ Colar múltiplas URLs'}
              </button>
            </div>

            {/* Bulk Add */}
            {showBulkAdd ? (
              <div className="space-y-2 p-3 bg-white rounded-xl border border-zinc-200">
                <label className="block text-[11px] text-zinc-600 font-medium">
                  Cole uma URL de foto por linha:
                </label>
                <textarea
                  rows={4}
                  value={bulkPhotosInput}
                  onChange={(e) => setBulkPhotosInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900 text-xs font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkAdd(false)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-xs hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkAddPhotos}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 cursor-pointer"
                  >
                    Inserir Fotos
                  </button>
                </div>
              </div>
            ) : (
              /* Single Add Input */
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newPhotoInput}
                  onChange={(e) => setNewPhotoInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoToItem}
                  disabled={!newPhotoInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            )}

            {/* Photos Preview Grid */}
            {itemForm.gallery_photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2 max-h-60 overflow-y-auto p-1">
                {itemForm.gallery_photos.map((pUrl, pIdx) => (
                  <div
                    key={pIdx}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-200 bg-zinc-900 shadow-2xs"
                  >
                    <img src={pUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhotoFromItem(pIdx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-sm bg-black/60 text-[9px] text-white font-mono">
                      #{pIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-xs text-zinc-400">
                Nenhuma foto adicional adicionada a este evento ainda.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-200 bg-[#FAFAF8] space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isVideo}
                onChange={(e) => setItemForm({ ...itemForm, isVideo: e.target.checked })}
                className="rounded text-[#C5A880] focus:ring-[#C5A880]"
              />
              <span className="font-semibold text-zinc-800 text-xs">Este trabalho inclui vídeo / teaser cinematográfico?</span>
            </label>

            {itemForm.isVideo && (
              <div>
                <label className="block text-zinc-600 text-[11px] mb-1">Link do Vídeo (YouTube, Vimeo ou MP4 direto)</label>
                <input
                  type="url"
                  value={itemForm.video_url}
                  onChange={(e) => setItemForm({ ...itemForm, video_url: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 text-zinc-900 bg-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors cursor-pointer"
            >
              {editingItem ? 'Salvar Alterações' : 'Adicionar ao Portfólio'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DEPOIMENTO */}
      <Modal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        title={editingTestimonial ? 'Editar Depoimento' : 'Novo Depoimento'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">Nome do Cliente / Casal *</label>
            <input
              type="text"
              required
              value={testimonialForm.name}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              placeholder="Ex: Beatriz Almeida"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">Evento Realizado</label>
            <input
              type="text"
              value={testimonialForm.event}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, event: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              placeholder="Ex: Casamento com Thiago"
            />
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">Avaliação em Estrelas</label>
            <select
              value={testimonialForm.rating}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5 Estrelas - Excelente)</option>
              <option value={4}>⭐⭐⭐⭐ (4 Estrelas)</option>
              <option value={3}>⭐⭐⭐ (3 Estrelas)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">Depoimento / Depoimento do Cliente *</label>
            <textarea
              rows={4}
              required
              value={testimonialForm.quote}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880] leading-relaxed"
              placeholder="Escreva a mensagem do cliente elogiando a experiência e entrega..."
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTestimonialModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-medium transition-colors cursor-pointer"
            >
              {editingTestimonial ? 'Salvar Depoimento' : 'Adicionar Depoimento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function PortfolioAdminPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Carregando painel de edição...</div>}>
        <PortfolioAdminContent />
      </Suspense>
    </AppShell>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import {
  Image as ImageIcon,
  Plus,
  Upload,
  ExternalLink,
  Copy,
  Clock,
  Heart,
  CheckCircle2,
  Calendar,
  Lock,
  RefreshCw,
  Search,
  ListFilter,
  Video,
  Film,
  Settings,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Folder,
  Trash2,
  Check,
  Star,
  Type,
  Download,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { QuickCreateModal } from '@/components/global/QuickCreateModal';
import { Gallery, GalleryFontStyle, GalleryDownloadQuality, GalleryPhoto } from '@/types';

export default function GalleriesAdminPage() {
  const { toast } = useToast();
  const {
    galleries,
    photos,
    events,
    renewGallery,
    addPhotoToGallery,
    updateGallery,
    updatePhoto,
    deletePhoto,
    setPhotoAsCover,
    reorderPhoto,
    addFolderToGallery,
    removeFolderFromGallery,
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video Management State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedGalleryForVideo, setSelectedGalleryForVideo] = useState<Gallery | null>(null);
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [videoInputTitle, setVideoInputTitle] = useState('');

  // Gallery Settings Modal State
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [activeSettingsGallery, setActiveSettingsGallery] = useState<Gallery | null>(null);
  const [settingsTab, setSettingsTab] = useState<'capa' | 'tipografia' | 'pastas' | 'regras'>('capa');
  
  // Settings Form values
  const [settingsCoverUrl, setSettingsCoverUrl] = useState('');
  const [settingsFontStyle, setSettingsFontStyle] = useState<GalleryFontStyle>('cormorant');
  const [settingsExpiresAt, setSettingsExpiresAt] = useState('');
  const [settingsSelectionEnabled, setSettingsSelectionEnabled] = useState(true);
  const [settingsSelectionMax, setSettingsSelectionMax] = useState(80);
  const [settingsFavoritesEnabled, setSettingsFavoritesEnabled] = useState(true);
  const [settingsDownloadEnabled, setSettingsDownloadEnabled] = useState(true);
  const [settingsDownloadQuality, setSettingsDownloadQuality] = useState<GalleryDownloadQuality>('both');
  const [newFolderName, setNewFolderName] = useState('');

  // Photo Organizer Modal State
  const [organizeModalOpen, setOrganizeModalOpen] = useState(false);
  const [organizeGallery, setOrganizeGallery] = useState<Gallery | null>(null);
  const [organizeFolderFilter, setOrganizeFolderFilter] = useState<string>('all');

  const filteredGalleries = galleries.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/galeria/${token}`;
    navigator.clipboard.writeText(url);
    toast('Link da galeria pública copiado!', 'success');
  };

  const copyForLightroom = (galleryId: string) => {
    const selectedPhotos = photos.filter((p) => p.gallery_id === galleryId && p.is_selected);
    if (selectedPhotos.length === 0) {
      toast('Nenhuma foto selecionada para o álbum nesta galeria ainda.', 'info');
      return;
    }
    const filenames = selectedPhotos.map((p) => p.filename).join(', ');
    navigator.clipboard.writeText(filenames);
    toast(`${selectedPhotos.length} fotos copiadas para filtrar no Adobe Lightroom!`, 'success');
  };

  const openSettingsModal = (gal: Gallery) => {
    setActiveSettingsGallery(gal);
    setSettingsCoverUrl(gal.cover_url);
    setSettingsFontStyle(gal.font_style || 'cormorant');
    // Format expires_at for date input (YYYY-MM-DD)
    const datePart = gal.expires_at ? gal.expires_at.split('T')[0] : '';
    setSettingsExpiresAt(datePart);
    setSettingsSelectionEnabled(gal.selection_enabled !== false);
    setSettingsSelectionMax(gal.selection_max || 60);
    setSettingsFavoritesEnabled(gal.favorites_enabled !== false);
    setSettingsDownloadEnabled(gal.download_enabled !== false);
    setSettingsDownloadQuality(gal.download_quality || 'both');
    setSettingsTab('capa');
    setSettingsModalOpen(true);
  };

  const handleSaveSettings = () => {
    if (!activeSettingsGallery) return;

    let fullExpiresAt = activeSettingsGallery.expires_at;
    if (settingsExpiresAt) {
      fullExpiresAt = `${settingsExpiresAt}T23:59:59Z`;
    }

    updateGallery(activeSettingsGallery.id, {
      cover_url: settingsCoverUrl.trim() || activeSettingsGallery.cover_url,
      font_style: settingsFontStyle,
      expires_at: fullExpiresAt,
      selection_enabled: settingsSelectionEnabled,
      selection_max: settingsSelectionMax,
      favorites_enabled: settingsFavoritesEnabled,
      download_enabled: settingsDownloadEnabled,
      download_quality: settingsDownloadQuality,
    });

    setSettingsModalOpen(false);
    toast('Configurações da galeria atualizadas com sucesso!', 'success');
  };

  const handleAddFolder = () => {
    if (!activeSettingsGallery || !newFolderName.trim()) return;
    addFolderToGallery(activeSettingsGallery.id, newFolderName.trim());
    // update current local state for immediate feedback
    setActiveSettingsGallery((prev) => {
      if (!prev) return prev;
      const cur = prev.folders || [];
      if (cur.includes(newFolderName.trim())) return prev;
      return { ...prev, folders: [...cur, newFolderName.trim()] };
    });
    setNewFolderName('');
    toast('Pasta criada com sucesso!', 'success');
  };

  const handleRemoveFolder = (folderName: string) => {
    if (!activeSettingsGallery) return;
    removeFolderFromGallery(activeSettingsGallery.id, folderName);
    setActiveSettingsGallery((prev) => {
      if (!prev) return prev;
      return { ...prev, folders: (prev.folders || []).filter((f) => f !== folderName) };
    });
    toast(`Pasta "${folderName}" removida.`, 'info');
  };

  const setExpiryDays = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setSettingsExpiresAt(target.toISOString().split('T')[0]);
  };

  const openOrganizeModal = (gal: Gallery) => {
    setOrganizeGallery(gal);
    setOrganizeFolderFilter('all');
    setOrganizeModalOpen(true);
  };

  const handleSimulatedUpload = (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedGalleryId) return;

    setUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      // Create photos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fakeUrl = URL.createObjectURL(file);
        addPhotoToGallery({
          gallery_id: selectedGalleryId,
          url: fakeUrl,
          thumbnail_url: fakeUrl,
          filename: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          is_favorite: false,
          is_selected: false,
        });
      }

      setUploading(false);
      setUploadProgress(0);
      setUploadModalOpen(false);
      toast(`${files.length} foto(s) enviada(s) para a galeria com sucesso!`, 'success');
    }, 1200);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-medium text-zinc-900 tracking-tight">
              Galerias de Fotos Online
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Personalize capas, tipografia, pastas, ordenação de fotos, validade e permissões de download.
            </p>
          </div>

          <button
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#C5A880]" />
            <span>+ Nova Galeria</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#EAEAE4] shadow-xs focus:outline-hidden focus:border-[#C5A880]"
          />
        </div>

        {/* Gallery Cards Grid */}
        {filteredGalleries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#EAEAE4] space-y-3">
            <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-800">Nenhuma galeria cadastrada</h3>
            <p className="text-xs text-zinc-500">Crie sua primeira galeria de fotos para os clientes.</p>
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
            >
              + Criar Galeria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries.map((gal) => {
              const galleryPhotos = photos.filter((p) => p.gallery_id === gal.id);
              const now = typeof window !== 'undefined' ? Date.now() : 1775520000000;
              const isExpired = new Date(gal.expires_at).getTime() < now;
              const foldersCount = gal.folders?.length || 0;

              return (
                <div
                  key={gal.id}
                  className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Photo */}
                    <Link href={`/galerias/${gal.id}`} className="relative h-48 w-full bg-zinc-900 overflow-hidden block">
                      <img
                        src={gal.cover_url}
                        alt={gal.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Clean Status Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/95 backdrop-blur-md text-zinc-900 shadow-xs">
                          {galleryPhotos.length} fotos
                        </span>
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-600 text-white">
                            Expirada
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-600 text-white">
                            Ativa
                          </span>
                        )}
                      </div>

                      {/* Title & Client over cover */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-serif-brand text-lg font-medium leading-snug truncate group-hover:text-[#E8D1B2] transition-colors">
                          {gal.title}
                        </h3>
                        <p className="text-[11px] text-zinc-300 truncate">
                          Cliente: {gal.client_name}
                        </p>
                      </div>
                    </Link>

                    {/* Simple Info Row */}
                    <div className="p-3.5 flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Expira em {formatDate(gal.expires_at)}</span>
                      </div>
                      {gal.selection_enabled !== false && (
                        <span className="text-[11px] font-medium text-[#8B6E3F]">
                          Álbum: {gal.selected_count}/{gal.selection_max}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Actions Bar */}
                  <div className="p-3 bg-zinc-50/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* Copy link */}
                      <button
                        onClick={() => copyLink(gal.token)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Copiar Link da Galeria"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Settings modal */}
                      <button
                        onClick={() => openSettingsModal(gal)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Configurações da Galeria"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Primary: Gerenciar Fotos */}
                      <Link
                        href={`/galerias/${gal.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-2xs"
                      >
                        Gerenciar Fotos
                      </Link>

                      {/* Secondary: Ver Galeria */}
                      <Link
                        href={`/galeria/${gal.token}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <span>Ver</span>
                        <ExternalLink className="w-3 h-3 text-[#C5A880]" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: CONFIGURAÇÕES DA GALERIA (CAPA, FONTES, REGRAS)    */}
        {/* ======================================================== */}
        <Modal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          title={`Configurações: ${activeSettingsGallery?.title || 'Galeria'}`}
          subtitle="Ajuste a foto de capa, estilo de tipografia editorial, pastas, prazo de validade e permissões do cliente."
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Tabs Bar */}
            <div className="flex border-b border-zinc-200 gap-2">
              <button
                type="button"
                onClick={() => setSettingsTab('capa')}
                className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  settingsTab === 'capa'
                    ? 'border-[#C5A880] text-zinc-900 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto de Capa</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('tipografia')}
                className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  settingsTab === 'tipografia'
                    ? 'border-[#C5A880] text-zinc-900 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Tipografia & Fontes</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('pastas')}
                className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  settingsTab === 'pastas'
                    ? 'border-[#C5A880] text-zinc-900 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Pastas da Galeria</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('regras')}
                className={`pb-2.5 px-3 font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                  settingsTab === 'regras'
                    ? 'border-[#C5A880] text-zinc-900 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Validade & Permissões</span>
              </button>
            </div>

            {/* TAB 1: CAPA */}
            {settingsTab === 'capa' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-zinc-800 mb-1.5">
                    Pré-visualização da Capa Atual
                  </label>
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 shadow-inner">
                    <img
                      src={settingsCoverUrl || activeSettingsGallery?.cover_url}
                      alt="Capa da galeria"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-xs uppercase tracking-widest text-[#E8D1B2] font-semibold">
                        {activeSettingsGallery?.client_name}
                      </p>
                      <h4 className="font-serif-brand text-xl font-light">
                        {activeSettingsGallery?.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    URL da Imagem de Capa
                  </label>
                  <input
                    type="text"
                    value={settingsCoverUrl}
                    onChange={(e) => setSettingsCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Você pode colar um link direto de imagem ou selecionar qualquer foto abaixo com 1 clique.
                  </p>
                </div>

                {activeSettingsGallery && (
                  <div>
                    <label className="block font-medium text-zinc-700 mb-2">
                      Ou escolha uma das fotos já presentes nesta galeria:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {photos
                        .filter((p) => p.gallery_id === activeSettingsGallery.id)
                        .map((photo) => {
                          const isSelected = settingsCoverUrl === photo.url;
                          return (
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => setSettingsCoverUrl(photo.url)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-[#C5A880] ring-2 ring-[#C5A880]/30'
                                  : 'border-transparent hover:border-zinc-400 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={photo.thumbnail_url || photo.url}
                                alt={photo.title || 'Foto'}
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-[#C5A880]/40 flex items-center justify-center">
                                  <Star className="w-5 h-5 text-white fill-white shadow-md" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TIPOGRAFIA */}
            {settingsTab === 'tipografia' && (
              <div className="space-y-4">
                <p className="text-zinc-600">
                  Escolha o estilo tipográfico editorial da galeria. O cliente verá os títulos, nomes e cabeçalhos renderizados com a fonte escolhida.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cormorant Garamond */}
                  <div
                    onClick={() => setSettingsFontStyle('cormorant')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      settingsFontStyle === 'cormorant'
                        ? 'border-[#C5A880] bg-[#FAF7F2]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-900">Cormorant Garamond</span>
                      {settingsFontStyle === 'cormorant' && (
                        <Check className="w-4 h-4 text-[#8B6E3F]" />
                      )}
                    </div>
                    <p className="font-cormorant text-2xl font-light text-zinc-800 leading-tight">
                      Amor, Poesia & Memórias Eternas
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-2 block">
                      Estilo Clássico Romântico & Alta Costura
                    </span>
                  </div>

                  {/* Cinzel */}
                  <div
                    onClick={() => setSettingsFontStyle('cinzel')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      settingsFontStyle === 'cinzel'
                        ? 'border-[#C5A880] bg-[#FAF7F2]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-900">Cinzel</span>
                      {settingsFontStyle === 'cinzel' && (
                        <Check className="w-4 h-4 text-[#8B6E3F]" />
                      )}
                    </div>
                    <p className="font-cinzel text-xl font-light text-zinc-800 tracking-wider leading-tight">
                      G&C STUDIO FINE ART
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-2 block">
                      Luxo Tradicional, Monogramas & Casamentos Nobres
                    </span>
                  </div>

                  {/* Playfair Display */}
                  <div
                    onClick={() => setSettingsFontStyle('playfair')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      settingsFontStyle === 'playfair'
                        ? 'border-[#C5A880] bg-[#FAF7F2]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-900">Playfair Display</span>
                      {settingsFontStyle === 'playfair' && (
                        <Check className="w-4 h-4 text-[#8B6E3F]" />
                      )}
                    </div>
                    <p className="font-playfair text-xl italic font-normal text-zinc-800 leading-tight">
                      Momentos Únicos e Inesquecíveis
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-2 block">
                      Editorial Vogue, Revista & 15 Anos Moderno
                    </span>
                  </div>

                  {/* Inter */}
                  <div
                    onClick={() => setSettingsFontStyle('inter')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      settingsFontStyle === 'inter'
                        ? 'border-[#C5A880] bg-[#FAF7F2]'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-900">Inter Sans</span>
                      {settingsFontStyle === 'inter' && (
                        <Check className="w-4 h-4 text-[#8B6E3F]" />
                      )}
                    </div>
                    <p className="font-inter text-lg font-medium text-zinc-800 tracking-tight leading-tight">
                      Fotografia Contemporânea & Urbana
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-2 block">
                      Minimalista, Corporativo & Ensaios Urbanos
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PASTAS */}
            {settingsTab === 'pastas' && (
              <div className="space-y-4">
                <div>
                  <p className="text-zinc-600 mb-3">
                    Crie categorias/pastas para organizar as fotos dentro da galeria (ex: <em>Making Of</em>, <em>Cerimônia</em>, <em>Ensaio a Dois</em>, <em>Festa</em>). O cliente poderá navegar entre as pastas com abas dedicadas.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nome da nova pasta (ex: Cerimônia)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFolder();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFolder}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 text-[#C5A880]" />
                      <span>Adicionar Pasta</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-zinc-800 block">Pastas Atuais:</span>
                  {!activeSettingsGallery?.folders || activeSettingsGallery.folders.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center text-zinc-500">
                      Nenhuma pasta criada. Todas as fotos aparecerão em fluxo contínuo.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeSettingsGallery.folders.map((folder) => {
                        const count = photos.filter(
                          (p) => p.gallery_id === activeSettingsGallery.id && p.folder === folder
                        ).length;

                        return (
                          <div
                            key={folder}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200"
                          >
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-[#8B6E3F]" />
                              <span className="font-medium text-zinc-800">{folder}</span>
                              <span className="text-[11px] text-zinc-400">
                                ({count} foto{count === 1 ? '' : 's'})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFolder(folder)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-white"
                              title="Remover pasta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: REGRAS, VALIDADE & PERMISSÕES */}
            {settingsTab === 'regras' && (
              <div className="space-y-5">
                {/* Validade */}
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <label className="block font-semibold text-zinc-900">
                    Data de Validade da Galeria
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    Após esta data, a galeria pública exibirá mensagem de expiração com orientação para contato.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="date"
                      value={settingsExpiresAt}
                      onChange={(e) => setSettingsExpiresAt(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                    />
                    <button
                      type="button"
                      onClick={() => setExpiryDays(30)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[11px]"
                    >
                      +30 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(60)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[11px]"
                    >
                      +60 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(90)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[11px]"
                    >
                      +90 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpiryDays(365)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[11px]"
                    >
                      +1 ano
                    </button>
                  </div>
                </div>

                {/* Seleção de fotos */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900 block">
                        Seleção de Fotos para o Álbum
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Permitir que o cliente marque as fotos que deseja no álbum fine art.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsSelectionEnabled}
                      onChange={(e) => setSettingsSelectionEnabled(e.target.checked)}
                      className="w-5 h-5 accent-[#C5A880] rounded cursor-pointer"
                    />
                  </div>

                  {settingsSelectionEnabled && (
                    <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                      <label className="text-zinc-700 font-medium">
                        Limite máximo de fotos no álbum:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={settingsSelectionMax}
                        onChange={(e) => setSettingsSelectionMax(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-semibold text-center focus:outline-hidden focus:border-[#C5A880]"
                      />
                    </div>
                  )}
                </div>

                {/* Favoritos */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-zinc-900 block">
                      Botão de Fotos Favoritas (Coração)
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Exibir botão para o cliente curtir e marcar suas fotos prediletas.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsFavoritesEnabled}
                    onChange={(e) => setSettingsFavoritesEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#C5A880] rounded cursor-pointer"
                  />
                </div>

                {/* Downloads & Qualidade */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900 block">
                        Permitir Download de Fotos
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Liberar botão de download para o cliente baixar fotos individuais ou a galeria inteira.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDownloadEnabled}
                      onChange={(e) => setSettingsDownloadEnabled(e.target.checked)}
                      className="w-5 h-5 accent-[#C5A880] rounded cursor-pointer"
                    />
                  </div>

                  {settingsDownloadEnabled && (
                    <div className="pt-2 border-t border-zinc-200 space-y-2">
                      <label className="block text-zinc-700 font-medium">
                        Qualidade permitida para download:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSettingsDownloadQuality('both')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            settingsDownloadQuality === 'both'
                              ? 'border-[#C5A880] bg-[#FAF7F2] font-semibold text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          <span className="block text-xs">Ambas</span>
                          <span className="text-[10px] text-zinc-400">Alta Res + Web</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettingsDownloadQuality('high_res')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            settingsDownloadQuality === 'high_res'
                              ? 'border-[#C5A880] bg-[#FAF7F2] font-semibold text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          <span className="block text-xs">Alta Resolução</span>
                          <span className="text-[10px] text-zinc-400">Para impressão</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSettingsDownloadQuality('web')}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            settingsDownloadQuality === 'web'
                              ? 'border-[#C5A880] bg-[#FAF7F2] font-semibold text-zinc-900'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          <span className="block text-xs">Web / Redes</span>
                          <span className="text-[10px] text-zinc-400">Leve para celular</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#C5A880]" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* ======================================================== */}
        {/* MODAL: ORGANIZAR & REORDENAR FOTOS DA GALERIA            */}
        {/* ======================================================== */}
        <Modal
          isOpen={organizeModalOpen}
          onClose={() => setOrganizeModalOpen(false)}
          title={`Organizar Fotos: ${organizeGallery?.title || 'Galeria'}`}
          subtitle="Reordene a posição das fotos, mova entre pastas e defina a foto de capa com 1 clique."
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Bar with Filter & Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
              {/* Folder Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-zinc-500 font-medium shrink-0">Filtrar:</span>
                <button
                  type="button"
                  onClick={() => setOrganizeFolderFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    organizeFolderFilter === 'all'
                      ? 'bg-zinc-900 text-white font-semibold'
                      : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Todas
                </button>
                {organizeGallery?.folders?.map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setOrganizeFolderFilter(folder)}
                    className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                      organizeFolderFilter === folder
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>

              {/* Upload trigger */}
              <button
                type="button"
                onClick={() => {
                  if (organizeGallery) {
                    setSelectedGalleryId(organizeGallery.id);
                    setUploadModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>+ Enviar Fotos</span>
              </button>
            </div>

            {/* Photos List / Sorter */}
            {(() => {
              if (!organizeGallery) return null;
              const galPhotos = photos
                .filter((p) => p.gallery_id === organizeGallery.id)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

              const filtered =
                organizeFolderFilter === 'all'
                  ? galPhotos
                  : galPhotos.filter((p) => p.folder === organizeFolderFilter);

              if (filtered.length === 0) {
                return (
                  <div className="p-8 text-center text-zinc-400 bg-zinc-50 rounded-2xl border border-zinc-200">
                    Nenhuma foto nesta pasta.
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((photo, index) => {
                    const isCover = organizeGallery.cover_url === photo.url;

                    return (
                      <div
                        key={photo.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 shadow-2xs transition-all"
                      >
                        {/* Photo Details */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-200">
                            <img
                              src={photo.thumbnail_url || photo.url}
                              alt={photo.title || 'Foto'}
                              className="w-full h-full object-cover"
                            />
                            {isCover && (
                              <div className="absolute top-1 left-1 bg-[#C5A880] text-zinc-950 p-0.5 rounded-full shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-zinc-950" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                #{photo.sort_order || index + 1}
                              </span>
                              <span className="font-semibold text-zinc-900 text-xs truncate">
                                {photo.title || photo.filename}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 truncate block">
                              {photo.filename}
                            </span>
                            {isCover && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#8B6E3F] text-[9px] font-bold uppercase">
                                Capa da Galeria
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions for Photo */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {/* Folder Selector Dropdown */}
                          <div className="flex items-center gap-1">
                            <Folder className="w-3.5 h-3.5 text-zinc-400" />
                            <select
                              value={photo.folder || ''}
                              onChange={(e) => {
                                updatePhoto(photo.id, { folder: e.target.value || undefined });
                                toast('Pasta da foto atualizada!', 'success');
                              }}
                              className="px-2 py-1 rounded-lg border border-zinc-200 text-[11px] bg-zinc-50 text-zinc-800 focus:outline-hidden focus:border-[#C5A880]"
                            >
                              <option value="">Sem Pasta</option>
                              {organizeGallery.folders?.map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Reorder Buttons */}
                          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                            <button
                              type="button"
                              onClick={() => {
                                reorderPhoto(photo.id, 'up');
                                toast('Posição alterada', 'info');
                              }}
                              className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                reorderPhoto(photo.id, 'down');
                                toast('Posição alterada', 'info');
                              }}
                              className="p-1.5 hover:bg-zinc-200 text-zinc-600 transition-colors border-l border-zinc-200"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Set as Cover */}
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoAsCover(organizeGallery.id, photo.url);
                                toast('Esta foto agora é a capa da galeria!', 'success');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-[#C5A880]/40 text-[#8B6E3F] hover:bg-[#C5A880]/15 transition-colors text-[11px] font-medium flex items-center gap-1"
                              title="Definir esta foto como capa principal"
                            >
                              <Star className="w-3 h-3" />
                              <span>Capa</span>
                            </button>
                          )}

                          {/* Delete Photo */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta foto da galeria?')) {
                                deletePhoto(photo.id);
                                toast('Foto removida da galeria.', 'info');
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setOrganizeModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800"
              >
                Concluir
              </button>
            </div>
          </div>
        </Modal>

        {/* ======================================================== */}
        {/* MODAL: UPLOAD DE FOTOS                                   */}
        {/* ======================================================== */}
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => {
            if (!uploading) setUploadModalOpen(false);
          }}
          title="Upload de Fotos da Galeria"
          subtitle="Arraste ou selecione os arquivos em alta resolução para enviar."
        >
          <div className="space-y-4 text-xs">
            {uploading ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#C5A880] border-t-transparent animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900">Enviando fotos...</h4>
                  <p className="text-xs text-zinc-500">
                    Otimizando miniaturas e gerando previews de alta fidelidade
                  </p>
                </div>
                <div className="w-48 bg-zinc-200 h-2 rounded-full mx-auto overflow-hidden">
                  <div
                    className="bg-[#C5A880] h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="border-2 border-dashed border-zinc-300 hover:border-[#C5A880] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2 group bg-zinc-50/50">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-[#C5A880] transition-colors" />
                  <span className="font-semibold text-zinc-800">
                    Clique para selecionar fotos ou arraste os arquivos aqui
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Suporte a arquivos JPG, PNG ou WEBP em alta definição
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleSimulatedUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </Modal>

        {/* ======================================================== */}
        {/* MODAL: CONFIGURAR VÍDEO / TEASER                         */}
        {/* ======================================================== */}
        <Modal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title="Vídeo / Teaser da Galeria"
          subtitle="Vincule um filme do YouTube, Vimeo ou arquivo direto de vídeo MP4."
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Título do Vídeo / Teaser</label>
              <input
                type="text"
                value={videoInputTitle}
                onChange={(e) => setVideoInputTitle(e.target.value)}
                placeholder="Ex: Teaser Cinematográfico 4K"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Link do Vídeo (YouTube, Vimeo ou MP4)</label>
              <input
                type="text"
                value={videoInputUrl}
                onChange={(e) => setVideoInputUrl(e.target.value)}
                placeholder="Ex: https://vimeo.com/... ou https://youtu.be/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Suporta links públicos ou não-listados do YouTube, Vimeo, ou link direto .mp4.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              {selectedGalleryForVideo?.video_url ? (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedGalleryForVideo) {
                      updateGallery(selectedGalleryForVideo.id, { video_url: undefined, video_title: undefined });
                      setVideoModalOpen(false);
                      toast('Vídeo removido da galeria.', 'info');
                    }
                  }}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Remover Vídeo
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedGalleryForVideo) {
                      updateGallery(selectedGalleryForVideo.id, {
                        video_url: videoInputUrl.trim() || undefined,
                        video_title: videoInputTitle.trim() || undefined,
                      });
                      setVideoModalOpen(false);
                      toast('Vídeo da galeria atualizado com sucesso!', 'success');
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs"
                >
                  Salvar Vídeo
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultTab="gallery"
      />
    </AppShell>
  );
}

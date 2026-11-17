'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Upload,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
  Settings,
  Image as ImageIcon,
  Heart,
  Check,
  CheckCircle2,
  Clock,
  Star,
  Sliders,
  Type,
  MoreVertical,
  Move,
  Download,
  Edit3,
  Layers,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  Film,
  Video,
  ListFilter,
  CheckSquare,
  Square,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { GalleryFontStyle, GalleryDownloadQuality, GalleryPhoto } from '@/types';

function GalleryEditorContent() {
  const params = useParams();
  const router = useRouter();
  const galleryId = (params?.id as string) || '';
  const { toast } = useToast();

  const {
    galleries,
    photos,
    updateGallery,
    deleteGallery,
    renewGallery,
    addPhotoToGallery,
    updatePhoto,
    deletePhoto,
    setPhotoAsCover,
    reorderPhoto,
    movePhotoToIndex,
    moveMultiplePhotosToIndex,
    movePhotosToFolder,
    deletePhotosBatch,
    addFolderToGallery,
    removeFolderFromGallery,
  } = useAppStore();

  const gallery = galleries.find((g) => g.id === galleryId);

  // Active Tab: 'gallery' | 'favorites' | 'settings' | 'design'
  const [activeTab, setActiveTab] = useState<'gallery' | 'favorites' | 'settings' | 'design'>('gallery');

  // Folder filtering
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit Description State
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');

  // Drag and Drop state
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<string | null>(null);
  const [isDraggingBatch, setIsDraggingBatch] = useState(false);

  // Order dropdown
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);

  // Batch selection
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [batchFolderDropdownOpen, setBatchFolderDropdownOpen] = useState(false);

  // Settings tab form state
  const [settingsExpiresAt, setSettingsExpiresAt] = useState('');
  const [settingsSelectionEnabled, setSettingsSelectionEnabled] = useState(true);
  const [settingsSelectionMax, setSettingsSelectionMax] = useState(80);
  const [settingsFavoritesEnabled, setSettingsFavoritesEnabled] = useState(true);
  const [settingsDownloadEnabled, setSettingsDownloadEnabled] = useState(true);
  const [settingsDownloadQuality, setSettingsDownloadQuality] = useState<GalleryDownloadQuality>('both');
  const [settingsCoverUrl, setSettingsCoverUrl] = useState('');
  const [settingsFontStyle, setSettingsFontStyle] = useState<GalleryFontStyle>('cormorant');

  // Sync settings when gallery loads
  React.useEffect(() => {
    if (gallery) {
      setDescInput(gallery.description || '');
      setSettingsCoverUrl(gallery.cover_url);
      setSettingsFontStyle(gallery.font_style || 'cormorant');
      const datePart = gallery.expires_at ? gallery.expires_at.split('T')[0] : '';
      setSettingsExpiresAt(datePart);
      setSettingsSelectionEnabled(gallery.selection_enabled !== false);
      setSettingsSelectionMax(gallery.selection_max || 80);
      setSettingsFavoritesEnabled(gallery.favorites_enabled !== false);
      setSettingsDownloadEnabled(gallery.download_enabled !== false);
      setSettingsDownloadQuality(gallery.download_quality || 'both');
    }
  }, [gallery]);

  // Gallery Photos sorted by sort_order
  const galleryPhotos = useMemo(() => {
    if (!gallery) return [];
    return photos
      .filter((p) => p.gallery_id === gallery.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [gallery, photos]);

  // Filtered photos by folder
  const displayedPhotos = useMemo(() => {
    if (activeFolder === 'all') return galleryPhotos;
    return galleryPhotos.filter((p) => p.folder === activeFolder);
  }, [galleryPhotos, activeFolder]);

  // Favorite photos
  const favoritePhotos = useMemo(() => {
    return galleryPhotos.filter((p) => p.is_favorite);
  }, [galleryPhotos]);

  if (!gallery) {
    return (
      <AppShell>
        <div className="p-12 text-center space-y-4">
          <h2 className="text-lg font-medium text-zinc-900">Galeria não encontrada</h2>
          <Link
            href="/galerias"
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium"
          >
            ← Voltar para Galerias
          </Link>
        </div>
      </AppShell>
    );
  }

  const copyLink = () => {
    const url = `${window.location.origin}/galeria/${gallery.token}`;
    navigator.clipboard.writeText(url);
    toast('Link da galeria copiado para a área de transferência!', 'success');
  };

  const copyFavoritesToLightroom = () => {
    if (favoritePhotos.length === 0) {
      toast('Nenhuma foto favorita nesta galeria.', 'info');
      return;
    }
    const filenames = favoritePhotos.map((p) => p.filename).join(', ');
    navigator.clipboard.writeText(filenames);
    toast(`${favoritePhotos.length} fotos copiadas para o Lightroom!`, 'success');
  };

  // Selection toggle helper
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    setSelectedPhotoIds(displayedPhotos.map((p) => p.id));
  };

  const clearSelection = () => {
    setSelectedPhotoIds([]);
  };

  // Drag and Drop handlers with MULTI-SELECTION support
  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    e.dataTransfer.effectAllowed = 'move';

    // If the dragged photo is part of the selected batch, drag ALL selected photos
    if (selectedPhotoIds.includes(photoId) && selectedPhotoIds.length > 1) {
      setIsDraggingBatch(true);
      e.dataTransfer.setData('text/plain', JSON.stringify(selectedPhotoIds));
      setDraggedPhotoId(photoId);
    } else {
      // Single photo drag
      setIsDraggingBatch(false);
      e.dataTransfer.setData('text/plain', JSON.stringify([photoId]));
      setDraggedPhotoId(photoId);
    }
  };

  const handleDragOver = (e: React.DragEvent, photoId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPhotoId !== photoId) {
      setDragOverPhotoId(photoId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, photoId: string) => {
    if (dragOverPhotoId === photoId) {
      setDragOverPhotoId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetPhotoId: string) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      let sourceIds: string[] = [];
      if (dataStr) {
        sourceIds = JSON.parse(dataStr);
      } else if (draggedPhotoId) {
        sourceIds = isDraggingBatch ? selectedPhotoIds : [draggedPhotoId];
      }

      if (sourceIds.length > 0) {
        if (sourceIds.length === 1) {
          movePhotoToIndex(gallery.id, sourceIds[0], targetPhotoId);
          toast('Ordem da foto atualizada!', 'success');
        } else {
          moveMultiplePhotosToIndex(gallery.id, sourceIds, targetPhotoId);
          toast(`${sourceIds.length} fotos movidas com sucesso!`, 'success');
        }
      }
    } catch {
      if (draggedPhotoId) {
        movePhotoToIndex(gallery.id, draggedPhotoId, targetPhotoId);
      }
    }

    setDraggedPhotoId(null);
    setDragOverPhotoId(null);
    setIsDraggingBatch(false);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolderToGallery(gallery.id, newFolderName.trim());
    setNewFolderName('');
    setNewFolderModalOpen(false);
    toast('Pasta criada com sucesso!', 'success');
  };

  const handleBatchMoveFolder = (folderName?: string) => {
    if (selectedPhotoIds.length === 0) return;
    movePhotosToFolder(selectedPhotoIds, folderName);
    setBatchFolderDropdownOpen(false);
    toast(`${selectedPhotoIds.length} fotos movidas para ${folderName || 'Geral'}!`, 'success');
  };

  const handleBatchDelete = () => {
    if (selectedPhotoIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir as ${selectedPhotoIds.length} fotos selecionadas?`)) {
      deletePhotosBatch(selectedPhotoIds);
      setSelectedPhotoIds([]);
      toast('Fotos excluídas com sucesso.', 'info');
    }
  };

  const handleSaveSettings = () => {
    let fullExpiresAt = gallery.expires_at;
    if (settingsExpiresAt) {
      fullExpiresAt = `${settingsExpiresAt}T23:59:59Z`;
    }

    updateGallery(gallery.id, {
      cover_url: settingsCoverUrl.trim() || gallery.cover_url,
      font_style: settingsFontStyle,
      expires_at: fullExpiresAt,
      selection_enabled: settingsSelectionEnabled,
      selection_max: settingsSelectionMax,
      favorites_enabled: settingsFavoritesEnabled,
      download_enabled: settingsDownloadEnabled,
      download_quality: settingsDownloadQuality,
    });
    toast('Configurações salvas com sucesso!', 'success');
  };

  const handleSimulatedUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(15);

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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fakeUrl = URL.createObjectURL(file);
        addPhotoToGallery({
          gallery_id: gallery.id,
          url: fakeUrl,
          thumbnail_url: fakeUrl,
          filename: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
          folder: activeFolder !== 'all' ? activeFolder : undefined,
          is_favorite: false,
          is_selected: false,
        });
      }

      setUploading(false);
      setUploadProgress(0);
      setUploadModalOpen(false);
      toast(`${files.length} foto(s) enviada(s) com sucesso!`, 'success');
    }, 1200);
  };

  const totalSizeMB = Math.round((galleryPhotos.length * 4.8) * 10) / 10;

  return (
    <AppShell>
      <div className="space-y-5 animate-in fade-in duration-200 pb-16">
        {/* ======================================================== */}
        {/* 1. CABEÇALHO SUPERIOR (100% EM PORTUGUÊS)                */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1">
            <Link
              href="/galerias"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Todas as galerias</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
              {gallery.title}
            </h1>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Compartilhar link */}
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                title="Copiar link público para o cliente"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Compartilhar link</span>
              </button>

              {/* Visualizar galeria */}
              <Link
                href={`/galeria/${gallery.token}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 text-blue-600 text-xs font-medium transition-all cursor-pointer shadow-2xs"
              >
                <span>Visualizar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Excluir galeria */}
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
                title="Excluir Galeria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Subtexto */}
            <span className="text-[11px] text-zinc-400">
              Armazenado até {formatDate(gallery.expires_at)} • {galleryPhotos.length} fotos ({totalSizeMB} MB)
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. BARRA DE ABAS PRINCIPAL (EM PORTUGUÊS)                */}
        {/* ======================================================== */}
        <div className="border-b border-zinc-200 flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Fotos da Galeria</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favoritas ({favoritePhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`pb-3 font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'design'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Capa e Estilo</span>
          </button>
        </div>

        {/* Dica amigável */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Dica de Organização:</strong> Marque várias fotos para <strong>arrastar todas juntas</strong> ou movê-las de pasta em 1 clique!
            </span>
          </div>
          {selectedPhotoIds.length > 0 && (
            <span className="text-[11px] font-semibold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
              {selectedPhotoIds.length} selecionada(s)
            </span>
          )}
        </div>

        {/* ======================================================== */}
        {/* ABA 1: FOTOS DA GALERIA (PASTAS, GRADE E MULTI-ARRASTE)  */}
        {/* ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-5">
            {/* Linha de Pastas */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {/* Pasta Geral / Todas */}
              <button
                onClick={() => setActiveFolder('all')}
                className={`p-3 rounded-xl border text-left min-w-[140px] transition-all cursor-pointer ${
                  activeFolder === 'all'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <h4 className="font-semibold text-zinc-900 text-xs">Todas as Fotos</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {galleryPhotos.length} fotos, {totalSizeMB} MB
                </p>
              </button>

              {/* Subpastas criadas */}
              {gallery.folders?.map((folder) => {
                const fCount = galleryPhotos.filter((p) => p.folder === folder).length;
                const fMB = Math.round(fCount * 4.8 * 10) / 10;
                const isSelected = activeFolder === folder;

                return (
                  <div
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`p-3 rounded-xl border min-w-[150px] transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-900 text-xs">{folder}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {fCount} fotos, {fMB} MB
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover pasta "${folder}"? Suas fotos não serão excluídas.`)) {
                          removeFolderFromGallery(gallery.id, folder);
                          if (activeFolder === folder) setActiveFolder('all');
                          toast('Pasta removida.', 'info');
                        }
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Excluir pasta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* + Nova pasta */}
              <button
                onClick={() => setNewFolderModalOpen(true)}
                className="px-3.5 py-3 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>+ Nova pasta</span>
              </button>
            </div>

            {/* Barra de Ações Rápidas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Botão de Upload */}
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Enviar fotos</span>
                </button>

                {/* Selecionar todas / Desmarcar */}
                {displayedPhotos.length > 0 && (
                  <button
                    onClick={selectedPhotoIds.length === displayedPhotos.length ? clearSelection : selectAllPhotos}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs transition-colors cursor-pointer"
                  >
                    {selectedPhotoIds.length === displayedPhotos.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Desmarcar todas</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Selecionar todas</span>
                      </>
                    )}
                  </button>
                )}

                {/* Editar descrição */}
                {editingDesc ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      placeholder="Descrição da galeria..."
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 focus:outline-hidden focus:border-blue-600 w-60"
                    />
                    <button
                      onClick={() => {
                        updateGallery(gallery.id, { description: descInput.trim() });
                        setEditingDesc(false);
                        toast('Descrição salva!', 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDesc(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 py-1.5 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{gallery.description ? 'Editar descrição' : 'Adicionar descrição'}</span>
                  </button>
                )}
              </div>

              {/* Ordenar por */}
              <div className="relative">
                <button
                  onClick={() => setOrderDropdownOpen(!orderDropdownOpen)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 py-1.5 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ordenar</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {orderDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-20 text-xs">
                    <button
                      onClick={() => {
                        setOrderDropdownOpen(false);
                        toast('Arraste fotos soltas ou selecionadas para mudar de lugar.', 'info');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-900 font-medium flex items-center justify-between"
                    >
                      <span>Manual (Arrastar e Soltar)</span>
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        const sorted = [...galleryPhotos].sort((a, b) => a.filename.localeCompare(b.filename));
                        sorted.forEach((p, idx) => updatePhoto(p.id, { sort_order: idx + 1 }));
                        setOrderDropdownOpen(false);
                        toast('Ordenado por Nome (A-Z)', 'success');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-600"
                    >
                      Nome do arquivo (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        const sorted = [...galleryPhotos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                        sorted.forEach((p, idx) => updatePhoto(p.id, { sort_order: idx + 1 }));
                        setOrderDropdownOpen(false);
                        toast('Ordenado por Mais recentes', 'success');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-600"
                    >
                      Mais recentes primeiro
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* GRADE DE FOTOS COM MULTI-SELEÇÃO E ARRASTAR E SOLTAR */}
            {displayedPhotos.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 space-y-3">
                <ImageIcon className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-700">Nenhuma foto nesta pasta</h3>
                <p className="text-xs text-zinc-400">Envie arquivos para começar a organizar sua galeria.</p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium"
                >
                  + Enviar Fotos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {displayedPhotos.map((photo, index) => {
                  const isCover = gallery.cover_url === photo.url;
                  const isSelected = selectedPhotoIds.includes(photo.id);
                  const isDraggingThis = draggedPhotoId === photo.id;
                  const isOver = dragOverPhotoId === photo.id;

                  return (
                    <div
                      key={photo.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, photo.id)}
                      onDragOver={(e) => handleDragOver(e, photo.id)}
                      onDragLeave={(e) => handleDragLeave(e, photo.id)}
                      onDrop={(e) => handleDrop(e, photo.id)}
                      className={`relative group rounded-xl overflow-hidden bg-zinc-100 border transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                        isDraggingThis
                          ? 'opacity-40 scale-95 border-blue-500 shadow-2xl ring-2 ring-blue-500'
                          : isOver
                          ? 'border-blue-600 ring-4 ring-blue-500/40 scale-102 shadow-xl z-10'
                          : isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600 shadow-sm'
                          : 'border-zinc-200 hover:border-zinc-400 hover:shadow-sm'
                      }`}
                    >
                      {/* Miniatura da foto */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                        <img
                          src={photo.thumbnail_url || photo.url}
                          alt={photo.title || 'Foto'}
                          className="w-full h-full object-cover pointer-events-none group-hover:scale-102 transition-transform duration-300"
                        />

                        {/* Checkbox de Seleção Rápida */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePhotoSelection(photo.id);
                          }}
                          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            isSelected
                              ? 'bg-blue-600 text-white ring-2 ring-white'
                              : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                          }`}
                          title={isSelected ? 'Desmarcar foto' : 'Selecionar para mover em grupo'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        {/* Número da Ordem */}
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                          #{photo.sort_order || index + 1}
                        </div>

                        {/* Selo de Capa */}
                        {isCover && (
                          <div className="absolute top-2 right-2 bg-[#C5A880] text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-zinc-950" />
                            <span>Capa</span>
                          </div>
                        )}

                        {/* Ações em Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between pointer-events-none">
                          <div className="flex items-center justify-end pointer-events-auto">
                            <div className="flex items-center gap-1">
                              {/* Definir como Capa */}
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPhotoAsCover(gallery.id, photo.url);
                                    toast('Esta foto foi definida como Capa da Galeria!', 'success');
                                  }}
                                  className="p-1.5 rounded-md bg-black/60 hover:bg-black text-[#E8D1B2] transition-colors cursor-pointer"
                                  title="Definir como foto de capa"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Excluir foto */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Excluir esta foto da galeria?')) {
                                    deletePhoto(photo.id);
                                    toast('Foto excluída.', 'info');
                                  }
                                }}
                                className="p-1.5 rounded-md bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                title="Excluir foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Nome do arquivo e pasta */}
                          <div className="text-white space-y-0.5 pointer-events-auto">
                            <p className="text-[10px] font-mono truncate drop-shadow-md">
                              {photo.filename}
                            </p>
                            {photo.folder && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-[#E8D1B2] font-medium">
                                {photo.folder}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* BARRA FLUTUANTE DE AÇÕES EM LOTE (QUANDO SELECIONADAS)   */}
        {/* ======================================================== */}
        {selectedPhotoIds.length > 0 && activeTab === 'gallery' && (
          <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] lg:bottom-6 inset-x-0 z-40 flex justify-center px-3 sm:px-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="bg-zinc-950 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-zinc-800 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs max-w-full">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedPhotoIds.length}
                </span>
                <span className="font-medium">
                  {selectedPhotoIds.length === 1 ? '1 foto selecionada' : `${selectedPhotoIds.length} fotos selecionadas`}
                </span>
              </div>

              <div className="h-4 w-px bg-zinc-800" />

              {/* Mover para pasta dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBatchFolderDropdownOpen(!batchFolderDropdownOpen)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Folder className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mover para pasta</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {batchFolderDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 text-xs">
                    <button
                      onClick={() => handleBatchMoveFolder(undefined)}
                      className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Sem pasta (Geral)
                    </button>
                    {gallery.folders?.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleBatchMoveFolder(f)}
                        className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Excluir selecionadas */}
              <button
                type="button"
                onClick={handleBatchDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>

              <div className="h-4 w-px bg-zinc-800" />

              {/* Desmarcar */}
              <button
                type="button"
                onClick={clearSelection}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Desmarcar todas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: FAVORITAS (EM PORTUGUÊS)                          */}
        {/* ======================================================== */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div>
                <h3 className="font-semibold text-zinc-900 text-xs">
                  Fotos Favoritadas pelo Cliente ({favoritePhotos.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Fotos que o cliente curtiu na galeria online.
                </p>
              </div>

              {favoritePhotos.length > 0 && (
                <button
                  onClick={copyFavoritesToLightroom}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ListFilter className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Copiar para o Lightroom</span>
                </button>
              )}
            </div>

            {favoritePhotos.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 bg-white rounded-2xl border border-zinc-200 text-xs">
                Nenhuma foto foi favoritada pelo cliente até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {favoritePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 aspect-[3/4]"
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white">
                      <Heart className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-white text-[10px] font-mono truncate">
                      {photo.filename}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 3: CONFIGURAÇÕES (EM PORTUGUÊS)                      */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-5 text-xs">
            {/* Validade */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <h3 className="font-semibold text-zinc-900 text-sm">Prazo de Validade da Galeria</h3>
              <p className="text-zinc-500">
                Data até quando o cliente terá acesso liberado para visualizar, favoritar e baixar fotos.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <input
                  type="date"
                  value={settingsExpiresAt}
                  onChange={(e) => setSettingsExpiresAt(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-300 text-zinc-900 text-xs focus:outline-hidden focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    const target = new Date();
                    target.setDate(target.getDate() + 30);
                    setSettingsExpiresAt(target.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px]"
                >
                  +30 dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = new Date();
                    target.setDate(target.getDate() + 60);
                    setSettingsExpiresAt(target.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px]"
                >
                  +60 dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = new Date();
                    target.setDate(target.getDate() + 90);
                    setSettingsExpiresAt(target.toISOString().split('T')[0]);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px]"
                >
                  +90 dias
                </button>
              </div>
            </div>

            {/* Downloads */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Download de Arquivos</h3>
                  <p className="text-zinc-500">Permitir que o cliente baixe as fotos diretamente da galeria.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsDownloadEnabled}
                  onChange={(e) => setSettingsDownloadEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {settingsDownloadEnabled && (
                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  <label className="font-medium text-zinc-700 block">Qualidade permitida:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettingsDownloadQuality('both')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settingsDownloadQuality === 'both'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      Alta Resolução + Web
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsDownloadQuality('high_res')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settingsDownloadQuality === 'high_res'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      Apenas Alta Resolução
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsDownloadQuality('web')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settingsDownloadQuality === 'web'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      Apenas Web / Redes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Seleção de Álbum */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Seleção para Álbum Fine Art</h3>
                  <p className="text-zinc-500">Exibir ferramenta de escolha de fotos para diagramação gráfica.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsSelectionEnabled}
                  onChange={(e) => setSettingsSelectionEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              {settingsSelectionEnabled && (
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="font-medium text-zinc-700">Limite de fotos para o álbum:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={settingsSelectionMax}
                    onChange={(e) => setSettingsSelectionMax(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-xl border border-zinc-300 text-zinc-900 font-semibold text-center"
                  />
                </div>
              )}
            </div>

            {/* Favoritos */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm">Botão de Favoritos (Coração)</h3>
                <p className="text-zinc-500">Exibir o botão de curtir nas fotos para o cliente.</p>
              </div>
              <input
                type="checkbox"
                checked={settingsFavoritesEnabled}
                onChange={(e) => setSettingsFavoritesEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Galeria</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: CAPA E ESTILO (EM PORTUGUÊS)                      */}
        {/* ======================================================== */}
        {activeTab === 'design' && (
          <div className="max-w-3xl space-y-6 text-xs">
            {/* Foto de Capa */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4">
              <h3 className="font-semibold text-zinc-900 text-sm">Foto de Capa Principal</h3>
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-zinc-900">
                <img
                  src={settingsCoverUrl || gallery.cover_url}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 text-white">
                  <div>
                    <span className="text-[10px] text-zinc-300 uppercase tracking-widest block">
                      {gallery.client_name}
                    </span>
                    <h4 className="font-serif-brand text-lg font-light">{gallery.title}</h4>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">URL da Imagem de Capa:</label>
                <input
                  type="text"
                  value={settingsCoverUrl}
                  onChange={(e) => setSettingsCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 text-xs focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-2">
                  Ou clique em qualquer foto abaixo para defini-la como capa:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {galleryPhotos.map((p) => {
                    const isSelected = settingsCoverUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSettingsCoverUrl(p.url);
                          setPhotoAsCover(gallery.id, p.url);
                          toast('Foto definida como capa!', 'success');
                        }}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/30'
                            : 'border-transparent hover:border-zinc-400'
                        }`}
                      >
                        <img src={p.thumbnail_url || p.url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                            <Star className="w-4 h-4 fill-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tipografia */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-4">
              <h3 className="font-semibold text-zinc-900 text-sm">Tipografia Editorial</h3>
              <p className="text-zinc-500">Estilo de fonte aplicado nos títulos e cabeçalhos da galeria pública.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSettingsFontStyle('cormorant')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    settingsFontStyle === 'cormorant'
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-900">Cormorant Garamond</span>
                    {settingsFontStyle === 'cormorant' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="font-cormorant text-xl text-zinc-800">Pré Wedding — Vania e Angelo</p>
                </div>

                <div
                  onClick={() => setSettingsFontStyle('cinzel')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    settingsFontStyle === 'cinzel'
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-900">Cinzel</span>
                    {settingsFontStyle === 'cinzel' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="font-cinzel text-base text-zinc-800 tracking-wider">PRÉ WEDDING — VANIA E ANGELO</p>
                </div>

                <div
                  onClick={() => setSettingsFontStyle('playfair')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    settingsFontStyle === 'playfair'
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-900">Playfair Display</span>
                    {settingsFontStyle === 'playfair' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="font-playfair text-lg italic text-zinc-800">Pré Wedding — Vania e Angelo</p>
                </div>

                <div
                  onClick={() => setSettingsFontStyle('inter')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    settingsFontStyle === 'inter'
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-900">Inter Sans</span>
                    {settingsFontStyle === 'inter' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="font-inter text-base font-semibold text-zinc-800 tracking-tight">Pré Wedding — Vania e Angelo</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors cursor-pointer"
              >
                Salvar Capa e Estilo
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: CRIAR NOVA PASTA                                  */}
        {/* ======================================================== */}
        <Modal
          isOpen={newFolderModalOpen}
          onClose={() => setNewFolderModalOpen(false)}
          title="Criar Nova Pasta"
          subtitle="Organize as fotos por momentos específicos do evento."
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-medium text-zinc-700 block mb-1">Nome da pasta:</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Bosque & Trilha, Cerimônia, Festa..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-zinc-900 text-xs focus:outline-hidden focus:border-blue-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFolder();
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewFolderModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddFolder}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer"
              >
                Criar Pasta
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
          title="Upload de Fotos"
          subtitle={`Enviando para a pasta: ${activeFolder === 'all' ? 'Todas as fotos' : activeFolder}`}
        >
          <div className="space-y-4 text-xs">
            {uploading ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900">Enviando fotos...</h4>
                  <p className="text-xs text-zinc-500">Gerando miniaturas e processando arquivos em alta definição</p>
                </div>
                <div className="w-48 bg-zinc-200 h-2 rounded-full mx-auto overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="border-2 border-dashed border-zinc-300 hover:border-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2 group bg-zinc-50/50">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                  <span className="font-semibold text-zinc-800">
                    Clique para selecionar fotos ou arraste os arquivos aqui
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    JPG, PNG ou WEBP em alta definição
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

        {/* Modal Confirmar Exclusão da Galeria */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Excluir Galeria"
          subtitle="Esta ação não pode ser desfeita"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-zinc-600 leading-relaxed">
              Tem certeza que deseja excluir a galeria{' '}
              <strong className="text-zinc-900">{gallery.title}</strong>? Todas as{' '}
              {galleryPhotos.length} fotos associadas e o link público de acesso serão removidos.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteGallery(gallery.id);
                  setDeleteModalOpen(false);
                  toast('Galeria excluída com sucesso.', 'info');
                  router.push('/galerias');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Galeria</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

export default function GalleryEditorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center text-zinc-400 text-xs">
          Carregando editor da galeria...
        </div>
      }
    >
      <GalleryEditorContent />
    </React.Suspense>
  );
}

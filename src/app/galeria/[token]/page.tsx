'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Heart,
  CheckCircle2,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
  Check,
  Send,
  Play,
  Video,
  Film,
  Folder,
  ArrowUp,
  FileArchive,
  Star,
} from 'lucide-react';
import { GalleryPhoto } from '@/types';

function getEmbedUrl(url?: string): string {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0&byline=0&portrait=0`;
  }
  return url;
}

function formatNumericDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function formatExpirationLong(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    return `Expira em ${month} ${day}, ${year}`;
  } catch {
    return `Expira em ${dateStr}`;
  }
}

function GalleryContent() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const {
    galleries,
    photos,
    togglePhotoFavorite,
    togglePhotoSelection,
    completeGallerySelection,
  } = useAppStore();

  const gallery = galleries.find(
    (g) => g.token === token || g.slug === token
  );

  const galleryPhotos = useMemo(() => {
    if (!gallery) return [];
    return photos.filter((p) => p.gallery_id === gallery.id);
  }, [gallery, photos]);

  // Filters
  const [filterMode, setFilterMode] = useState<'todas' | 'favoritas' | 'selecionadas' | 'video'>('todas');
  const [selectedFolder, setSelectedFolder] = useState<string>('todas');

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  // Selection Completion Alert
  const [justCompleted, setJustCompleted] = useState(false);

  // Floating Back to Top Button
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Download Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadScope, setDownloadScope] = useState<'all' | 'folder' | 'selected' | 'favorites'>('all');
  const [downloadQuality, setDownloadQuality] = useState<'high_res' | 'web'>('high_res');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // Track window scroll for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < visiblePhotos.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : visiblePhotos.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Set default quality based on gallery configuration
  useEffect(() => {
    if (gallery?.download_quality === 'web') {
      setDownloadQuality('web');
    } else {
      setDownloadQuality('high_res');
    }
  }, [gallery?.download_quality]);

  // Typography font class based on gallery.font_style
  const fontHeadingClass = useMemo(() => {
    switch (gallery?.font_style) {
      case 'cinzel':
        return 'font-cinzel tracking-wider';
      case 'playfair':
        return 'font-playfair italic';
      case 'inter':
        return 'font-inter font-bold tracking-tight';
      case 'cormorant':
      default:
        return 'font-cormorant font-light';
    }
  }, [gallery?.font_style]);

  if (!gallery) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center text-zinc-900">
        <div className="max-w-md w-full bg-zinc-50 p-8 rounded-3xl border border-zinc-200 space-y-4">
          <h1 className="font-serif-brand text-2xl font-light">Galeria Não Encontrada</h1>
          <p className="text-xs text-zinc-500">
            O link informado pode ser inválido ou a galeria foi desativada pela G&C Studio.
          </p>
        </div>
      </div>
    );
  }

  // Check expiration
  const isExpired = new Date(gallery.expires_at).getTime() < Date.now();
  if (isExpired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center text-zinc-900">
        <div className="max-w-md w-full bg-zinc-50 p-8 rounded-3xl border border-zinc-200 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-[#C5A880]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif-brand text-2xl font-light text-zinc-900">
            Esta Galeria Não Está Mais Disponível
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {formatExpirationLong(gallery.expires_at)}. Entre em contato com a G&C Studio para solicitar a renovação do acesso.
          </p>
        </div>
      </div>
    );
  }

  // Sorted and filtered photos
  const sortedPhotos = [...galleryPhotos].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const favoritesCount = sortedPhotos.filter((p) => p.is_favorite).length;
  const selectedCount = sortedPhotos.filter((p) => p.is_selected).length;

  const visiblePhotos = sortedPhotos.filter((p) => {
    // Folder filter
    if (selectedFolder !== 'todas' && p.folder !== selectedFolder) {
      return false;
    }
    // Status filter
    if (filterMode === 'favoritas') return p.is_favorite;
    if (filterMode === 'selecionadas') return p.is_selected;
    return true;
  });

  const activePhoto: GalleryPhoto | null =
    lightboxIndex !== null && visiblePhotos[lightboxIndex]
      ? visiblePhotos[lightboxIndex]
      : null;

  const handleFinishSelection = () => {
    if (gallery.selection_max > 0 && selectedCount < gallery.selection_max) {
      alert(`Você selecionou ${selectedCount} de ${gallery.selection_max} fotos necessárias para o álbum. Por favor, complete a seleção antes de finalizar.`);
      return;
    }
    completeGallerySelection(gallery.id);
    setJustCompleted(true);
  };

  const isSelectionDone = Boolean(gallery.selection_completed_at) || justCompleted;

  // Handle single photo download
  const handleSinglePhotoDownload = (photo: GalleryPhoto) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename || 'foto-gcstudio.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Download Compilation Simulation
  const handleStartZipDownload = () => {
    setDownloadingZip(true);
    setZipProgress(15);
    setDownloadSuccessMessage('');

    const interval = setInterval(() => {
      setZipProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setZipProgress(100);

      // Trigger dummy download
      const targetPhoto = visiblePhotos[0] || sortedPhotos[0];
      if (targetPhoto) {
        const link = document.createElement('a');
        link.href = targetPhoto.url;
        link.download = `${gallery.slug}_${downloadQuality === 'high_res' ? 'Alta_Resolucao' : 'Web'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadingZip(false);
      setDownloadSuccessMessage(
        `Download concluído! Arquivos em ${
          downloadQuality === 'high_res' ? 'Alta Resolução Fine Art' : 'Qualidade Web & Redes Sociais'
        } baixados com sucesso.`
      );
    }, 1600);
  };

  const photosForDownloadCount = useMemo(() => {
    if (downloadScope === 'all') return sortedPhotos.length;
    if (downloadScope === 'folder') return sortedPhotos.filter((p) => p.folder === selectedFolder).length;
    if (downloadScope === 'selected') return selectedCount;
    if (downloadScope === 'favorites') return favoritesCount;
    return sortedPhotos.length;
  }, [downloadScope, sortedPhotos, selectedFolder, selectedCount, favoritesCount]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-200 selection:text-zinc-900">
      {/* ======================================================== */}
      {/* 1. EDITORIAL SPLIT COVER HERO (SCREENSHOT 1)             */}
      {/* ======================================================== */}
      <section className="flex flex-col md:flex-row w-full min-h-[85vh] md:h-screen border-b border-zinc-100">
        {/* Left Side: Full-bleed Vertical Cover Image */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-full bg-zinc-100 overflow-hidden relative">
          <img
            src={gallery.cover_url}
            alt={gallery.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Side: Clean White Minimalist Typography Box */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 sm:p-14 lg:p-20 text-center select-none">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Event Date (e.g. 06/09/2026) */}
            <p className="text-xs sm:text-sm text-zinc-400 font-sans tracking-widest uppercase">
              {formatNumericDate(gallery.published_at || gallery.created_at)}
            </p>

            {/* Main Editorial Title (e.g. Pré Wedding — Vania e Angelo) */}
            <h1
              className={`${fontHeadingClass} text-3xl sm:text-4xl lg:text-5xl font-normal text-zinc-900 tracking-tight leading-tight pt-1 pb-2`}
            >
              {gallery.title}
            </h1>

            {/* Studio Branding / Credit Link */}
            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-zinc-600 font-light pt-1">
              <span>G&C Studio</span>
              <span className="text-zinc-300">|</span>
              <a
                href="https://gcstudiocwb.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-950 transition-colors"
              >
                gcstudiocwb.com.br
              </a>
            </div>

            {/* Teaser CTA Button if video exists */}
            {gallery.video_url && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    const videoEl = document.getElementById('cinema-player-section');
                    videoEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-300 hover:border-zinc-900 text-zinc-800 hover:text-zinc-950 text-xs font-medium transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Assistir ao Teaser Cinematográfico</span>
                </button>
              </div>
            )}

            {/* Subtle Scroll Down Prompt */}
            <div className="pt-6">
              <button
                onClick={() => {
                  const gridEl = document.getElementById('gallery-photos-grid');
                  gridEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <span>Explorar fotografias</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. SUBHEADER / ACTION BAR (SCREENSHOT 2)                 */}
      {/* ======================================================== */}
      <header
        id="gallery-photos-grid"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 lg:px-12 py-3.5 transition-all shadow-2xs"
      >
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left Side: Folder & Filter Navigation */}
          <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0 text-xs">
            {/* Folder tabs if present */}
            {gallery.folders && gallery.folders.length > 0 ? (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setSelectedFolder('todas')}
                  className={`py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFolder === 'todas'
                      ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
                  }`}
                >
                  Todas ({sortedPhotos.length})
                </button>

                {gallery.folders.map((folder) => {
                  const count = sortedPhotos.filter((p) => p.folder === folder).length;
                  return (
                    <button
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                        selectedFolder === folder
                          ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                          : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
                      }`}
                    >
                      {folder} ({count})
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Separator if both folders and filters exist */}
            {gallery.folders && gallery.folders.length > 0 && (
              <span className="text-zinc-200 hidden sm:inline">|</span>
            )}

            {/* Favorites Filter */}
            {gallery.favorites_enabled !== false && (
              <button
                onClick={() => setFilterMode(filterMode === 'favoritas' ? 'todas' : 'favoritas')}
                className={`flex items-center gap-1.5 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'favoritas'
                    ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    filterMode === 'favoritas' ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'
                  }`}
                />
                <span>Favoritas ({favoritesCount})</span>
              </button>
            )}

            {/* Album Selection Filter */}
            {gallery.selection_enabled !== false && (
              <button
                onClick={() => setFilterMode(filterMode === 'selecionadas' ? 'todas' : 'selecionadas')}
                className={`flex items-center gap-1.5 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'selecionadas'
                    ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-[#8B6E3F]" />
                <span>Para o Álbum ({selectedCount})</span>
              </button>
            )}

            {/* Video Tab */}
            {gallery.video_url && (
              <button
                onClick={() => setFilterMode(filterMode === 'video' ? 'todas' : 'video')}
                className={`flex items-center gap-1.5 py-1 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  filterMode === 'video'
                    ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-[#8B6E3F]" />
                <span>Vídeo & Teaser</span>
              </button>
            )}
          </div>

          {/* Right Side: Expiration Date & Download Button (Screenshot 2 Match) */}
          <div className="flex items-center justify-between md:justify-end gap-4 text-xs shrink-0">
            {/* Expiration text: "Expira em outubro 8, 2026" */}
            <span className="text-zinc-500 text-xs font-light tracking-wide whitespace-nowrap">
              {formatExpirationLong(gallery.expires_at)}
            </span>

            {/* Download Button: "Baixar arquivos ⌄" (Screenshot 2 exact match) */}
            {gallery.download_enabled !== false && (
              <button
                onClick={() => setDownloadModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white text-zinc-900 text-xs font-normal transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <span>Baixar arquivos</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Finalize album selection if enabled */}
            {gallery.selection_enabled !== false && (
              <div className="flex items-center gap-2">
                {isSelectionDone ? (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Seleção Concluída</span>
                  </span>
                ) : (
                  <button
                    onClick={handleFinishSelection}
                    className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3 text-[#C5A880]" />
                    <span>Finalizar ({selectedCount}/{gallery.selection_max})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Selection Confirmation Banner */}
      {isSelectionDone && (
        <div className="max-w-4xl mx-auto my-6 px-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-semibold block">
                Seleção de Fotos Registrada com Sucesso!
              </strong>
              <span>
                A G&C Studio já recebeu a sua lista com {selectedCount} fotos selecionadas para a diagramação do álbum fine art.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CINEMA TEASER SECTION                                 */}
      {/* ======================================================== */}
      {gallery.video_url && (filterMode === 'todas' || filterMode === 'video') && (
        <section id="cinema-player-section" className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="p-5 sm:p-7 rounded-3xl bg-zinc-50 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-[#C5A880] flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`${fontHeadingClass} text-xl sm:text-2xl text-zinc-900`}>
                    {gallery.video_title || 'Teaser Cinematográfico 4K'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Cinema em altíssima definição produzido exclusivamente pela G&C Studio
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-900 text-white font-medium self-start sm:self-auto uppercase tracking-wider">
                Ultra HD 4K
              </span>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-200 shadow-inner">
              {gallery.video_url.endsWith('.mp4') || gallery.video_url.endsWith('.webm') ? (
                <video src={gallery.video_url} controls playsInline className="w-full h-full object-cover" />
              ) : (
                <iframe
                  src={getEmbedUrl(gallery.video_url)}
                  title={gallery.video_title || 'Filme da Galeria'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. PHOTOGRAPHY GRID (SCREENSHOT 2 EXACT MATCH)          */}
      {/* ======================================================== */}
      {filterMode !== 'video' && (
        <main className="max-w-[1700px] mx-auto px-1 sm:px-3 lg:px-4 py-4 sm:py-6">
          {visiblePhotos.length === 0 ? (
            <div className="py-24 text-center text-zinc-400 text-xs">
              Nenhuma foto encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1.5 sm:gap-2 space-y-1.5 sm:space-y-2">
              {visiblePhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative group overflow-hidden bg-zinc-100 cursor-pointer break-inside-avoid shadow-2xs select-none"
                >
                  <img
                    src={photo.url}
                    alt={photo.title || 'Foto G&C Studio'}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  />

                  {/* Hover Overlay with Action Icons */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Top Action Icons */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {/* Favorite Button (conditional) */}
                      {gallery.favorites_enabled !== false && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePhotoFavorite(photo.id);
                          }}
                          className="p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md transition-all text-white"
                          title="Favoritar foto"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              photo.is_favorite ? 'text-rose-500 fill-rose-500' : 'text-white'
                            }`}
                          />
                        </button>
                      )}

                      {/* Select for album button (conditional) */}
                      {gallery.selection_enabled !== false && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePhotoSelection(photo.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-md transition-all ${
                            photo.is_selected
                              ? 'bg-[#C5A880] text-zinc-950 font-bold'
                              : 'bg-black/50 text-white hover:bg-black/80'
                          }`}
                          title="Selecionar para álbum"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom-Right Download Icon Arrow (SCREENSHOT 2 EXACT MATCH) */}
                    {gallery.download_enabled !== false && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSinglePhotoDownload(photo);
                        }}
                        className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer"
                        title="Baixar esta foto"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Bottom-Left Filename/Title */}
                    <div className="absolute bottom-2.5 left-2.5 text-white/90 text-[10px] font-mono drop-shadow-md">
                      <span>{photo.filename}</span>
                    </div>
                  </div>

                  {/* Persistent badges if favorite or selected */}
                  {((gallery.favorites_enabled !== false && photo.is_favorite) ||
                    (gallery.selection_enabled !== false && photo.is_selected)) && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 pointer-events-none group-hover:opacity-0 transition-opacity">
                      {gallery.favorites_enabled !== false && photo.is_favorite && (
                        <span className="p-1 rounded-full bg-rose-600 text-white shadow-xs">
                          <Heart className="w-2.5 h-2.5 fill-white" />
                        </span>
                      )}
                      {gallery.selection_enabled !== false && photo.is_selected && (
                        <span className="p-1 rounded-full bg-[#C5A880] text-zinc-950 shadow-xs">
                          <Check className="w-2.5 h-2.5 font-bold" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ======================================================== */}
      {/* 5. FLOATING SCROLL TO TOP BUTTON (SCREENSHOT 2)          */}
      {/* ======================================================== */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white text-zinc-800 shadow-lg border border-zinc-200/80 hover:shadow-xl hover:bg-zinc-50 flex items-center justify-center transition-all animate-in fade-in cursor-pointer"
          title="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: BAIXAR ARQUIVOS (COM SELEÇÃO DE QUALIDADE)     */}
      {/* ======================================================== */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 space-y-5 text-xs text-zinc-700 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <FileArchive className="w-5 h-5 text-[#8B6E3F]" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm">Download dos Arquivos</h3>
                  <p className="text-[11px] text-zinc-400">G&C Studio • {gallery.client_name}</p>
                </div>
              </div>
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-900">
                O que você deseja baixar?
              </label>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setDownloadScope('all')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    downloadScope === 'all'
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-medium'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  <div>
                    <span className="block text-xs text-zinc-900 font-medium">Todas as fotos da galeria</span>
                    <span className="text-[10px] text-zinc-500">Acervo completo ({sortedPhotos.length} fotos)</span>
                  </div>
                  {downloadScope === 'all' && <Check className="w-4 h-4 text-zinc-900" />}
                </button>

                {selectedFolder !== 'todas' && (
                  <button
                    type="button"
                    onClick={() => setDownloadScope('folder')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      downloadScope === 'folder'
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-medium'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="block text-xs text-zinc-900 font-medium">Pasta atual: {selectedFolder}</span>
                      <span className="text-[10px] text-zinc-500">
                        {sortedPhotos.filter((p) => p.folder === selectedFolder).length} fotos
                      </span>
                    </div>
                    {downloadScope === 'folder' && <Check className="w-4 h-4 text-zinc-900" />}
                  </button>
                )}

                {gallery.selection_enabled !== false && selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDownloadScope('selected')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      downloadScope === 'selected'
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-medium'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="block text-xs text-zinc-900 font-medium">Fotos selecionadas para o Álbum</span>
                      <span className="text-[10px] text-zinc-500">{selectedCount} fotos marcadas</span>
                    </div>
                    {downloadScope === 'selected' && <Check className="w-4 h-4 text-zinc-900" />}
                  </button>
                )}

                {gallery.favorites_enabled !== false && favoritesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDownloadScope('favorites')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      downloadScope === 'favorites'
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-medium'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      <span className="block text-xs text-zinc-900 font-medium">Fotos marcadas como Favoritas</span>
                      <span className="text-[10px] text-zinc-500">{favoritesCount} fotos curtidas</span>
                    </div>
                    {downloadScope === 'favorites' && <Check className="w-4 h-4 text-zinc-900" />}
                  </button>
                )}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-900">
                Selecione a resolução desejada:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* High Res */}
                {gallery.download_quality !== 'web' && (
                  <button
                    type="button"
                    onClick={() => setDownloadQuality('high_res')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      downloadQuality === 'high_res'
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-zinc-900">💎 Alta Resolução</span>
                      {downloadQuality === 'high_res' && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Resolução original máxima para impressão fine art e ampliações.
                    </p>
                  </button>
                )}

                {/* Web Res */}
                {gallery.download_quality !== 'high_res' && (
                  <button
                    type="button"
                    onClick={() => setDownloadQuality('web')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      downloadQuality === 'web'
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-950'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-zinc-900">⚡ Web & Celular</span>
                      {downloadQuality === 'web' && <Check className="w-3.5 h-3.5 text-zinc-900" />}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Otimizada para carregar rápido, guardar no celular e postar no Instagram.
                    </p>
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar if downloading */}
            {downloadingZip ? (
              <div className="py-4 space-y-2 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-zinc-800 font-medium">Compactando {photosForDownloadCount} fotos em arquivo ZIP...</p>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-900 h-full transition-all duration-200"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
              </div>
            ) : downloadSuccessMessage ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{downloadSuccessMessage}</span>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setDownloadModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Fechar
              </button>

              <button
                type="button"
                disabled={downloadingZip}
                onClick={handleStartZipDownload}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-[#C5A880]" />
                <span>Baixar {photosForDownloadCount} Fotos (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. FULLSCREEN LIGHTBOX MODAL                             */}
      {/* ======================================================== */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in duration-150 select-none"
          onTouchStart={(e) => {
            if (e.touches.length !== 1) return;
            touchStartRef.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            if (!touchStartRef.current || e.changedTouches.length !== 1) return;
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
            touchStartRef.current = null;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              if (dx < 0) {
                setLightboxIndex((prev) =>
                  prev !== null && prev < visiblePhotos.length - 1 ? prev + 1 : 0
                );
              } else {
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : visiblePhotos.length - 1
                );
              }
            }
          }}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="font-mono tabular-nums">
              Foto {lightboxIndex + 1} de {visiblePhotos.length}
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Favorite & Selection (Desktop in top bar; Mobile moves to bottom thumb bar) */}
              <div className="hidden sm:flex items-center gap-3">
                {gallery.favorites_enabled !== false && (
                  <button
                    onClick={() => togglePhotoFavorite(activePhoto.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        activePhoto.is_favorite ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'
                      }`}
                    />
                    <span>Favoritar</span>
                  </button>
                )}

                {gallery.selection_enabled !== false && (
                  <button
                    onClick={() => togglePhotoSelection(activePhoto.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      activePhoto.is_selected
                        ? 'bg-[#C5A880] text-zinc-950 font-semibold'
                        : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{activePhoto.is_selected ? 'Selecionada' : 'Selecionar para Álbum'}</span>
                  </button>
                )}
              </div>

              {/* Individual Download */}
              {gallery.download_enabled !== false && (
                <button
                  onClick={() => handleSinglePhotoDownload(activePhoto)}
                  className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                  title="Baixar foto"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                title="Fechar (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Image with Previous/Next Controls + Touch Swipe */}
          <div className="relative flex-1 flex items-center justify-center p-1 sm:p-6 overflow-hidden">
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : visiblePhotos.length - 1
                )
              }
              className="absolute left-1.5 sm:left-6 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black text-white/90 backdrop-blur-md transition-colors z-10 cursor-pointer"
              title="Foto anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <img
              src={activePhoto.url}
              alt={activePhoto.title || 'Foto em alta resolução'}
              className="max-h-[70dvh] sm:max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-none"
            />

            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null && prev < visiblePhotos.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-1.5 sm:right-6 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black text-white/90 backdrop-blur-md transition-colors z-10 cursor-pointer"
              title="Próxima foto (Seta Direita)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Bottom Caption + Mobile Thumb Bar */}
          <div className="space-y-3 text-center text-xs text-zinc-400">
            <div>
              <p className="font-medium text-white truncate">{activePhoto.title}</p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                {activePhoto.filename} {activePhoto.folder ? `• Pasta: ${activePhoto.folder}` : ''}
              </p>
            </div>

            {(gallery.favorites_enabled !== false || gallery.selection_enabled !== false) && (
              <div className="sm:hidden flex items-center justify-center gap-2 pt-1">
                {gallery.favorites_enabled !== false && (
                  <button
                    onClick={() => togglePhotoFavorite(activePhoto.id)}
                    className={`flex-1 max-w-[160px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                      activePhoto.is_favorite
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        : 'bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        activePhoto.is_favorite ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'
                      }`}
                    />
                    <span>{activePhoto.is_favorite ? 'Favorita' : 'Favoritar'}</span>
                  </button>
                )}

                {gallery.selection_enabled !== false && (
                  <button
                    onClick={() => togglePhotoSelection(activePhoto.id)}
                    className={`flex-1 max-w-[180px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      activePhoto.is_selected
                        ? 'bg-[#C5A880] text-zinc-950 font-semibold'
                        : 'bg-zinc-900 border border-zinc-800 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{activePhoto.is_selected ? 'Selecionada' : 'Selecionar'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicGalleryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando galeria exclusiva...
        </div>
      }
    >
      <GalleryContent />
    </React.Suspense>
  );
}

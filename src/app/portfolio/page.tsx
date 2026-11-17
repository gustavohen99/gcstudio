'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getWhatsAppUrl } from '@/lib/utils';
import {
  Camera,
  Sparkles,
  Calendar,
  MapPin,
  MessageCircle,
  ExternalLink,
  Edit,
  Sliders,
  Images,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ChevronDown,
  ArrowUp,
  Heart,
  Play,
  CheckCircle2,
} from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import { EventType, PortfolioItem } from '@/types';

// Real Hero Slideshow Images from gcstudiocwb.com.br
const HERO_SLIDES = [
  'https://im-sl-cf.wfolio.photo/x/dOf5ECvmfSiZ-95akib5IibYi-O31i6d/gEvq59H7D6S0S35BE1DzIyQJZR3ppOMV/rnTHuaajRaOi8e_wil5WOxtKNWxG0C4O/DyQfDS0hRi5B7FLp0KvMsbRp_34AGqGz/lC-AEKs-2uh9rgDt71R6kg.jpg',
  'https://im-sl-cf.wfolio.photo/x/D48ScH1DA6jxU_uSH-Or-C0cJClpP-QP/lEAL128xEMPGM2o_rKw_kMPHKR9vAJ80/VP9NxrFT4LPv6bK6KD-xT7hRs0GwGSUn/nUYcCEOYLytGIJS508nwGUbD2vh9JePP/L18iVPqiNZl6GH5LyDsFtQ.jpg',
  'https://im-sl-cf.wfolio.photo/x/D48ScH1DA6jxU_uSH-Or-C0cJClpP-QP/lEAL128xEMPGM2o_rKw_kMPHKR9vAJ80/6bWWXInTLPjRyA_DEcNQxoQRKswCWVbs/_wmmT87xJHD1jKCADXWNA4Cci7WS0LRB/MEip3ppsXyui5GFFkssXkg.jpg',
];

const LOGO_IMG = '/logo-white.png';

const GUSTAVO_CAMILA_PHOTO =
  'https://im-sl-cf.wfolio.photo/x/pieqsBurX1jB9jW-WOZEzOZ69pV_er1n/SCUPRdDCZOtDDKqCUAB8nHRz8x1EvPk3/a7bLY0B9nBSlVzT6MY0B-mMR6LUk86N1/Ycdq_-jzcl9SETJEtZDu05f7gwXUKUvU/4rZtpVEoq0BufVOVt51T3d684X-O49AX/OKZTMUcSKOR3ALhljact75KlAjUFyTab.jpg';

const NOSSA_FOTOGRAFIA_BG =
  'https://im-sl-cf.wfolio.photo/x/dOf5ECvmfSiZ-95akib5IibYi-O31i6d/gEvq59H7D6S0S35BE1DzIyQJZR3ppOMV/F5sLDPB4YHC3c6goWNlr_CGF9iuhp8O1/n7M_5jPYyIHO4ETHh3Zqg42suhrIapc9/OaiVyQ-2lAT0gBz8C1kwAQ.jpg';

function PortfolioLandingContent() {
  const { addLead, portfolioConfig, portfolioItems } = useAppStore();
  const searchParams = useSearchParams();

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showInformer, setShowInformer] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal & Lightbox state for Event Gallery
  const [activeEventModal, setActiveEventModal] = useState<PortfolioItem | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);

  // Sync category or event from URL query params
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) {
      if (cat.toLowerCase().includes('casam')) {
        setSelectedCategory('Casamento');
      } else if (cat.toLowerCase().includes('xv') || cat.toLowerCase().includes('15')) {
        setSelectedCategory('XV Anos');
      } else {
        setSelectedCategory('Todos');
      }
    }

    const eventParam = searchParams.get('event');
    if (eventParam && portfolioItems && portfolioItems.length > 0) {
      const match = portfolioItems.find(
        (p) =>
          p.id === eventParam ||
          p.title.toLowerCase().includes(eventParam.toLowerCase().replace(/-/g, ' '))
      );
      if (match) {
        setActiveEventModal(match);
      }
    }
  }, [searchParams, portfolioItems]);

  // Contact Form State
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    event_type: 'Casamento' as EventType,
    event_date: '',
    location: '',
    guest_count: 150,
    estimated_value: 3000,
    notes: '',
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slideshow automatic timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for Lightbox and Modals
  const currentEventPhotos =
    activeEventModal?.gallery_photos && activeEventModal.gallery_photos.length > 0
      ? activeEventModal.gallery_photos
      : activeEventModal
      ? [activeEventModal.image]
      : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxPhotoIndex !== null) {
          setLightboxPhotoIndex(null);
        } else if (activeEventModal) {
          setActiveEventModal(null);
        }
      }

      if (lightboxPhotoIndex !== null && currentEventPhotos.length > 0) {
        if (e.key === 'ArrowLeft') {
          setLightboxPhotoIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : currentEventPhotos.length - 1
          );
        } else if (e.key === 'ArrowRight') {
          setLightboxPhotoIndex((prev) =>
            prev !== null && prev < currentEventPhotos.length - 1 ? prev + 1 : 0
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhotoIndex, activeEventModal, currentEventPhotos.length]);

  const categories = ['Todos', 'Casamento', 'XV Anos'];

  const filteredItems = (portfolioItems || []).filter((item) => {
    if (selectedCategory === 'Todos') return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.whatsapp) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addLead({
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email,
        event_type: form.event_type,
        event_date: form.event_date || undefined,
        location: form.location || 'Curitiba e Região',
        guest_count: form.guest_count,
        estimated_value: form.estimated_value,
        origin: 'Site Oficial G&C Studio',
        status: 'NOVO CONTATO',
        notes: `Contato pelo formulário do site. Obs: ${form.notes || 'Sem observações adicionais.'}`,
      });
      setIsSubmitting(false);
      setLeadSubmitted(true);
    }, 600);
  };

  const directWaUrl = getWhatsAppUrl(
    '5541988126597',
    'Olá, G&C Studio! Estive no site de vocês e gostaria de consultar a disponibilidade de data para o meu evento.'
  );

  return (
    <div className="min-h-screen bg-[#111110] text-[#E8E8E6] selection:bg-[#C5A880]/30 selection:text-white font-sans antialiased relative">
      {/* 0. Header / Navigation identical to gcstudiocwb.com.br */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#111110]/95 backdrop-blur-md py-3 shadow-lg border-b border-white/5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Social Links on the left */}
          <div className="flex items-center gap-4 text-zinc-300">
            <a
              href="https://www.instagram.com/gc.studi.o/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C5A880] transition-colors p-1"
              title="Instagram @gc.studi.o"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/5541988126597"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#C5A880] transition-colors p-1"
              title="WhatsApp G&C Studio"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          {/* Center Brand Monogram */}
          <a href="#inicio" className="flex items-center gap-2 group">
            <img
              src={LOGO_IMG}
              alt="G&C Studio Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 filter drop-shadow"
            />
          </a>

          {/* Desktop Menu Links on the right */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-light tracking-widest uppercase">
            <a href="#inicio" className="hover:text-[#C5A880] transition-colors">
              Início
            </a>

            <button
              onClick={() => {
                setSelectedCategory('Casamento');
                document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#C5A880] transition-colors uppercase tracking-widest cursor-pointer"
            >
              Casamento
            </button>

            <button
              onClick={() => {
                setSelectedCategory('XV Anos');
                document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-[#C5A880] transition-colors uppercase tracking-widest cursor-pointer"
            >
              XV Anos
            </button>

            <a href="#sobre" className="hover:text-[#C5A880] transition-colors">
              Sobre Nós
            </a>

            <a href="#contato" className="hover:text-[#C5A880] transition-colors">
              Contato
            </a>

            <Link
              href="/orcamento"
              className="px-4 py-1.5 rounded-full border border-[#C5A880]/60 hover:bg-[#C5A880] hover:text-zinc-950 text-[#C5A880] text-[11px] font-medium tracking-wider transition-all"
            >
              Orçamento
            </Link>

            {/* Admin CMS Access */}
            <Link
              href="/portfolio/admin"
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title="Acessar o Painel de Edição do Site"
            >
              <Sliders className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/orcamento"
              className="px-3 py-1 rounded-full border border-[#C5A880]/60 text-[#C5A880] text-[10px] uppercase tracking-wider"
            >
              Orçamento
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#C5A880]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#161614]/98 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3 text-xs tracking-widest uppercase">
              <a
                href="#inicio"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-300 hover:text-[#C5A880] transition-colors border-b border-white/5"
              >
                Início
              </a>
              <button
                onClick={() => {
                  setSelectedCategory('Casamento');
                  setMobileMenuOpen(false);
                  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left py-2 text-zinc-300 hover:text-[#C5A880] transition-colors border-b border-white/5 uppercase tracking-widest cursor-pointer"
              >
                Casamento
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('XV Anos');
                  setMobileMenuOpen(false);
                  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left py-2 text-zinc-300 hover:text-[#C5A880] transition-colors border-b border-white/5 uppercase tracking-widest cursor-pointer"
              >
                XV Anos
              </button>
              <a
                href="#sobre"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-300 hover:text-[#C5A880] transition-colors border-b border-white/5"
              >
                Sobre Nós
              </a>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-300 hover:text-[#C5A880] transition-colors border-b border-white/5"
              >
                Contato
              </a>
              <Link
                href="/orcamento"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[#C5A880] font-medium border-b border-white/5"
              >
                Orçamento 2026
              </Link>
              <Link
                href="/portfolio/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-400 hover:text-white flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Painel de Edição do Site</span>
              </Link>
            </div>

            <div className="pt-2 flex items-center gap-4 text-zinc-400">
              <a
                href="https://www.instagram.com/gc.studi.o/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-[#C5A880]"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>@gc.studi.o</span>
              </a>
              <a
                href="https://wa.me/5541988126597"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-emerald-400"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>(41) 98812-6597</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 1. Hero Cover Slideshow matching gcstudiocwb.com.br */}
      <section id="inicio" className="relative h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Slides */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              activeSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ backgroundImage: `url('${slide}')` }}
          />
        ))}

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111110] via-transparent to-black/50" />

        {/* Top spacer */}
        <div className="relative z-10 pt-28" />

        {/* Center Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20 p-2 mx-auto mb-4 bg-black/30 backdrop-blur-md">
            <img src={LOGO_IMG} alt="Logo" className="w-full h-full object-contain opacity-95" />
          </div>

          <h1 className="font-serif-brand text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-wide leading-tight drop-shadow-md">
            Eternizando sentimentos, preservando histórias
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-light tracking-widest uppercase pt-2">
            G&C Studio • Fotografia & Cinema de Casamentos e 15 Anos
          </p>
        </div>

        {/* Down Arrow at the bottom */}
        <div className="relative z-10 pb-8 text-center">
          <a
            href="#sobre"
            className="inline-flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors animate-bounce cursor-pointer"
            title="Rolar para ver o conteúdo"
          >
            <span className="text-[10px] tracking-widest uppercase font-light">Role para ver</span>
            <ChevronDown className="w-5 h-5 text-[#C5A880]" />
          </a>
        </div>
      </section>

      {/* 2. Seção "Sobre Nós" matching gcstudiocwb.com.br */}
      <section id="sobre" className="py-24 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="md:col-span-7 space-y-5 text-left">
            <h2 className="font-serif-brand text-3xl sm:text-4xl text-white font-light tracking-wide">
              Sobre Nós
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A880]/80" />

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light text-justify">
              Somos Gustavo e Camila, fotógrafos e filmmakers apaixonados por registrar histórias reais. À frente do{' '}
              <strong className="text-white font-normal">G&C Studio</strong>, transformamos momentos especiais em
              memórias eternas através de imagens cheias de emoção, sensibilidade e autenticidade. Nosso propósito é
              capturar cada detalhe com carinho, para que você possa reviver seus melhores momentos por toda a vida.
            </p>

            <div className="pt-2">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#C5A880] hover:underline tracking-wider"
              >
                <span>Falar com Gustavo & Camila no WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Round Photo */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-[#C5A880]/40 shadow-2xl group hover:border-[#C5A880] transition-colors">
              <img
                src={GUSTAVO_CAMILA_PHOTO}
                alt="Gustavo e Camila — G&C Studio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seção "Nossa fotografia" Banner matching gcstudiocwb.com.br */}
      <section
        className="relative py-28 px-4 sm:px-8 bg-cover bg-center flex items-center justify-center my-8"
        style={{ backgroundImage: `url('${NOSSA_FOTOGRAFIA_BG}')` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-serif-brand text-3xl sm:text-4xl text-white font-light tracking-wide">
            Nossa fotografia
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880]/80 mx-auto" />

          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light text-justify sm:text-center">
            Nosso estilo de fotografia é documental e espontâneo, focado em registrar os momentos como eles realmente
            acontecem. Valorizamos emoções genuínas, sorrisos sinceros, olhares e detalhes que contam a história do seu
            dia de forma natural. Mais do que fotos posadas, buscamos criar lembranças autênticas que permitam reviver
            cada momento e sentimento sempre que forem vistas.
          </p>
        </div>
      </section>

      {/* 4. Seção Portfólio matching gcstudiocwb.com.br */}
      <section id="portfolio" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="font-serif-brand text-3xl sm:text-5xl text-white font-light tracking-wide">
            Portfólio
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880]/80 mx-auto" />

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-light tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C5A880] text-zinc-950 font-medium shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid in 1:1 Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const photoCount = item.gallery_photos ? item.gallery_photos.length : 1;

            return (
              <div
                key={item.id}
                onClick={() => setActiveEventModal(item)}
                className="group cursor-pointer space-y-3"
              >
                {/* 1:1 Square Photo Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Photo Count Tag */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md border border-white/15 text-zinc-200 flex items-center gap-1.5 shadow-xs">
                    <Images className="w-3 h-3 text-[#C5A880]" />
                    <span>{photoCount} fotos</span>
                  </span>

                  {/* Hover Prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-4 py-2 rounded-full bg-white/95 text-zinc-950 font-semibold text-xs shadow-2xl flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Ver Galeria</span>
                    </span>
                  </div>
                </div>

                {/* Caption / Title */}
                <div className="text-center pt-1">
                  <span className="font-serif-brand text-xl sm:text-2xl text-white group-hover:text-[#C5A880] transition-colors relative inline-block">
                    {item.title}
                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-[#C5A880]" />
                  </span>
                  <span className="text-[11px] text-zinc-400 block tracking-widest uppercase mt-0.5">
                    {item.category} • Curitiba
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Seção "Entre em contato" matching gcstudiocwb.com.br */}
      <section id="contato" className="py-24 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="font-serif-brand text-3xl sm:text-5xl text-white font-light tracking-wide">
            Entre em contato
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A880]/80 mx-auto" />
          <p className="text-xs sm:text-sm text-zinc-300 font-light">
            Será um prazer contar a sua história através de imagens.
          </p>
        </div>

        {/* Contact Quick Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://www.instagram.com/gc.studi.o/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C5A880]/50 text-white text-xs font-light tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all shadow-md"
          >
            <InstagramIcon className="w-4 h-4 text-[#C5A880]" />
            <span>Instagram: @gc.studi.o</span>
          </a>

          <a
            href="https://wa.me/5541988126597"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp: (41) 98812-6597</span>
          </a>

          <Link
            href="/orcamento"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <span>Ver Orçamento 2026</span>
          </Link>
        </div>

        {/* Lead Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#181816] border border-white/10 shadow-2xl">
          {leadSubmitted ? (
            <div className="text-center space-y-4 py-6">
              <CheckCircle2 className="w-12 h-12 text-[#C5A880] mx-auto" />
              <h3 className="font-serif-brand text-2xl text-white font-normal">
                Mensagem enviada com sucesso!
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Obrigado, <strong>{form.name}</strong>! Gustavo e Camila receberam o seu contato e responderão em breve.
              </p>
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Abrir conversa no WhatsApp</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
              <span className="text-[11px] text-[#C5A880] tracking-widest uppercase block font-medium">
                Envie uma mensagem direta
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo ou casal"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">WhatsApp com DDD *</label>
                  <input
                    type="text"
                    required
                    placeholder="(41) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 mb-1">Tipo de Evento</label>
                  <select
                    value={form.event_type}
                    onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-hidden focus:border-[#C5A880]"
                  >
                    <option value="Casamento">Casamento</option>
                    <option value="15 anos">XV Anos</option>
                    <option value="Ensaio">Ensaio Fotográfico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Data Estimada</label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-hidden focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Mensagem ou Detalhes</label>
                <textarea
                  rows={3}
                  placeholder="Conte um pouco sobre os seus planos e o local do evento..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 6. Footer matching gcstudiocwb.com.br */}
      <footer className="border-t border-white/10 py-12 px-4 text-center space-y-4 text-xs text-zinc-400">
        <div className="w-12 h-12 rounded-full border border-white/15 p-1.5 mx-auto bg-black/20">
          <img src={LOGO_IMG} alt="Logo" className="w-full h-full object-contain opacity-80" />
        </div>
        <p className="font-serif-brand text-lg text-white font-light">
          G&C Studio 2026
        </p>
        <p className="text-[11px] text-zinc-500">
          Curitiba, PR • contato@gcstudio.com.br • (41) 98812-6597
        </p>
      </footer>

      {/* 7. Floating "Poucas datas 2026 !" Pill identical to gcstudiocwb.com.br */}
      {showInformer && (
        <div className="fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 p-1 pl-4 pr-2 rounded-full bg-[#1C1C1A]/95 backdrop-blur-md border border-[#C5A880]/50 shadow-2xl text-xs text-white">
            <Link
              href="/orcamento"
              className="flex items-center gap-2 font-medium hover:text-[#C5A880] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
              <span>Poucas datas 2026 !</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowInformer(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 8. Floating Action Buttons (WhatsApp & Scroll to top) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 rounded-full bg-[#1C1C1A]/90 hover:bg-[#1C1C1A] text-white border border-white/15 shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4 text-[#C5A880]" />
        </button>

        <a
          href={directWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl transition-all hover:scale-110 cursor-pointer border border-white/20"
          title="Falar no WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      </div>

      {/* ========================================================================= */}
      {/* 9. MODAL: FULL EVENT GALLERY (Real Photos with Zoom & Lightbox) */}
      {/* ========================================================================= */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] text-[#C5A880] tracking-widest uppercase font-semibold">
                {activeEventModal.category} • Curitiba
              </span>
              <h2 className="font-serif-brand text-3xl sm:text-4xl text-white font-normal mt-0.5">
                {activeEventModal.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveEventModal(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Gallery Body */}
          <div className="max-w-6xl w-full mx-auto py-8 space-y-10 flex-1">
            {/* Story / Context */}
            {activeEventModal.story && (
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed max-w-3xl">
                {activeEventModal.story}
              </p>
            )}

            {/* Photo Gallery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  {currentEventPhotos.length} Fotografias em Alta Resolução
                </span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  Clique para visualizar em tela cheia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentEventPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxPhotoIndex(idx)}
                    className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10 aspect-4/3 cursor-pointer shadow-md hover:border-[#C5A880]/60 transition-all hover:scale-[1.01]"
                  >
                    <img
                      src={photoUrl}
                      alt={`${activeEventModal.title} - Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        <Maximize2 className="w-4 h-4 text-[#C5A880]" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#181816] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-brand text-xl text-white">Gostou deste ensaio?</h3>
                <p className="text-xs text-zinc-400">Consulte nossa agenda e pacotes para o seu evento.</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/orcamento"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C5A880] text-zinc-950 font-semibold text-xs tracking-wider uppercase text-center"
                >
                  Ver Orçamento 2026
                </Link>
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. FULLSCREEN LIGHTBOX VIEWER */}
      {/* ========================================================================= */}
      {lightboxPhotoIndex !== null && activeEventModal && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in zoom-in-95 duration-150 select-none">
          {/* Top Bar of Lightbox */}
          <div className="w-full max-w-7xl flex items-center justify-between text-white z-10">
            <div>
              <span className="font-serif-brand text-base sm:text-lg block">
                {activeEventModal.title}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Foto {lightboxPhotoIndex + 1} de {currentEventPhotos.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxPhotoIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central Image View */}
          <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentEventPhotos[lightboxPhotoIndex]}
              alt={`${activeEventModal.title} - Foto ampliada ${lightboxPhotoIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in"
            />

            {/* Left Button */}
            {currentEventPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxPhotoIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : currentEventPhotos.length - 1
                  )
                }
                className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
                title="Foto anterior (Seta esquerda)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Button */}
            {currentEventPhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxPhotoIndex((prev) =>
                    prev !== null && prev < currentEventPhotos.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
                title="Próxima foto (Seta direita)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2">
            {currentEventPhotos.map((photo, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => setLightboxPhotoIndex(pIdx)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  lightboxPhotoIndex === pIdx
                    ? 'border-[#C5A880] scale-105 shadow-md'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortfolioLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111110] flex items-center justify-center text-zinc-400 text-xs">
          Carregando portfólio...
        </div>
      }
    >
      <PortfolioLandingContent />
    </Suspense>
  );
}

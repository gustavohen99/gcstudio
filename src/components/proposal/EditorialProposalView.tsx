'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { formatDate, formatDateFull, getWhatsAppUrl } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Play,
  Heart,
  MessageCircle,
  ExternalLink,
  Plus,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Film,
  Award,
} from 'lucide-react';
import { Quote } from '@/types';

interface EditorialProposalViewProps {
  quote?: Quote;
}

// Clean Brazilian Real currency formatter matching GC Studio's clean style (R$ 1.000)
function formatCleanPrice(val: number): string {
  return `R$ ${val.toLocaleString('pt-BR')}`;
}

export function EditorialProposalView({ quote }: EditorialProposalViewProps) {
  const { settings, acceptQuote } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client info or defaults
  const clientName = quote?.client_name || 'Mariana & Lucas';
  const eventType = quote?.event_type || 'Casamento';
  const eventDate = quote?.event_date || '2026-11-21';
  const isQuoteAccepted = quote?.status === 'aceito';
  const is15Anos = eventType === '15 anos';

  // Interactive Package Selection State
  const defaultPkgPrefix = is15Anos ? 'pkg-15-' : 'pkg-';
  const [selectedPhotoPkg, setSelectedPhotoPkg] = useState<string>(
    quote?.package_name?.includes('3')
      ? `${defaultPkgPrefix}3`
      : quote?.package_name?.includes('2')
      ? `${defaultPkgPrefix}2`
      : `${defaultPkgPrefix}1`
  );

  // Film option toggle (default false so client chooses freely)
  const [includeFilm, setIncludeFilm] = useState<boolean>(false);

  // Addons toggle
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Modal / Acceptance state
  const [isAccepting, setIsAccepting] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Lightbox for Portfolio Photos
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<number | null>(null);

  const photoPackages = is15Anos
    ? [
        {
          id: 'pkg-15-1',
          title: 'PACOTE 1',
          subtitle: 'Cobertura 5h (Foto)',
          price: 1200,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bH64K0SEvQo2/PGIk4iZ_fpOItzca9F2eViixgLyWWZUx/VVRAd73OqOilZctaqOftyGa2B-qINCNB/Mpn277zsuYl8U6-n45m1LqOQLRiZ7fTJ/rDR1M1yU7L4J4_CpPdecFTc4XkvzTxCr/FYyV0VEIT5fuEUvK3F6SYzuV1ay1hGkZ.jpg',
          features: [
            'Cobertura 5h (Foto)',
            'Entregas: Todas as fotos editadas em alta resolução.',
          ],
        },
        {
          id: 'pkg-15-2',
          title: 'PACOTE 2',
          subtitle: 'Ensaio Externo + Cobertura 5h',
          badge: 'Mais Escolhido',
          price: 1500,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bHTYiFogT9qJ/6V2KLZ5-pPO9hAokFL7l71SmiMMKjYUW/C2yCIXlcHjlJ466IhiQaX781TMVNDisq/FPxr4jFQ09cL2M4YoxN4TCp5U-aa04h8/QPxC8jCErNHciU2lUUm8DbFp4JsEIOYO/gAazmoklZnLzX1PCuD2PAcTGdqNOlCN2.jpg',
          features: [
            'Ensaio Fotográfico (Externo)',
            'Cobertura 5h (Foto)',
            'Entregas: Todas as fotos editadas em alta resolução.',
          ],
        },
        {
          id: 'pkg-15-3',
          title: 'PACOTE 3',
          subtitle: 'Ensaio + Cobertura 5h + Vídeo',
          badge: 'Completo',
          price: 1800,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bH64K0SEvQo2/PGIk4iZ_fpOItzca9F2eViixgLyWWZUx/VVRAd73OqOilZctaqOftyGa2B-qINCNB/Mpn277zsuYmGYb9MB5xqrUXXAZ3lfaXd/PP2vw8BkjCQQnDyT3L68HTbxkT1o8cD4/jLiAS9gxK8z5cO_OanOrLJ0m-2GmjZd3.jpg',
          features: [
            'Ensaio Fotográfico (Externo)',
            'Cobertura 5h (Foto)',
            '+ Vídeo dos melhores momentos (3 a 5 minutos de duração)',
          ],
        },
      ]
    : [
        {
          id: 'pkg-1',
          title: 'PACOTE 1',
          subtitle: 'Cerimônia + Recepção + Festa',
          price: 1000,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bH64K0SEvQo2/PGIk4iZ_fpOItzca9F2eViixgLyWWZUx/VVRAd73OqOilZctaqOftyGa2B-qINCNB/Mpn277zsuYl8U6-n45m1LqOQLRiZ7fTJ/rDR1M1yU7L4J4_CpPdecFTc4XkvzTxCr/FYyV0VEIT5fuEUvK3F6SYzuV1ay1hGkZ.jpg',
          features: [
            'Cobertura da Cerimônia',
            '+ Recepção + 1h festa',
            'Entregas: Todas as fotos editadas em alta resolução.',
            'Prazo de entrega: Até 10 dias úteis.',
          ],
        },
        {
          id: 'pkg-2',
          title: 'PACOTE 2',
          subtitle: 'Casamento no Civil + Celebração',
          badge: 'Mais Escolhido',
          price: 1300,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bHTYiFogT9qJ/6V2KLZ5-pPO9hAokFL7l71SmiMMKjYUW/C2yCIXlcHjlJ466IhiQaX781TMVNDisq/FPxr4jFQ09cL2M4YoxN4TCp5U-aa04h8/QPxC8jCErNHciU2lUUm8DbFp4JsEIOYO/gAazmoklZnLzX1PCuD2PAcTGdqNOlCN2.jpg',
          features: [
            'Casamento no Civil',
            '+ Cobertura da Cerimônia + Recepção + 1h festa',
            'Entregas: Todas as fotos editadas em alta resolução.',
            'Prazo de entrega: Até 10 dias úteis.',
          ],
        },
        {
          id: 'pkg-3',
          title: 'PACOTE 3',
          subtitle: 'Pré-Wedding + Civil + Cerimônia + Festa',
          badge: 'Completo',
          price: 1600,
          image:
            'https://im-sl-cf.wfolio.photo/x/7Z8UNlpghPzz0rsayy75bH64K0SEvQo2/PGIk4iZ_fpOItzca9F2eViixgLyWWZUx/VVRAd73OqOilZctaqOftyGa2B-qINCNB/Mpn277zsuYmGYb9MB5xqrUXXAZ3lfaXd/PP2vw8BkjCQQnDyT3L68HTbxkT1o8cD4/jLiAS9gxK8z5cO_OanOrLJ0m-2GmjZd3.jpg',
          features: [
            'Pré-Wedding + Casamento no Civil',
            '+ Cobertura da Cerimônia + Recepção + 1h festa',
            'Entregas: Todas as fotos editadas em alta resolução.',
            'Prazo de entrega: Até 10 dias úteis.',
          ],
        },
      ];

  // Filmagem: R$ 1.800
  const filmPackage = {
    title: 'Filmagem',
    subtitle: 'Vídeo Profissional',
    price: 1800,
    features: [
      'Vídeo Profissional',
      'Filmagem — Melhores momentos',
      'Cerimônia + Recepção / Festa',
      '+ Trailer (1 minuto de duração)',
    ],
  };

  const addonsList = is15Anos
    ? [
        {
          id: 'addon-making-off-15',
          title: 'Registro Making Off',
          desc: 'Os bastidores cheios de emoção antes do grande momento.',
          price: 300,
        },
        {
          id: 'addon-ensaio-studio-15',
          title: 'Ensaio em Studio',
          desc: 'Fotos produzidas em ambiente controlado, com iluminação profissional.',
          price: 280,
        },
      ]
    : [
        {
          id: 'addon-quadro',
          title: 'Quadro para Recepção',
          desc: 'Um detalhe especial para receber seus convidados com estilo.',
          spec: 'Tamanho 50×70cm',
          price: 220,
        },
        {
          id: 'addon-storymaker',
          title: 'Story Maker',
          desc: 'Conteúdo dinâmico para postar nos stories em tempo real.',
          price: 550,
        },
        {
          id: 'addon-making-noiva',
          title: 'Making Off Noiva',
          desc: 'Os bastidores do preparo, cheios de emoção e detalhes.',
          price: 300,
        },
      ];

  // Portfolio Fotos matching real GC Studio weddings
  const portfolioPhotos = [
    {
      title: 'Kamila & João',
      subtitle: 'Casamento em Curitiba',
      image:
        'https://im-sl-cf.wfolio.photo/x/LATXGxMAvg4T0aCx3BMAPcoPN8LBuMrG/WUxqXOvhFPl7GHv-GzWkMqqXeqAxaS7S/AIjlcYqRFOtLVSAdqpaDrJNs_9jm1C-P/_1pWa063XRGqwnb6AC_p6gvFWc8eImF-/jTR1ByUb7QGxU2HNeOAumg.jpg',
    },
    {
      title: 'Juliana & João',
      subtitle: 'Casamento em Curitiba',
      image:
        'https://im-sl-cf.wfolio.photo/x/LATXGxMAvg4T0aCx3BMAPcoPN8LBuMrG/WUxqXOvhFPl7GHv-GzWkMqqXeqAxaS7S/AIjlcYqRFOtLVSAdqpaDrH3VL9sB2yMn/m7SqbQo3GH8JFuz1EwA7Eu8t4UhmDFq3/SxuOwGSm2SSoSqwsMj-P7w.jpg',
    },
    {
      title: 'Ana Clara & Eduardo',
      subtitle: 'Casamento em Curitiba',
      image:
        'https://im-sl-cf.wfolio.photo/x/LATXGxMAvg4T0aCx3BMAPcoPN8LBuMrG/WUxqXOvhFPl7GHv-GzWkMqqXeqAxaS7S/AIjlcYqRFOtLVSAdqpaDrLnFyQm60NpE/nY7_KVRU4Mo-_uNiEr9m9boQgUWM7tiF/vkS_6inL7KVmVxDa9sQu8A.jpg',
    },
  ];

  // Calculation of total investment
  const currentPhotoPrice =
    photoPackages.find((p) => p.id === selectedPhotoPkg)?.price || photoPackages[0].price;
  const currentFilmPrice = includeFilm ? filmPackage.price : 0;
  const currentAddonsPrice = selectedAddons.reduce((sum, addId) => {
    const item = addonsList.find((a) => a.id === addId);
    return sum + (item ? item.price : 0);
  }, 0);

  const totalCalculated = currentPhotoPrice + currentFilmPrice + currentAddonsPrice;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmOrder = () => {
    setIsAccepting(true);
    setTimeout(() => {
      if (quote?.token) {
        acceptQuote(quote.token);
      }
      setIsAccepting(false);
      setJustAccepted(true);
      setShowOrderModal(false);
    }, 600);
  };

  const selectedPhotoPkgObj = photoPackages.find((p) => p.id === selectedPhotoPkg)!;

  // WhatsApp link with structured pre-filled proposal details
  const waMsg = `Olá, G&C Studio! Estou no orçamento de ${eventType} (${clientName}) e selecionei:\n\n• ${selectedPhotoPkgObj.title} (${formatCleanPrice(selectedPhotoPkgObj.price)})\n${includeFilm ? `• Filmagem Completa (${formatCleanPrice(filmPackage.price)})\n` : ''}${selectedAddons.length > 0 ? `• Adicionais: ${selectedAddons.map(id => addonsList.find(a => a.id === id)?.title).join(', ')}\n` : ''}\nTotal: ${formatCleanPrice(totalCalculated)}\n\nGostaria de confirmar a data (${formatDate(eventDate)})!`;

  const waUrl = getWhatsAppUrl(settings.whatsapp || '5541999999999', waMsg);

  return (
    <div className="min-h-screen bg-[#0C0C0B] text-zinc-100 selection:bg-[#C5A880]/30 selection:text-white font-sans antialiased select-none pb-28">
      {/* 0. Top Monogram & Minimal Header */}
      <header className="pt-10 pb-6 px-4 text-center space-y-3">
        <Link href="/portfolio" className="inline-block group">
          <div className="w-16 h-16 rounded-full border border-[#C5A880]/40 flex items-center justify-center p-2.5 mx-auto shadow-xl group-hover:scale-105 group-hover:border-[#C5A880] transition-transform bg-[#141412]">
            <img src="/logo-gold.png" alt="G&C Studio Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif-brand text-sm tracking-widest text-zinc-300 uppercase block mt-2 font-medium">
            G&C Studio
          </span>
          <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-medium block">
            Fotografia & Cinema
          </span>
        </Link>
      </header>

      {/* Acceptance Alert If Already Accepted */}
      {isMounted && (isQuoteAccepted || justAccepted) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 my-6">
          <div className="p-6 rounded-3xl bg-emerald-950/80 border border-emerald-600/80 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#C5A880] shrink-0" />
              <div>
                <h3 className="font-serif-brand text-lg font-medium text-white">
                  Proposta Confirmada & Data Pré-Reservada!
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">
                  Obrigado, <strong>{clientName}</strong>! Sua escolha foi registrada com sucesso no sistema da G&C Studio. Nossa equipe entrará em contato para os próximos passos contratuais.
                </p>
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* 1. Banner Principal / Hero da Proposta */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 my-6">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-16/9 sm:aspect-21/9 bg-zinc-950 flex flex-col justify-end p-6 sm:p-12">
          {/* Real Wedding Atmospheric Photo from G&C Studio */}
          <img
            src="https://im-sl-cf.wfolio.photo/x/dOf5ECvmfSiZ-95akib5IibYi-O31i6d/gEvq59H7D6S0S35BE1DzIyQJZR3ppOMV/rnTHuaajRaOi8e_wil5WOxtKNWxG0C4O/DyQfDS0hRi5B7FLp0KvMsbRp_34AGqGz/lC-AEKs-2uh9rgDt71R6kg.jpg"
            alt="Casamento G&C Studio"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

          {/* Banner Text Layout (Left: Casamento / Right: Manifesto) */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] block">
                Orçamento Exclusivo • {clientName}
              </span>
              <h1 className="font-serif-brand text-4xl sm:text-6xl text-white font-light tracking-tight leading-tight">
                {eventType}
              </h1>
              {eventDate && (
                <p className="text-xs text-zinc-400 flex items-center gap-2 pt-1 font-light">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Data Prevista: {formatDateFull(eventDate)}</span>
                </p>
              )}
            </div>

            <div className="max-w-md text-xs sm:text-sm text-zinc-300 font-light leading-relaxed border-l-2 border-[#C5A880]/60 pl-4 py-1 italic">
              {is15Anos
                ? '“A fotografia de 15 anos eterniza uma noite inesquecível, repleta de brilho, personalidade e emoção. Com um olhar atento e sensível, registramos cada instante único em lembranças para a vida toda.”'
                : '“A fotografia de casamento é a forma de eternizar os momentos mais especiais do seu grande dia. Com um olhar atento e sensível, registramos cada emoção, detalhe e sorriso, transformando instantes únicos em lembranças que durarão para sempre.”'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Seção FOTOGRAFIA */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-light text-white tracking-wide">
            Fotografia
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-light">
            Selecione o pacote fotográfico ideal para a sua celebração.
          </p>
        </div>

        {/* 3 Colunas de Pacotes com Fotos no Topo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {photoPackages.map((pkg) => {
            const isSelected = selectedPhotoPkg === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPhotoPkg(pkg.id as any)}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#C5A880] bg-[#141412] shadow-2xl scale-[1.02] ring-1 ring-[#C5A880]/50'
                    : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900'
                }`}
              >
                <div>
                  {/* Photo at the top */}
                  <div className="relative aspect-4/3 bg-zinc-900 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                    {pkg.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#C5A880] text-zinc-950 font-bold text-[10px] uppercase tracking-wider shadow-md">
                        {pkg.badge}
                      </span>
                    )}

                    <div className="absolute bottom-3 left-4 right-4">
                      <span className="font-serif-brand text-2xl font-normal text-white block">
                        {pkg.title}
                      </span>
                      <span className="text-[11px] text-[#E8D1B2] font-light">
                        {pkg.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Body with Features */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2.5 text-xs">
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-light">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with Price & Selection Button */}
                <div className="p-6 pt-4 border-t border-white/10 space-y-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-medium">
                      Investimento
                    </span>
                    <span className="font-sans tabular-nums tracking-tight text-2xl sm:text-3xl font-semibold text-white">
                      {formatCleanPrice(pkg.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoPkg(pkg.id as any);
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#C5A880] text-zinc-950 shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Pacote Selecionado</span>
                      </>
                    ) : (
                      <span>Selecionar Este Pacote</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Seção FILMAGEM (Casamento) */}
      {!is15Anos && (
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif-brand text-3xl sm:text-5xl font-light text-white tracking-wide">
              Filmagem
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto font-light">
              Video Profissional — Melhores momentos, cerimônia e trailer.
            </p>
          </div>

          <div
            onClick={() => setIncludeFilm(!includeFilm)}
            className={`p-8 sm:p-10 rounded-3xl border transition-all cursor-pointer relative ${
              includeFilm
                ? 'bg-[#141412] border-[#C5A880] shadow-2xl ring-1 ring-[#C5A880]/40'
                : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-brand text-2xl font-normal text-white">
                      {filmPackage.title}
                    </h3>
                    <span className="text-[11px] text-[#C5A880] uppercase tracking-wider font-semibold">
                      {filmPackage.subtitle}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {filmPackage.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                      <span className="font-light leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-left md:text-right space-y-3 shrink-0">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                    Investimento Filmagem
                  </span>
                  <span className="font-sans tabular-nums tracking-tight text-2xl sm:text-3xl font-semibold text-white">
                    {formatCleanPrice(filmPackage.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIncludeFilm(!includeFilm);
                  }}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    includeFilm
                      ? 'bg-[#C5A880] text-zinc-950 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {includeFilm ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Filmagem Incluída</span>
                    </>
                  ) : (
                    <span>+ Incluir Filmagem</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Seção ADICIONAIS */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-light text-white tracking-wide">
            Adicionais
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto font-light">
            Personalize ainda mais a sua experiência com itens exclusivos de alta qualidade.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 gap-6 ${
            is15Anos ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'
          }`}
        >
          {addonsList.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);

            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-6 sm:p-8 rounded-3xl border transition-all flex flex-col justify-between space-y-6 cursor-pointer ${
                  isSelected
                    ? 'bg-[#141412] border-[#C5A880] shadow-xl ring-1 ring-[#C5A880]/40'
                    : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif-brand text-xl font-normal text-white">
                      {addon.title}
                    </h3>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#C5A880] bg-[#C5A880] text-zinc-950'
                          : 'border-zinc-700 bg-black/40 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {addon.desc}
                  </p>

                  {addon.spec && (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#C5A880] font-medium">
                      {addon.spec}
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Valor</span>
                    <span className="font-sans tabular-nums tracking-tight text-xl sm:text-2xl font-semibold text-white">
                      {formatCleanPrice(addon.price)}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold transition-colors ${
                      isSelected ? 'text-[#C5A880]' : 'text-zinc-400'
                    }`}
                  >
                    {isSelected ? 'Incluído ✓' : '+ Adicionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Observações e Avisos de Rodapé */}
        <div className="text-center space-y-1 pt-4 text-xs text-zinc-400 italic font-light">
          <p>*Valores válidos para eventos em Curitiba (fora da cidade, consultar deslocamento)</p>
          <p className="text-[#C5A880]">*Tabela de preços válida exclusivamente para eventos em 2026.</p>
        </div>
      </section>

      {/* 5. Banner de Impacto "RESERVE SUA DATA!" */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 my-16">
        <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-16/9 sm:aspect-21/9 bg-zinc-950 flex flex-col items-center justify-center text-center p-6 sm:p-12">
          {/* Real Hands & Rings Photo from G&C Studio */}
          <img
            src="https://im-sl-cf.wfolio.photo/x/D48ScH1DA6jxU_uSH-Or-C0cJClpP-QP/lEAL128xEMPGM2o_rKw_kMPHKR9vAJ80/dslcMQWZtjN-jzkAsArb7y5QYTixPlxJ/025RUv3HslS2EHq4lbf7lMjWLk2gCp5L/rF4MDEcdV5nHrRA5zbpOJg.jpg"
            alt="Reserve sua data"
            className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-[0.38] scale-105"
          />
          <div className="absolute inset-0 bg-radial from-transparent via-black/45 to-black/85" />

          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="font-serif-brand text-sm tracking-widest text-[#E8D1B2] uppercase block">
              CASAMENTO
            </span>

            <h2 className="font-serif-brand text-4xl sm:text-6xl text-white font-light tracking-tight">
              Reserve sua data!
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              As datas são reservadas mediante aprovação e disponibilidade de agenda da nossa equipe.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowOrderModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs uppercase tracking-wider transition-all shadow-2xl cursor-pointer"
              >
                Envie uma mensagem / Reservar
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Conversar pelo WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Seção PORTFÓLIO VÍDEOS */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-light text-white tracking-wide">
            Portfólio Vídeos
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light">
            Clique no link:{' '}
            <a
              href="https://gcstudiocwb.com.br/disk/videos-gc-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C5A880] hover:underline inline-flex items-center gap-1 font-medium"
            >
              gcstudiocwb.com.br/disk/videos-gc-studio
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>

        {/* Video Player */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-16/9 bg-zinc-950 group">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
            title="G&C Studio Filmes de Casamento"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* 7. Seção PORTFÓLIO FOTOS */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif-brand text-3xl sm:text-5xl font-light text-white tracking-wide">
            Portfólio Fotos
          </h2>
          <p className="text-xs text-zinc-400 font-light">
            Kamila & João • Juliana & João • Ana Clara & Eduardo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolioPhotos.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActivePhotoLightbox(idx)}
              className="group relative rounded-3xl overflow-hidden aspect-4/5 bg-zinc-900 border border-white/10 shadow-lg cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                  <Maximize2 className="w-4 h-4 text-[#C5A880]" />
                </span>
              </div>

              <div className="relative z-10 p-6 flex flex-col justify-end h-full space-y-1">
                <h3 className="font-serif-brand text-2xl font-normal text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 font-light">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Rodapé Minimalista */}
      <footer className="border-t border-white/10 pt-12 pb-6 px-4 text-center text-xs text-zinc-500 space-y-4">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center p-2 mx-auto bg-black/40">
          <img src="/logo-gold.png" alt="G&C Studio Logo" className="w-full h-full object-contain" />
        </div>
        <p className="text-zinc-400">
          G&C Studio • Fotografia & Cinema de Eventos
        </p>
        <p className="text-[11px] text-zinc-600">
          Curitiba, PR • contato@gcstudio.com.br • Todos os direitos reservados.
        </p>
      </footer>

      {/* 9. Floating WhatsApp Icon */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer border-2 border-white/20"
          title="Falar direto no WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>

      {/* 10. Sticky Bottom Bar with Selected Total & Order Button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0C0C0B]/95 backdrop-blur-md border-t border-white/15 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
              Investimento Total Selecionado
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-sans tabular-nums tracking-tight text-xl sm:text-2xl font-semibold text-white">
                {formatCleanPrice(totalCalculated)}
              </span>
              <span className="text-[11px] text-[#C5A880] hidden sm:inline">
                ({selectedPhotoPkgObj.title} {includeFilm ? '+ Filmagem' : ''})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/10 text-white text-xs font-medium items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tirar Dúvida</span>
            </a>

            <button
              type="button"
              onClick={() => setShowOrderModal(true)}
              className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 font-semibold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              Fazer Pedido
            </button>
          </div>
        </div>
      </div>

      {/* 11. MODAL: Confirmação do Pedido / Aceite */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowOrderModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#C5A880]/20 flex items-center justify-center mx-auto text-[#C5A880]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif-brand text-2xl text-white font-light">
                Confirmar Reserva de Data
              </h3>
              <p className="text-xs text-zinc-400">
                Revise os itens selecionados para a cobertura de <strong>{eventType} ({clientName})</strong>:
              </p>
            </div>

            {/* Order Items Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-200">
                <span>Fotografia: {selectedPhotoPkgObj.title}</span>
                <span className="font-semibold">{formatCleanPrice(selectedPhotoPkgObj.price)}</span>
              </div>

              {includeFilm && (
                <div className="flex justify-between items-center text-zinc-200">
                  <span>Filmagem: {filmPackage.title}</span>
                  <span className="font-semibold">{formatCleanPrice(filmPackage.price)}</span>
                </div>
              )}

              {selectedAddons.map((addId) => {
                const addObj = addonsList.find((a) => a.id === addId);
                if (!addObj) return null;
                return (
                  <div key={addId} className="flex justify-between items-center text-zinc-400">
                    <span>Adicional: {addObj.title}</span>
                    <span>{formatCleanPrice(addObj.price)}</span>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-white text-sm font-semibold">
                <span>Investimento Total</span>
                <span className="font-sans tabular-nums tracking-tight text-lg font-semibold text-[#C5A880]">
                  {formatCleanPrice(totalCalculated)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed text-center">
              Ao confirmar, nossa equipe da G&C Studio receberá a notificação para gerar o contrato formal e travar a sua data na agenda de 2026.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="w-full sm:w-1/2 py-3 rounded-xl border border-white/15 text-zinc-300 hover:bg-white/5 text-xs font-medium transition-colors cursor-pointer"
              >
                Voltar e Ajustar
              </button>

              <button
                type="button"
                disabled={isAccepting}
                onClick={handleConfirmOrder}
                className="w-full sm:w-1/2 py-3 rounded-xl bg-[#C5A880] hover:bg-[#B5956B] text-zinc-950 text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isAccepting ? 'Confirmando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Fullscreen Lightbox for Portfolio Photos */}
      {activePhotoLightbox !== null && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-8 animate-in zoom-in-95">
          <div className="w-full max-w-5xl flex items-center justify-between text-white">
            <span className="font-serif-brand text-lg">
              {portfolioPhotos[activePhotoLightbox].title}
            </span>
            <button
              onClick={() => setActivePhotoLightbox(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-4xl max-h-[75vh] flex items-center justify-center my-auto">
            <img
              src={portfolioPhotos[activePhotoLightbox].image}
              alt=""
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            {activePhotoLightbox + 1} de {portfolioPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
}

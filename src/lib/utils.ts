import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EventStatus, LeadStatus, PaymentStatus, DeliveryStatus, BriefingStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Data não informada';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateFull(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    return dateString;
  } catch {
    return dateString;
  }
}

function getLocalTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Ordena eventos em ordem cronológica a partir de hoje:
 * 1. Eventos futuros / de hoje primeiro, do mais próximo de acontecer ao mais distante.
 * 2. Eventos já realizados depois, do mais recente ao mais antigo.
 */
export function sortEventsByProximity<T extends { date?: string; time?: string }>(list: T[]): T[] {
  const today = getLocalTodayStr();
  const key = (e: T) => `${e.date || '9999-12-31'}T${e.time || '00:00'}`;
  const upcoming = list.filter((e) => (e.date || '9999-12-31') >= today);
  const past = list.filter((e) => (e.date || '9999-12-31') < today);
  upcoming.sort((a, b) => key(a).localeCompare(key(b)));
  past.sort((a, b) => key(b).localeCompare(key(a)));
  return [...upcoming, ...past];
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function extractNationalDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 11);
}

export function formatPhoneInput(value: string): string {
  const digits = extractNationalDigits(value);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function getWhatsAppUrl(phone: string, message: string = ''): string {
  let clean = cleanPhone(phone);
  if (!clean.startsWith('55') && clean.length >= 10) {
    clean = '55' + clean;
  }
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function getEventStatusConfig(status: EventStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'lead':
      return { label: 'Lead', color: 'text-zinc-600', bg: 'bg-zinc-100' };
    case 'orcamento_enviado':
      return { label: 'Orçamento Enviado', color: 'text-amber-700', bg: 'bg-amber-50' };
    case 'negociacao':
      return { label: 'Em Negociação', color: 'text-sky-700', bg: 'bg-sky-50' };
    case 'aguardando_contrato':
      return { label: 'Aguardando Contrato', color: 'text-orange-700', bg: 'bg-orange-50' };
    case 'contrato_enviado':
      return { label: 'Contrato Enviado', color: 'text-indigo-700', bg: 'bg-indigo-50' };
    case 'confirmado':
      return { label: 'Confirmado', color: 'text-emerald-700', bg: 'bg-emerald-50' };
    case 'evento_proximo':
      return { label: 'Evento Próximo', color: 'text-amber-800', bg: 'bg-amber-100/70' };
    case 'realizado':
      return { label: 'Realizado', color: 'text-blue-700', bg: 'bg-blue-50' };
    case 'pos_producao':
      return { label: 'Pós-Produção', color: 'text-purple-700', bg: 'bg-purple-50' };
    case 'entregando':
      return { label: 'Entregando', color: 'text-teal-700', bg: 'bg-teal-50' };
    case 'concluido':
      return { label: 'Concluído', color: 'text-zinc-700', bg: 'bg-zinc-100' };
    case 'cancelado':
      return { label: 'Cancelado', color: 'text-rose-700', bg: 'bg-rose-50' };
    default:
      return { label: status, color: 'text-zinc-700', bg: 'bg-zinc-100' };
  }
}

export function getLeadStatusConfig(status: LeadStatus): { label: string; bg: string; border: string } {
  switch (status) {
    case 'NOVO CONTATO':
      return { label: 'Novo Contato', bg: 'bg-blue-50/60', border: 'border-blue-200' };
    case 'ORÇAMENTO ENVIADO':
      return { label: 'Orçamento Enviado', bg: 'bg-amber-50/60', border: 'border-amber-200' };
    case 'NEGOCIAÇÃO':
      return { label: 'Negociação', bg: 'bg-indigo-50/60', border: 'border-indigo-200' };
    case 'AGUARDANDO RESPOSTA':
      return { label: 'Aguardando Resposta', bg: 'bg-orange-50/60', border: 'border-orange-200' };
    case 'FECHADO':
      return { label: 'Fechado', bg: 'bg-emerald-50/60', border: 'border-emerald-200' };
    case 'PERDIDO':
      return { label: 'Perdido', bg: 'bg-rose-50/60', border: 'border-rose-200' };
  }
}

export function getPaymentStatusConfig(status: PaymentStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'pago':
      return { label: 'Pago', color: 'text-emerald-700', bg: 'bg-emerald-50' };
    case 'pendente':
      return { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50' };
    case 'atrasado':
      return { label: 'Atrasado', color: 'text-rose-700', bg: 'bg-rose-50' };
    case 'cancelado':
      return { label: 'Cancelado', color: 'text-zinc-500', bg: 'bg-zinc-100' };
  }
}

export function getDeliveryStatusConfig(status: DeliveryStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'a_fazer':
      return { label: 'A Fazer', color: 'text-zinc-600', bg: 'bg-zinc-100' };
    case 'em_producao':
      return { label: 'Em Produção', color: 'text-amber-700', bg: 'bg-amber-50' };
    case 'em_revisao':
      return { label: 'Em Revisão', color: 'text-purple-700', bg: 'bg-purple-50' };
    case 'pronto':
      return { label: 'Pronto', color: 'text-blue-700', bg: 'bg-blue-50' };
    case 'entregue':
      return { label: 'Entregue', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  }
}

export function getBriefingStatusConfig(status: BriefingStatus): { label: string; color: string; bg: string } {
  switch (status) {
    case 'nao_enviado':
      return { label: 'Não Enviado', color: 'text-zinc-600', bg: 'bg-zinc-100' };
    case 'enviado':
      return { label: 'Enviado', color: 'text-amber-700', bg: 'bg-amber-50' };
    case 'em_preenchimento':
      return { label: 'Em Preenchimento', color: 'text-sky-700', bg: 'bg-sky-50' };
    case 'concluido':
      return { label: 'Concluído', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  }
}

export interface ResolvedPackageInfo {
  id?: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_custom: boolean;
}

export const DEFAULT_GC_PACKAGES: Record<string, { name: string; description: string; price: number; features: string[] }> = {
  'pkg-1': {
    name: 'PACOTE 1 — Fotografia',
    description: 'Cobertura da Cerimônia + Recepção + 1h festa. Todas as fotos em alta resolução.',
    price: 1000,
    features: [
      'Cobertura da Cerimônia + Recepção + 1h festa',
      'Entregas: Todas as fotos editadas em alta resolução',
      'Prazo de entrega: Até 10 dias úteis',
    ],
  },
  'pkg-2': {
    name: 'PACOTE 2 — Fotografia',
    description: 'Casamento no Civil + Cerimônia + Recepção + 1h festa.',
    price: 1300,
    features: [
      'Casamento no Civil',
      'Cobertura da Cerimônia + Recepção + 1h festa',
      'Entregas: Todas as fotos editadas em alta resolução',
      'Prazo de entrega: Até 10 dias úteis',
    ],
  },
  'pkg-3': {
    name: 'PACOTE 3 — Fotografia',
    description: 'Pré-Wedding + Casamento no Civil + Cerimônia + Recepção + 1h festa.',
    price: 1600,
    features: [
      'Pré-Wedding + Casamento no Civil',
      'Cobertura da Cerimônia + Recepção + 1h festa',
      'Entregas: Todas as fotos editadas em alta resolução',
      'Prazo de entrega: Até 10 dias úteis',
    ],
  },
  'pkg-film': {
    name: 'Filmagem — Vídeo Profissional',
    description: 'Filmagem dos melhores momentos + Cerimônia + Recepção + Trailer de 1 min.',
    price: 1800,
    features: [
      'Vídeo Profissional',
      'Filmagem — Melhores momentos',
      'Cerimônia + Recepção / Festa',
      'Trailer de 1 minuto em alta definição',
    ],
  },
  'pkg-5': {
    name: 'Ensaio Editorial & Retratos',
    description: 'Sessão intimista de casal ou pessoal em locação externa.',
    price: 650,
    features: [
      'Até 2 horas de ensaio fotográfico',
      '40 fotos com tratamento de pele e cor editorial',
      'Galeria digital para seleção',
    ],
  },
};

export function resolveEventPackage(
  packages: Array<{ id: string; name: string; description: string; price: number; features?: string[] }> = [],
  packageName?: string,
  packageId?: string,
  customDescription?: string
): ResolvedPackageInfo {
  const safeName = (packageName || '').trim();

  // Helper de normalização (remove acentos visuais em traços, múltiplos espaços e caixa alta/baixa)
  const norm = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/[\u2014\u2013-]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();

  const targetNorm = norm(safeName);

  // 1. Busca por ID direto na lista de pacotes
  if (packageId) {
    const foundById = packages.find((p) => p.id === packageId);
    if (foundById) {
      return {
        id: foundById.id,
        name: foundById.name,
        description: customDescription || foundById.description,
        price: foundById.price,
        features: foundById.features || [],
        is_custom: false,
      };
    }
  }

  // 2. Busca por nome exato
  if (safeName) {
    const foundByName = packages.find((p) => p.name === safeName);
    if (foundByName) {
      return {
        id: foundByName.id,
        name: foundByName.name,
        description: customDescription || foundByName.description,
        price: foundByName.price,
        features: foundByName.features || [],
        is_custom: false,
      };
    }

    // 3. Busca por nome normalizado (ignora traço longo vs traço curto vs espaços)
    const foundByNorm = packages.find((p) => norm(p.name) === targetNorm);
    if (foundByNorm) {
      return {
        id: foundByNorm.id,
        name: foundByNorm.name,
        description: customDescription || foundByNorm.description,
        price: foundByNorm.price,
        features: foundByNorm.features || [],
        is_custom: false,
      };
    }

    // 4. Busca por inclusão (ex: "PACOTE 1" encontra "PACOTE 1 — Fotografia")
    const foundByInc = packages.find(
      (p) =>
        norm(p.name).includes(targetNorm) ||
        (targetNorm.length >= 4 && targetNorm.includes(norm(p.name)))
    );
    if (foundByInc) {
      return {
        id: foundByInc.id,
        name: foundByInc.name,
        description: customDescription || foundByInc.description,
        price: foundByInc.price,
        features: foundByInc.features || [],
        is_custom: false,
      };
    }
  }

  // 5. Fallback inteligente para pacotes padrão GC Studio
  let fallbackKey: string | null = null;
  if (packageId && DEFAULT_GC_PACKAGES[packageId]) {
    fallbackKey = packageId;
  } else if (safeName) {
    if (/pacote\s*1\b/i.test(safeName) || /pacote\s*01\b/i.test(safeName) || safeName === '1') {
      fallbackKey = 'pkg-1';
    } else if (/pacote\s*2\b/i.test(safeName) || /pacote\s*02\b/i.test(safeName) || safeName === '2') {
      fallbackKey = 'pkg-2';
    } else if (/pacote\s*3\b/i.test(safeName) || /pacote\s*03\b/i.test(safeName) || safeName === '3') {
      fallbackKey = 'pkg-3';
    } else if (/film/i.test(safeName) || /v[ií]deo/i.test(safeName)) {
      fallbackKey = 'pkg-film';
    } else if (/ensaio/i.test(safeName)) {
      fallbackKey = 'pkg-5';
    }
  }

  if (fallbackKey && DEFAULT_GC_PACKAGES[fallbackKey]) {
    const fb = DEFAULT_GC_PACKAGES[fallbackKey];
    return {
      id: fallbackKey,
      name: safeName || fb.name,
      description: customDescription || fb.description,
      price: fb.price,
      features: fb.features,
      is_custom: false,
    };
  }

  // 6. Pacote Personalizado
  return {
    id: packageId,
    name: safeName || 'Personalizado',
    description:
      customDescription ||
      (safeName && safeName.toLowerCase() !== 'personalizado'
        ? `Pacote ${safeName} com escopo contratado para o evento.`
        : 'Pacote com especificações e entregas customizadas para este evento.'),
    price: 0,
    features: [],
    is_custom: true,
  };
}

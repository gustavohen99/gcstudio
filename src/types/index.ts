export type EventStatus =
  | 'lead'
  | 'orcamento_enviado'
  | 'negociacao'
  | 'aguardando_contrato'
  | 'contrato_enviado'
  | 'confirmado'
  | 'evento_proximo'
  | 'realizado'
  | 'pos_producao'
  | 'entregando'
  | 'concluido'
  | 'cancelado';

export type LeadStatus =
  | 'NOVO CONTATO'
  | 'ORÇAMENTO ENVIADO'
  | 'NEGOCIAÇÃO'
  | 'AGUARDANDO RESPOSTA'
  | 'FECHADO'
  | 'PERDIDO';

export type QuoteStatus = 'rascunho' | 'enviado' | 'aceito' | 'recusado';

export type ContractStatus = 'rascunho' | 'enviado' | 'visualizado' | 'assinado' | 'cancelado';

export type PaymentStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado';

export type DeliveryStatus = 'a_fazer' | 'em_producao' | 'em_revisao' | 'pronto' | 'entregue';

export type BriefingStatus = 'nao_enviado' | 'enviado' | 'em_preenchimento' | 'concluido';

export type EventType =
  | 'Casamento'
  | 'Aniversário'
  | '15 anos'
  | 'Formatura'
  | 'Ensaio'
  | 'Corporativo'
  | 'Esportivo'
  | 'Outro';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface Client {
  id: string;
  name: string;
  partner_name?: string;
  email?: string;
  phone: string;
  whatsapp: string;
  event_type: EventType;
  status: 'ativo' | 'inativo' | 'concluido';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  event_type: EventType;
  event_date?: string;
  location?: string;
  guest_count?: number;
  estimated_value: number;
  origin: string; // e.g. Instagram, Indicação, Google, Evento
  notes?: string;
  status: LeadStatus;
  converted_client_id?: string;
  converted_event_id?: string;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface EventAddon {
  id: string;
  name: string;
  price: number;
}

export interface EventExtraSession {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD (pode ficar vazio enquanto estiver a definir)
  time: string; // HH:mm
  location: string;
}

export interface EventItem {
  id: string;
  client_id: string;
  client_name: string;
  name: string; // e.g. "João & Maria"
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  value: number;
  deposit_value?: number;
  deposit_paid?: boolean;
  status: EventStatus;
  package_name?: string;
  package_id?: string;
  package_description?: string;
  addons?: EventAddon[];
  extra_sessions?: EventExtraSession[];
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  is_active: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
}

export interface Quote {
  id: string;
  token: string;
  client_id: string;
  client_name: string;
  event_id?: string;
  event_name: string;
  event_type: EventType;
  event_date: string;
  package_name: string;
  services: { name: string; price: number }[];
  total_value: number;
  payment_method: string;
  deposit_value: number;
  installments_count: number;
  validity_date: string;
  notes?: string;
  status: QuoteStatus;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  client_id: string;
  client_name: string;
  event_id: string;
  event_name: string;
  template_title: string;
  content: string;
  external_url?: string;
  status: ContractStatus;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  event_id: string;
  event_name: string;
  client_id: string;
  client_name: string;
  description: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  paid_at?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface BriefingPerson {
  id: string;
  name: string;
  category: string; // 'Pais da noiva' | 'Pais do noivo' | 'Padrinhos' | 'Avós' | 'Irmãos' | 'Filhos' | 'Amigos' | 'Outras pessoas'
  notes?: string;
}

export interface BriefingRequiredPhoto {
  id: string;
  description: string;
  people_involved?: string;
  notes?: string;
}

export interface BriefingData {
  id: string;
  event_id: string;
  client_id: string;
  token: string;
  status: BriefingStatus;
  current_step: number;
  completed_at?: string;
  // Step 1: Informações do Evento
  event_info: {
    date: string;
    ceremony_time: string;
    reception_time: string;
    ceremony_location: string;
    reception_location: string;
    making_of_address: string;
    team_arrival_time: string;
    expected_end_time: string;
  };
  // Step 2: Cerimônia
  ceremony_info: {
    type: string;
    celebrant: string;
    parents_entrance: boolean;
    godparents_entrance: boolean;
    pages_flower_girls: boolean;
    special_entrances: string;
    notes: string;
  };
  // Step 3: Pessoas Importantes
  people: BriefingPerson[];
  // Step 4: Fotos Obrigatórias
  required_photos: BriefingRequiredPhoto[];
  // Step 5: Momentos Especiais
  special_moments: {
    has_surprise: boolean;
    surprise_details: string;
    has_tribute: boolean;
    tribute_details: string;
    has_speech: boolean;
    speech_details: string;
    has_special_dance: boolean;
    special_dance_details: string;
    attention_moments: string;
  };
  // Step 6: Festa
  party_info: {
    attractions: string;
    retrospective: boolean;
    games: string;
    surprise: string;
    no_photo_moments: string;
  };
  // Step 7: Preferências
  preferences: {
    photography_favorites: string;
    style: 'espontaneas' | 'posadas' | 'misto';
    references: string;
    dislikes: string;
    notes: string;
  };
  // Step 8: Vídeo
  video_info: {
    important_music: string;
    essential_speeches: string;
    talking_people: string;
    essential_film_moments: string;
    record_testimonials: boolean;
  };
  // Direção específica para Ensaio (Pré-Wedding, Ensaio Externo, Studio ou Ensaio avulso)
  session_info?: BriefingSessionInfo;
  created_at: string;
  updated_at: string;
}

export interface BriefingSessionInfo {
  has_outfit_changes: boolean;
  outfit_changes_details: string;
  body_insecurities: string;
  preferred_poses: string;
  avoid_poses: string;
  props_or_elements: string;
  session_vibe: string;
  notes?: string;
}

export interface ChecklistTask {
  id: string;
  event_id: string;
  phase: 'antes' | 'durante' | 'pos';
  title: string;
  is_completed: boolean;
  completed_at?: string;
  is_custom?: boolean;
}

export interface TimelineMoment {
  id: string;
  event_id: string;
  time: string;
  title: string;
  location: string;
  description?: string;
  responsible?: string;
  notes?: string;
  sort_order: number;
}

export type GalleryFontStyle = 'cormorant' | 'cinzel' | 'playfair' | 'inter';
export type GalleryDownloadQuality = 'both' | 'high_res' | 'web';

export interface GalleryPhoto {
  id: string;
  gallery_id: string;
  url: string;
  thumbnail_url: string;
  title?: string;
  filename: string;
  width?: number;
  height?: number;
  is_favorite?: boolean;
  is_selected?: boolean;
  folder?: string; // Subpasta / Categoria (ex: 'Making Of', 'Cerimônia', 'Festa')
  sort_order?: number; // Ordem de exibição na galeria
  created_at: string;
}

export interface Gallery {
  id: string;
  event_id: string;
  client_id: string;
  client_name: string;
  title: string;
  slug: string;
  token: string;
  cover_url: string;
  description: string;
  published_at?: string;
  expires_at: string; // ISO date
  password?: string;
  download_enabled: boolean;
  download_quality?: GalleryDownloadQuality; // 'both' | 'high_res' | 'web'
  favorites_enabled: boolean;
  selection_enabled: boolean;
  selection_max: number;
  selection_completed_at?: string;
  photos_count: number;
  favorites_count: number;
  selected_count: number;
  font_style?: GalleryFontStyle; // Tipografia editorial da galeria
  folders?: string[]; // Pastas dentro da galeria (ex: ['Making Of', 'Cerimônia', 'Festa'])
  video_url?: string; // YouTube, Vimeo or MP4 URL
  video_title?: string; // e.g. "Teaser 4K do Casamento"
  is_expired?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryItem {
  id: string;
  event_id: string;
  event_name: string;
  name: string; // Fotografias, Vídeo teaser, Filme completo, Reels, Making of, Álbum, etc.
  description?: string;
  status: DeliveryStatus;
  deadline: string;
  completed_at?: string;
  link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventDocument {
  id: string;
  event_id: string;
  name: string;
  category: 'contratos' | 'comprovantes' | 'referencias' | 'briefings' | 'geral';
  file_url: string;
  file_size?: string;
  notes?: string;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[]; // e.g. ['nome_cliente', 'data_evento', 'valor', 'link', 'prazo']
}

export interface AppNotification {
  id: string;
  type: 'briefing' | 'pagamento' | 'contrato' | 'galeria' | 'entrega' | 'lead' | 'evento';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface StudioSettings {
  name: string;
  tagline: string;
  logo_url?: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  website: string;
  address: string;
  bank_details: {
    bank: string;
    agency: string;
    account: string;
    pix_key: string;
    beneficiary: string;
  };
  contract_defaults: {
    jurisdiction: string;
    late_fee_percentage: number;
    interest_rate: number;
  };
  gallery_defaults: {
    expiration_days: number;
    download_enabled: boolean;
    favorites_enabled: boolean;
    selection_enabled: boolean;
    default_selection_max: number;
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Casamentos' | 'Filmes' | 'Ensaios' | '15 Anos' | string;
  subtitle: string;
  image: string;
  location: string;
  isVideo?: boolean;
  video_url?: string;
  sort_order?: number;
  gallery_photos?: string[];
  gallery_id?: string;
  event_date?: string;
  story?: string;
}

export interface PortfolioTestimonial {
  id: string;
  name: string;
  event: string;
  quote: string;
  rating: number;
}

export interface PortfolioPageConfig {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bg_image: string;
    button_primary_text: string;
    button_primary_link: string;
    button_secondary_text: string;
    button_secondary_link: string;
    metrics: { number: string; label: string }[];
  };
  about: {
    badge: string;
    title: string;
    p1: string;
    p2: string;
    quote: string;
    image: string;
    feat1_title: string;
    feat1_desc: string;
    feat2_title: string;
    feat2_desc: string;
  };
  sections_enabled: {
    hero: boolean;
    portfolio: boolean;
    about: boolean;
    packages: boolean;
    testimonials: boolean;
    contact: boolean;
  };
  typography: 'cormorant' | 'cinzel' | 'playfair' | 'inter';
  theme: 'dark' | 'light';
  socials: {
    instagram: string;
    whatsapp: string;
    email: string;
    address: string;
  };
}


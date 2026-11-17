'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Client,
  Lead,
  EventItem,
  Package,
  ServiceItem,
  Quote,
  Contract,
  Payment,
  BriefingData,
  ChecklistTask,
  TimelineMoment,
  Gallery,
  GalleryPhoto,
  DeliveryItem,
  MessageTemplate,
  AppNotification,
  StudioSettings,
  LeadStatus,
  EventStatus,
  PortfolioItem,
  PortfolioTestimonial,
  PortfolioPageConfig,
} from '@/types';
import {
  initialClients,
  initialEvents,
  initialLeads,
  initialPackages,
  initialServices,
  initialQuotes,
  initialContracts,
  initialPayments,
  initialBriefings,
  initialChecklists,
  initialTimelines,
  samplePhotos,
  initialGalleries,
  initialDeliveries,
  initialMessageTemplates,
  initialNotifications,
  initialSettings,
  initialPortfolioConfig,
  initialPortfolioItems,
  initialPortfolioTestimonials,
} from './mock-data';
import { isSupabaseConfigured, supabase } from './supabase';
import { resolveEventPackage } from './utils';

const STORAGE_KEY = 'gcstudio_v1_store';

interface AppStoreState {
  clients: Client[];
  events: EventItem[];
  leads: Lead[];
  packages: Package[];
  services: ServiceItem[];
  quotes: Quote[];
  contracts: Contract[];
  payments: Payment[];
  briefings: BriefingData[];
  checklists: ChecklistTask[];
  timelines: TimelineMoment[];
  galleries: Gallery[];
  photos: GalleryPhoto[];
  deliveries: DeliveryItem[];
  messageTemplates: MessageTemplate[];
  notifications: AppNotification[];
  settings: StudioSettings;
  portfolioConfig: PortfolioPageConfig;
  portfolioItems: PortfolioItem[];
  portfolioTestimonials: PortfolioTestimonial[];
}

const createDefaultState = (): AppStoreState => ({
  clients: initialClients,
  events: initialEvents,
  leads: initialLeads,
  packages: initialPackages,
  services: initialServices,
  quotes: initialQuotes,
  contracts: initialContracts,
  payments: initialPayments,
  briefings: initialBriefings,
  checklists: initialChecklists,
  timelines: initialTimelines,
  galleries: initialGalleries,
  photos: samplePhotos,
  deliveries: initialDeliveries,
  messageTemplates: initialMessageTemplates,
  notifications: initialNotifications,
  settings: initialSettings,
  portfolioConfig: initialPortfolioConfig,
  portfolioItems: initialPortfolioItems,
  portfolioTestimonials: initialPortfolioTestimonials,
});

const hydrateStoreState = (
  parsed: Partial<AppStoreState>,
  defaultState: AppStoreState
): AppStoreState => {
  const rawPackages = parsed.packages || initialPackages;
  const has15AnosPackages = rawPackages.some(
    (p) => p.id?.startsWith('pkg-15-') || p.category === '15 anos'
  );
  const packagesList = has15AnosPackages
    ? rawPackages
    : [...rawPackages, ...initialPackages.filter((p) => p.id.startsWith('pkg-15-'))];

  const rawServices = parsed.services || initialServices;
  const has15AnosServices = rawServices.some(
    (s) =>
      s.id === 'srv-making-off-15' ||
      s.id === 'srv-ensaio-studio-15' ||
      s.category === '15 anos'
  );
  const servicesList = has15AnosServices
    ? rawServices
    : [...rawServices, ...initialServices.filter((s) => s.category === '15 anos')];

  const loadedEvents: EventItem[] = (parsed.events || initialEvents).map((ev: EventItem) => {
    const pkg = resolveEventPackage(
      packagesList,
      ev.package_name,
      ev.package_id,
      ev.package_description
    );
    return {
      ...ev,
      package_name: ev.package_name || pkg.name,
      package_id: ev.package_id || pkg.id,
      package_description: ev.package_description || pkg.description,
    };
  });
  const loadedPayments: Payment[] = [...(parsed.payments || initialPayments)];

  // Garantir que todos os eventos ativos que possuem valor contratado apareçam no Financeiro
  loadedEvents.forEach((ev) => {
    if (ev.status !== 'cancelado' && ev.value > 0) {
      const evPayments = loadedPayments.filter((p) => p.event_id === ev.id);
      if (evPayments.length === 0) {
        const depVal = Math.min(Math.max(0, Number(ev.deposit_value) || 0), ev.value);
        const remVal = Math.max(0, ev.value - depVal);
        if (depVal > 0) {
          loadedPayments.push({
            id: `pay-${ev.id}-dep`,
            event_id: ev.id,
            event_name: ev.name,
            client_id: ev.client_id,
            client_name: ev.client_name,
            description: 'Entrada / Sinal do Evento',
            amount: depVal,
            due_date: ev.created_at?.split('T')[0] || ev.date,
            status: ev.deposit_paid ? 'pago' : 'pendente',
            paid_at: ev.deposit_paid ? ev.created_at : undefined,
            payment_method: 'PIX',
            created_at: ev.created_at || new Date().toISOString(),
          });
        }
        if (remVal > 0) {
          loadedPayments.push({
            id: `pay-${ev.id}-rem`,
            event_id: ev.id,
            event_name: ev.name,
            client_id: ev.client_id,
            client_name: ev.client_name,
            description: depVal > 0 ? 'Saldo Restante do Evento' : 'Valor Total do Evento',
            amount: remVal,
            due_date: ev.date,
            status: 'pendente',
            payment_method: 'PIX',
            created_at: ev.created_at || new Date().toISOString(),
          });
        }
      }
    }
  });

  return {
    ...defaultState,
    ...parsed,
    packages: packagesList,
    services: servicesList,
    events: loadedEvents,
    payments: loadedPayments,
    settings: {
      ...initialSettings,
      ...(parsed.settings || {}),
      logo_url: '/logo-white.png',
    },
    portfolioConfig: parsed.portfolioConfig?.hero?.title?.includes('Eternizando')
      ? parsed.portfolioConfig
      : initialPortfolioConfig,
    portfolioItems: ((parsed.portfolioItems || []).some((item: any) => item.id?.startsWith('port-'))
      ? parsed.portfolioItems!
      : initialPortfolioItems
    ).map((item: any) => {
      const defaultMatch = initialPortfolioItems.find((d) => d.id === item.id);
      return {
        ...item,
        gallery_photos:
          item.gallery_photos && item.gallery_photos.length > 0
            ? item.gallery_photos
            : defaultMatch?.gallery_photos || [item.image],
        story: item.story || defaultMatch?.story || item.subtitle,
        event_date: item.event_date || defaultMatch?.event_date,
        gallery_id: item.gallery_id || defaultMatch?.gallery_id,
      };
    }),
    portfolioTestimonials: parsed.portfolioTestimonials || initialPortfolioTestimonials,
  };
};

const getInitialState = (): AppStoreState => {
  const defaultState = createDefaultState();

  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return hydrateStoreState(parsed, defaultState);
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  return defaultState;
};

export type CloudSyncStatus = 'local' | 'syncing' | 'synced' | 'empty_remote' | 'error';

export interface CloudSyncInfo {
  status: CloudSyncStatus;
  error?: string;
  lastSyncedAt?: string;
}

const SUPABASE_STATE_ROW_ID = 'main';
const clientTabId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'tab-' + Math.random().toString(36).slice(2);

let globalState = getInitialState();
const listeners = new Set<() => void>();
let cloudSyncInfo: CloudSyncInfo = {
  status: isSupabaseConfigured() ? 'syncing' : 'local',
};
let supabaseSyncInitialized = false;
let supabasePushTimer: ReturnType<typeof setTimeout> | null = null;
let lastWriteNonce = '';

const emitListeners = () => {
  listeners.forEach((listener) => listener());
};

const persistLocalOnly = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }
  emitListeners();
};

const setCloudSyncInfo = (next: CloudSyncInfo) => {
  cloudSyncInfo = next;
  emitListeners();
};

const pushStateToSupabase = async (): Promise<{ ok: boolean; error?: string }> => {
  if (!supabase) {
    return { ok: false, error: 'Supabase não configurado.' };
  }
  const nonce = `${clientTabId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  lastWriteNonce = nonce;
  setCloudSyncInfo({ ...cloudSyncInfo, status: 'syncing', error: undefined });

  const nowIso = new Date().toISOString();
  const { error } = await supabase.from('studio_state').upsert(
    {
      id: SUPABASE_STATE_ROW_ID,
      data: {
        ...globalState,
        _syncMeta: { writeNonce: nonce, tabId: clientTabId, updatedAt: nowIso },
      },
      updated_at: nowIso,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Supabase sync push error:', error);
    setCloudSyncInfo({ status: 'error', error: error.message });
    return { ok: false, error: error.message };
  }

  setCloudSyncInfo({ status: 'synced', lastSyncedAt: nowIso });
  return { ok: true };
};

const pullStateFromSupabase = async (): Promise<{ ok: boolean; empty?: boolean; error?: string }> => {
  if (!supabase) {
    return { ok: false, error: 'Supabase não configurado.' };
  }
  setCloudSyncInfo({ ...cloudSyncInfo, status: 'syncing', error: undefined });

  const { data: row, error } = await supabase
    .from('studio_state')
    .select('data, updated_at')
    .eq('id', SUPABASE_STATE_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error('Supabase sync pull error:', error);
    setCloudSyncInfo({ status: 'error', error: error.message });
    return { ok: false, error: error.message };
  }

  if (!row || !row.data || typeof row.data !== 'object') {
    setCloudSyncInfo({ status: 'empty_remote' });
    return { ok: true, empty: true };
  }

  const remoteData = row.data as Partial<AppStoreState> & {
    _syncMeta?: { writeNonce?: string; updatedAt?: string };
  };

  if (remoteData._syncMeta?.writeNonce && remoteData._syncMeta.writeNonce === lastWriteNonce) {
    setCloudSyncInfo({
      status: 'synced',
      lastSyncedAt: row.updated_at || remoteData._syncMeta.updatedAt || new Date().toISOString(),
    });
    return { ok: true, empty: false };
  }

  if (Array.isArray(remoteData.events) || Array.isArray(remoteData.clients)) {
    const cleanPayload = { ...remoteData };
    delete cleanPayload._syncMeta;
    globalState = hydrateStoreState(cleanPayload, createDefaultState());
    persistLocalOnly();
    setCloudSyncInfo({
      status: 'synced',
      lastSyncedAt: row.updated_at || remoteData._syncMeta?.updatedAt || new Date().toISOString(),
    });
    return { ok: true, empty: false };
  }

  setCloudSyncInfo({ status: 'empty_remote' });
  return { ok: true, empty: true };
};

const initSupabaseSync = () => {
  if (supabaseSyncInitialized || !supabase || typeof window === 'undefined') {
    return;
  }
  supabaseSyncInitialized = true;
  void pullStateFromSupabase();

  supabase
    .channel('studio_state_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'studio_state',
        filter: `id=eq.${SUPABASE_STATE_ROW_ID}`,
      },
      () => {
        void pullStateFromSupabase();
      }
    )
    .subscribe();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void pullStateFromSupabase();
    }
  });
};

const notifyListeners = () => {
  persistLocalOnly();
  if (supabase && typeof window !== 'undefined') {
    if (supabasePushTimer) {
      clearTimeout(supabasePushTimer);
    }
    supabasePushTimer = setTimeout(() => {
      void pushStateToSupabase();
    }, 150);
  }
};

export const useAppStore = () => {
  const [state, setState] = useState<AppStoreState>(globalState);
  const [syncInfo, setSyncInfo] = useState<CloudSyncInfo>(cloudSyncInfo);

  useEffect(() => {
    // Sync client state with current globalState on mount
    setState(globalState);
    setSyncInfo(cloudSyncInfo);
    initSupabaseSync();

    const handleChange = () => {
      setState({ ...globalState });
      setSyncInfo({ ...cloudSyncInfo });
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  // --- ACTIONS ---

  // CLIENTS
  const addClient = useCallback((client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const newClient: Client = {
      ...client,
      id: 'cli-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, clients: [newClient, ...globalState.clients] };
    notifyListeners();
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    globalState = {
      ...globalState,
      clients: globalState.clients.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    };
    notifyListeners();
  }, []);

  const deleteClient = useCallback((id: string) => {
    globalState = {
      ...globalState,
      clients: globalState.clients.filter((c) => c.id !== id),
    };
    notifyListeners();
  }, []);

  // EVENTS
  const addEvent = useCallback(
    (event: Omit<EventItem, 'id' | 'created_at' | 'updated_at'>) => {
      const eventId = 'evt-' + Date.now();
      const nowIso = new Date().toISOString();
      const todayStr = nowIso.split('T')[0];
      const totalValue = Number(event.value) || 0;
      const depositValue = Math.min(Math.max(0, Number(event.deposit_value) || 0), totalValue);
      const remainingValue = Math.max(0, totalValue - depositValue);

      const pkg = resolveEventPackage(
        globalState.packages,
        event.package_name,
        event.package_id,
        event.package_description
      );

      const newEvent: EventItem = {
        ...event,
        package_name: event.package_name || pkg.name,
        package_id: event.package_id || pkg.id,
        package_description: event.package_description || pkg.description,
        value: totalValue,
        deposit_value: depositValue,
        deposit_paid: Boolean(event.deposit_paid),
        id: eventId,
        created_at: nowIso,
        updated_at: nowIso,
      };

      // Automação Financeira: Lançar automaticamente entrada e saldo no Financeiro
      const autoPayments: Payment[] = [];
      if (depositValue > 0) {
        autoPayments.push({
          id: 'pay-' + Date.now() + '-dep',
          event_id: eventId,
          event_name: newEvent.name,
          client_id: newEvent.client_id,
          client_name: newEvent.client_name,
          description: 'Entrada / Sinal do Evento',
          amount: depositValue,
          due_date: todayStr,
          status: newEvent.deposit_paid ? 'pago' : 'pendente',
          paid_at: newEvent.deposit_paid ? nowIso : undefined,
          payment_method: 'PIX',
          notes: newEvent.package_name ? `Pacote: ${newEvent.package_name}` : undefined,
          created_at: nowIso,
        });
      }

      if (remainingValue > 0) {
        autoPayments.push({
          id: 'pay-' + Date.now() + '-rem',
          event_id: eventId,
          event_name: newEvent.name,
          client_id: newEvent.client_id,
          client_name: newEvent.client_name,
          description: depositValue > 0 ? 'Saldo Restante do Evento' : 'Valor Total do Evento',
          amount: remainingValue,
          due_date: newEvent.date || todayStr,
          status: 'pendente',
          payment_method: 'PIX',
          notes: newEvent.package_name ? `Pacote: ${newEvent.package_name}` : undefined,
          created_at: nowIso,
        });
      }

      // Automação: Criar checklist padrão para o evento
      const defaultChecklist: ChecklistTask[] = [
        { id: 'chk-' + Date.now() + '-1', event_id: eventId, phase: 'antes', title: 'Confirmar briefing com os clientes', is_completed: false },
        { id: 'chk-' + Date.now() + '-2', event_id: eventId, phase: 'antes', title: 'Conferir cronograma e horários com cerimonial', is_completed: false },
        { id: 'chk-' + Date.now() + '-3', event_id: eventId, phase: 'antes', title: 'Carregar baterias e formatar cartões de memória', is_completed: false },
        { id: 'chk-' + Date.now() + '-4', event_id: eventId, phase: 'antes', title: 'Limpar lentes e conferir equipamentos reservas', is_completed: false },
        { id: 'chk-' + Date.now() + '-5', event_id: eventId, phase: 'durante', title: 'Chegada da equipe no making of', is_completed: false },
        { id: 'chk-' + Date.now() + '-6', event_id: eventId, phase: 'durante', title: 'Registro de cerimônia e fotos obrigatórias', is_completed: false },
        { id: 'chk-' + Date.now() + '-7', event_id: eventId, phase: 'durante', title: 'Backup inicial de segurança das mídias', is_completed: false },
        { id: 'chk-' + Date.now() + '-8', event_id: eventId, phase: 'pos', title: 'Curadoria e seleção das fotos', is_completed: false },
        { id: 'chk-' + Date.now() + '-9', event_id: eventId, phase: 'pos', title: 'Edição de cor editorial e tratamento', is_completed: false },
        { id: 'chk-' + Date.now() + '-10', event_id: eventId, phase: 'pos', title: 'Publicar galeria online e entregar aos clientes', is_completed: false },
      ];

      // Automação: Criar estrutura padrão de briefing
      const defaultBriefing: BriefingData = {
        id: 'brf-' + Date.now(),
        event_id: eventId,
        client_id: event.client_id,
        token: 'brf-' + Math.random().toString(36).substring(2, 10),
        status: 'nao_enviado',
        current_step: 1,
        event_info: {
          date: event.date,
          ceremony_time: event.time,
          reception_time: '19:00',
          ceremony_location: event.location,
          reception_location: event.location,
          making_of_address: '',
          team_arrival_time: '13:00',
          expected_end_time: '02:00',
        },
        ceremony_info: {
          type: 'Cerimônia',
          celebrant: '',
          parents_entrance: true,
          godparents_entrance: true,
          pages_flower_girls: true,
          special_entrances: '',
          notes: '',
        },
        people: [],
        required_photos: [
          { id: 'rp-d1', description: 'Foto com os pais', people_involved: 'Pais' },
          { id: 'rp-d2', description: 'Foto com padrinhos e madrinhas', people_involved: 'Padrinhos' },
        ],
        special_moments: {
          has_surprise: false,
          surprise_details: '',
          has_tribute: false,
          tribute_details: '',
          has_speech: false,
          speech_details: '',
          has_special_dance: false,
          special_dance_details: '',
          attention_moments: '',
        },
        party_info: {
          attractions: '',
          retrospective: false,
          games: '',
          surprise: '',
          no_photo_moments: '',
        },
        preferences: {
          photography_favorites: '',
          style: 'misto',
          references: '',
          dislikes: '',
          notes: '',
        },
        video_info: {
          important_music: '',
          essential_speeches: '',
          talking_people: '',
          essential_film_moments: '',
          record_testimonials: true,
        },
        created_at: nowIso,
        updated_at: nowIso,
      };

      globalState = {
        ...globalState,
        events: [newEvent, ...globalState.events],
        payments: [...autoPayments, ...globalState.payments],
        checklists: [...globalState.checklists, ...defaultChecklist],
        briefings: [...globalState.briefings, defaultBriefing],
      };
      notifyListeners();
      return newEvent;
    },
    []
  );

  const updateEvent = useCallback((id: string, updates: Partial<EventItem>) => {
    const existingEvent = globalState.events.find((e) => e.id === id);
    if (!existingEvent) return;

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const updatedEvent: EventItem = {
      ...existingEvent,
      ...updates,
      updated_at: nowIso,
    };

    if (updates.package_name !== undefined || updates.package_id !== undefined) {
      const pkg = resolveEventPackage(
        globalState.packages,
        updates.package_name !== undefined ? updates.package_name : existingEvent.package_name,
        updates.package_id !== undefined ? updates.package_id : existingEvent.package_id,
        updates.package_description || existingEvent.package_description
      );
      updatedEvent.package_name = updates.package_name || pkg.name;
      updatedEvent.package_id = updates.package_id || pkg.id;
      if (!updates.package_description) {
        updatedEvent.package_description = pkg.description;
      }
    }

    let updatedPayments = [...globalState.payments];

    // Sincronizar nome do evento nos pagamentos vinculados se o nome mudou
    if (updates.name !== undefined && updates.name !== existingEvent.name) {
      updatedPayments = updatedPayments.map((p) =>
        p.event_id === id ? { ...p, event_name: updatedEvent.name } : p
      );
    }

    // Sincronizar Financeiro quando o valor total, valor de entrada ou status da entrada mudar
    if (
      updates.value !== undefined ||
      updates.deposit_value !== undefined ||
      updates.deposit_paid !== undefined
    ) {
      const totalValue = Number(updatedEvent.value) || 0;
      const depositValue = Math.min(Math.max(0, Number(updatedEvent.deposit_value) || 0), totalValue);
      updatedEvent.value = totalValue;
      updatedEvent.deposit_value = depositValue;

      const eventPayments = updatedPayments.filter((p) => p.event_id === id);
      const depositPayment = eventPayments.find(
        (p) =>
          p.id.endsWith('-dep') ||
          p.description.toLowerCase().includes('entrada') ||
          p.description.toLowerCase().includes('sinal')
      );
      const otherPayments = eventPayments.filter((p) => p.id !== depositPayment?.id);

      // 1. Atualizar ou criar o lançamento de Entrada / Sinal
      if (depositValue > 0) {
        const isPaid =
          updates.deposit_paid !== undefined
            ? updates.deposit_paid
            : depositPayment
            ? depositPayment.status === 'pago'
            : Boolean(updatedEvent.deposit_paid);
        updatedEvent.deposit_paid = isPaid;

        if (depositPayment) {
          updatedPayments = updatedPayments.map((p) =>
            p.id === depositPayment.id
              ? {
                  ...p,
                  amount: depositValue,
                  status: isPaid ? 'pago' : 'pendente',
                  paid_at: isPaid ? p.paid_at || nowIso : undefined,
                }
              : p
          );
        } else {
          const newDep: Payment = {
            id: 'pay-' + Date.now() + '-dep',
            event_id: id,
            event_name: updatedEvent.name,
            client_id: updatedEvent.client_id,
            client_name: updatedEvent.client_name,
            description: 'Entrada / Sinal do Evento',
            amount: depositValue,
            due_date: todayStr,
            status: isPaid ? 'pago' : 'pendente',
            paid_at: isPaid ? nowIso : undefined,
            payment_method: 'PIX',
            notes: updatedEvent.package_name ? `Pacote: ${updatedEvent.package_name}` : undefined,
            created_at: nowIso,
          };
          updatedPayments = [newDep, ...updatedPayments];
        }
      } else if (depositPayment) {
        // Se zerou a entrada, remove o lançamento de entrada
        updatedPayments = updatedPayments.filter((p) => p.id !== depositPayment.id);
        updatedEvent.deposit_paid = false;
      }

      // 2. Atualizar ou criar o lançamento do Saldo Restante
      const remainingTarget = Math.max(0, totalValue - depositValue);
      if (otherPayments.length === 0) {
        if (remainingTarget > 0) {
          const newRem: Payment = {
            id: 'pay-' + Date.now() + '-rem',
            event_id: id,
            event_name: updatedEvent.name,
            client_id: updatedEvent.client_id,
            client_name: updatedEvent.client_name,
            description: depositValue > 0 ? 'Saldo Restante do Evento' : 'Valor Total do Evento',
            amount: remainingTarget,
            due_date: updatedEvent.date || todayStr,
            status: 'pendente',
            payment_method: 'PIX',
            notes: updatedEvent.package_name ? `Pacote: ${updatedEvent.package_name}` : undefined,
            created_at: nowIso,
          };
          updatedPayments = [...updatedPayments, newRem];
        }
      } else if (otherPayments.length === 1) {
        const singleOther = otherPayments[0];
        if (remainingTarget <= 0) {
          updatedPayments = updatedPayments.filter((p) => p.id !== singleOther.id);
        } else {
          updatedPayments = updatedPayments.map((p) =>
            p.id === singleOther.id
              ? {
                  ...p,
                  amount: remainingTarget,
                  description:
                    depositValue > 0 && p.description === 'Valor Total do Evento'
                      ? 'Saldo Restante do Evento'
                      : p.description,
                }
              : p
          );
        }
      } else {
        // Caso haja múltiplas parcelas além da entrada, ajusta as parcelas pendentes para fechar o saldo
        const paidOthersSum = otherPayments
          .filter((p) => p.status === 'pago')
          .reduce((acc, p) => acc + p.amount, 0);
        const pendingOthers = otherPayments.filter((p) => p.status !== 'pago');
        const pendingTarget = Math.max(0, remainingTarget - paidOthersSum);

        if (pendingOthers.length > 0) {
          const perInstallment = Math.floor(pendingTarget / pendingOthers.length);
          const remainder = pendingTarget - perInstallment * pendingOthers.length;
          pendingOthers.forEach((po, idx) => {
            const newAmt = idx === pendingOthers.length - 1 ? perInstallment + remainder : perInstallment;
            updatedPayments = updatedPayments.map((p) =>
              p.id === po.id ? { ...p, amount: newAmt } : p
            );
          });
        }
      }
    }

    globalState = {
      ...globalState,
      events: globalState.events.map((e) => (e.id === id ? updatedEvent : e)),
      payments: updatedPayments,
    };
    notifyListeners();
  }, []);

  const deleteEvent = useCallback((id: string) => {
    globalState = {
      ...globalState,
      events: globalState.events.filter((e) => e.id !== id),
      checklists: globalState.checklists.filter((c) => c.event_id !== id),
      timelines: globalState.timelines.filter((t) => t.event_id !== id),
      briefings: globalState.briefings.filter((b) => b.event_id !== id),
      payments: globalState.payments.filter((p) => p.event_id !== id),
      quotes: globalState.quotes.filter((q) => q.event_id !== id),
      contracts: globalState.contracts.filter((c) => c.event_id !== id),
      deliveries: globalState.deliveries.filter((d) => d.event_id !== id),
      galleries: globalState.galleries.filter((g) => g.event_id !== id),
    };
    notifyListeners();
  }, []);

  // LEADS & CONVERSION
  const addLead = useCallback((lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'last_interaction'>) => {
    const newLead: Lead = {
      ...lead,
      id: 'lead-' + Date.now(),
      last_interaction: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, leads: [newLead, ...globalState.leads] };
    notifyListeners();
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    globalState = {
      ...globalState,
      leads: globalState.leads.map((l) =>
        l.id === id ? { ...l, ...updates, last_interaction: new Date().toISOString(), updated_at: new Date().toISOString() } : l
      ),
    };
    notifyListeners();
  }, []);

  const deleteLead = useCallback((id: string) => {
    globalState = {
      ...globalState,
      leads: globalState.leads.filter((l) => l.id !== id),
    };
    notifyListeners();
  }, []);

  const convertLeadToClient = useCallback((leadId: string) => {
    const lead = globalState.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    // 1. Criar novo cliente
    const newClient: Client = {
      id: 'cli-' + Date.now(),
      name: lead.name,
      email: lead.email || '',
      phone: lead.whatsapp,
      whatsapp: lead.whatsapp,
      event_type: lead.event_type,
      status: 'ativo',
      notes: `Convertido do Lead via CRM. Origem: ${lead.origin}. Obs: ${lead.notes || 'Sem observações'}`,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 2. Criar novo evento
    const newEventId = 'evt-' + Date.now();
    const estimatedVal = Number(lead.estimated_value) || 0;
    const newEvent: EventItem = {
      id: newEventId,
      client_id: newClient.id,
      client_name: newClient.name,
      name: lead.name,
      type: lead.event_type,
      date: lead.event_date || todayStr,
      time: '16:00',
      location: lead.location || 'A definir',
      value: estimatedVal,
      deposit_value: 0,
      deposit_paid: false,
      status: 'confirmado',
      notes: `Origem: ${lead.origin}. Convertido a partir do Lead CRM.`,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const autoPayments: Payment[] = [];
    if (estimatedVal > 0) {
      autoPayments.push({
        id: 'pay-' + Date.now() + '-rem',
        event_id: newEventId,
        event_name: newEvent.name,
        client_id: newClient.id,
        client_name: newClient.name,
        description: 'Valor Total do Evento',
        amount: estimatedVal,
        due_date: newEvent.date,
        status: 'pendente',
        payment_method: 'PIX',
        created_at: nowIso,
      });
    }

    // 3. Atualizar lead com status FECHADO e vínculos
    const updatedLead: Lead = {
      ...lead,
      status: 'FECHADO',
      converted_client_id: newClient.id,
      converted_event_id: newEvent.id,
      last_interaction: nowIso,
      updated_at: nowIso,
    };

    // Criar checklist padrão
    const defaultChecklist: ChecklistTask[] = [
      { id: 'chk-' + Date.now() + '-1', event_id: newEventId, phase: 'antes', title: 'Confirmar briefing com os clientes', is_completed: false },
      { id: 'chk-' + Date.now() + '-2', event_id: newEventId, phase: 'antes', title: 'Conferir cronograma e horários', is_completed: false },
      { id: 'chk-' + Date.now() + '-3', event_id: newEventId, phase: 'antes', title: 'Carregar baterias e formatar cartões', is_completed: false },
      { id: 'chk-' + Date.now() + '-4', event_id: newEventId, phase: 'durante', title: 'Chegada da equipe no evento', is_completed: false },
      { id: 'chk-' + Date.now() + '-5', event_id: newEventId, phase: 'pos', title: 'Curadoria e edição das fotos', is_completed: false },
    ];

    globalState = {
      ...globalState,
      clients: [newClient, ...globalState.clients],
      events: [newEvent, ...globalState.events],
      payments: [...autoPayments, ...globalState.payments],
      leads: globalState.leads.map((l) => (l.id === leadId ? updatedLead : l)),
      checklists: [...globalState.checklists, ...defaultChecklist],
    };

    notifyListeners();
    return { client: newClient, event: newEvent };
  }, []);

  // QUOTES (ORÇAMENTOS)
  const addQuote = useCallback((quote: Omit<Quote, 'id' | 'token' | 'created_at' | 'updated_at'>) => {
    const newQuote: Quote = {
      ...quote,
      id: 'quo-' + Date.now(),
      token: 'prop-' + Math.random().toString(36).substring(2, 10),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, quotes: [newQuote, ...globalState.quotes] };
    notifyListeners();
    return newQuote;
  }, []);

  const updateQuote = useCallback((id: string, updates: Partial<Quote>) => {
    globalState = {
      ...globalState,
      quotes: globalState.quotes.map((q) =>
        q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q
      ),
    };
    notifyListeners();
  }, []);

  const deleteQuote = useCallback((id: string) => {
    globalState = {
      ...globalState,
      quotes: globalState.quotes.filter((q) => q.id !== id),
    };
    notifyListeners();
  }, []);

  const acceptQuote = useCallback((token: string) => {
    const quote = globalState.quotes.find((q) => q.token === token);
    if (!quote) return null;

    const acceptedAt = new Date().toISOString();
    const updatedQuote: Quote = {
      ...quote,
      status: 'aceito',
      accepted_at: acceptedAt,
      updated_at: acceptedAt,
    };

    // Criar notificação
    const newNotif: AppNotification = {
      id: 'not-' + Date.now(),
      type: 'contrato',
      title: 'Proposta Aceita pelo Cliente!',
      message: `${quote.client_name} aceitou a proposta do evento ${quote.event_name} (R$ ${quote.total_value.toLocaleString('pt-BR')}).`,
      link: `/orcamentos`,
      read: false,
      created_at: acceptedAt,
    };

    globalState = {
      ...globalState,
      quotes: globalState.quotes.map((q) => (q.token === token ? updatedQuote : q)),
      notifications: [newNotif, ...globalState.notifications],
    };
    notifyListeners();
    return updatedQuote;
  }, []);

  // CONTRACTS
  const addContract = useCallback((contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) => {
    const newContract: Contract = {
      ...contract,
      id: 'ctr-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, contracts: [newContract, ...globalState.contracts] };
    notifyListeners();
    return newContract;
  }, []);

  const updateContract = useCallback((id: string, updates: Partial<Contract>) => {
    globalState = {
      ...globalState,
      contracts: globalState.contracts.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    };
    notifyListeners();
  }, []);

  const deleteContract = useCallback((id: string) => {
    globalState = {
      ...globalState,
      contracts: globalState.contracts.filter((c) => c.id !== id),
    };
    notifyListeners();
  }, []);

  // PAYMENTS
  const addPayment = useCallback((payment: Omit<Payment, 'id' | 'created_at'>) => {
    const newPayment: Payment = {
      ...payment,
      id: 'pay-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    globalState = { ...globalState, payments: [newPayment, ...globalState.payments] };
    notifyListeners();
    return newPayment;
  }, []);

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    const target = globalState.payments.find((p) => p.id === id);
    const updatedPayments = globalState.payments.map((p) => (p.id === id ? { ...p, ...updates } : p));

    let updatedEvents = globalState.events;
    if (
      target &&
      updates.status &&
      (target.id.endsWith('-dep') ||
        target.description.toLowerCase().includes('entrada') ||
        target.description.toLowerCase().includes('sinal'))
    ) {
      updatedEvents = globalState.events.map((e) =>
        e.id === target.event_id ? { ...e, deposit_paid: updates.status === 'pago' } : e
      );
    }

    globalState = {
      ...globalState,
      payments: updatedPayments,
      events: updatedEvents,
    };
    notifyListeners();
  }, []);

  const deletePayment = useCallback((id: string) => {
    globalState = {
      ...globalState,
      payments: globalState.payments.filter((p) => p.id !== id),
    };
    notifyListeners();
  }, []);

  // CHECKLISTS
  const toggleChecklistTask = useCallback((taskId: string) => {
    globalState = {
      ...globalState,
      checklists: globalState.checklists.map((t) =>
        t.id === taskId
          ? {
              ...t,
              is_completed: !t.is_completed,
              completed_at: !t.is_completed ? new Date().toISOString() : undefined,
            }
          : t
      ),
    };
    notifyListeners();
  }, []);

  const addChecklistTask = useCallback((task: Omit<ChecklistTask, 'id'>) => {
    const newTask: ChecklistTask = {
      ...task,
      id: 'chk-' + Date.now(),
    };
    globalState = { ...globalState, checklists: [...globalState.checklists, newTask] };
    notifyListeners();
    return newTask;
  }, []);

  const deleteChecklistTask = useCallback((taskId: string) => {
    globalState = {
      ...globalState,
      checklists: globalState.checklists.filter((t) => t.id !== taskId),
    };
    notifyListeners();
  }, []);

  // TIMELINE
  const addTimelineMoment = useCallback((moment: Omit<TimelineMoment, 'id'>) => {
    const newMoment: TimelineMoment = {
      ...moment,
      id: 'tl-' + Date.now(),
    };
    globalState = {
      ...globalState,
      timelines: [...globalState.timelines, newMoment].sort((a, b) => a.time.localeCompare(b.time)),
    };
    notifyListeners();
    return newMoment;
  }, []);

  const updateTimelineMoment = useCallback((id: string, updates: Partial<TimelineMoment>) => {
    globalState = {
      ...globalState,
      timelines: globalState.timelines
        .map((t) => (t.id === id ? { ...t, ...updates } : t))
        .sort((a, b) => a.time.localeCompare(b.time)),
    };
    notifyListeners();
  }, []);

  const deleteTimelineMoment = useCallback((id: string) => {
    globalState = {
      ...globalState,
      timelines: globalState.timelines.filter((t) => t.id !== id),
    };
    notifyListeners();
  }, []);

  // BRIEFINGS
  const updateBriefing = useCallback((id: string, updates: Partial<BriefingData>) => {
    globalState = {
      ...globalState,
      briefings: globalState.briefings.map((b) =>
        b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
      ),
    };
    notifyListeners();
  }, []);

  const submitBriefing = useCallback((token: string, finalData?: Partial<BriefingData>) => {
    const briefing = globalState.briefings.find((b) => b.token === token);
    if (!briefing) return null;

    const completedAt = new Date().toISOString();
    const updatedBriefing: BriefingData = {
      ...briefing,
      ...finalData,
      status: 'concluido',
      completed_at: completedAt,
      updated_at: completedAt,
    };

    // Notificar admin
    const newNotif: AppNotification = {
      id: 'not-' + Date.now(),
      type: 'briefing',
      title: 'Briefing Concluído pelo Cliente!',
      message: `O briefing do evento foi finalizado e já está disponível para consulta da equipe.`,
      link: `/eventos/${briefing.event_id}`,
      read: false,
      created_at: completedAt,
    };

    globalState = {
      ...globalState,
      briefings: globalState.briefings.map((b) => (b.token === token ? updatedBriefing : b)),
      notifications: [newNotif, ...globalState.notifications],
    };
    notifyListeners();
    return updatedBriefing;
  }, []);

  // GALLERIES
  const addGallery = useCallback((gallery: Omit<Gallery, 'id' | 'token' | 'slug' | 'created_at' | 'updated_at' | 'photos_count' | 'favorites_count' | 'selected_count'>) => {
    const slug = gallery.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newGallery: Gallery = {
      ...gallery,
      id: 'gal-' + Date.now(),
      token: 'gal-' + Math.random().toString(36).substring(2, 10),
      slug,
      photos_count: 0,
      favorites_count: 0,
      selected_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, galleries: [newGallery, ...globalState.galleries] };
    notifyListeners();
    return newGallery;
  }, []);

  const updateGallery = useCallback((id: string, updates: Partial<Gallery>) => {
    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) =>
        g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
      ),
    };
    notifyListeners();
  }, []);

  const renewGallery = useCallback((id: string, additionalDays: number = 60) => {
    const gallery = globalState.galleries.find((g) => g.id === id);
    if (!gallery) return;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + additionalDays);

    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) =>
        g.id === id
          ? {
              ...g,
              expires_at: newExpiry.toISOString(),
              is_expired: false,
              updated_at: new Date().toISOString(),
            }
          : g
      ),
    };
    notifyListeners();
  }, []);

  const addPhotoToGallery = useCallback((photo: Omit<GalleryPhoto, 'id' | 'created_at'>) => {
    const newPhoto: GalleryPhoto = {
      ...photo,
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };
    const galleryPhotos = [...globalState.photos, newPhoto];
    const galleryCount = galleryPhotos.filter((p) => p.gallery_id === photo.gallery_id).length;

    globalState = {
      ...globalState,
      photos: galleryPhotos,
      galleries: globalState.galleries.map((g) =>
        g.id === photo.gallery_id ? { ...g, photos_count: galleryCount, updated_at: new Date().toISOString() } : g
      ),
    };
    notifyListeners();
    return newPhoto;
  }, []);

  const togglePhotoFavorite = useCallback((photoId: string) => {
    let targetGalleryId = '';
    const updatedPhotos = globalState.photos.map((p) => {
      if (p.id === photoId) {
        targetGalleryId = p.gallery_id;
        return { ...p, is_favorite: !p.is_favorite };
      }
      return p;
    });

    const favoritesCount = updatedPhotos.filter(
      (p) => p.gallery_id === targetGalleryId && p.is_favorite
    ).length;

    globalState = {
      ...globalState,
      photos: updatedPhotos,
      galleries: globalState.galleries.map((g) =>
        g.id === targetGalleryId ? { ...g, favorites_count: favoritesCount } : g
      ),
    };
    notifyListeners();
  }, []);

  const togglePhotoSelection = useCallback((photoId: string) => {
    let targetGalleryId = '';
    const targetPhoto = globalState.photos.find((p) => p.id === photoId);
    if (!targetPhoto) return;
    targetGalleryId = targetPhoto.gallery_id;

    const gallery = globalState.galleries.find((g) => g.id === targetGalleryId);
    const currentSelectedCount = globalState.photos.filter(
      (p) => p.gallery_id === targetGalleryId && p.is_selected
    ).length;

    // Se está desmarcando, permite sempre. Se está marcando, confere se não excedeu o máximo
    if (!targetPhoto.is_selected && gallery && gallery.selection_max > 0) {
      if (currentSelectedCount >= gallery.selection_max) {
        return false; // limite atingido
      }
    }

    const updatedPhotos = globalState.photos.map((p) => {
      if (p.id === photoId) {
        return { ...p, is_selected: !p.is_selected };
      }
      return p;
    });

    const newSelectedCount = updatedPhotos.filter(
      (p) => p.gallery_id === targetGalleryId && p.is_selected
    ).length;

    globalState = {
      ...globalState,
      photos: updatedPhotos,
      galleries: globalState.galleries.map((g) =>
        g.id === targetGalleryId ? { ...g, selected_count: newSelectedCount } : g
      ),
    };
    notifyListeners();
    return true;
  }, []);

  const completeGallerySelection = useCallback((galleryId: string) => {
    const gallery = globalState.galleries.find((g) => g.id === galleryId);
    if (!gallery) return;

    const completedAt = new Date().toISOString();
    const newNotif: AppNotification = {
      id: 'not-' + Date.now(),
      type: 'galeria',
      title: 'Seleção de Fotos Concluída!',
      message: `${gallery.client_name} finalizou a seleção de ${gallery.selected_count} fotos na galeria "${gallery.title}".`,
      link: `/galerias`,
      read: false,
      created_at: completedAt,
    };

    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) =>
        g.id === galleryId ? { ...g, selection_completed_at: completedAt, updated_at: completedAt } : g
      ),
      notifications: [newNotif, ...globalState.notifications],
    };
    notifyListeners();
  }, []);

  const updatePhoto = useCallback((photoId: string, updates: Partial<GalleryPhoto>) => {
    globalState = {
      ...globalState,
      photos: globalState.photos.map((p) =>
        p.id === photoId ? { ...p, ...updates } : p
      ),
    };
    notifyListeners();
  }, []);

  const deletePhoto = useCallback((photoId: string) => {
    const photo = globalState.photos.find((p) => p.id === photoId);
    if (!photo) return;
    const galleryId = photo.gallery_id;
    const newPhotos = globalState.photos.filter((p) => p.id !== photoId);
    const galleryCount = newPhotos.filter((p) => p.gallery_id === galleryId).length;
    const favoritesCount = newPhotos.filter((p) => p.gallery_id === galleryId && p.is_favorite).length;
    const selectedCount = newPhotos.filter((p) => p.gallery_id === galleryId && p.is_selected).length;

    globalState = {
      ...globalState,
      photos: newPhotos,
      galleries: globalState.galleries.map((g) =>
        g.id === galleryId
          ? {
              ...g,
              photos_count: galleryCount,
              favorites_count: favoritesCount,
              selected_count: selectedCount,
            }
          : g
      ),
    };
    notifyListeners();
  }, []);

  const setPhotoAsCover = useCallback((galleryId: string, photoUrl: string) => {
    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) =>
        g.id === galleryId ? { ...g, cover_url: photoUrl, updated_at: new Date().toISOString() } : g
      ),
    };
    notifyListeners();
  }, []);

  const reorderPhoto = useCallback((photoId: string, direction: 'up' | 'down') => {
    const photo = globalState.photos.find((p) => p.id === photoId);
    if (!photo) return;
    const galleryId = photo.gallery_id;
    const galleryPhotos = globalState.photos
      .filter((p) => p.gallery_id === galleryId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = galleryPhotos.findIndex((p) => p.id === photoId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= galleryPhotos.length) return;

    const targetPhoto = galleryPhotos[targetIndex];
    const currentOrder = photo.sort_order ?? currentIndex;
    const targetOrder = targetPhoto.sort_order ?? targetIndex;

    globalState = {
      ...globalState,
      photos: globalState.photos.map((p) => {
        if (p.id === photo.id) return { ...p, sort_order: targetOrder };
        if (p.id === targetPhoto.id) return { ...p, sort_order: currentOrder };
        return p;
      }),
    };
    notifyListeners();
  }, []);

  const movePhotoToIndex = useCallback((galleryId: string, sourcePhotoId: string, targetPhotoId: string) => {
    if (sourcePhotoId === targetPhotoId) return;

    const galleryPhotos = globalState.photos
      .filter((p) => p.gallery_id === galleryId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const sourceIndex = galleryPhotos.findIndex((p) => p.id === sourcePhotoId);
    const targetIndex = galleryPhotos.findIndex((p) => p.id === targetPhotoId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...galleryPhotos];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const orderMap = new Map<string, number>();
    reordered.forEach((p, idx) => {
      orderMap.set(p.id, idx + 1);
    });

    globalState = {
      ...globalState,
      photos: globalState.photos.map((p) => {
        if (orderMap.has(p.id)) {
          return { ...p, sort_order: orderMap.get(p.id) };
        }
        return p;
      }),
    };
    notifyListeners();
  }, []);

  const moveMultiplePhotosToIndex = useCallback((galleryId: string, sourcePhotoIds: string[], targetPhotoId: string) => {
    if (!sourcePhotoIds || sourcePhotoIds.length === 0) return;
    if (sourcePhotoIds.includes(targetPhotoId) && sourcePhotoIds.length === 1) return;

    const galleryPhotos = globalState.photos
      .filter((p) => p.gallery_id === galleryId)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const targetIndex = galleryPhotos.findIndex((p) => p.id === targetPhotoId);
    if (targetIndex === -1) return;

    const movingItems = galleryPhotos.filter((p) => sourcePhotoIds.includes(p.id));
    const remainingItems = galleryPhotos.filter((p) => !sourcePhotoIds.includes(p.id));

    let insertIndex = remainingItems.findIndex((p) => p.id === targetPhotoId);
    if (insertIndex === -1) {
      insertIndex = remainingItems.length;
    }

    const reordered = [...remainingItems];
    reordered.splice(insertIndex, 0, ...movingItems);

    const orderMap = new Map<string, number>();
    reordered.forEach((p, idx) => {
      orderMap.set(p.id, idx + 1);
    });

    globalState = {
      ...globalState,
      photos: globalState.photos.map((p) => {
        if (orderMap.has(p.id)) {
          return { ...p, sort_order: orderMap.get(p.id) };
        }
        return p;
      }),
    };
    notifyListeners();
  }, []);

  const movePhotosToFolder = useCallback((photoIds: string[], folder?: string) => {
    globalState = {
      ...globalState,
      photos: globalState.photos.map((p) => {
        if (photoIds.includes(p.id)) {
          return { ...p, folder: folder || undefined };
        }
        return p;
      }),
    };
    notifyListeners();
  }, []);

  const deletePhotosBatch = useCallback((photoIds: string[]) => {
    globalState = {
      ...globalState,
      photos: globalState.photos.filter((p) => !photoIds.includes(p.id)),
    };
    notifyListeners();
  }, []);

  const addFolderToGallery = useCallback((galleryId: string, folderName: string) => {
    const trimmed = folderName.trim();
    if (!trimmed) return;
    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) => {
        if (g.id !== galleryId) return g;
        const currentFolders = g.folders || [];
        if (currentFolders.includes(trimmed)) return g;
        return {
          ...g,
          folders: [...currentFolders, trimmed],
          updated_at: new Date().toISOString(),
        };
      }),
    };
    notifyListeners();
  }, []);

  const removeFolderFromGallery = useCallback((galleryId: string, folderName: string) => {
    globalState = {
      ...globalState,
      galleries: globalState.galleries.map((g) => {
        if (g.id !== galleryId) return g;
        return {
          ...g,
          folders: (g.folders || []).filter((f) => f !== folderName),
          updated_at: new Date().toISOString(),
        };
      }),
      photos: globalState.photos.map((p) => {
        if (p.gallery_id === galleryId && p.folder === folderName) {
          return { ...p, folder: undefined };
        }
        return p;
      }),
    };
    notifyListeners();
  }, []);

  // DELIVERIES
  const addDelivery = useCallback((delivery: Omit<DeliveryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newDelivery: DeliveryItem = {
      ...delivery,
      id: 'del-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    globalState = { ...globalState, deliveries: [newDelivery, ...globalState.deliveries] };
    notifyListeners();
    return newDelivery;
  }, []);

  const updateDelivery = useCallback((id: string, updates: Partial<DeliveryItem>) => {
    globalState = {
      ...globalState,
      deliveries: globalState.deliveries.map((d) =>
        d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
      ),
    };
    notifyListeners();
  }, []);

  const deleteDelivery = useCallback((id: string) => {
    globalState = {
      ...globalState,
      deliveries: globalState.deliveries.filter((d) => d.id !== id),
    };
    notifyListeners();
  }, []);

  // PACKAGES & SERVICES
  const addPackage = useCallback((pkg: Omit<Package, 'id'>) => {
    const newPkg: Package = { ...pkg, id: 'pkg-' + Date.now() };
    globalState = { ...globalState, packages: [...globalState.packages, newPkg] };
    notifyListeners();
    return newPkg;
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<Package>) => {
    const existingPkg = globalState.packages.find((p) => p.id === id);
    const updatedPackages = globalState.packages.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    const updatedEvents = globalState.events.map((ev) => {
      const matchesPkg =
        ev.package_id === id || (existingPkg && ev.package_name === existingPkg.name);
      if (!matchesPkg) return ev;
      return {
        ...ev,
        package_name: updates.name !== undefined ? updates.name : ev.package_name,
        package_description:
          updates.description !== undefined ? updates.description : ev.package_description,
      };
    });

    globalState = {
      ...globalState,
      packages: updatedPackages,
      events: updatedEvents,
    };
    notifyListeners();
  }, []);

  const deletePackage = useCallback((id: string) => {
    globalState = {
      ...globalState,
      packages: globalState.packages.filter((p) => p.id !== id),
    };
    notifyListeners();
  }, []);

  const addService = useCallback((srv: Omit<ServiceItem, 'id'>) => {
    const newSrv: ServiceItem = { ...srv, id: 'srv-' + Date.now() };
    globalState = { ...globalState, services: [...globalState.services, newSrv] };
    notifyListeners();
    return newSrv;
  }, []);

  const updateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    globalState = {
      ...globalState,
      services: globalState.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    };
    notifyListeners();
  }, []);

  const deleteService = useCallback((id: string) => {
    globalState = {
      ...globalState,
      services: globalState.services.filter((s) => s.id !== id),
    };
    notifyListeners();
  }, []);

  // MESSAGE TEMPLATES
  const addMessageTemplate = useCallback((template: Omit<MessageTemplate, 'id'>) => {
    const newTpl: MessageTemplate = { ...template, id: 'tpl-' + Date.now() };
    globalState = { ...globalState, messageTemplates: [...globalState.messageTemplates, newTpl] };
    notifyListeners();
    return newTpl;
  }, []);

  const updateMessageTemplate = useCallback((id: string, updates: Partial<MessageTemplate>) => {
    globalState = {
      ...globalState,
      messageTemplates: globalState.messageTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    notifyListeners();
  }, []);

  const deleteMessageTemplate = useCallback((id: string) => {
    globalState = {
      ...globalState,
      messageTemplates: globalState.messageTemplates.filter((t) => t.id !== id),
    };
    notifyListeners();
  }, []);

  // NOTIFICATIONS
  const markNotificationAsRead = useCallback((id: string) => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    };
    notifyListeners();
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    globalState = {
      ...globalState,
      notifications: globalState.notifications.map((n) => ({ ...n, read: true })),
    };
    notifyListeners();
  }, []);

  // SETTINGS
  const updateSettings = useCallback((updates: Partial<StudioSettings>) => {
    globalState = {
      ...globalState,
      settings: { ...globalState.settings, ...updates },
    };
    notifyListeners();
  }, []);

  // PORTFOLIO / SITE CMS
  const updatePortfolioConfig = useCallback((updates: Partial<PortfolioPageConfig>) => {
    globalState = {
      ...globalState,
      portfolioConfig: {
        ...globalState.portfolioConfig,
        ...updates,
        hero: {
          ...(globalState.portfolioConfig?.hero || initialPortfolioConfig.hero),
          ...(updates.hero || {}),
        },
        about: {
          ...(globalState.portfolioConfig?.about || initialPortfolioConfig.about),
          ...(updates.about || {}),
        },
        sections_enabled: {
          ...(globalState.portfolioConfig?.sections_enabled || initialPortfolioConfig.sections_enabled),
          ...(updates.sections_enabled || {}),
        },
        socials: {
          ...(globalState.portfolioConfig?.socials || initialPortfolioConfig.socials),
          ...(updates.socials || {}),
        },
      },
    };
    notifyListeners();
  }, []);

  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: 'pf-' + Date.now(),
      sort_order: (globalState.portfolioItems?.length || 0) + 1,
    };
    globalState = {
      ...globalState,
      portfolioItems: [...(globalState.portfolioItems || []), newItem],
    };
    notifyListeners();
    return newItem;
  }, []);

  const updatePortfolioItem = useCallback((id: string, updates: Partial<PortfolioItem>) => {
    globalState = {
      ...globalState,
      portfolioItems: (globalState.portfolioItems || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    };
    notifyListeners();
  }, []);

  const deletePortfolioItem = useCallback((id: string) => {
    globalState = {
      ...globalState,
      portfolioItems: (globalState.portfolioItems || []).filter((item) => item.id !== id),
    };
    notifyListeners();
  }, []);

  const reorderPortfolioItems = useCallback((items: PortfolioItem[]) => {
    globalState = {
      ...globalState,
      portfolioItems: items.map((item, idx) => ({ ...item, sort_order: idx + 1 })),
    };
    notifyListeners();
  }, []);

  const addPortfolioTestimonial = useCallback((t: Omit<PortfolioTestimonial, 'id'>) => {
    const newTestimonial: PortfolioTestimonial = {
      ...t,
      id: 'test-' + Date.now(),
    };
    globalState = {
      ...globalState,
      portfolioTestimonials: [...(globalState.portfolioTestimonials || []), newTestimonial],
    };
    notifyListeners();
    return newTestimonial;
  }, []);

  const updatePortfolioTestimonial = useCallback((id: string, updates: Partial<PortfolioTestimonial>) => {
    globalState = {
      ...globalState,
      portfolioTestimonials: (globalState.portfolioTestimonials || []).map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    };
    notifyListeners();
  }, []);

  const deletePortfolioTestimonial = useCallback((id: string) => {
    globalState = {
      ...globalState,
      portfolioTestimonials: (globalState.portfolioTestimonials || []).filter((t) => t.id !== id),
    };
    notifyListeners();
  }, []);

  // DATA MANAGEMENT (Clear / Reset)
  const resetToDemoData = useCallback(() => {
    globalState = {
      clients: initialClients,
      events: initialEvents,
      leads: initialLeads,
      packages: initialPackages,
      services: initialServices,
      quotes: initialQuotes,
      contracts: initialContracts,
      payments: initialPayments,
      briefings: initialBriefings,
      checklists: initialChecklists,
      timelines: initialTimelines,
      galleries: initialGalleries,
      photos: samplePhotos,
      deliveries: initialDeliveries,
      messageTemplates: initialMessageTemplates,
      notifications: initialNotifications,
      settings: initialSettings,
      portfolioConfig: initialPortfolioConfig,
      portfolioItems: initialPortfolioItems,
      portfolioTestimonials: initialPortfolioTestimonials,
    };
    notifyListeners();
  }, []);

  const clearAllUserData = useCallback(() => {
    globalState = {
      clients: [],
      events: [],
      leads: [],
      packages: initialPackages,
      services: initialServices,
      quotes: [],
      contracts: [],
      payments: [],
      briefings: [],
      checklists: [],
      timelines: [],
      galleries: [],
      photos: [],
      deliveries: [],
      messageTemplates: initialMessageTemplates,
      notifications: [],
      settings: initialSettings,
      portfolioConfig: initialPortfolioConfig,
      portfolioItems: [],
      portfolioTestimonials: [],
    };
    notifyListeners();
  }, []);

  const exportStoreData = useCallback(() => {
    return {
      app: 'gcstudio',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: globalState,
    };
  }, []);

  const importStoreData = useCallback((raw: unknown) => {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Arquivo de backup inválido.');
    }
    const envelope = raw as { app?: string; data?: Partial<AppStoreState> } & Partial<AppStoreState>;
    const payload: Partial<AppStoreState> =
      envelope.data && typeof envelope.data === 'object' ? envelope.data : envelope;

    if (!Array.isArray(payload.events) && !Array.isArray(payload.clients)) {
      throw new Error('Este arquivo não contém registros válidos de eventos ou clientes do G&C Studio.');
    }

    globalState = hydrateStoreState(payload, createDefaultState());
    notifyListeners();
    return {
      clients: globalState.clients.length,
      events: globalState.events.length,
    };
  }, []);

  return {
    ...state,
    addClient,
    updateClient,
    deleteClient,
    addEvent,
    updateEvent,
    deleteEvent,
    addLead,
    updateLead,
    deleteLead,
    convertLeadToClient,
    addQuote,
    updateQuote,
    deleteQuote,
    acceptQuote,
    addContract,
    updateContract,
    deleteContract,
    addPayment,
    updatePayment,
    deletePayment,
    toggleChecklistTask,
    addChecklistTask,
    deleteChecklistTask,
    addTimelineMoment,
    updateTimelineMoment,
    deleteTimelineMoment,
    updateBriefing,
    submitBriefing,
    addGallery,
    updateGallery,
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
    togglePhotoFavorite,
    togglePhotoSelection,
    completeGallerySelection,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    addPackage,
    updatePackage,
    deletePackage,
    addService,
    updateService,
    deleteService,
    addMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateSettings,
    updatePortfolioConfig,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    reorderPortfolioItems,
    addPortfolioTestimonial,
    updatePortfolioTestimonial,
    deletePortfolioTestimonial,
    resetToDemoData,
    clearAllUserData,
    exportStoreData,
    importStoreData,
    cloudSyncInfo: syncInfo,
    pushToSupabase: pushStateToSupabase,
    pullFromSupabase: pullStateFromSupabase,
  };
};

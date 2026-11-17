import type {
  AppNotification,
  BriefingData,
  ChecklistTask,
  Client,
  Contract,
  DeliveryItem,
  EventItem,
  Gallery,
  GalleryPhoto,
  Lead,
  MessageTemplate,
  Package,
  Payment,
  PortfolioItem,
  PortfolioPageConfig,
  PortfolioTestimonial,
  Quote,
  ServiceItem,
  StudioSettings,
  TimelineMoment,
} from '@/types';

export interface SyncableState {
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

export type CollectionKey =
  | 'clients'
  | 'events'
  | 'leads'
  | 'packages'
  | 'services'
  | 'quotes'
  | 'contracts'
  | 'payments'
  | 'briefings'
  | 'checklists'
  | 'timelines'
  | 'galleries'
  | 'photos'
  | 'deliveries'
  | 'messageTemplates'
  | 'notifications'
  | 'portfolioItems'
  | 'portfolioTestimonials';

export const COLLECTION_KEYS: CollectionKey[] = [
  'clients',
  'events',
  'leads',
  'packages',
  'services',
  'quotes',
  'contracts',
  'payments',
  'briefings',
  'checklists',
  'timelines',
  'galleries',
  'photos',
  'deliveries',
  'messageTemplates',
  'notifications',
  'portfolioItems',
  'portfolioTestimonials',
];

export interface SyncMetadata {
  writeNonce?: string;
  tabId?: string;
  updatedAt?: string;
  revision?: number;
  touchedAt?: Record<string, string>;
  deletedAt?: Record<string, string>;
  singletonTouchedAt?: {
    settings?: string;
    portfolioConfig?: string;
  };
}

const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function maxIso(a?: string, b?: string): string {
  if (!a) return b || '';
  if (!b) return a;
  return a >= b ? a : b;
}

function getEntityTimestamp(item: unknown, meta?: SyncMetadata): string {
  if (!item || typeof item !== 'object') return '';
  const rec = item as Record<string, unknown>;
  const id = typeof rec.id === 'string' ? rec.id : '';
  const tracked = id ? meta?.touchedAt?.[id] || '' : '';

  const own =
    (typeof rec.updated_at === 'string' && rec.updated_at) ||
    (typeof rec.paid_at === 'string' && rec.paid_at) ||
    (typeof rec.completed_at === 'string' && rec.completed_at) ||
    (typeof rec.signed_at === 'string' && rec.signed_at) ||
    (typeof rec.last_interaction === 'string' && rec.last_interaction) ||
    (typeof rec.created_at === 'string' && rec.created_at) ||
    '';

  return maxIso(tracked, own);
}

/**
 * Remove tombstones muito antigos (> 30 dias) e garante estrutura limpa.
 */
export function pruneSyncMetadata(meta: SyncMetadata, nowMs = Date.now()): SyncMetadata {
  const cutoffIso = new Date(nowMs - TOMBSTONE_TTL_MS).toISOString();
  const nextDeleted: Record<string, string> = {};
  const nextTouched: Record<string, string> = { ...(meta.touchedAt || {}) };

  Object.entries(meta.deletedAt || {}).forEach(([id, ts]) => {
    if (ts && ts >= cutoffIso) {
      nextDeleted[id] = ts;
    }
  });

  return {
    ...meta,
    touchedAt: nextTouched,
    deletedAt: nextDeleted,
    singletonTouchedAt: { ...(meta.singletonTouchedAt || {}) },
  };
}

/**
 * Compara o estado anterior com o novo estado local e registra automaticamente
 * quais itens foram criados, editados ou excluídos em `touchedAt` / `deletedAt`.
 */
export function trackLocalStateDiff(
  prevState: SyncableState,
  nextState: SyncableState,
  prevMeta: SyncMetadata,
  nowIso = new Date().toISOString()
): SyncMetadata {
  const touchedAt: Record<string, string> = { ...(prevMeta.touchedAt || {}) };
  const deletedAt: Record<string, string> = { ...(prevMeta.deletedAt || {}) };

  for (const key of COLLECTION_KEYS) {
    const prevList = (prevState[key] || []) as Array<{ id: string }>;
    const nextList = (nextState[key] || []) as Array<{ id: string }>;

    const prevMap = new Map<string, { id: string }>();
    for (const item of prevList) {
      if (item && typeof item.id === 'string') prevMap.set(item.id, item);
    }

    const nextMap = new Map<string, { id: string }>();
    for (const item of nextList) {
      if (item && typeof item.id === 'string') nextMap.set(item.id, item);
    }

    // Itens adicionados ou modificados
    nextMap.forEach((nextItem, id) => {
      const prevItem = prevMap.get(id);
      if (!prevItem) {
        touchedAt[id] = nowIso;
        delete deletedAt[id];
      } else if (prevItem !== nextItem && JSON.stringify(prevItem) !== JSON.stringify(nextItem)) {
        touchedAt[id] = nowIso;
        delete deletedAt[id];
      }
    });

    // Itens excluídos
    prevMap.forEach((_prevItem, id) => {
      if (!nextMap.has(id)) {
        deletedAt[id] = nowIso;
        delete touchedAt[id];
      }
    });
  }

  const singletonTouchedAt = { ...(prevMeta.singletonTouchedAt || {}) };
  if (
    prevState.settings !== nextState.settings &&
    JSON.stringify(prevState.settings) !== JSON.stringify(nextState.settings)
  ) {
    singletonTouchedAt.settings = nowIso;
  }
  if (
    prevState.portfolioConfig !== nextState.portfolioConfig &&
    JSON.stringify(prevState.portfolioConfig) !== JSON.stringify(nextState.portfolioConfig)
  ) {
    singletonTouchedAt.portfolioConfig = nowIso;
  }

  return pruneSyncMetadata({
    ...prevMeta,
    touchedAt,
    deletedAt,
    singletonTouchedAt,
  });
}

/**
 * Mescla dois estados (local e remoto) por entidade, usando timestamps de edição
 * e tombstones de exclusão para evitar que edições simultâneas em dispositivos diferentes
 * sobrescrevam umas às outras.
 */
export function mergeSyncStates(
  localState: SyncableState,
  localMeta: SyncMetadata,
  remoteState: SyncableState,
  remoteMeta: SyncMetadata
): { state: SyncableState; meta: SyncMetadata } {
  const mergedDeletedAt: Record<string, string> = {};
  const allDeletedIds = new Set([
    ...Object.keys(localMeta.deletedAt || {}),
    ...Object.keys(remoteMeta.deletedAt || {}),
  ]);
  allDeletedIds.forEach((id) => {
    const ts = maxIso(localMeta.deletedAt?.[id], remoteMeta.deletedAt?.[id]);
    if (ts) mergedDeletedAt[id] = ts;
  });

  const mergedTouchedAt: Record<string, string> = {};
  const mergedCollections: Partial<SyncableState> = {};

  for (const key of COLLECTION_KEYS) {
    const localList = (localState[key] || []) as Array<{ id: string }>;
    const remoteList = (remoteState[key] || []) as Array<{ id: string }>;

    const localMap = new Map<string, { id: string }>();
    for (const item of localList) {
      if (item && typeof item.id === 'string') localMap.set(item.id, item);
    }

    const remoteMap = new Map<string, { id: string }>();
    for (const item of remoteList) {
      if (item && typeof item.id === 'string') remoteMap.set(item.id, item);
    }

    // Mantém ordem: novos itens locais primeiro, seguidos pela ordem remota/existente
    const orderedIds: string[] = [];
    const seen = new Set<string>();

    for (const item of localList) {
      if (item?.id && !remoteMap.has(item.id) && !seen.has(item.id)) {
        orderedIds.push(item.id);
        seen.add(item.id);
      }
    }
    for (const item of remoteList) {
      if (item?.id && !seen.has(item.id)) {
        orderedIds.push(item.id);
        seen.add(item.id);
      }
    }
    for (const item of localList) {
      if (item?.id && !seen.has(item.id)) {
        orderedIds.push(item.id);
        seen.add(item.id);
      }
    }

    const resultList: Array<{ id: string }> = [];

    for (const id of orderedIds) {
      const lItem = localMap.get(id);
      const rItem = remoteMap.get(id);
      const lTs = lItem ? getEntityTimestamp(lItem, localMeta) : '';
      const rTs = rItem ? getEntityTimestamp(rItem, remoteMeta) : '';
      const itemMaxTs = maxIso(lTs, rTs);
      const delTs = mergedDeletedAt[id] || '';

      // Se foi excluído mais recentemente (ou depois da última edição conhecida), mantém excluído
      if (delTs && (!itemMaxTs || delTs >= itemMaxTs)) {
        continue;
      }

      if (lItem && !rItem) {
        resultList.push(lItem);
        if (lTs) mergedTouchedAt[id] = lTs;
      } else if (!lItem && rItem) {
        resultList.push(rItem);
        if (rTs) mergedTouchedAt[id] = rTs;
      } else if (lItem && rItem) {
        if (lTs > rTs) {
          resultList.push(lItem);
          mergedTouchedAt[id] = lTs;
        } else {
          resultList.push(rItem);
          if (rTs) mergedTouchedAt[id] = rTs;
        }
      }
    }

    (mergedCollections as Record<string, unknown>)[key] = resultList;
  }

  // Singletons: settings & portfolioConfig
  const localSettingsTs = localMeta.singletonTouchedAt?.settings || '';
  const remoteSettingsTs = remoteMeta.singletonTouchedAt?.settings || '';
  const useLocalSettings = localSettingsTs > remoteSettingsTs;

  const localPortfolioTs = localMeta.singletonTouchedAt?.portfolioConfig || '';
  const remotePortfolioTs = remoteMeta.singletonTouchedAt?.portfolioConfig || '';
  const useLocalPortfolio = localPortfolioTs > remotePortfolioTs;

  const mergedState: SyncableState = {
    ...(remoteState as SyncableState),
    ...(mergedCollections as Pick<SyncableState, CollectionKey>),
    settings: useLocalSettings ? localState.settings : remoteState.settings,
    portfolioConfig: useLocalPortfolio ? localState.portfolioConfig : remoteState.portfolioConfig,
  };

  const mergedMeta = pruneSyncMetadata({
    revision: Math.max(localMeta.revision || 0, remoteMeta.revision || 0),
    touchedAt: mergedTouchedAt,
    deletedAt: mergedDeletedAt,
    singletonTouchedAt: {
      settings: maxIso(localSettingsTs, remoteSettingsTs) || undefined,
      portfolioConfig: maxIso(localPortfolioTs, remotePortfolioTs) || undefined,
    },
  });

  return { state: mergedState, meta: mergedMeta };
}

'use client';

import React from 'react';
import {
  BriefingData,
  ChecklistTask,
  Client,
  EventItem,
  TimelineMoment,
} from '@/types';
import { BriefingContext } from '@/lib/briefing-config';
import { formatDate, formatDateFull, getWhatsAppUrl, ResolvedPackageInfo } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  MapPin,
  MessageCircle,
  Navigation,
  Package as PackageIcon,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';

interface EventDayModeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  client: Client | null | undefined;
  packageInfo: ResolvedPackageInfo | null;
  briefingCtx: BriefingContext | null;
  briefing: BriefingData | null | undefined;
  timeline: TimelineMoment[];
  checklist: ChecklistTask[];
  onToggleChecklistTask: (taskId: string) => void;
  onToggleRequiredPhoto: (photoId: string) => void;
  onCopyText: (text: string, label: string) => void;
}

export const EventDayModeSheet: React.FC<EventDayModeSheetProps> = ({
  isOpen,
  onClose,
  event,
  client,
  packageInfo,
  briefingCtx,
  briefing,
  timeline,
  checklist,
  onToggleChecklistTask,
  onToggleRequiredPhoto,
  onCopyText,
}) => {
  if (!isOpen) return null;

  const mainLocation = briefing?.event_info?.reception_location || event.location;
  const ceremonyLocation = briefing?.event_info?.ceremony_location || event.location;
  const makingOfAddress = briefing?.event_info?.making_of_address || '';

  const requiredPhotos = briefing?.required_photos || [];
  const donePhotosCount = requiredPhotos.filter((rp) => rp.is_done).length;
  const duringTasks = checklist.filter((c) => c.phase === 'durante');
  const duringDoneCount = duringTasks.filter((c) => c.is_completed).length;

  const hasAlerts = Boolean(
    briefing?.session_info?.body_insecurities ||
      briefing?.party_info?.no_photo_moments ||
      briefing?.special_moments?.surprise_details ||
      briefing?.special_moments?.tribute_details ||
      briefing?.special_moments?.special_dance_details
  );

  const mapsUrl = (addr: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBFBF9] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Field Bar */}
      <header className="bg-zinc-950 text-white px-4 py-3 sm:px-6 flex items-center justify-between gap-3 border-b border-zinc-800 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#E5C99B] text-[10px] font-semibold uppercase tracking-wider">
              <Camera className="w-3 h-3" /> Guia de Campo
            </span>
            <span className="text-[11px] text-zinc-400 truncate">
              {formatDate(event.date)} • {event.time}
            </span>
          </div>
          <h2 className="font-serif-brand text-lg sm:text-xl font-medium truncate mt-0.5">
            {event.name}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </header>

      {/* Scrollable Field Content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Quick Actions + Package Scope */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white font-medium">
                {event.type}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E6DFD3] text-[#8B6E3F] font-semibold">
                <PackageIcon className="w-3 h-3 text-[#C5A880]" />
                {event.package_name || packageInfo?.name || 'Personalizado'}
              </span>
              {briefingCtx && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium">
                  {briefingCtx.hasVideo ? (
                    <>
                      <Video className="w-3 h-3 text-[#C5A880]" /> Foto & Vídeo
                    </>
                  ) : (
                    <>
                      <Camera className="w-3 h-3 text-[#C5A880]" /> Somente Foto
                    </>
                  )}
                </span>
              )}
              {briefingCtx?.hasMakingOf && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                  Making Of incluso
                </span>
              )}
            </div>

            {event.addons && event.addons.length > 0 && (
              <div className="text-xs bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-amber-900">
                <strong className="font-semibold">Adicionais contratados: </strong>
                {event.addons.map((a) => a.name).join(' • ')}
              </div>
            )}

            {/* 1-Tap Field Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {mainLocation && (
                <a
                  href={mapsUrl(mainLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900 text-white text-xs font-medium text-center"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Abrir GPS</span>
                </a>
              )}
              {client?.whatsapp && (
                <a
                  href={getWhatsAppUrl(
                    client.whatsapp,
                    `Olá, ${client.name}! Aqui é a equipe da G&C Studio chegando para o seu evento.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-medium text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Cliente</span>
                </a>
              )}
              {mainLocation && (
                <button
                  type="button"
                  onClick={() => onCopyText(mainLocation, 'Endereço copiado!')}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-medium cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Endereço</span>
                </button>
              )}
            </div>
          </div>

          {/* Locais & Horários */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-2.5 text-xs">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
              Locais & Horários ({formatDateFull(event.date)})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Chegada da Equipe
                </span>
                <span className="text-sm font-bold text-zinc-900 font-mono">
                  {briefing?.event_info?.team_arrival_time || event.time}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  {briefingCtx?.copy.receptionLocationLabel || 'Local Principal'}
                </span>
                <span className="font-semibold text-zinc-900 block">{mainLocation}</span>
              </div>
              {briefingCtx?.copy.showCeremonyTimeAndLocation && ceremonyLocation && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Cerimônia ({briefing?.event_info?.ceremony_time || event.time})
                  </span>
                  <span className="font-semibold text-zinc-900 block">{ceremonyLocation}</span>
                </div>
              )}
              {briefingCtx?.hasMakingOf && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-[10px] uppercase tracking-wider text-[#8B6E3F] font-semibold block">
                    Making Of
                  </span>
                  <span className="font-semibold text-zinc-900 block">
                    {makingOfAddress || 'Endereço não preenchido no briefing'}
                  </span>
                </div>
              )}
            </div>

            {event.extra_sessions && event.extra_sessions.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5">
                {event.extra_sessions.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] text-[11px] text-[#8B6E3F]"
                  >
                    <Calendar className="w-3 h-3" />
                    <strong>{s.label}:</strong>{' '}
                    {s.date ? `${formatDate(s.date)} (${s.time || '16:00'})` : 'A definir'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Alertas do Briefing & Restrições de Direção */}
          {(hasAlerts || briefingCtx?.hasEnsaio || briefingCtx?.hasVideo) && (
            <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3 text-xs">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Pontos de Atenção & Direção
              </h3>

              {briefing?.session_info?.body_insecurities && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <strong className="block text-[11px] uppercase tracking-wider text-rose-700 mb-0.5">
                    Ângulos / Partes do corpo a evitar
                  </strong>
                  <span>{briefing.session_info.body_insecurities}</span>
                </div>
              )}

              {briefing?.party_info?.no_photo_moments && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <strong className="block text-[11px] uppercase tracking-wider text-amber-800 mb-0.5">
                    Não fotografar
                  </strong>
                  <span>{briefing.party_info.no_photo_moments}</span>
                </div>
              )}

              {briefingCtx?.hasEnsaio && briefing?.session_info && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-1">
                  <span className="font-semibold text-[#8B6E3F] block">
                    Direção do {briefingCtx.sessionLabel}
                  </span>
                  {briefing.session_info.outfit_changes_details && (
                    <p>
                      <strong className="text-zinc-700">Trocas/Looks:</strong>{' '}
                      {briefing.session_info.outfit_changes_details}
                    </p>
                  )}
                  {briefing.session_info.preferred_poses && (
                    <p>
                      <strong className="text-zinc-700">Poses curtidas:</strong>{' '}
                      {briefing.session_info.preferred_poses}
                    </p>
                  )}
                  {briefing.session_info.avoid_poses && (
                    <p>
                      <strong className="text-zinc-700">Evitar poses:</strong>{' '}
                      {briefing.session_info.avoid_poses}
                    </p>
                  )}
                  {briefing.session_info.props_or_elements && (
                    <p>
                      <strong className="text-zinc-700">Objetos/Pet:</strong>{' '}
                      {briefing.session_info.props_or_elements}
                    </p>
                  )}
                </div>
              )}

              {(briefing?.special_moments?.surprise_details ||
                briefing?.special_moments?.tribute_details ||
                briefing?.special_moments?.special_dance_details) && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  {briefing.special_moments.surprise_details && (
                    <p>
                      <strong className="text-zinc-700">Surpresa:</strong>{' '}
                      {briefing.special_moments.surprise_details}
                    </p>
                  )}
                  {briefing.special_moments.tribute_details && (
                    <p>
                      <strong className="text-zinc-700">Homenagens:</strong>{' '}
                      {briefing.special_moments.tribute_details}
                    </p>
                  )}
                  {briefing.special_moments.special_dance_details && (
                    <p>
                      <strong className="text-zinc-700">Dança / Valsa:</strong>{' '}
                      {briefing.special_moments.special_dance_details}
                    </p>
                  )}
                </div>
              )}

              {briefingCtx?.hasVideo && briefing?.video_info && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="font-semibold text-zinc-900 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-[#C5A880]" /> Vídeo
                  </span>
                  <p>
                    <strong className="text-zinc-700">Cenas essenciais:</strong>{' '}
                    {briefing.video_info.essential_film_moments || 'Nenhuma observação extra'}
                  </p>
                  <p>
                    <strong className="text-zinc-700">Gravar depoimentos:</strong>{' '}
                    {briefing.video_info.record_testimonials ? 'Sim' : 'Não'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fotos Obrigatórias (Marcáveis em Campo) */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                Fotos Obrigatórias
              </h3>
              {requiredPhotos.length > 0 && (
                <span className="text-[11px] font-semibold text-[#8B6E3F]">
                  {donePhotosCount}/{requiredPhotos.length} feitas
                </span>
              )}
            </div>

            {requiredPhotos.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">
                Nenhuma foto obrigatória listada no briefing.
              </p>
            ) : (
              <div className="space-y-2">
                {requiredPhotos.map((rp) => (
                  <button
                    key={rp.id}
                    type="button"
                    onClick={() => onToggleRequiredPhoto(rp.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                      rp.is_done
                        ? 'bg-emerald-50/50 border-emerald-200 text-zinc-500'
                        : 'bg-zinc-50/70 border-zinc-200 text-zinc-900 hover:border-[#C5A880]'
                    }`}
                  >
                    {rp.is_done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <span className={`font-semibold block ${rp.is_done ? 'line-through' : ''}`}>
                        {rp.description}
                      </span>
                      {(rp.people_involved || rp.notes) && (
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          {[rp.people_involved, rp.notes].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pessoas Importantes */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C5A880]" />
              Pessoas Importantes ({briefing?.people?.length || 0})
            </h3>
            {briefing?.people && briefing.people.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {briefing.people.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs"
                  >
                    <div className="font-semibold text-zinc-900">{p.name}</div>
                    <div className="text-[11px] text-[#8B6E3F] font-medium">{p.category}</div>
                    {p.notes && <p className="text-[11px] text-zinc-500 mt-0.5">{p.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                Nenhuma pessoa específica cadastrada no briefing.
              </p>
            )}
          </div>

          {/* Cronograma do Dia */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
              Cronograma do Dia ({timeline.length})
            </h3>
            {timeline.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">Nenhum horário cadastrado ainda.</p>
            ) : (
              <div className="space-y-2">
                {timeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-xs"
                  >
                    <span className="px-2.5 py-1 rounded-lg bg-[#F7F3ED] border border-[#E8DEC8] font-bold font-mono text-[#8B6E3F] shrink-0">
                      {item.time}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-zinc-900 block">{item.title}</span>
                      {(item.location || item.description) && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {item.location ? `${item.location} — ` : ''}
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checklist Rápido "No Evento" */}
          {duringTasks.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-[#EAEAE4] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  Checklist da Cobertura (No Evento)
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  {duringDoneCount}/{duringTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {duringTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onToggleChecklistTask(task.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 text-xs cursor-pointer ${
                      task.is_completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-zinc-500 line-through'
                        : 'bg-white border-zinc-200 text-zinc-900'
                    }`}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-300 shrink-0" />
                    )}
                    <span className="font-medium">{task.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

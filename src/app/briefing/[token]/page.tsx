'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { buildBriefingContext } from '@/lib/briefing-config';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Camera,
  Video,
  Sparkles,
  Send,
  Calendar,
} from 'lucide-react';
import { BriefingPerson, BriefingRequiredPhoto, BriefingSessionInfo } from '@/types';
import { formatDate } from '@/lib/utils';

function BriefingContent() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const { briefings, events, packages, submitBriefing, updateBriefing } = useAppStore();

  const briefing = briefings.find((b) => b.token === token);
  const event = briefing ? events.find((e) => e.id === briefing.event_id) : null;
  const ctx = buildBriefingContext(event, packages);

  const totalSteps = ctx.steps.length;
  const [step, setStep] = useState(briefing?.current_step || 1);
  const safeStep = Math.min(Math.max(1, step), totalSteps);
  const currentStepDef = ctx.steps[safeStep - 1] || ctx.steps[0];

  const [submitted, setSubmitted] = useState(briefing?.status === 'concluido');

  // Form State
  const [eventInfo, setEventInfo] = useState(
    briefing?.event_info || {
      date: event?.date || '',
      ceremony_time: event?.time || '16:30',
      reception_time: event?.time || '18:30',
      ceremony_location: event?.location || '',
      reception_location: event?.location || '',
      making_of_address: '',
      team_arrival_time: '13:00',
      expected_end_time: '02:00',
    }
  );

  const [ceremonyInfo, setCeremonyInfo] = useState(
    briefing?.ceremony_info || {
      type:
        ctx.profile === '15_anos'
          ? 'Tradicional (Valsa & Protocolo)'
          : 'Religiosa com efeito civil',
      celebrant: '',
      parents_entrance: true,
      godparents_entrance: true,
      pages_flower_girls: true,
      special_entrances: '',
      notes: '',
    }
  );

  const [people, setPeople] = useState<BriefingPerson[]>(
    briefing?.people && briefing.people.length > 0 ? briefing.people : []
  );

  const [requiredPhotos, setRequiredPhotos] = useState<BriefingRequiredPhoto[]>(
    briefing?.required_photos && briefing.required_photos.length > 0
      ? briefing.required_photos
      : ctx.defaultRequiredPhotos
  );

  const [specialMoments, setSpecialMoments] = useState(
    briefing?.special_moments || {
      has_surprise: false,
      surprise_details: '',
      has_tribute: false,
      tribute_details: '',
      has_speech: false,
      speech_details: '',
      has_special_dance: false,
      special_dance_details: '',
      attention_moments: '',
    }
  );

  const [partyInfo, setPartyInfo] = useState(
    briefing?.party_info || {
      attractions: '',
      retrospective: false,
      games: '',
      surprise: '',
      no_photo_moments: '',
    }
  );

  const [preferences, setPreferences] = useState(
    briefing?.preferences || {
      photography_favorites: '',
      style: 'misto' as 'espontaneas' | 'posadas' | 'misto',
      references: '',
      dislikes: '',
      notes: '',
    }
  );

  const [videoInfo, setVideoInfo] = useState(
    briefing?.video_info || {
      important_music: '',
      essential_speeches: '',
      talking_people: '',
      essential_film_moments: '',
      record_testimonials: true,
    }
  );

  const [sessionInfo, setSessionInfo] = useState<BriefingSessionInfo>(
    briefing?.session_info || {
      has_outfit_changes: false,
      outfit_changes_details: '',
      body_insecurities: '',
      preferred_poses: '',
      avoid_poses: '',
      props_or_elements: '',
      session_vibe: '',
      notes: '',
    }
  );

  // Helper additions
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonCategory, setNewPersonCategory] = useState(ctx.peopleCategories[0]);
  const [newPersonNotes, setNewPersonNotes] = useState('');

  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoPeople, setNewPhotoPeople] = useState('');
  const [newPhotoNotes, setNewPhotoNotes] = useState('');

  const effectivePersonCategory = ctx.peopleCategories.includes(newPersonCategory)
    ? newPersonCategory
    : ctx.peopleCategories[0];

  if (!briefing) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#EAEAE4] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            ?
          </div>
          <h1 className="font-serif-brand text-2xl font-semibold text-zinc-900">
            Briefing Não Encontrado
          </h1>
          <p className="text-xs text-zinc-500">
            O link informado pode ser inválido. Por favor, confirme o link com a equipe da G&C Studio.
          </p>
        </div>
      </div>
    );
  }

  // Save current step progress
  const saveProgress = (nextStepNumber: number) => {
    const bounded = Math.min(Math.max(1, nextStepNumber), totalSteps);
    updateBriefing(briefing.id, {
      current_step: bounded,
      status: 'em_preenchimento',
      event_info: eventInfo,
      ceremony_info: ceremonyInfo,
      people,
      required_photos: requiredPhotos,
      special_moments: specialMoments,
      party_info: partyInfo,
      preferences,
      video_info: videoInfo,
      session_info: sessionInfo,
    });
    setStep(bounded);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    submitBriefing(briefing.token, {
      current_step: totalSteps,
      event_info: eventInfo,
      ceremony_info: ceremonyInfo,
      people,
      required_photos: requiredPhotos,
      special_moments: specialMoments,
      party_info: partyInfo,
      preferences,
      video_info: videoInfo,
      session_info: sessionInfo,
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1A1A18] selection:bg-[#C5A880]/20 selection:text-[#7A5B30] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-zinc-950 items-center justify-center text-[#C5A880] font-serif-brand font-bold text-xl shadow-md border border-zinc-800">
            G&C
          </div>
          <h2 className="font-serif-brand text-2xl font-semibold text-zinc-900">
            G&C Studio • Briefing Oficial
          </h2>
          <p className="text-xs text-zinc-500">
            {event ? `${event.name} — ${ctx.copy.headerSubtitle}` : 'Planejamento de Cobertura'}
          </p>

          {/* Escopo detectado do evento e pacote */}
          {event && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white font-medium">
                {event.type}
              </span>
              {ctx.packageInfo?.name && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E6DFD3] text-[#8B6E3F] font-medium">
                  {ctx.packageInfo.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-700 font-medium">
                {ctx.hasVideo ? (
                  <>
                    <Video className="w-3 h-3 text-[#C5A880]" /> Foto & Vídeo
                  </>
                ) : (
                  <>
                    <Camera className="w-3 h-3 text-[#C5A880]" /> Fotografia
                  </>
                )}
              </span>
              {ctx.hasMakingOf && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-medium">
                  <Sparkles className="w-3 h-3" /> Making Of incluso
                </span>
              )}
              {ctx.hasEnsaio && ctx.profile !== 'ensaio' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[#8B6E3F] font-medium">
                  <Camera className="w-3 h-3" /> Inclui {ctx.sessionLabel}
                </span>
              )}
            </div>
          )}

          {event?.extra_sessions && event.extra_sessions.length > 0 && (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EAEAE4] text-[11px] text-zinc-600">
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Datas extras no pacote:</span>
              {event.extra_sessions.map((s) => (
                <span key={s.id} className="font-medium text-zinc-800">
                  {s.label}
                  {s.date ? ` (${formatDate(s.date)})` : ' (a definir)'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Success Screen After Submit */}
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAEAE4] shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif-brand text-3xl font-medium text-zinc-900">
                Briefing Enviado com Sucesso!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                A G&C Studio recebeu suas informações e utilizará esses dados para preparar a cobertura do seu evento nos mínimos detalhes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFBF9] border border-[#EAEAE4] text-xs text-zinc-500 max-w-sm mx-auto">
              Nossa equipe entrará em contato caso haja qualquer dúvida sobre a lista de fotos ou cronograma.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EAEAE4] shadow-sm overflow-hidden">
            {/* Progress Bar & Step Counter */}
            <div className="p-4 sm:p-6 border-b border-zinc-100 bg-[#FAF7F2]/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                <span className="uppercase tracking-wider text-[11px] text-[#8B6E3F]">
                  ETAPA {safeStep} DE {totalSteps}
                </span>
                <span className="text-zinc-500 font-medium">
                  {Math.round((safeStep / totalSteps) * 100)}% Concluído
                </span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C5A880] h-full transition-all duration-300 ease-out"
                  style={{ width: `${(safeStep / totalSteps) * 100}%` }}
                />
              </div>

              {/* Etapas ativas para este pacote/evento */}
              <div className="flex sm:flex-wrap gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                {ctx.steps.map((st, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = stepNum === safeStep;
                  const isDone = stepNum < safeStep;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => saveProgress(stepNum)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-[10px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-zinc-900 text-white'
                          : isDone
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                            : 'bg-white text-zinc-500 border border-zinc-200/80 hover:border-zinc-300'
                      }`}
                    >
                      {stepNum}. {st.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Steps */}
            <div className="p-4 sm:p-8 space-y-6">
              {/* ETAPA: INFORMAÇÕES DO EVENTO */}
              {currentStepDef.id === 'event_info' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.dateLabel}
                      </label>
                      <input
                        type="date"
                        value={eventInfo.date}
                        onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.arrivalLabel}
                      </label>
                      <input
                        type="time"
                        value={eventInfo.team_arrival_time}
                        onChange={(e) =>
                          setEventInfo({ ...eventInfo, team_arrival_time: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {ctx.copy.showCeremonyTimeAndLocation && (
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1">
                          {ctx.copy.ceremonyTimeLabel}
                        </label>
                        <input
                          type="time"
                          value={eventInfo.ceremony_time}
                          onChange={(e) =>
                            setEventInfo({ ...eventInfo, ceremony_time: e.target.value })
                          }
                          className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.receptionTimeLabel}
                      </label>
                      <input
                        type="time"
                        value={eventInfo.reception_time}
                        onChange={(e) =>
                          setEventInfo({ ...eventInfo, reception_time: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    {ctx.hasMakingOf && (
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1">
                          {ctx.copy.makingOfLabel}
                        </label>
                        <input
                          type="text"
                          placeholder={ctx.copy.makingOfPlaceholder}
                          value={eventInfo.making_of_address}
                          onChange={(e) =>
                            setEventInfo({ ...eventInfo, making_of_address: e.target.value })
                          }
                          className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                        />
                      </div>
                    )}

                    {ctx.copy.showCeremonyTimeAndLocation && (
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1">
                          {ctx.copy.ceremonyLocationLabel}
                        </label>
                        <input
                          type="text"
                          placeholder={ctx.copy.ceremonyLocationPlaceholder}
                          value={eventInfo.ceremony_location}
                          onChange={(e) =>
                            setEventInfo({ ...eventInfo, ceremony_location: e.target.value })
                          }
                          className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.receptionLocationLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.receptionLocationPlaceholder}
                        value={eventInfo.reception_location}
                        onChange={(e) =>
                          setEventInfo({ ...eventInfo, reception_location: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA: CERIMÔNIA / CERIMONIAL */}
              {currentStepDef.id === 'ceremony' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.ceremonyTypeLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.ceremonyTypePlaceholder}
                        value={ceremonyInfo.type}
                        onChange={(e) => setCeremonyInfo({ ...ceremonyInfo, type: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.celebrantLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.celebrantPlaceholder}
                        value={ceremonyInfo.celebrant}
                        onChange={(e) =>
                          setCeremonyInfo({ ...ceremonyInfo, celebrant: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="font-semibold text-zinc-800 block">
                        {ctx.copy.entourageHeading}
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.parents_entrance}
                          onChange={(e) =>
                            setCeremonyInfo({
                              ...ceremonyInfo,
                              parents_entrance: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>{ctx.copy.parentsEntranceLabel}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.godparents_entrance}
                          onChange={(e) =>
                            setCeremonyInfo({
                              ...ceremonyInfo,
                              godparents_entrance: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>{ctx.copy.godparentsEntranceLabel}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.pages_flower_girls}
                          onChange={(e) =>
                            setCeremonyInfo({
                              ...ceremonyInfo,
                              pages_flower_girls: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>{ctx.copy.pagesFlowerGirlsLabel}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.specialEntrancesLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.specialEntrancesPlaceholder}
                        value={ceremonyInfo.special_entrances}
                        onChange={(e) =>
                          setCeremonyInfo({ ...ceremonyInfo, special_entrances: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.ceremonyNotesLabel}
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Detalhes sobre posicionamento ou regras do local..."
                        value={ceremonyInfo.notes}
                        onChange={(e) =>
                          setCeremonyInfo({ ...ceremonyInfo, notes: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA: DIREÇÃO ESPECÍFICA DE ENSAIO */}
              {currentStepDef.id === 'session' && ctx.hasEnsaio && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Clima do ensaio */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1.5">
                        Qual clima / estilo combina mais com esse ensaio?
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {ctx.copy.sessionVibeOptions.map((vibe) => {
                          const selected = sessionInfo.session_vibe === vibe;
                          return (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() =>
                                setSessionInfo({
                                  ...sessionInfo,
                                  session_vibe: selected ? '' : vibe,
                                })
                              }
                              className={`px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                              }`}
                            >
                              {vibe}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="Ou descreva com suas palavras (ex: leve, ao ar livre, clima editorial...)"
                        value={sessionInfo.session_vibe}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, session_vibe: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {/* Troca de roupas */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F2]/70 border border-[#EAEAE4] space-y-3">
                      <span className="font-medium text-zinc-800 block">
                        {ctx.copy.outfitChangesQuestion}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: true, label: 'Sim, haverá troca de looks' },
                          { val: false, label: 'Não, apenas 1 look' },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            type="button"
                            onClick={() =>
                              setSessionInfo({ ...sessionInfo, has_outfit_changes: opt.val })
                            }
                            className={`p-2.5 rounded-xl border font-medium text-center transition-colors cursor-pointer ${
                              sessionInfo.has_outfit_changes === opt.val
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1">
                          {sessionInfo.has_outfit_changes
                            ? 'Quantas trocas e quais looks/cores vocês pensam em usar?'
                            : 'Descreva o look planejado (cores/estilo para combinarmos com o cenário)'}
                        </label>
                        <input
                          type="text"
                          placeholder={ctx.copy.outfitDetailsPlaceholder}
                          value={sessionInfo.outfit_changes_details}
                          onChange={(e) =>
                            setSessionInfo({
                              ...sessionInfo,
                              outfit_changes_details: e.target.value,
                            })
                          }
                          className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm"
                        />
                      </div>
                    </div>

                    {/* Partes do corpo / ângulos que não gosta */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe alguma parte do corpo, lado do rosto ou ângulo que você NÃO gosta ou prefere evitar nas fotos?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.bodyInsecuritiesPlaceholder}
                        value={sessionInfo.body_insecurities}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, body_insecurities: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {/* Poses preferidas */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Que tipo de poses e direções vocês mais gostam?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.preferredPosesPlaceholder}
                        value={sessionInfo.preferred_poses}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, preferred_poses: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {/* Poses a evitar */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe alguma pose ou ideia que vocês NÃO querem fazer?
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.avoidPosesPlaceholder}
                        value={sessionInfo.avoid_poses}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, avoid_poses: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {/* Acessórios, objetos ou pets */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Vão levar algum acessório especial, objeto ou pet?
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.propsPlaceholder}
                        value={sessionInfo.props_or_elements}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, props_or_elements: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {/* Observações gerais */}
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Mais algum detalhe ou observação para deixar o ensaio confortável?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Tenho um pouco de timidez no começo, prefiro que o fotógrafo dê bastante direção..."
                        value={sessionInfo.notes || ''}
                        onChange={(e) =>
                          setSessionInfo({ ...sessionInfo, notes: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA: PESSOAS IMPORTANTES */}
              {currentStepDef.id === 'people' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      + Adicionar Pessoa Importante
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder={ctx.copy.personNamePlaceholder}
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      />
                      <select
                        value={effectivePersonCategory}
                        onChange={(e) => setNewPersonCategory(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      >
                        {ctx.peopleCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder={ctx.copy.personNotesPlaceholder}
                      value={newPersonNotes}
                      onChange={(e) => setNewPersonNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPersonName.trim()) return;
                        setPeople([
                          ...people,
                          {
                            id: 'p-' + Date.now(),
                            name: newPersonName.trim(),
                            category: effectivePersonCategory,
                            notes: newPersonNotes.trim(),
                          },
                        ]);
                        setNewPersonName('');
                        setNewPersonNotes('');
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium"
                    >
                      Adicionar Pessoa
                    </button>
                  </div>

                  <div className="space-y-2">
                    {people.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">
                        Nenhuma pessoa adicionada ainda. Você pode cadastrar quantas desejar acima.
                      </p>
                    ) : (
                      people.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-zinc-900">{p.name}</span>
                            <span className="ml-2 text-[11px] text-[#8B6E3F] font-medium">
                              • {p.category}
                            </span>
                            {p.notes && <p className="text-zinc-500 mt-0.5">{p.notes}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setPeople(people.filter((item) => item.id !== p.id))}
                            className="p-1 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA: FOTOS QUE NÃO PODEM FALTAR */}
              {currentStepDef.id === 'required_photos' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      + Adicionar Foto Obrigatória
                    </span>
                    <input
                      type="text"
                      placeholder={ctx.copy.photoDescPlaceholder}
                      value={newPhotoDesc}
                      onChange={(e) => setNewPhotoDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder={ctx.copy.photoPeoplePlaceholder}
                        value={newPhotoPeople}
                        onChange={(e) => setNewPhotoPeople(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Observações adicionais"
                        value={newPhotoNotes}
                        onChange={(e) => setNewPhotoNotes(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPhotoDesc.trim()) return;
                        setRequiredPhotos([
                          ...requiredPhotos,
                          {
                            id: 'rp-' + Date.now(),
                            description: newPhotoDesc.trim(),
                            people_involved: newPhotoPeople.trim(),
                            notes: newPhotoNotes.trim(),
                          },
                        ]);
                        setNewPhotoDesc('');
                        setNewPhotoPeople('');
                        setNewPhotoNotes('');
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium"
                    >
                      Adicionar à Lista de Fotos
                    </button>
                  </div>

                  <div className="space-y-2">
                    {requiredPhotos.map((rp) => (
                      <div
                        key={rp.id}
                        className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-zinc-900">{rp.description}</span>
                          {rp.people_involved && (
                            <span className="ml-2 text-[11px] text-[#8B6E3F]">
                              • {rp.people_involved}
                            </span>
                          )}
                          {rp.notes && <p className="text-zinc-500 mt-0.5">{rp.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setRequiredPhotos(requiredPhotos.filter((item) => item.id !== rp.id))
                          }
                          className="p-1 text-zinc-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ETAPA: MOMENTOS ESPECIAIS */}
              {currentStepDef.id === 'special_moments' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe alguma surpresa planejada?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.surprisePlaceholder}
                        value={specialMoments.surprise_details}
                        onChange={(e) =>
                          setSpecialMoments({
                            ...specialMoments,
                            surprise_details: e.target.value,
                            has_surprise: Boolean(e.target.value),
                          })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Haverá homenagens no telão ou presentes?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.tributePlaceholder}
                        value={specialMoments.tribute_details}
                        onChange={(e) =>
                          setSpecialMoments({
                            ...specialMoments,
                            tribute_details: e.target.value,
                            has_tribute: Boolean(e.target.value),
                          })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.speechLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.speechPlaceholder}
                        value={specialMoments.speech_details}
                        onChange={(e) =>
                          setSpecialMoments({
                            ...specialMoments,
                            speech_details: e.target.value,
                            has_speech: Boolean(e.target.value),
                          })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    {ctx.profile !== 'corporativo' && (
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1">
                          {ctx.copy.danceLabel}
                        </label>
                        <input
                          type="text"
                          placeholder={ctx.copy.dancePlaceholder}
                          value={specialMoments.special_dance_details}
                          onChange={(e) =>
                            setSpecialMoments({
                              ...specialMoments,
                              special_dance_details: e.target.value,
                              has_special_dance: Boolean(e.target.value),
                            })
                          }
                          className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA: DINÂMICA DA FESTA */}
              {currentStepDef.id === 'party' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.attractionsLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.attractionsPlaceholder}
                        value={partyInfo.attractions}
                        onChange={(e) =>
                          setPartyInfo({ ...partyInfo, attractions: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.gamesLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.gamesPlaceholder}
                        value={partyInfo.games}
                        onChange={(e) => setPartyInfo({ ...partyInfo, games: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe algum momento que NÃO querem que seja fotografado?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.noPhotoPlaceholder}
                        value={partyInfo.no_photo_moments}
                        onChange={(e) =>
                          setPartyInfo({ ...partyInfo, no_photo_moments: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA: PREFERÊNCIAS FOTOGRÁFICAS */}
              {currentStepDef.id === 'preferences' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        O que vocês mais amam em fotografia?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Momentos espontâneos, detalhes da decoração, iluminação quente..."
                        value={preferences.photography_favorites}
                        onChange={(e) =>
                          setPreferences({ ...preferences, photography_favorites: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Estilo predominante preferido:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'espontaneas', label: '100% Espontâneo' },
                          { id: 'misto', label: 'Equilibrado (Misto)' },
                          { id: 'posadas', label: 'Mais Posadas' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() =>
                              setPreferences({
                                ...preferences,
                                style: st.id as 'espontaneas' | 'posadas' | 'misto',
                              })
                            }
                            className={`p-3 rounded-xl border font-medium text-center transition-colors ${
                              preferences.style === st.id
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe algo que NÃO gostam em fotos?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Não gosto de poses forçadas, flash direto sem difusor, etc."
                        value={preferences.dislikes}
                        onChange={(e) =>
                          setPreferences({ ...preferences, dislikes: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA: VÍDEO & CINEMATOGRAFIA (somente se o pacote/evento inclui vídeo) */}
              {currentStepDef.id === 'video' && ctx.hasVideo && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      {currentStepDef.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">{currentStepDef.subtitle}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        {ctx.copy.musicLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={ctx.copy.musicPlaceholder}
                        value={videoInfo.important_music}
                        onChange={(e) =>
                          setVideoInfo({ ...videoInfo, important_music: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe algum momento que é ESSENCIAL estar no vídeo?
                      </label>
                      <textarea
                        rows={2}
                        placeholder={ctx.copy.essentialFilmPlaceholder}
                        value={videoInfo.essential_film_moments}
                        onChange={(e) =>
                          setVideoInfo({
                            ...videoInfo,
                            essential_film_moments: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={videoInfo.record_testimonials}
                          onChange={(e) =>
                            setVideoInfo({
                              ...videoInfo,
                              record_testimonials: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span className="font-medium text-zinc-800">
                          {ctx.copy.testimonialsLabel}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Bottom Controls */}
            <div className="p-6 border-t border-zinc-100 bg-[#FAF7F2]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex gap-2 w-full sm:w-auto">
                {safeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => saveProgress(safeStep - 1)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => saveProgress(safeStep)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-medium"
                >
                  Salvar rascunho
                </button>
              </div>

              {safeStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => saveProgress(safeStep + 1)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Briefing Finalizado</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-zinc-400">
          G&C Studio • Todas as respostas são salvas automaticamente com segurança.
        </div>
      </div>
    </div>
  );
}

export default function PublicBriefingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando briefing...
        </div>
      }
    >
      <BriefingContent />
    </React.Suspense>
  );
}

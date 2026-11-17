'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Camera,
  Video,
  Music,
  Users,
  Check,
  Send,
} from 'lucide-react';
import { BriefingPerson, BriefingRequiredPhoto } from '@/types';

function BriefingContent() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const { briefings, events, submitBriefing, updateBriefing } = useAppStore();

  const briefing = briefings.find((b) => b.token === token);
  const event = briefing ? events.find((e) => e.id === briefing.event_id) : null;

  const [step, setStep] = useState(briefing?.current_step || 1);
  const [submitted, setSubmitted] = useState(briefing?.status === 'concluido');

  // Form State
  const [eventInfo, setEventInfo] = useState(
    briefing?.event_info || {
      date: event?.date || '',
      ceremony_time: event?.time || '16:30',
      reception_time: '18:30',
      ceremony_location: event?.location || '',
      reception_location: event?.location || '',
      making_of_address: '',
      team_arrival_time: '13:00',
      expected_end_time: '02:00',
    }
  );

  const [ceremonyInfo, setCeremonyInfo] = useState(
    briefing?.ceremony_info || {
      type: 'Religiosa com efeito civil',
      celebrant: '',
      parents_entrance: true,
      godparents_entrance: true,
      pages_flower_girls: true,
      special_entrances: '',
      notes: '',
    }
  );

  const [people, setPeople] = useState<BriefingPerson[]>(
    briefing?.people || [
      { id: 'p1', name: '', category: 'Pais da noiva', notes: '' },
    ]
  );

  const [requiredPhotos, setRequiredPhotos] = useState<BriefingRequiredPhoto[]>(
    briefing?.required_photos || [
      { id: 'rp1', description: 'Foto com os pais no altar', people_involved: 'Pais', notes: '' },
      { id: 'rp2', description: 'Foto com padrinhos e madrinhas', people_involved: 'Padrinhos', notes: '' },
    ]
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

  // Helper additions
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonCategory, setNewPersonCategory] = useState('Pais da noiva');
  const [newPersonNotes, setNewPersonNotes] = useState('');

  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoPeople, setNewPhotoPeople] = useState('');
  const [newPhotoNotes, setNewPhotoNotes] = useState('');

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
    updateBriefing(briefing.id, {
      current_step: nextStepNumber,
      status: 'em_preenchimento',
      event_info: eventInfo,
      ceremony_info: ceremonyInfo,
      people,
      required_photos: requiredPhotos,
      special_moments: specialMoments,
      party_info: partyInfo,
      preferences,
      video_info: videoInfo,
    });
    setStep(nextStepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    submitBriefing(briefing.token, {
      event_info: eventInfo,
      ceremony_info: ceremonyInfo,
      people,
      required_photos: requiredPhotos,
      special_moments: specialMoments,
      party_info: partyInfo,
      preferences,
      video_info: videoInfo,
    });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1A1A18] selection:bg-[#C5A880]/20 selection:text-[#7A5B30] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-zinc-950 items-center justify-center text-[#C5A880] font-serif-brand font-bold text-xl shadow-md border border-zinc-800">
            G&C
          </div>
          <h2 className="font-serif-brand text-2xl font-semibold text-zinc-900">
            G&C Studio • Briefing Oficial
          </h2>
          <p className="text-xs text-zinc-500">
            {event ? `${event.name} — Cobertura Audiovisual` : 'Planejamento de Cobertura'}
          </p>
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
            <div className="p-6 border-b border-zinc-100 bg-[#FAF7F2]/60">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 mb-2">
                <span className="uppercase tracking-wider text-[11px] text-[#8B6E3F]">
                  ETAPA {step} DE 8
                </span>
                <span className="text-zinc-500 font-medium">
                  {Math.round((step / 8) * 100)}% Concluído
                </span>
              </div>
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#C5A880] h-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Steps */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* ETAPA 1 — INFORMAÇÕES DO EVENTO */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Informações do Evento
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Horários e locais previstos para a equipe de foto e vídeo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">Data do Evento</label>
                      <input
                        type="date"
                        value={eventInfo.date}
                        onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Horário de Chegada da Equipe
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
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Horário da Cerimônia
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
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Horário da Recepção / Festa
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
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Endereço do Making Of
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Hotel Fasano - Rua Vitório Fasano, 88"
                        value={eventInfo.making_of_address}
                        onChange={(e) =>
                          setEventInfo({ ...eventInfo, making_of_address: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Local da Cerimônia
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Paróquia Nossa Senhora do Brasil"
                        value={eventInfo.ceremony_location}
                        onChange={(e) =>
                          setEventInfo({ ...eventInfo, ceremony_location: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Local da Recepção
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Casa Bisutti"
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

              {/* ETAPA 2 — CERIMÔNIA */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Detalhes da Cerimônia
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Entradas, celebrante e dinâmica do cortejo.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">Tipo de Cerimônia</label>
                      <input
                        type="text"
                        placeholder="Ex: Religiosa, Ecumênica, Civil no local, etc."
                        value={ceremonyInfo.type}
                        onChange={(e) => setCeremonyInfo({ ...ceremonyInfo, type: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">Quem celebrará?</label>
                      <input
                        type="text"
                        placeholder="Ex: Padre Michelino / Pastor Paulo / Amigo da família"
                        value={ceremonyInfo.celebrant}
                        onChange={(e) =>
                          setCeremonyInfo({ ...ceremonyInfo, celebrant: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="font-semibold text-zinc-800 block">Cortejo de Entradas:</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.parents_entrance}
                          onChange={(e) =>
                            setCeremonyInfo({ ...ceremonyInfo, parents_entrance: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>Haverá entrada dos pais?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.godparents_entrance}
                          onChange={(e) =>
                            setCeremonyInfo({ ...ceremonyInfo, godparents_entrance: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>Haverá entrada de padrinhos?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ceremonyInfo.pages_flower_girls}
                          onChange={(e) =>
                            setCeremonyInfo({ ...ceremonyInfo, pages_flower_girls: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-[#C5A880]"
                        />
                        <span>Haverá pajens / daminhas?</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existem entradas especiais?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Avó trazendo as alianças, pet na cerimônia, etc."
                        value={ceremonyInfo.special_entrances}
                        onChange={(e) =>
                          setCeremonyInfo({ ...ceremonyInfo, special_entrances: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Observações da Cerimônia
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

              {/* ETAPA 3 — PESSOAS IMPORTANTES */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Pessoas Importantes
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Avós, pais, padrinhos ou amigos próximos que devem ter atenção especial da equipe.
                    </p>
                  </div>

                  {/* Add person form */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      + Adicionar Pessoa Importante
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome da pessoa (ex: Avó Maria)"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      />
                      <select
                        value={newPersonCategory}
                        onChange={(e) => setNewPersonCategory(e.target.value)}
                        className="p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                      >
                        <option value="Pais da noiva">Pais da noiva</option>
                        <option value="Pais do noivo">Pais do noivo</option>
                        <option value="Padrinhos">Padrinhos</option>
                        <option value="Avós">Avós</option>
                        <option value="Irmãos">Irmãos</option>
                        <option value="Filhos">Filhos</option>
                        <option value="Amigos">Amigos</option>
                        <option value="Outras pessoas">Outras pessoas</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Observação (ex: Precisa aparecer bastante nas fotos / mobilidade reduzida)"
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
                            category: newPersonCategory,
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

                  {/* List of registered people */}
                  <div className="space-y-2">
                    {people.map((p) => (
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
                    ))}
                  </div>
                </div>
              )}

              {/* ETAPA 4 — FOTOS QUE NÃO PODEM FALTAR */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Fotos Que Não Podem Faltar
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Fotos protocolares, com a família, amigos ou poses que você faz questão absoluta.
                    </p>
                  </div>

                  {/* Add Photo Form */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
                    <span className="font-semibold text-zinc-800 block">
                      + Adicionar Foto Obrigatória
                    </span>
                    <input
                      type="text"
                      placeholder="Descrição (ex: Foto com os 12 casais de padrinhos no altar)"
                      value={newPhotoDesc}
                      onChange={(e) => setNewPhotoDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 text-zinc-900 bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Pessoas envolvidas (ex: Padrinhos / Família)"
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

                  {/* List of registered photos */}
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

              {/* ETAPA 5 — MOMENTOS ESPECIAIS */}
              {step === 5 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Momentos Especiais & Surpresas
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Avise nossa equipe com antecedência para prepararmos a melhor posição de câmera e luz.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe alguma surpresa planejada?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: O noivo tocará saxofone, entrada surpresa de alguém especial..."
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
                        placeholder="Descreva se haverá vídeo, entrega de buquê, etc."
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
                        Haverá discursos durante o brinde ou jantar?
                      </label>
                      <input
                        type="text"
                        placeholder="Quem fará discurso?"
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

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Haverá dança coreografada especial?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Valsa coreografada com os padrinhos / dança divertida"
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
                  </div>
                </div>
              )}

              {/* ETAPA 6 — FESTA */}
              {step === 6 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Dinâmica da Festa
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Atrações musicais, brincadeiras e momentos que NÃO devem ser fotografados.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Haverá atrações na festa? (Bandas, DJs convidados, robô de LED, etc.)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Banda de rock às 23h e escola de samba à 01h"
                        value={partyInfo.attractions}
                        onChange={(e) =>
                          setPartyInfo({ ...partyInfo, attractions: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Brincadeiras da festa (Buquê com fitas, hora do sapato, gravata)
                      </label>
                      <input
                        type="text"
                        placeholder="Descreva as brincadeiras previstas"
                        value={partyInfo.games}
                        onChange={(e) => setPartyInfo({ ...partyInfo, games: e.target.value })}
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe algum momento que vocês NÃO querem que seja fotografado?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Evitar fotos dos convidados comendo no buffet / momentos de descanso"
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

              {/* ETAPA 7 — PREFERÊNCIAS FOTOGRÁFICAS */}
              {step === 7 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Preferências Fotográficas
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Alinhe a linguagem estética das suas fotos com a nossa equipe.
                    </p>
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
                      <div className="grid grid-cols-3 gap-2">
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
                        Existe algo que vocês NÃO gostam em fotos de eventos?
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

              {/* ETAPA 8 — VÍDEO & CINEMATOGRAFIA */}
              {step === 8 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif-brand text-2xl font-medium text-zinc-900">
                      Direção de Vídeo & Cinema
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Músicas marcantes, discursos essenciais e narrativa do seu filme.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe alguma música muito importante na história de vocês?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Nome da música e artista especial"
                        value={videoInfo.important_music}
                        onChange={(e) =>
                          setVideoInfo({ ...videoInfo, important_music: e.target.value })
                        }
                        className="w-full p-3 rounded-xl border border-zinc-200 text-zinc-900 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Existe algum momento que é ESSENCIAL estar no teaser e filme completo?
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: O abraço emocionado com a avó, os votos do noivo, etc."
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
                          Gostariam que nossa equipe gravasse depoimentos rápidos de amigos e pais durante a festa?
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Bottom Controls (Item 34) */}
            <div className="p-6 border-t border-zinc-100 bg-[#FAF7F2]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex gap-2 w-full sm:w-auto">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => saveProgress(step - 1)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => saveProgress(step)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-xs font-medium"
                >
                  Salvar rascunho
                </button>
              </div>

              {step < 8 ? (
                <button
                  type="button"
                  onClick={() => saveProgress(step + 1)}
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

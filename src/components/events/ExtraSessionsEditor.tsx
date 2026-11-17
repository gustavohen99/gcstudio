'use client';

import React from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { EventExtraSession } from '@/types';

interface ExtraSessionsEditorProps {
  sessions: EventExtraSession[];
  onChange: (next: EventExtraSession[]) => void;
  suggestedLabels?: string[];
}

export const ExtraSessionsEditor: React.FC<ExtraSessionsEditorProps> = ({
  sessions,
  onChange,
  suggestedLabels = [],
}) => {
  const createSession = (label: string): EventExtraSession => ({
    id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label,
    date: '',
    time: '16:00',
    location: '',
  });

  const handleAdd = (label = '') => {
    onChange([...sessions, createSession(label)]);
  };

  const handleUpdate = (id: string, field: keyof EventExtraSession, val: string) => {
    onChange(sessions.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const handleRemove = (id: string) => {
    onChange(sessions.filter((s) => s.id !== id));
  };

  const missingSuggestions = suggestedLabels.filter(
    (lbl) => !sessions.some((s) => s.label.trim().toLowerCase() === lbl.trim().toLowerCase())
  );

  return (
    <div className="p-3.5 rounded-2xl bg-[#FBFBF9] border border-[#EAEAE4] space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
          Datas Extras na Agenda (Civil, Pré-Wedding, Ensaio)
        </span>
        <button
          type="button"
          onClick={() => handleAdd('')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 hover:border-[#C5A880] text-zinc-800 font-medium text-[11px] cursor-pointer transition-colors"
        >
          <Plus className="w-3 h-3 text-[#C5A880]" />
          <span>Adicionar data extra</span>
        </button>
      </div>

      {missingSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-500">Sugeridos pelo pacote:</span>
          {missingSuggestions.map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => handleAdd(lbl)}
              className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[#8B6E3F] hover:bg-amber-100 text-[11px] font-medium cursor-pointer transition-colors"
            >
              + {lbl}
            </button>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-[11px] text-zinc-400">
          Opcional: marque datas e locais separados para Pré-Wedding, Casamento no Civil ou Ensaio Externo aparecerem na agenda.
        </p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
            >
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Etapa / Sessão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pré-Wedding"
                  value={s.label}
                  onChange={(e) => handleUpdate(s.id, 'label', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Data (opcional)
                </label>
                <input
                  type="date"
                  value={s.date}
                  onChange={(e) => handleUpdate(s.id, 'date', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Horário
                </label>
                <input
                  type="time"
                  value={s.time}
                  onChange={(e) => handleUpdate(s.id, 'time', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-medium text-zinc-500 mb-0.5">
                  Local
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parque Barigui"
                  value={s.location}
                  onChange={(e) => handleUpdate(s.id, 'location', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900 focus:outline-hidden focus:border-[#C5A880]"
                />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemove(s.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remover data extra"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

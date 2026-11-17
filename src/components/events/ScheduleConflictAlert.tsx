'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { AgendaConflict, formatDate } from '@/lib/utils';

interface ScheduleConflictAlertProps {
  conflicts: AgendaConflict[];
  date?: string;
  compact?: boolean;
  linkToEvent?: boolean;
}

export const ScheduleConflictAlert: React.FC<ScheduleConflictAlertProps> = ({
  conflicts,
  date,
  compact = false,
  linkToEvent = true,
}) => {
  if (!conflicts || conflicts.length === 0) return null;

  const hasTimeClash = conflicts.some((c) => c.timeOverlap);

  return (
    <div
      className={`rounded-xl border ${
        compact ? 'p-2.5 text-[11px]' : 'p-3 text-xs'
      } space-y-1.5 ${
        hasTimeClash
          ? 'bg-rose-50/90 border-rose-200 text-rose-900'
          : 'bg-amber-50/90 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        <AlertTriangle
          className={`w-3.5 h-3.5 shrink-0 ${hasTimeClash ? 'text-rose-600' : 'text-amber-600'}`}
        />
        <span>
          {hasTimeClash
            ? `Conflito de horário detectado${date ? ` em ${formatDate(date)}` : ''}!`
            : `Já existe compromisso neste dia${date ? ` (${formatDate(date)})` : ''}:`}
        </span>
      </div>

      <div className="space-y-1 pl-5">
        {conflicts.map((c) => (
          <div key={c.key} className="flex items-center justify-between gap-2 flex-wrap">
            <span className="leading-snug">
              <strong>{c.label}</strong> •{' '}
              <span className="inline-flex items-center gap-0.5 font-mono">
                <Clock className="w-3 h-3 inline" /> {c.time}
              </span>
              {c.location ? ` (${c.location})` : ''}
            </span>
            {linkToEvent && c.event?.id && (
              <Link
                href={`/eventos/${c.event.id}`}
                target="_blank"
                className="inline-flex items-center gap-0.5 underline font-medium opacity-85 hover:opacity-100 shrink-0"
              >
                Abrir <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';

/**
 * Retorna a data de hoje (YYYY-MM-DD, fuso local) apenas no navegador.
 * Durante o pré-render (build) retorna null, pois o Next.js com
 * Cache Components não permite ler a hora atual na renderização.
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setToday(`${y}-${m}-${d}`);
  }, []);

  return today;
}

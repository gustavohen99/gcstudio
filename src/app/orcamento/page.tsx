'use client';

import React, { Suspense } from 'react';
import { useAppStore } from '@/lib/store';
import { EditorialProposalView } from '@/components/proposal/EditorialProposalView';

function ProposalDirectContent() {
  const { quotes } = useAppStore();
  // Use first quote or demo
  const sampleQuote = quotes[0];

  return <EditorialProposalView quote={sampleQuote} />;
}

export default function GeneralProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0C0B] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando proposta comercial...
        </div>
      }
    >
      <ProposalDirectContent />
    </Suspense>
  );
}

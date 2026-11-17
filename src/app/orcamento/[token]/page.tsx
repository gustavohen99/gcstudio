'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { EditorialProposalView } from '@/components/proposal/EditorialProposalView';

function ProposalTokenContent() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const { quotes } = useAppStore();
  const quote = quotes.find((q) => q.token === token);

  return <EditorialProposalView quote={quote} />;
}

export default function PublicProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0C0B] flex items-center justify-center p-6 text-zinc-400 text-xs">
          Carregando proposta comercial...
        </div>
      }
    >
      <ProposalTokenContent />
    </Suspense>
  );
}

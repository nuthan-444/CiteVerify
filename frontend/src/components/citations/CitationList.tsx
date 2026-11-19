import React from 'react';
import { CitationCard } from './CitationCard';
import type { Citation } from '../../types';
import { BookMarked } from 'lucide-react';

interface CitationListProps {
  citations: Citation[];
}

export const CitationList: React.FC<CitationListProps> = ({ citations }) => {
  if (citations.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <BookMarked className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">No citations retrieved yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {citations.map((c) => (
        <CitationCard key={c.id} citation={c} />
      ))}
    </div>
  );
};

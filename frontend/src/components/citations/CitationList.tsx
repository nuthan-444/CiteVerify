import React from 'react';
import { CitationCard } from './CitationCard';
import type { Citation } from '../../types';
import { BookMarked } from 'lucide-react';
import { CitationCardSkeleton } from '../ui/Skeleton';
import { useStaggerIn } from '../../hooks/usePageEntrance';

interface CitationListProps {
  citations: Citation[];
  isLoading?: boolean;
}

export const CitationList: React.FC<CitationListProps> = ({ citations, isLoading }) => {
  const listRef = useStaggerIn(0.06, 0.05);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CitationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (citations.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
        <BookMarked className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
        <p className="text-xs text-neutral-500">No citations retrieved yet.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {citations.map((c) => (
        <CitationCard key={c.id} citation={c} />
      ))}
    </div>
  );
};

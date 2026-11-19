import React, { useState } from 'react';
import { ClaimCard } from './ClaimCard';
import type { Claim } from '../../types';
import { Filter, Search } from 'lucide-react';
import { ClaimCardSkeleton } from '../ui/Skeleton';
import { useStaggerIn } from '../../hooks/usePageEntrance';

interface ClaimListProps {
  claims: Claim[];
  isLoading?: boolean;
}

export const ClaimList: React.FC<ClaimListProps> = ({ claims, isLoading }) => {
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useStaggerIn(0.06, 0.05);

  const filtered = claims.filter((claim) => {
    const matchesFilter =
      filterVerdict === 'all' ||
      claim.verification?.verdict === filterVerdict ||
      (!claim.verification && filterVerdict === 'unverified');

    const matchesSearch =
      claim.claim_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (claim.citation_marker && claim.citation_marker.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search claims or citations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="flex-1 sm:flex-initial text-xs border border-neutral-300 rounded-lg px-2.5 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black cursor-pointer"
          >
            <option value="all">All Verdicts ({claims.length})</option>
            <option value="supported">Supported</option>
            <option value="contradicted">Contradicted</option>
            <option value="insufficient_evidence">Insufficient Evidence</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <ClaimCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 sm:p-8 text-center text-xs text-neutral-500 bg-white rounded-xl border border-neutral-200">
          No claims matched your search or filter.
        </div>
      ) : (
        <div ref={listRef} className="space-y-3">
          {filtered.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
};

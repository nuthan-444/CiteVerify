import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Claim } from '../../types';
import { VerdictBadge } from '../verification/VerdictBadge';
import { EvidencePanel } from '../verification/EvidencePanel';

interface ClaimCardProps {
  claim: Claim;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs hover:border-neutral-400 transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {claim.page_number && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
              Page {claim.page_number}
            </span>
          )}
          {claim.section && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
              {claim.section}
            </span>
          )}
          {claim.citation_marker && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-black border border-neutral-300">
              {claim.citation_marker}
            </span>
          )}
        </div>

        <VerdictBadge verdict={claim.verification?.verdict} size="sm" />
      </div>

      <p className="text-sm font-medium text-neutral-900 leading-relaxed">
        {claim.claim_text}
      </p>

      {claim.verification && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-black hover:underline transition-all cursor-pointer"
          >
            {expanded ? (
              <>
                Hide Evidence & Reasoning <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                View Verification Evidence <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-3">
              <EvidencePanel verification={claim.verification} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

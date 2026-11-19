import React from 'react';
import { Quote } from 'lucide-react';
import type { VerificationResult } from '../../types';

interface EvidencePanelProps {
  verification: VerificationResult;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ verification }) => {
  return (
    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
          <Quote className="w-3.5 h-3.5 text-black" />
          Evidence Traceability
        </span>
        {verification.evidence_page && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-neutral-800 border border-neutral-300">
            Page {verification.evidence_page}
          </span>
        )}
      </div>

      {verification.evidence_text ? (
        <blockquote className="text-xs text-neutral-800 italic border-l-2 border-black pl-3 py-1 bg-white rounded-r">
          "{verification.evidence_text}"
        </blockquote>
      ) : (
        <p className="text-xs text-neutral-400 italic">No specific direct quote matched.</p>
      )}

      {verification.reasoning && (
        <div className="pt-2 border-t border-neutral-200">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Reasoning Chain
          </p>
          <p className="text-xs text-neutral-800 leading-relaxed">{verification.reasoning}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
        <span>Confidence: {Math.round((verification.confidence || 0) * 100)}%</span>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { getVerdictColor } from '../../lib/utils';

interface VerdictBadgeProps {
  verdict?: 'supported' | 'contradicted' | 'insufficient_evidence' | string;
  size?: 'sm' | 'md';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict = 'insufficient_evidence',
  size = 'md',
}) => {
  const getIcon = () => {
    switch (verdict) {
      case 'supported':
        return <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'contradicted':
        return <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      default:
        return <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    }
  };

  const getLabel = () => {
    switch (verdict) {
      case 'supported':
        return 'Supported';
      case 'contradicted':
        return 'Contradicted';
      case 'insufficient_evidence':
        return 'Insufficient Evidence';
      default:
        return 'Unverified';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${getVerdictColor(
        verdict
      )} ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'}`}
    >
      {getIcon()}
      {getLabel()}
    </span>
  );
};

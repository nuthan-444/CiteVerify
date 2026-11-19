import React from 'react';
import { getTrustScoreColor, getTrustScoreLabel } from '../../lib/utils';

interface TrustScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TrustScore: React.FC<TrustScoreProps> = ({ score, size = 'md' }) => {
  // Normalize score: if received as 0.0-1.0 float, scale to 0-100 percentage
  const normalizedScore =
    score <= 1.0 && score > 0
      ? Math.round(score * 100)
      : Math.max(0, Math.min(100, Math.round(score || 0)));

  const color = getTrustScoreColor(normalizedScore);
  const label = getTrustScoreLabel(normalizedScore);

  const radius = size === 'lg' ? 42 : size === 'md' ? 32 : 22;
  const stroke = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={radius * 2 + stroke * 2}
          height={radius * 2 + stroke * 2}
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke="#e5e5e5"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span
          className={`absolute font-bold text-black ${
            size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-xs'
          }`}
        >
          {normalizedScore}%
        </span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Trust Score
        </p>
        <h4 className="text-sm font-bold text-black">
          {label}
        </h4>
      </div>
    </div>
  );
};

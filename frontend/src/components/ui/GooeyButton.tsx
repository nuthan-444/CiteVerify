import React, { useId } from 'react';
import { Link } from 'react-router-dom';

export type GooeyButtonVariant = 'dark' | 'light';

export interface GooeyButtonProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: GooeyButtonVariant;
  gooeyBlur?: number;
  className?: string;
}

export const GooeyButton: React.FC<GooeyButtonProps> = ({
  to,
  children,
  icon,
  variant = 'dark',
  gooeyBlur = 8,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  const isDark = variant === 'dark';

  // Dark variant: black pill + white icon bubble
  // Light variant: white pill + black icon bubble (with border)
  const pillBg = isDark ? '#0a0a0a' : '#ffffff';
  const pillText = isDark ? '#ffffff' : '#0a0a0a';
  const bubbleBg = isDark ? '#2a2a2a' : '#0a0a0a';
  const bubbleText = '#ffffff';
  const borderStyle = !isDark ? '1px solid #d4d4d4' : 'none';

  return (
    <div className={`gooey-btn-root ${className}`}>
      {/* SVG filter — unique id per instance */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={`gbtn-${uid}`} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Filter wrapper — the two children merge together */}
      <div
        className="gooey-btn-filter-wrap"
        style={{ filter: `url(#gbtn-${uid})` }}
      >
        {/* Main text pill */}
        <Link
          to={to}
          className="gooey-btn-pill"
          style={{
            backgroundColor: pillBg,
            color: pillText,
            border: borderStyle,
          }}
        >
          {children}
        </Link>

        {/* Merged icon bubble */}
        {icon && (
          <div
            className="gooey-btn-bubble"
            style={{
              backgroundColor: bubbleBg,
              color: bubbleText,
              border: borderStyle,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

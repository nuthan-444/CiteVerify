import React, { useRef, useState, useId } from 'react';
import { Search, X } from 'lucide-react';

export interface GooeyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  gooeyBlur?: number;
  className?: string;
}

export const GooeyInput: React.FC<GooeyInputProps> = ({
  value,
  onChange,
  placeholder = 'Search past audits...',
  gooeyBlur = 5,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterId = useId().replace(/:/g, '');

  const isOpen = isFocused || Boolean(value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Hidden SVG Filter for the Liquid Gooey Effect */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`gooey-search-${filterId}`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative flex items-center h-8 cursor-text"
      >
        {/* Layer 1: Gooey Liquid Background Shapes (Filter is applied ONLY here so text stays crisp) */}
        <div
          className="absolute inset-0 flex items-center pointer-events-none overflow-visible"
          style={{ filter: `url(#gooey-search-${filterId})` }}
        >
          {/* Expanding / Morphing Pill Background */}
          <div
            className={`h-7 rounded-full bg-black transition-all duration-300 ease-out ${
              isOpen ? 'w-full' : 'w-24'
            }`}
            style={{
              // Slight overlap with the bubble to create the liquid goo bridge
              marginRight: '-10px',
            }}
          />

          {/* Liquid Bubble merged on the right edge */}
          <div className="w-7 h-7 rounded-full bg-black shrink-0 transition-transform duration-200" />
        </div>

        {/* Layer 2: Razor-Sharp Foreground (Text & Icons - NO filter applied) */}
        <div className="relative z-10 flex items-center justify-between w-full h-full px-2.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isOpen ? placeholder : 'Search...'}
              className="w-full bg-transparent border-none outline-none text-white text-xs placeholder:text-neutral-400 font-medium tracking-tight pr-1"
            />
          </div>

          {/* Action icon on right: Clear (X) if text present, or subtle dot indicator */}
          <div className="shrink-0 flex items-center justify-center w-5 h-5">
            {value ? (
              <button
                type="button"
                onClick={handleClear}
                className="w-4 h-4 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

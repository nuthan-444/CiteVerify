import React, { useEffect, useState, useRef } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export type LatticePattern = 'orbit' | 'snake' | 'sweep' | 'pulse' | 'ripple' | 'spin';
export type LatticeShape = 'round' | 'square';
export type LatticeStatus = 'loading' | 'done' | 'error';

export interface LatticeLoaderProps {
  grid?: 3 | 4;
  pattern?: LatticePattern;
  shape?: LatticeShape;
  color?: string;
  cellSize?: number;
  gap?: number;
  step?: number;
  status?: LatticeStatus;
  label?: string;
  showTimer?: boolean;
  className?: string;
}

export const LatticeLoader: React.FC<LatticeLoaderProps> = ({
  grid = 3,
  pattern = 'orbit',
  shape = 'round',
  color = '#000000',
  cellSize = 6,
  gap = 3,
  step = 85,
  status = 'loading',
  label,
  showTimer = false,
  className = '',
}) => {
  const totalCells = grid * grid;
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Elapsed stopwatch timer
  useEffect(() => {
    if (status !== 'loading') return;
    startTimeRef.current = Date.now();
    const timerInterval = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
    return () => clearInterval(timerInterval);
  }, [status]);

  // Sequence definitions for 3x3 and 4x4
  const getSequence = (): number[][] => {
    if (grid === 3) {
      switch (pattern) {
        case 'orbit':
          // Perimeter: 0 -> 1 -> 2 -> 5 -> 8 -> 7 -> 6 -> 3
          return [[0], [1], [2], [5], [8], [7], [6], [3]];
        case 'snake':
          return [[0], [1], [2], [5], [4], [3], [6], [7], [8]];
        case 'sweep':
          // Columns
          return [[0, 3, 6], [1, 4, 7], [2, 5, 8], [1, 4, 7]];
        case 'pulse':
          // Center -> Cardinal -> Diagonal
          return [[4], [1, 3, 5, 7], [0, 2, 6, 8]];
        case 'spin':
          return [[1, 7], [2, 6], [5, 3], [8, 0]];
        case 'ripple':
          return [[0], [1, 3], [2, 4, 6], [5, 7], [8]];
        default:
          return [[0], [1], [2], [5], [8], [7], [6], [3]];
      }
    } else {
      // 4x4 grid
      switch (pattern) {
        case 'orbit':
          return [
            [0], [1], [2], [3],
            [7], [11], [15],
            [14], [13], [12],
            [8], [4]
          ];
        case 'sweep':
          return [
            [0, 4, 8, 12],
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15]
          ];
        case 'pulse':
          return [
            [5, 6, 9, 10],
            [1, 2, 4, 7, 8, 11, 13, 14],
            [0, 3, 12, 15]
          ];
        default:
          return [
            [0], [1], [2], [3],
            [7], [11], [15],
            [14], [13], [12],
            [8], [4]
          ];
      }
    }
  };

  const sequence = getSequence();

  // Animation step ticker
  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % sequence.length);
    }, step);
    return () => clearInterval(interval);
  }, [status, step, sequence.length]);

  // Compute cell opacities based on proximity to the active wave step
  const getCellOpacity = (cellIndex: number): number => {
    if (status === 'done') return 1;
    if (status === 'error') return 0.7;

    const currentActiveCells = sequence[activeStep] || [];
    if (currentActiveCells.includes(cellIndex)) {
      return 1.0;
    }

    // Check decay trail for the previous 2 steps
    const prevStep1 = (activeStep - 1 + sequence.length) % sequence.length;
    if (sequence[prevStep1]?.includes(cellIndex)) {
      return 0.6;
    }

    const prevStep2 = (activeStep - 2 + sequence.length) % sequence.length;
    if (sequence[prevStep2]?.includes(cellIndex)) {
      return 0.35;
    }

    return 0.12; // Base resting opacity
  };

  const isRounded = shape === 'round';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Lattice Matrix or Status Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {status === 'done' ? (
          <div
            style={{ width: grid * cellSize + (grid - 1) * gap, height: grid * cellSize + (grid - 1) * gap }}
            className="flex items-center justify-center rounded-full bg-black text-white"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        ) : status === 'error' ? (
          <div
            style={{ width: grid * cellSize + (grid - 1) * gap, height: grid * cellSize + (grid - 1) * gap }}
            className="flex items-center justify-center rounded-full bg-neutral-900 text-white"
          >
            <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${grid}, ${cellSize}px)`,
              gap: `${gap}px`,
            }}
          >
            {Array.from({ length: totalCells }).map((_, idx) => {
              const opacity = getCellOpacity(idx);
              const isActive = opacity > 0.5;
              return (
                <div
                  key={idx}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: color,
                    opacity,
                    borderRadius: isRounded ? '50%' : '2px',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: 'opacity 120ms ease-out, transform 120ms ease-out',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Label and Stopwatch Timer */}
      {(label || showTimer) && (
        <div className="flex items-center gap-2 text-xs">
          {label && (
            <span className="font-semibold text-neutral-900 tracking-tight">
              {label}
            </span>
          )}
          {showTimer && status === 'loading' && (
            <span className="font-mono text-[11px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              {elapsed.toFixed(1)}s
            </span>
          )}
        </div>
      )}
    </div>
  );
};

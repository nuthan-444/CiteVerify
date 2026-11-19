import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';

export interface SlingButtonProps {
  onSling?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  threshold?: number;
  maxDistance?: number;
  disabled?: boolean;
  className?: string;
}

export const SlingButton: React.FC<SlingButtonProps> = ({
  onSling,
  onClick,
  icon,
  label = 'Pull & release to upload',
  threshold = 45,
  maxDistance = 85,
  disabled = false,
  className = '',
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isReadyToFire, setIsReadyToFire] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Spring snap-back animation using damped harmonic oscillator
  const animateSnapBack = useCallback((startX: number, startY: number, fired: boolean) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let currentX = startX;
    let currentY = startY;
    let vx = 0;
    let vy = 0;

    const stiffness = 0.35;
    const damping = 0.72;

    const tick = () => {
      // Spring forces towards (0, 0)
      const ax = -stiffness * currentX;
      const ay = -stiffness * currentY;

      vx = (vx + ax) * damping;
      vy = (vy + ay) * damping;

      currentX += vx;
      currentY += vy;

      if (Math.abs(currentX) < 0.2 && Math.abs(currentY) < 0.2 && Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        setPosition({ x: 0, y: 0 });
        if (fired && onSling) {
          onSling();
        }
        return;
      }

      setPosition({ x: currentX, y: currentY });
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [onSling]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    startPosRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;

    let dx = e.clientX - startPosRef.current.x;
    let dy = e.clientY - startPosRef.current.y;

    const dist = Math.hypot(dx, dy);

    // Apply elastic resistance if pulled beyond max distance
    if (dist > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: dx, y: dy });
    setIsReadyToFire(dist >= threshold);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture was lost
    }

    setIsDragging(false);

    const dist = Math.hypot(position.x, position.y);
    const fired = dist >= threshold;

    setIsReadyToFire(false);

    if (dist < 5) {
      // Normal click
      setPosition({ x: 0, y: 0 });
      if (onClick) onClick();
      else if (onSling) onSling();
    } else {
      // Sling release
      animateSnapBack(position.x, position.y, fired);
    }
  };

  const distance = Math.hypot(position.x, position.y);
  const tetherThickness = Math.max(1.5, 4 - (distance / maxDistance) * 2.5);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center select-none py-2 ${className}`}
    >
      {/* Sling Tether Canvas / SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        style={{ zIndex: 0 }}
      >
        {distance > 2 && (
          <line
            x1="50%"
            y1="50%"
            x2={`calc(50% + ${position.x}px)`}
            y2={`calc(50% + ${position.y}px)`}
            stroke={isReadyToFire ? '#000000' : '#a3a3a3'}
            strokeWidth={tetherThickness}
            strokeDasharray={isReadyToFire ? 'none' : '3 2'}
            className="transition-colors duration-150"
          />
        )}
      </svg>

      {/* Anchor Ring (origin base) */}
      <div className="absolute w-12 h-12 rounded-full border border-dashed border-neutral-300 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-neutral-300" />
      </div>

      {/* Draggable Sling Button */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-shadow cursor-grab active:cursor-grabbing border ${
          isReadyToFire
            ? 'bg-black text-white border-black shadow-lg scale-105'
            : isDragging
            ? 'bg-neutral-100 text-black border-black shadow-md'
            : 'bg-white text-black border-neutral-300 hover:border-black shadow-xs hover:shadow-sm'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {icon || <Upload className={`w-6 h-6 ${isReadyToFire ? 'text-white' : 'text-black'}`} />}
      </div>

      {/* Micro-hint */}
      {label && (
        <span
          className={`mt-3 text-[11px] font-medium transition-colors ${
            isReadyToFire ? 'text-black font-semibold' : 'text-neutral-400'
          }`}
        >
          {isReadyToFire ? '⚡ Release to Launch!' : label}
        </span>
      )}
    </div>
  );
};

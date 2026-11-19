import React from 'react';
import { cn } from '../../lib/utils';

// ─── Base pulse block ────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} />
);

// ─── Document Card Skeleton ───────────────────────────────────────────────────
export const DocumentCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-neutral-200 shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="h-3.5 bg-neutral-200 rounded w-4/5" />
        <div className="h-2.5 bg-neutral-100 rounded w-2/5" />
      </div>
    </div>
    <div className="h-7 bg-neutral-100 rounded-lg w-full" />
    <div className="flex items-center justify-between pt-1">
      <div className="h-2 bg-neutral-100 rounded w-1/4" />
      <div className="h-2 bg-neutral-200 rounded w-1/5" />
    </div>
  </div>
);

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3 animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-neutral-200 shrink-0" />
    <div className="space-y-2 flex-1">
      <div className="h-2.5 bg-neutral-100 rounded w-2/3" />
      <div className="h-5 bg-neutral-200 rounded w-1/3" />
    </div>
  </div>
);

// ─── Claim Card Skeleton ──────────────────────────────────────────────────────
export const ClaimCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded bg-neutral-200 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-neutral-200 rounded w-full" />
        <div className="h-3 bg-neutral-200 rounded w-5/6" />
        <div className="h-3 bg-neutral-100 rounded w-3/4" />
      </div>
    </div>
    <div className="flex items-center gap-2 pt-1">
      <div className="h-5 bg-neutral-100 rounded-full w-20" />
      <div className="h-5 bg-neutral-100 rounded-full w-16" />
    </div>
  </div>
);

// ─── Citation Card Skeleton ───────────────────────────────────────────────────
export const CitationCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3 animate-pulse">
    <div className="flex items-start gap-2.5">
      <div className="w-4 h-4 rounded bg-neutral-200 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-neutral-200 rounded w-5/6" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>
    </div>
    <div className="h-2 bg-neutral-100 rounded w-1/2" />
    <div className="h-5 bg-neutral-100 rounded-full w-24" />
  </div>
);

// ─── Document Header Card Skeleton (DocumentPage) ─────────────────────────────
export const DocumentHeaderSkeleton: React.FC = () => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-neutral-200 rounded w-56" />
          <div className="flex gap-3">
            <div className="h-3 bg-neutral-100 rounded w-24" />
            <div className="h-3 bg-neutral-100 rounded w-16" />
            <div className="h-5 bg-neutral-100 rounded-full w-20" />
          </div>
        </div>
      </div>
      <div className="w-20 h-20 rounded-full bg-neutral-200 shrink-0 hidden md:block" />
    </div>
  </div>
);

// ─── Tab Content Skeleton (generic list of rows) ──────────────────────────────
export const TabContentSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-4/5" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>
    ))}
  </div>
);

// ─── Sidebar history list skeleton ────────────────────────────────────────────
export const SidebarSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-1 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg">
        <div className="w-3.5 h-3.5 rounded bg-neutral-200 shrink-0" />
        <div className="h-2.5 bg-neutral-200 rounded flex-1" style={{ width: `${60 + (i % 3) * 15}%` }} />
        <div className="w-7 h-4 rounded bg-neutral-100 shrink-0" />
      </div>
    ))}
  </div>
);

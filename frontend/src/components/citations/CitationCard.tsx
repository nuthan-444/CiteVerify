import React from 'react';
import { ExternalLink, BookOpen, Globe, UserCheck, Calendar } from 'lucide-react';
import type { Citation } from '../../types';

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const getSourceBadge = () => {
    switch (citation.source_type) {
      case 'crossref':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-black border border-neutral-300">
            <BookOpen className="w-3 h-3" />
            Crossref
          </span>
        );
      case 'openalex':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-black border border-neutral-300">
            <UserCheck className="w-3 h-3" />
            OpenAlex
          </span>
        );
      case 'tavily':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-black border border-neutral-300">
            <Globe className="w-3 h-3" />
            Tavily Web
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs hover:border-neutral-400 transition-all space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <h5 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
          {citation.title || 'Untitled Academic Source'}
        </h5>
        {getSourceBadge()}
      </div>

      {citation.authors && citation.authors.length > 0 && (
        <p className="text-[11px] text-neutral-600 line-clamp-1">
          <span className="font-semibold text-neutral-500">Authors:</span>{' '}
          {citation.authors.join(', ')}
        </p>
      )}

      {citation.abstract && (
        <p className="text-xs text-neutral-700 line-clamp-3 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
          {citation.abstract}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
        <div className="flex items-center gap-3">
          {citation.publication_year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neutral-400" />
              {citation.publication_year}
            </span>
          )}
          {citation.doi && (
            <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[150px]">
              DOI: {citation.doi}
            </span>
          )}
        </div>

        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-black hover:underline"
          >
            Source
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

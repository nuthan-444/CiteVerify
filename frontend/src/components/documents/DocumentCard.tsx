import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Layers, Trash2, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getStatusColor, getStatusLabel } from '../../lib/utils';
import { LatticeLoader } from '../ui/LatticeLoader';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />;
      case 'processing':
      case 'extracting_text':
      case 'finding_claims':
      case 'retrieving_citations':
      case 'verifying':
        return <LatticeLoader grid={3} pattern="orbit" cellSize={2.5} gap={1.2} status="loading" className="shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 shadow-2xs hover:shadow-sm hover:border-neutral-400 transition-all flex flex-col justify-between group overflow-hidden">
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-black border border-neutral-200 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate" title={document.filename}>
                {document.filename}
              </h4>
              <p className="text-[11px] sm:text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span className="truncate">{formatDate(document.created_at)}</span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0 max-w-[120px] truncate ${getStatusColor(
              document.status
            )}`}
          >
            {getStatusIcon(document.status)}
            <span className="truncate">{getStatusLabel(document.status)}</span>
          </span>
        </div>

        {document.error_message && document.status === 'error' && (
          <div className="mb-3 p-2.5 rounded-lg bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-start gap-1.5 break-words overflow-hidden">
            <AlertTriangle className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <span className="line-clamp-2">{document.error_message}</span>
          </div>
        )}

        {document.page_count && (
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-600 mb-3 sm:mb-4 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
            <span className="flex items-center gap-1 shrink-0 text-[11px] sm:text-xs">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              {document.page_count} {document.page_count === 1 ? 'Page' : 'Pages'}
            </span>
            {document.trust_score !== undefined && (
              <span className="font-semibold text-black text-[11px] sm:text-xs shrink-0">
                Trust: {Math.round(document.trust_score <= 1.0 && document.trust_score > 0 ? document.trust_score * 100 : document.trust_score)}%
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-neutral-100">
        {onDelete && (
          <button
            onClick={() => onDelete(document.id)}
            className="text-xs text-neutral-400 hover:text-black p-1 rounded transition-colors cursor-pointer"
            title="Delete paper"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        <Link
          to={`/documents/${document.id}`}
          className="ml-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-black hover:text-neutral-700 group-hover:translate-x-0.5 transition-transform"
        >
          View Audit Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

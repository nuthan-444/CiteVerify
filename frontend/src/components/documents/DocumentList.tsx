import React from 'react';
import { DocumentCard } from './DocumentCard';
import type { Document } from '../../types';
import { FileSearch } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 bg-white rounded-xl border border-neutral-200 p-5 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-neutral-100 rounded w-1/2 mb-6" />
            <div className="h-8 bg-neutral-100 rounded w-full mb-4" />
            <div className="h-4 bg-neutral-200 rounded w-1/3 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <FileSearch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-800">No Research Papers Yet</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
          Upload an academic paper above to extract factual claims, cross-reference academic citations, and calculate trust scores.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
};

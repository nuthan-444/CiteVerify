import React from 'react';
import { Layout } from '../components/layout/Layout';
import { UploadZone } from '../components/documents/UploadZone';
import { DocumentList } from '../components/documents/DocumentList';
import { useDocuments } from '../hooks/useDocuments';
import type { Document } from '../types';
import { FileText, CheckCircle2, Clock, History } from 'lucide-react';
import { StatCardSkeleton } from '../components/ui/Skeleton';
import { usePageEntrance } from '../hooks/usePageEntrance';

export const DashboardPage: React.FC = () => {
  const { documents, isLoading, addDocument, deleteDocument, fetchDocuments } = useDocuments();
  const pageRef = usePageEntrance();

  const handleUploadSuccess = (newDoc: Document) => {
    addDocument(newDoc);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research paper?')) return;
    try {
      await deleteDocument(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const totalDocs = documents.length;
  const completedDocs = documents.filter((d) => d.status === 'completed').length;
  const processingDocs = documents.filter(
    (d) => d.status !== 'completed' && d.status !== 'error' && d.status !== 'uploaded'
  ).length;

  // Keep top 3 previous papers below the upload div
  const top3Previous = documents.slice(0, 3);

  return (
    <Layout showSidebar>
      <div ref={pageRef} className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
        <div data-animate>
          <h1 className="text-xl sm:text-2xl font-bold text-black">Researcher Dashboard</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Upload and audit academic papers for verifiable claim citations and integrity.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div data-animate className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {isLoading && documents.length === 0 ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-500">Total Papers</p>
                  <h3 className="text-lg sm:text-xl font-bold text-black">{totalDocs}</h3>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-500">Audited & Verified</p>
                  <h3 className="text-lg sm:text-xl font-bold text-black">{completedDocs}</h3>
                </div>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-500">In Pipeline</p>
                  <h3 className="text-lg sm:text-xl font-bold text-black">{processingDocs}</h3>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upload Zone */}
        <div data-animate className="space-y-2">
          <h2 className="text-xs sm:text-sm font-bold text-black">Upload New Document</h2>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Top 3 Previous Documents below upload div */}
        <div data-animate className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-black" />
                <h2 className="text-xs sm:text-sm font-bold text-black">Recent Audits (Top 3)</h2>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Latest 3 analyzed papers. View full history in the left menu.
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
              {documents.length > 3 && (
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                  +{documents.length - 3} more in history
                </span>
              )}
              <button
                onClick={fetchDocuments}
                className="text-xs font-medium text-black hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          <DocumentList
            documents={top3Previous}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
};

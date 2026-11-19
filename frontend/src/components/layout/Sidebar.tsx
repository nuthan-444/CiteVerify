import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Trash2,
  History,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';
import { LatticeLoader } from '../ui/LatticeLoader';
import { GooeyInput } from '../ui/GooeyInput';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { documents, isLoading, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete report for "${name}"?`)) return;

    try {
      await deleteDocument(id);
      if (location.pathname === `/documents/${id}`) {
        handleNavigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col flex-1 min-h-0 space-y-4">
        {/* Mobile Header with Close Button */}
        <div className="md:hidden flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-black" />
            <span className="text-xs font-bold uppercase tracking-wider text-black">
              Audit Workspace
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Audit Action Button (like ChatGPT "+ New chat") */}
        <button
          onClick={() => handleNavigate('/dashboard')}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>New Paper Audit</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono uppercase bg-neutral-900 px-1.5 py-0.5 rounded">
            Upload
          </span>
        </button>

        {/* Workspace Quick Nav */}
        <NavLink
          to="/dashboard"
          end
          onClick={() => onCloseMobile?.()}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-neutral-100 text-black font-semibold'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 text-black" />
          <span>Dashboard & Overview</span>
        </NavLink>

        {/* Previous Reports / History Section */}
        <div className="flex flex-col flex-1 min-h-0 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <History className="w-3.5 h-3.5" />
              <span>Audit History</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full border border-neutral-200">
              {documents.length}
            </span>
          </div>

          {/* Dedicated Gooey Search Bar */}
          <div className="px-1 mb-2.5">
            <GooeyInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search past audits..."
            />
          </div>

          {/* Scrollable History List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1 max-h-[calc(100vh-22rem)] md:max-h-[calc(100vh-23rem)]">
            {isLoading && documents.length === 0 ? (
              <div className="p-4 text-center">
                <LatticeLoader
                  grid={3}
                  pattern="orbit"
                  cellSize={4}
                  gap={2}
                  status="loading"
                  className="mx-auto mb-2"
                />
                <p className="text-[11px] text-neutral-400">Loading history...</p>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400">
                {searchQuery ? 'No matching audits' : 'No previous reports yet'}
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = location.pathname === `/documents/${doc.id}`;
                const isProcessing =
                  doc.status !== 'completed' && doc.status !== 'error' && doc.status !== 'uploaded';

                return (
                  <div
                    key={doc.id}
                    onClick={() => handleNavigate(`/documents/${doc.id}`)}
                    className={`group relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-100 text-black font-semibold border-l-2 border-black shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-50 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-black' : 'text-neutral-400 group-hover:text-black'
                        }`}
                      />
                      <span className="truncate" title={doc.filename}>
                        {doc.filename.replace(/\.pdf$/i, '')}
                      </span>
                    </div>

                    {/* Status badge / Trust Score or Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isProcessing ? (
                        <LatticeLoader
                          grid={3}
                          pattern="orbit"
                          cellSize={2}
                          gap={1}
                          status="loading"
                          className="shrink-0"
                        />
                      ) : doc.status === 'completed' && doc.trust_score !== undefined ? (
                        (() => {
                          const scoreVal = Math.round(
                            doc.trust_score <= 1.0 && doc.trust_score > 0
                              ? doc.trust_score * 100
                              : doc.trust_score
                          );
                          return (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                scoreVal >= 70
                                  ? 'bg-black text-white'
                                  : 'bg-neutral-200 text-neutral-800'
                              }`}
                            >
                              {scoreVal}%
                            </span>
                          );
                        })()
                      ) : doc.status === 'error' ? (
                        <AlertCircle className="w-3 h-3 text-neutral-500" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                      )}

                      {/* Trash action */}
                      <button
                        onClick={(e) => handleDelete(e, doc.id, doc.filename)}
                        title="Delete report"
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 hover:text-black p-1 transition-opacity cursor-pointer text-neutral-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Verification Engines Status */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800">Groq LLM</span>
              <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-neutral-200 text-neutral-900">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800">Tavily Web</span>
              <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-neutral-200 text-neutral-900">
                LIVE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800">Crossref / OpenAlex</span>
              <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-neutral-200 text-neutral-900">
                SYNCED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-800">RAG Vector DB</span>
              <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-neutral-200 text-neutral-900">
                384-DIM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Version Info */}
      <div className="pt-2 mt-2 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between px-1">
        <span>CiteVerify v1.0</span>
        <span className="font-mono text-[9px]">AI Academic Auditor</span>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar */}
      <aside className="hidden md:flex md:w-72 border-r border-neutral-200 bg-white min-h-[calc(100vh-4rem)] p-3.5 flex-col justify-between shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Slide-over sheet */}
          <aside className="relative z-50 w-80 max-w-[85vw] h-full bg-white p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

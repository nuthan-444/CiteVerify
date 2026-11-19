import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileText, CheckCircle2, Play, Upload, RotateCcw } from 'lucide-react';
import { documents as documentsApi } from '../../services/api';
import type { Document } from '../../types';
import { SlingButton } from '../ui/SlingButton';
import { LatticeLoader } from '../ui/LatticeLoader';
import { BellToggle } from '../ui/BellToggle';

interface UploadZoneProps {
  onUploadSuccess: (doc: Document) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploadedDoc && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!uploadedDoc && !isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Accepted extensions (must match backend SUPPORTED_EXTENSIONS + extras)
    const ACCEPTED_EXTS = new Set([
      '.pdf', '.docx', '.doc', '.odt', '.odp',
      '.pptx', '.ppt', '.txt', '.md', '.markdown',
      '.rst', '.tex', '.rtf', '.html', '.htm',
      '.readme', '.bib', '.csv',
    ]);
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTS.has(ext) && !file.name.toLowerCase().includes('readme')) {
      setError('Unsupported file type. Accepted: PDF, DOCX, ODT, ODP, PPTX, TXT, MD, RST, TEX, RTF, HTML, CSV, and more.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const doc = await documentsApi.upload(file, (percent) => {
        setProgress(percent);
      });
      setUploadedDoc(doc);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (!uploadedDoc || isAnalyzing) return;

    setError(null);
    setIsAnalyzing(true);

    try {
      await documentsApi.process(uploadedDoc.id);
      onUploadSuccess(uploadedDoc);
      navigate(`/documents/${uploadedDoc.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start analysis. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUploadedDoc(null);
    setIsAnalyzing(false);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.odt,.odp,.pptx,.ppt,.txt,.md,.markdown,.rst,.tex,.rtf,.html,.htm,.csv,.bib"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || isAnalyzing}
      />

      {/* Case 1: File is Uploaded and Ready for Analysis (Sling Button step) */}
      {uploadedDoc ? (
        <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-7 text-center shadow-xs transition-all">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6 space-y-4">
              <LatticeLoader
                pattern="orbit"
                grid={3}
                cellSize={7}
                gap={3.5}
                status="loading"
                showTimer={true}
              />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-black">
                  Starting Document Audit...
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto px-2">
                  Extracting factual claims, resolving citation DOIs, and matching evidence with RAG embeddings.
                </p>
              </div>
              <div className="pt-2">
                <BellToggle />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Paper metadata header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl bg-neutral-100 border border-neutral-200 max-w-md w-full justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left w-full sm:w-auto">
                  <FileText className="w-4 h-4 text-black shrink-0" />
                  <span className="text-xs font-semibold text-black truncate" title={uploadedDoc.filename}>
                    {uploadedDoc.filename}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase font-mono px-2 py-0.5 rounded bg-black text-white shrink-0 self-end sm:self-auto">
                  <CheckCircle2 className="w-3 h-3" />
                  Uploaded
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-black">
                  Ready to Start Verification
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 max-w-md mx-auto px-2">
                  Sling the button below to launch the automated AI claim extraction and citation audit.
                </p>
              </div>

              {/* Notification toggle for verification alerts */}
              <div className="pt-1">
                <BellToggle />
              </div>

              {/* Sling Button configured to trigger analysis */}
              <div className="py-1 max-w-full overflow-hidden">
                <SlingButton
                  onSling={handleStartAnalysis}
                  onClick={handleStartAnalysis}
                  icon={<Play className="w-5 h-5 fill-current ml-0.5" />}
                  label="Pull & release to start analysis, or click"
                  threshold={40}
                  maxDistance={70}
                />
              </div>

              {/* Action to change paper */}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-medium transition-colors cursor-pointer py-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload a different paper</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Case 2: Dropzone / Select Paper */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-black bg-neutral-100 scale-[1.01]'
              : 'border-neutral-300 hover:border-black hover:bg-neutral-50 bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            {isUploading ? (
              <div className="my-2">
                <LatticeLoader
                  pattern="orbit"
                  grid={3}
                  cellSize={7}
                  gap={3.5}
                  status="loading"
                  showTimer={true}
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-black border border-neutral-200 shadow-xs">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}

            <div>
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">
                {isUploading ? 'Uploading Document to Server...' : 'Upload Research Document'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto px-2">
                {isUploading
                  ? 'Transmitting file securely to your database.'
                  : 'Tap or drop your document here. Once uploaded, sling to start analysis.'}
              </p>
            </div>

            {isUploading && (
              <div className="w-full max-w-xs mt-2 px-4">
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-200">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{progress}% uploaded</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-neutral-400 mt-1 max-w-sm px-2">
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">PDF</span>
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">DOCX</span>
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">ODT</span>
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">ODP</span>
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">TXT</span>
              <span className="font-mono px-1.5 py-0.5 bg-neutral-100 rounded border border-neutral-200 text-neutral-800">MD</span>
              <span className="text-neutral-500 font-medium">+more</span>
              <span>•</span>
              <span>Up to 25MB</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-neutral-100 border border-neutral-300 flex items-start gap-2.5 text-neutral-900 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

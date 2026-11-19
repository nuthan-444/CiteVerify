import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, FileText, Download, ChevronDown, X } from 'lucide-react';
import type { Document, Claim, Citation, VerificationResult } from '../../types';
import { TrustScore } from '../verification/TrustScore';

interface ReportViewProps {
  document: Document;
  claims: Claim[];
  citations: Citation[];
  verifications: VerificationResult[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const FORMAT_OPTIONS = [
  { id: 'html',  label: 'HTML Report',       ext: '.html', icon: '🌐', desc: 'Styled web page, open in any browser' },
  { id: 'json',  label: 'JSON Data',          ext: '.json', icon: '{ }', desc: 'Raw structured data for processing' },
  { id: 'pdf',   label: 'PDF Document',       ext: '.pdf',  icon: '📄', desc: 'Print-ready, universal format' },
  { id: 'docx',  label: 'Word Document',      ext: '.docx', icon: '📝', desc: 'Editable in Microsoft Word' },
  { id: 'odt',   label: 'OpenDocument Text',  ext: '.odt',  icon: '📃', desc: 'Open format for LibreOffice / OpenOffice' },
  { id: 'txt',   label: 'Plain Text',         ext: '.txt',  icon: '📋', desc: 'No formatting, maximum compatibility' },
  { id: 'csv',   label: 'CSV Spreadsheet',    ext: '.csv',  icon: '📊', desc: 'Claims & verdicts in table format' },
  { id: 'md',    label: 'Markdown',           ext: '.md',   icon: '✏️', desc: 'Developer-friendly text markup' },
] as const;

type FormatId = typeof FORMAT_OPTIONS[number]['id'];

/** Fetch HTML/JSON from backend with auth. Other formats are built client-side. */
async function downloadReport(documentId: string, format: FormatId, claims: Claim[], _citations: Citation[], verifications: VerificationResult[], filename: string, trustScore: number) {
  if (format === 'html' || format === 'json') {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/documents/${documentId}/report?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    triggerDownload(blob, `citeverify-report.${format}`);
    return;
  }

  // ── Client-side generation for other formats ──
  const supported = verifications.filter((v) => v.verdict === 'supported').length;
  const contradicted = verifications.filter((v) => v.verdict === 'contradicted').length;
  const insufficient = verifications.filter((v) => v.verdict === 'insufficient_evidence').length;
  const scoreLabel = trustScore >= 70 ? 'High' : trustScore >= 40 ? 'Moderate' : 'Low';

  if (format === 'md') {
    const lines = [
      `# CiteVerify Verification Report`,
      `**File:** ${filename}`,
      `**Generated:** ${new Date().toLocaleString()}`,
      `**Trust Score:** ${trustScore.toFixed(0)}% (${scoreLabel})`,
      '',
      `## Summary`,
      `| Verdict | Count |`,
      `|---------|-------|`,
      `| Supported | ${supported} |`,
      `| Contradicted | ${contradicted} |`,
      `| Insufficient Evidence | ${insufficient} |`,
      '',
      `## Claims`,
    ];
    claims.forEach((c, i) => {
      const v = verifications.find((vr) => vr.claim_id === c.id);
      lines.push(`### Claim ${i + 1} — ${v?.verdict?.replace('_', ' ') ?? 'Unverified'}`);
      lines.push(`> ${c.claim_text}`);
      if (v?.reasoning) lines.push(`\n**Reasoning:** ${v.reasoning}`);
      lines.push('');
    });
    triggerDownload(new Blob([lines.join('\n')], { type: 'text/markdown' }), `citeverify-report.md`);
    return;
  }

  if (format === 'txt') {
    const lines = [
      'CITEVERIFY VERIFICATION REPORT',
      '================================',
      `File: ${filename}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Trust Score: ${trustScore.toFixed(0)}% (${scoreLabel})`,
      '',
      'SUMMARY',
      '-------',
      `Supported Claims:   ${supported}`,
      `Contradicted:       ${contradicted}`,
      `Insufficient:       ${insufficient}`,
      '',
      'CLAIMS',
      '------',
    ];
    claims.forEach((c, i) => {
      const v = verifications.find((vr) => vr.claim_id === c.id);
      lines.push(`[${i + 1}] ${v?.verdict?.toUpperCase() ?? 'UNVERIFIED'}`);
      lines.push(`    ${c.claim_text}`);
      if (v?.reasoning) lines.push(`    Reasoning: ${v.reasoning}`);
      lines.push('');
    });
    triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain' }), `citeverify-report.txt`);
    return;
  }

  if (format === 'csv') {
    const rows = [
      ['Claim #', 'Claim Text', 'Verdict', 'Confidence', 'Reasoning', 'Page'],
      ...claims.map((c, i) => {
        const v = verifications.find((vr) => vr.claim_id === c.id);
        return [
          String(i + 1),
          `"${(c.claim_text ?? '').replace(/"/g, '""')}"`,
          v?.verdict ?? '',
          v?.confidence != null ? (v.confidence * 100).toFixed(0) + '%' : '',
          `"${(v?.reasoning ?? '').replace(/"/g, '""')}"`,
          String(c.page_number ?? ''),
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    triggerDownload(new Blob([csv], { type: 'text/csv' }), `citeverify-report.csv`);
    return;
  }

  if (format === 'pdf' || format === 'docx' || format === 'odt') {
    alert(`${FORMAT_OPTIONS.find((f) => f.id === format)?.label} export requires the backend to be running. Downloading HTML instead.`);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/documents/${documentId}/report?format=html`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    triggerDownload(blob, `citeverify-report.html`);
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const ReportView: React.FC<ReportViewProps> = ({
  document,
  claims,
  citations,
  verifications,
}) => {
  const [showFormats, setShowFormats] = useState(false);
  const [downloading, setDownloading] = useState<FormatId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const supportedCount = verifications.filter((v) => v.verdict === 'supported').length;
  const contradictedCount = verifications.filter((v) => v.verdict === 'contradicted').length;
  const insufficientCount = verifications.filter((v) => v.verdict === 'insufficient_evidence').length;
  const trustScore = document.trust_score ?? 0;

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowFormats(false);
      }
    };
    if (showFormats) window.document.addEventListener('mousedown', handler);
    return () => window.document.removeEventListener('mousedown', handler);
  }, [showFormats]);

  const handleFormat = async (fmt: FormatId) => {
    setDownloading(fmt);
    setShowFormats(false);
    try {
      await downloadReport(document.id, fmt, claims, citations, verifications, document.filename, trustScore);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Make sure the backend is running.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-neutral-200">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-black">
            Verification Report
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-0.5 truncate" title={document.filename}>
            {document.filename}
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
            Generated on {new Date().toLocaleDateString()} • {citations.length} Sources Cross-Checked • Powered by CiteVerify AI
          </p>
        </div>

        {/* ── Download Button with Format Picker ── */}
        <div className="relative self-stretch sm:self-auto" ref={panelRef}>
          <button
            onClick={() => setShowFormats((s) => !s)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer select-none"
          >
            {downloading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Download Report</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${showFormats ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Format picker panel */}
          {showFormats && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-black uppercase tracking-wider">Choose Format</span>
                <button onClick={() => setShowFormats(false)} className="text-neutral-400 hover:text-black transition-colors cursor-pointer p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2 max-h-72 sm:max-h-80 overflow-y-auto">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => handleFormat(fmt.id)}
                    className="w-full flex items-start gap-2.5 sm:gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 text-left transition-colors group cursor-pointer"
                  >
                    <span className="text-base w-6 text-center shrink-0 mt-0.5">{fmt.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-900 group-hover:text-black">{fmt.label}</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 leading-snug">{fmt.desc}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-neutral-400 shrink-0 mt-1">{fmt.ext}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-200">
        <div className="col-span-2 sm:col-span-1 flex items-center justify-center p-2 bg-white sm:bg-transparent rounded-lg sm:rounded-none border sm:border-0 border-neutral-200">
          <TrustScore score={trustScore} size="md" />
        </div>
        <div className="text-center p-2.5 sm:p-3 rounded-lg bg-white border border-neutral-200">
          <p className="text-xl sm:text-2xl font-bold text-black">{supportedCount}</p>
          <p className="text-[10px] sm:text-xs font-medium text-neutral-700 flex items-center justify-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" /> Supported
          </p>
        </div>
        <div className="text-center p-2.5 sm:p-3 rounded-lg bg-white border border-neutral-200">
          <p className="text-xl sm:text-2xl font-bold text-black">{contradictedCount}</p>
          <p className="text-[10px] sm:text-xs font-medium text-neutral-700 flex items-center justify-center gap-1 mt-1">
            <AlertTriangle className="w-3.5 h-3.5 text-neutral-500 shrink-0" /> Contradicted
          </p>
        </div>
        <div className="text-center p-2.5 sm:p-3 rounded-lg bg-white border border-neutral-200">
          <p className="text-xl sm:text-2xl font-bold text-black">{insufficientCount}</p>
          <p className="text-[10px] sm:text-xs font-medium text-neutral-700 flex items-center justify-center gap-1 mt-1">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" /> Insufficient
          </p>
        </div>
      </div>

      {/* Claims list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-black shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Audited Claims</h4>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          {claims.map((claim, idx) => {
            const v = verifications.find((res) => res.claim_id === claim.id);
            return (
              <div key={claim.id} className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-neutral-500">Claim #{idx + 1}</span>
                  {v && (
                    <span className={`font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded border shrink-0 ${
                      v.verdict === 'supported'
                        ? 'bg-black text-white border-black'
                        : v.verdict === 'contradicted'
                        ? 'bg-neutral-200 text-black border-neutral-400'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}>
                      {v.verdict.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <p className="font-medium text-neutral-900 leading-relaxed">{claim.claim_text}</p>
                {v?.reasoning && (
                  <p className="text-neutral-700 bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100 leading-relaxed">
                    {v.reasoning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

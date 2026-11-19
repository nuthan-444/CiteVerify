import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProcessingStatus } from '../components/documents/ProcessingStatus';
import { ClaimList } from '../components/claims/ClaimList';
import { CitationList } from '../components/citations/CitationList';
import { ReportView } from '../components/reports/ReportView';
import { TrustScore } from '../components/verification/TrustScore';
import { LatticeLoader } from '../components/ui/LatticeLoader';
import { useDocuments } from '../hooks/useDocuments';
import { documents as documentsApi } from '../services/api';
import type { Document, Claim, Citation, VerificationResult } from '../types';
import {
  FileText,
  Calendar,
  Layers,
  ArrowLeft,
  Sparkles,
  Bookmark,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'citations' | 'report'>('overview');
  const [loading, setLoading] = useState(true);
  const { fetchDocuments: refreshSidebarDocs } = useDocuments();

  // Dynamic trust score calculation: uses doc.trust_score if present, or calculates directly from verifications
  const effectiveTrustScore = React.useMemo(() => {
    if (doc?.trust_score !== undefined && doc.trust_score !== null) {
      return doc.trust_score <= 1.0 && doc.trust_score > 0
        ? Math.round(doc.trust_score * 100)
        : Math.round(doc.trust_score);
    }
    if (!verifications || verifications.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;
    for (const v of verifications) {
      const conf = v.confidence ?? 0.5;
      if (v.verdict === 'supported') {
        weightedScore += conf;
        totalWeight += 1.0;
      } else if (v.verdict === 'contradicted') {
        weightedScore += (1.0 - conf) * 0.2;
        totalWeight += 1.0;
      } else {
        weightedScore += 0.5;
        totalWeight += 0.5;
      }
    }
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
  }, [doc?.trust_score, verifications]);

  const handleCompleted = () => {
    fetchDocumentData();
    refreshSidebarDocs();
  };

  const fetchDocumentData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const docData = await documentsApi.get(id);
      setDoc(docData);

      if (docData.status === 'completed') {
        const [claimsData, citationsData, verifData] = await Promise.all([
          documentsApi.getClaims(id),
          documentsApi.getCitations(id),
          documentsApi.getVerification(id),
        ]);

        const mergedClaims = claimsData.map((c) => ({
          ...c,
          verification: verifData.find((v) => v.claim_id === c.id),
        }));

        setClaims(mergedClaims);
        setCitations(citationsData);
        setVerifications(verifData);
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentData();
  }, [id]);

  if (loading && !doc) {
    return (
      <Layout showSidebar>
        <div className="flex items-center justify-center min-h-[350px] p-4">
          <LatticeLoader
            grid={3}
            pattern="orbit"
            cellSize={7}
            gap={3.5}
            label="Loading audit workspace..."
            showTimer={true}
          />
        </div>
      </Layout>
    );
  }

  if (!doc) {
    return (
      <Layout showSidebar>
        <div className="p-6 sm:p-8 text-center bg-white rounded-xl border border-neutral-200">
          <AlertTriangle className="w-8 h-8 text-black mx-auto mb-2" />
          <h3 className="text-base font-bold text-neutral-900">Document Not Found</h3>
          <Link to="/dashboard" className="text-xs text-black font-semibold mt-2 inline-block hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar>
      <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black mb-2.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Workspace
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-neutral-900 truncate" title={doc.filename}>
                  {doc.filename}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-neutral-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(doc.created_at)}
                  </span>
                  {doc.page_count && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {doc.page_count} Pages
                    </span>
                  )}
                  <span className="capitalize font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                    Status: {doc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {doc.status === 'completed' && (
              <div className="shrink-0 flex items-center justify-start md:justify-end pt-1 md:pt-0 border-t md:border-t-0 border-neutral-100">
                <TrustScore score={effectiveTrustScore} size="md" />
              </div>
            )}
          </div>
        </div>

        {/* If processing, show pipeline status */}
        {doc.status !== 'completed' && (
          <ProcessingStatus
            documentId={doc.id}
            initialStatus={doc.status}
            filename={doc.filename}
            onCompleted={handleCompleted}
          />
        )}

        {/* Tab Navigation */}
        {doc.status === 'completed' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="overflow-x-auto pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 scrollbar-none border-b border-neutral-200 flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'claims'
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Extracted Claims ({claims.length})
              </button>
              <button
                onClick={() => setActiveTab('citations')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'citations'
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Retrieved Citations ({citations.length})
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'report'
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-black'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Verification Report
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col items-center text-center justify-center space-y-2.5">
                    <TrustScore score={effectiveTrustScore} size="lg" />
                    <p className="text-xs text-neutral-500">
                      Calculated from supported factual claims vs. total verifiable statements.
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-3.5">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Verification Highlights</h3>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-neutral-100 border border-neutral-300 p-2.5 sm:p-3 rounded-xl text-center">
                        <span className="text-lg sm:text-xl font-bold text-black">
                          {verifications.filter((v) => v.verdict === 'supported').length}
                        </span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-800 mt-0.5">Supported</p>
                      </div>
                      <div className="bg-neutral-200 border border-neutral-400 p-2.5 sm:p-3 rounded-xl text-center">
                        <span className="text-lg sm:text-xl font-bold text-black">
                          {verifications.filter((v) => v.verdict === 'contradicted').length}
                        </span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-800 mt-0.5">Contradicted</p>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200 p-2.5 sm:p-3 rounded-xl text-center">
                        <span className="text-lg sm:text-xl font-bold text-neutral-600">
                          {verifications.filter((v) => v.verdict === 'insufficient_evidence').length}
                        </span>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-600 mt-0.5">Insufficient</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed pt-1">
                      Groq LLM identified {claims.length} key factual statements. Sources were cross-checked
                      against Crossref, OpenAlex, and Tavily with RAG semantic passage retrieval.
                    </p>
                  </div>
                </div>

                {/* ── AI Overview Summary ── */}
                {claims.length > 0 && (() => {
                  const total = claims.length;
                  const supported = verifications.filter((v) => v.verdict === 'supported').length;
                  const contradicted = verifications.filter((v) => v.verdict === 'contradicted').length;
                  const insufficient = verifications.filter((v) => v.verdict === 'insufficient_evidence').length;
                  const pct = (n: number) => Math.round((n / total) * 100);
                  const scoreLabel = effectiveTrustScore >= 70 ? 'high' : effectiveTrustScore >= 40 ? 'moderate' : 'low';
                  const uniqueSources = new Set(citations.map((c) => c.doi || c.url || c.id)).size;

                  let summaryText = `This document contains ${total} verifiable claim${total !== 1 ? 's' : ''} cross-checked against ${uniqueSources} academic source${uniqueSources !== 1 ? 's' : ''}, yielding an overall trust score of ${effectiveTrustScore.toFixed(0)}% — classified as ${scoreLabel} confidence.`;
                  const breakdown: string[] = [];
                  if (supported > 0) breakdown.push(`${supported} (${pct(supported)}%) claim${supported !== 1 ? 's are' : ' is'} fully supported by cited evidence`);
                  if (contradicted > 0) breakdown.push(`${contradicted} (${pct(contradicted)}%) contradict${contradicted === 1 ? 's' : ''} the referenced literature`);
                  if (insufficient > 0) breakdown.push(`${insufficient} (${pct(insufficient)}%) lack${insufficient === 1 ? 's' : ''} sufficient evidence to verify`);
                  if (breakdown.length) summaryText += ' ' + breakdown.join('; ') + '.';
                  if (scoreLabel === 'high') summaryText += ' The paper demonstrates strong citation integrity overall.';
                  else if (scoreLabel === 'moderate') summaryText += ' Reviewers should inspect the flagged claims before publication.';
                  else summaryText += ' Significant citation concerns were identified — a thorough manual review is recommended.';

                  return (
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-6 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-black shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider text-black">AI Overview Summary</span>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">{summaryText}</p>

                      {/* Visual breakdown bars */}
                      <div className="space-y-2 pt-1">
                        {[
                          { label: 'Supported', count: supported, shade: 'bg-black' },
                          { label: 'Contradicted', count: contradicted, shade: 'bg-neutral-500' },
                          { label: 'Insufficient', count: insufficient, shade: 'bg-neutral-300' },
                        ].map(({ label, count, shade }) => (
                          <div key={label} className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-neutral-500">
                            <span className="w-20 sm:w-24 shrink-0 font-medium">{label}</span>
                            <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${shade} rounded-full transition-all duration-700`}
                                style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                              />
                            </div>
                            <span className="w-6 text-right font-semibold text-black">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'claims' && <ClaimList claims={claims} />}

            {activeTab === 'citations' && <CitationList citations={citations} />}

            {activeTab === 'report' && (
              <ReportView
                document={doc}
                claims={claims}
                citations={citations}
                verifications={verifications}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

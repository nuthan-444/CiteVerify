import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StarBorder } from '../components/ui/StarBorder';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-6 sm:py-12 md:py-20 max-w-5xl mx-auto space-y-14 sm:space-y-20 md:space-y-24 px-1 sm:px-4">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-black text-[11px] sm:text-xs font-semibold max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Next-Gen Academic Citation & Claim Auditor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-tight">
            Verify Academic Citations <br className="hidden sm:inline" />
            <span className="text-neutral-500">
              With Rigorous AI Verification
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            CiteVerify extracts factual claims from research PDFs, retrieves verified sources via
            Crossref, OpenAlex, and Tavily, performs deep RAG evidence matching, and generates
            verifiable trust reports.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4 max-w-md sm:max-w-none mx-auto">
            {/* Primary CTA — Black background with white glowing star border */}
            <StarBorder
              as={Link}
              to="/signup"
              color="#ffffff"
              speed="5s"
              className="w-full sm:w-auto"
              innerClassName="w-full bg-black text-white hover:bg-neutral-900 shadow-sm justify-center py-3.5 sm:py-3"
            >
              <span>Start Auditing Papers Free</span>
              <ArrowRight className="w-4 h-4 text-white shrink-0" />
            </StarBorder>

            {/* Secondary CTA — White background with black/dark glowing star border */}
            <StarBorder
              as={Link}
              to="/login"
              color="#000000"
              speed="6s"
              className="w-full sm:w-auto"
              innerClassName="w-full bg-white text-black border border-neutral-300 hover:bg-neutral-50 shadow-xs justify-center py-3.5 sm:py-3"
            >
              <span>Researcher Sign In</span>
              <ArrowRight className="w-4 h-4 text-black shrink-0" />
            </StarBorder>
          </div>
        </div>

        {/* 4-Step Process */}
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black">How CiteVerify Works</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">Four automated steps from raw paper to audited trust score</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">Document Ingestion</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Extracts text page-by-page from PDFs, DOCX, ODT, TXT, preserving exact page number metadata.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">Claim Extraction</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Groq LLM extracts testable factual claims with citation markers validated by Pydantic.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">Source Retrieval</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Crossref & OpenAlex retrieve metadata, abstracts, and DOIs, falling back to Tavily for web sources.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">Evidence Verification</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                RAG semantic search matches claims with evidence to generate supported/contradicted verdicts.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-black rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white space-y-6 sm:space-y-8">
          <div className="max-w-2xl">
            <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">Enterprise-Grade Architecture</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-1 text-white">Built For Academic Integrity</h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
              No simulated data or hardcoded mock results. Every verification result is generated through real LLM evaluation and academic database queries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 pt-2 sm:pt-4">
            <div className="space-y-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <h4 className="text-sm font-bold">Strict Pydantic Schemas</h4>
              <p className="text-xs text-neutral-400">All LLM outputs are validated against strict type-safe schemas.</p>
            </div>

            <div className="space-y-2">
              <Layers className="w-5 h-5 text-white" />
              <h4 className="text-sm font-bold">Page-Level Traceability</h4>
              <p className="text-xs text-neutral-400">Every claim and piece of evidence tracks exact PDF page numbers.</p>
            </div>

            <div className="space-y-2">
              <Database className="w-5 h-5 text-white" />
              <h4 className="text-sm font-bold">pgvector & Dense Embeddings</h4>
              <p className="text-xs text-neutral-400">Sentence Transformers 384-dimensional semantic similarity matching.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

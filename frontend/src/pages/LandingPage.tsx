import React, { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { StarBorder } from '../components/ui/StarBorder';
import gsap from 'gsap';
import {
  CheckCircle2,
  ArrowRight,
  Layers,
  Database,
  FileText,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // 1. Hero card subtle scale and fade
      gsap.from('.gsap-hero', {
        scale: 0.97,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      // 2. Staggered hero contents
      gsap.from('.gsap-hero-child', {
        y: 30,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        delay: 0.2,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      // 3. Remaining sections
      gsap.from('.gsap-section', {
        y: 35,
        opacity: 0,
        duration: 0.75,
        stagger: 0.15,
        delay: 0.35,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <Layout>
      <div ref={containerRef} className="py-4 sm:py-8 md:py-12 max-w-6xl mx-auto space-y-16 sm:space-y-24 px-2 sm:px-4">
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION — Superconscious / Outcrowd Ethereal Monochrome Atmosphere */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div className="gsap-hero relative rounded-3xl bg-black text-white p-6 sm:p-12 md:p-20 overflow-hidden border border-neutral-800 shadow-2xl transition-all">
          {/* Layer 1: Ethereal Breathing Mesh Aura (Radial Glow) */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 w-[450px] sm:w-[650px] md:w-[800px] h-[450px] sm:h-[650px] md:h-[800px] rounded-full blur-[100px] md:blur-[140px] animate-aura"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, rgba(200, 200, 200, 0.06) 45%, rgba(0, 0, 0, 0) 70%)',
            }}
          />

          {/* Layer 2: Concentric Harmonic Ripple Rings (Frequency Waves) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 md:w-[480px] h-64 sm:h-96 md:h-[480px] rounded-full border border-white/[0.08] animate-ripple-1" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 md:w-[480px] h-64 sm:h-96 md:h-[480px] rounded-full border border-white/[0.05] animate-ripple-2" />

          {/* Layer 3: Central Rotating Neural Orbit (Dashed Gyro Rings) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[420px] md:w-[560px] h-72 sm:h-[420px] md:h-[560px] rounded-full border border-dashed border-white/[0.07] animate-spin-slow" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-60 sm:w-[340px] md:w-[440px] h-60 sm:h-[340px] md:h-[440px] rounded-full border border-dotted border-white/[0.05] animate-spin-reverse" />

          {/* Main Hero Content (Kinetic Typography & Neural Centerpiece) */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
            {/* Top Kinetic Pill Badge */}
            <div className="gsap-hero-child inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.18] backdrop-blur-md text-neutral-200 text-[11px] sm:text-xs font-semibold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>Next-Gen Academic Citation & Claim Auditor</span>
            </div>

            {/* Shimmering Headline */}
            <h1 className="gsap-hero-child text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Verify Academic Truth <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 via-white to-neutral-500 animate-shimmer-text">
                With Neural Precision.
              </span>
            </h1>

            {/* Subheading */}
            <p className="gsap-hero-child text-sm sm:text-base md:text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed">
              CiteVerify ingests research papers, isolates testable claims with exact page numbers,
              cross-checks citations across Crossref and OpenAlex, and executes deep RAG evidence verification.
            </p>

            {/* Dual CTAs (Star Border Micro-Interactions) */}
            <div className="gsap-hero-child flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 max-w-md sm:max-w-none mx-auto">
              <StarBorder
                as={Link}
                to="/signup"
                color="#ffffff"
                speed="5s"
                className="w-full sm:w-auto"
                innerClassName="w-full bg-white text-black hover:bg-neutral-100 shadow-lg justify-center py-3.5 sm:py-3.5 font-bold"
              >
                <span>Start Auditing Papers Free</span>
                <ArrowRight className="w-4 h-4 text-black shrink-0" />
              </StarBorder>

              <StarBorder
                as={Link}
                to="/login"
                color="#888888"
                speed="6s"
                className="w-full sm:w-auto"
                innerClassName="w-full bg-neutral-900/90 text-white border border-neutral-700 hover:bg-neutral-800 shadow-sm justify-center py-3.5 sm:py-3.5"
              >
                <span>Researcher Sign In</span>
                <ArrowRight className="w-4 h-4 text-neutral-300 shrink-0" />
              </StarBorder>
            </div>

            {/* Center Neural Soundwave Pulse (Brainwave Entrainment Theme from Superconscious) */}
            <div className="gsap-hero-child pt-8 flex flex-col items-center justify-center gap-2 opacity-80">
              <div className="flex items-center justify-center gap-1.5 h-8">
                {[0.4, 0.7, 1.0, 0.6, 0.9, 0.3, 0.8, 1.0, 0.5, 0.9, 0.4, 0.7].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-white/70 rounded-full"
                    style={{
                      height: `${height * 28}px`,
                      animation: `soundwave-pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                Live RAG Semantic Resonance Engine
              </span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* INFINITE RUNNING MARQUEE — Scientific Integration Ticker */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        <div className="gsap-section relative overflow-hidden py-4 border-y border-neutral-200 bg-neutral-50 rounded-2xl select-none">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-neutral-50 to-transparent z-10" />

          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600">
            <span>GROQ LLM (GPT-OSS-120B)</span>
            <span>•</span>
            <span>CROSSREF DOI RESOLUTION</span>
            <span>•</span>
            <span>OPENALEX CITATION GRAPH</span>
            <span>•</span>
            <span>TAVILY NEURAL WEB SEARCH</span>
            <span>•</span>
            <span>PGVECTOR 384-DIM DENSE RETRIEVAL</span>
            <span>•</span>
            <span>PYMUPDF PAGE ATTRIBUTION</span>
            <span>•</span>
            <span>STRICT ZERO-MOCK PIPELINE</span>
            <span>•</span>
            {/* Duplicated for seamless continuous loop */}
            <span>GROQ LLM (GPT-OSS-120B)</span>
            <span>•</span>
            <span>CROSSREF DOI RESOLUTION</span>
            <span>•</span>
            <span>OPENALEX CITATION GRAPH</span>
            <span>•</span>
            <span>TAVILY NEURAL WEB SEARCH</span>
            <span>•</span>
            <span>PGVECTOR 384-DIM DENSE RETRIEVAL</span>
            <span>•</span>
            <span>PYMUPDF PAGE ATTRIBUTION</span>
            <span>•</span>
            <span>STRICT ZERO-MOCK PIPELINE</span>
          </div>
        </div>

                      {/* ═════════════════════════════════════════════════════════════════════════ */}
                      {/* INTERACTIVE AUDIT DECK PREVIEW (Superconscious Product Card Interface)  */}
                      {/* ═════════════════════════════════════════════════════════════════════════ */}
                        <div className="gsap-section space-y-4">
                          <div className="text-center">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
                              [ REAL-TIME WORKSPACE PREVIEW ]
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
                              Precision That Leaves No Claim Unchecked
                            </h2>
                          </div>

                          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-900">
                                    quantum_coherence_biological_systems_2025.pdf
                                  </h4>
                                  <p className="text-xs text-neutral-500">
                                    42 Pages • 28 Citations Cross-Checked • RAG Matched
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-black text-white font-semibold">
                                  Trust Score: 94%
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                                <span className="text-xs font-semibold text-neutral-500">Supported Claims</span>
                                <p className="text-2xl font-bold text-black">19</p>
                                <p className="text-[11px] text-neutral-600">Validated against Crossref sources</p>
                              </div>
                              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                                <span className="text-xs font-semibold text-neutral-500">Contradicted</span>
                                <p className="text-2xl font-bold text-black">2</p>
                                <p className="text-[11px] text-neutral-600">Literature refutes findings</p>
                              </div>
                              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                                <span className="text-xs font-semibold text-neutral-500">Verification Engine</span>
                                <p className="text-2xl font-bold text-black">0.3s</p>
                                <p className="text-[11px] text-neutral-600">Groq LLM + pgvector latency</p>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800">Claim #3 • Page 8 Attribution</span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black text-white">
                                  SUPPORTED
                                </span>
                              </div>
                              <p className="text-xs text-neutral-700 leading-relaxed italic">
                                "Room-temperature quantum coherence in photosynthetic complexes persists beyond 100 femtoseconds under physiological conditions."
                              </p>
                              <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
                                <span>Source: Nature Physical Chemistry (DOI: 10.1038/s41570-023-00482-9)</span>
                                <span className="font-semibold text-black">Cosine Similarity: 0.94</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ═════════════════════════════════════════════════════════════════════════ */}
                        {/* 4-STEP PROCESS CARDS                                                      */}
                        {/* ═════════════════════════════════════════════════════════════════════════ */}
                          <div className="gsap-section space-y-6 sm:space-y-8">
                            <div className="text-center px-2">
                              <h2 className="text-xl sm:text-3xl font-extrabold text-black">How CiteVerify Operates</h2>
                              <p className="text-xs sm:text-sm text-neutral-500 mt-1">Four rigorous stages from raw document to certified audit report</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 hover:border-black transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                                  1
                                </div>
                                <h3 className="text-base font-bold text-neutral-900">Document Ingestion</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                  Extracts text page-by-page from PDFs, DOCX, ODT, TXT, preserving exact page number metadata.
                                </p>
                              </div>

                              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 hover:border-black transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                                  2
                                </div>
                                <h3 className="text-base font-bold text-neutral-900">Claim Extraction</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                  Groq LLM extracts testable factual claims with citation markers validated by Pydantic.
                                </p>
                              </div>

                              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 hover:border-black transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                                  3
                                </div>
                                <h3 className="text-base font-bold text-neutral-900">Source Retrieval</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                  Crossref & OpenAlex retrieve metadata, abstracts, and DOIs, falling back to Tavily for web sources.
                                </p>
                              </div>

                              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3 hover:border-black transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                                  4
                                </div>
                                <h3 className="text-base font-bold text-neutral-900">Evidence Verification</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                  RAG semantic search matches claims with evidence to generate supported/contradicted verdicts.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* ═════════════════════════════════════════════════════════════════════════ */}
                          {/* ENTERPRISE ARCHITECTURE BANNER                                            */}
                          {/* ═════════════════════════════════════════════════════════════════════════ */}
                            <div className="gsap-section bg-black rounded-3xl p-6 sm:p-10 md:p-14 text-white space-y-8 border border-neutral-800 shadow-2xl relative overflow-hidden">
                              <div className="max-w-2xl">
                                <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
                                  ENTERPRISE-GRADE ARCHITECTURE
                                </span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mt-1 text-white">
                                  Built For Academic Integrity
                                </h2>
                                <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                                  No simulated data or hardcoded mock results. Every verification result is generated through real LLM evaluation and academic database queries.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                                <div className="space-y-2">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                  <h4 className="text-sm font-bold text-white">Strict Pydantic Schemas</h4>
                                  <p className="text-xs text-neutral-400 leading-relaxed">
                                    All LLM outputs are validated against strict type-safe schemas.
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Layers className="w-5 h-5 text-white" />
                                  <h4 className="text-sm font-bold text-white">Page-Level Traceability</h4>
                                  <p className="text-xs text-neutral-400 leading-relaxed">
                                    Every claim and piece of evidence tracks exact PDF page numbers.
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Database className="w-5 h-5 text-white" />
                                  <h4 className="text-sm font-bold text-white">pgvector & Dense Embeddings</h4>
                                  <p className="text-xs text-neutral-400 leading-relaxed">
                                    Sentence Transformers 384-dimensional semantic similarity matching.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Layout>
                        );
};

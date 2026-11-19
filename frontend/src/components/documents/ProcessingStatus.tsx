import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { documents as documentsApi } from '../../services/api';
import { LatticeLoader } from '../ui/LatticeLoader';
import { BellToggle } from '../ui/BellToggle';
import {
  NOTIFICATION_STORAGE_KEY,
  notifyVerificationComplete,
} from '../../lib/notifications';

interface ProcessingStatusProps {
  documentId: string;
  initialStatus: string;
  filename?: string;
  onCompleted?: () => void;
}

const STEPS = [
  { id: 'extracting_text', label: 'Extracting Text & PDF Structure' },
  { id: 'finding_claims', label: 'Extracting Factual Claims (Groq LLM)' },
  { id: 'retrieving_citations', label: 'Retrieving Citations (Crossref / OpenAlex / Tavily)' },
  { id: 'verifying', label: 'Verifying Evidence & Generating Trust Scores' },
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  documentId,
  initialStatus,
  filename,
  onCompleted,
}) => {
  const [status, setStatus] = useState<string>(initialStatus);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'completed' || status === 'error') return;

    const interval = setInterval(async () => {
      try {
        const res = await documentsApi.getStatus(documentId);
        setStatus(res.status);
        if (res.error_message) setErrorMsg(res.error_message);

        if (res.status === 'completed') {
          clearInterval(interval);

          // Check if notification is enabled and notify user
          try {
            const isNotifyEnabled = localStorage.getItem(NOTIFICATION_STORAGE_KEY) === 'true';
            if (isNotifyEnabled) {
              notifyVerificationComplete(filename);
            }
          } catch {
            // Ignore
          }

          if (onCompleted) onCompleted();
        } else if (res.status === 'error') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [documentId, status, filename, onCompleted]);

  const getStepState = (stepId: string) => {
    if (status === 'completed') return 'completed';
    if (status === 'error') return 'error';

    const order = ['uploaded', 'processing', 'extracting_text', 'finding_claims', 'retrieving_citations', 'verifying', 'completed'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  const currentStep = STEPS.find((s) => getStepState(s.id) === 'current');

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 flex-wrap gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900">Verification Pipeline Status</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {status !== 'completed' && status !== 'error' && (
            <BellToggle activeLabel="Notify when done" inactiveLabel="Notify me" />
          )}
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-black text-white shrink-0">
            {status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {status !== 'completed' && status !== 'error' && (
        <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <LatticeLoader
            grid={3}
            pattern="orbit"
            cellSize={4.5}
            gap={2.5}
            status="loading"
            label={currentStep ? currentStep.label : 'Processing Document...'}
            showTimer={true}
          />
          <span className="text-[10px] sm:text-[11px] font-mono text-neutral-500 uppercase tracking-wider font-semibold self-end sm:self-auto">
            Active
          </span>
        </div>
      )}

      <div className="space-y-3">
        {STEPS.map((step) => {
          const state = getStepState(step.id);
          return (
            <div key={step.id} className="flex items-center gap-3">
              {state === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
              ) : state === 'current' ? (
                <LatticeLoader
                  grid={3}
                  pattern="snake"
                  cellSize={3.5}
                  gap={1.5}
                  status="loading"
                  className="shrink-0"
                />
              ) : (
                <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  state === 'completed'
                    ? 'text-neutral-900 font-semibold'
                    : state === 'current'
                    ? 'text-black font-semibold'
                    : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-lg bg-neutral-100 border border-neutral-300 text-xs text-neutral-900 flex items-start gap-2 overflow-hidden break-words">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
          <span className="break-all">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { documents as docsApi } from '../services/api';
import type { VerificationResult, Citation } from '../types';

export function useVerification(documentId: string | undefined) {
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    if (!documentId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [vData, cData] = await Promise.all([
        docsApi.getVerification(documentId),
        docsApi.getCitations(documentId),
      ]);
      setVerifications(vData);
      setCitations(cData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch verification';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  return { verifications, citations, isLoading, error, refetch: fetchVerification };
}

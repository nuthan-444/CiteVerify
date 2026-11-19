import { useState, useEffect, useCallback } from 'react';
import { documents as docsApi } from '../services/api';
import type { Claim } from '../types';

export function useClaims(documentId: string | undefined) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!documentId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await docsApi.getClaims(documentId);
      setClaims(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch claims';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return { claims, isLoading, error, refetch: fetchClaims };
}

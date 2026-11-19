import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { documents as docsApi } from '../services/api';
import type { Document } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DocumentContextType {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  deleteDocument: (id: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await docsApi.list();
      setDocuments(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = (doc: Document) => {
    setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
  };

  const deleteDocument = async (id: string) => {
    await docsApi.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        isLoading,
        error,
        fetchDocuments,
        addDocument,
        deleteDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentsContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentsContext must be used within a DocumentProvider');
  }
  return context;
};

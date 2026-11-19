export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
}

export interface Document {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'extracting_text' | 'finding_claims' | 'retrieving_citations' | 'verifying' | 'completed' | 'error';
  page_count: number;
  created_at: string;
  updated_at?: string;
  error_message?: string;
  trust_score?: number;
  metadata?: Record<string, unknown>;
}

export interface Claim {
  id: string;
  document_id: string;
  claim_text: string;
  page_number: number;
  citation_marker?: string;
  section?: string;
  confidence?: number;
  verification?: VerificationResult;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  claim_id: string;
  source_type: 'crossref' | 'openalex' | 'tavily';
  title: string;
  authors: string[];
  doi?: string;
  url?: string;
  publication_year?: number;
  abstract?: string;
  metadata?: Record<string, unknown>;
}

export interface VerificationResult {
  id: string;
  claim_id: string;
  citation_id?: string;
  verdict: 'supported' | 'contradicted' | 'insufficient_evidence';
  confidence: number;
  reasoning: string;
  evidence_text?: string;
  evidence_page?: number;
}

export interface DocumentStatus {
  status: string;
  progress?: number;
  current_step?: string;
  steps_completed?: string[];
  error_message?: string;
}

export interface Report {
  id: string;
  document_id: string;
  content: string;
  generated_at: string;
  download_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DashboardStats {
  total_documents: number;
  total_claims: number;
  average_trust_score: number;
  documents_processing: number;
}

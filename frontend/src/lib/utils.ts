import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-white bg-black border border-black';
    case 'processing':
    case 'extracting_text':
    case 'finding_claims':
    case 'retrieving_citations':
    case 'verifying':
      return 'text-neutral-900 bg-neutral-100 border border-neutral-300';
    case 'error':
      return 'text-white bg-neutral-900 border border-black';
    case 'uploaded':
    default:
      return 'text-neutral-700 bg-neutral-100 border border-neutral-200';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'uploaded': return 'Uploaded';
    case 'processing': return 'Processing';
    case 'extracting_text': return 'Extracting Text';
    case 'finding_claims': return 'Finding Claims';
    case 'retrieving_citations': return 'Retrieving Citations';
    case 'verifying': return 'Verifying';
    case 'completed': return 'Completed';
    case 'error': return 'Error';
    default: return status;
  }
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'supported':
      return 'text-white bg-black border-black';
    case 'contradicted':
      return 'text-black bg-neutral-200 border-neutral-400';
    case 'insufficient_evidence':
      return 'text-neutral-800 bg-neutral-100 border-neutral-300';
    default:
      return 'text-neutral-700 bg-neutral-100 border-neutral-200';
  }
}

export function getTrustScoreColor(score: number): string {
  const s = score <= 1.0 && score > 0 ? score * 100 : score;
  if (s >= 70) return '#000000';
  if (s >= 40) return '#404040';
  return '#737373';
}

export function getTrustScoreLabel(score: number): string {
  const s = score <= 1.0 && score > 0 ? score * 100 : score;
  if (s >= 70) return 'High Trust';
  if (s >= 40) return 'Medium Trust';
  return 'Low Trust';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

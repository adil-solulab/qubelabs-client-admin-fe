export type DocumentType = 'faq' | 'pdf' | 'manual' | 'article' | 'policy';

export type TrainingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DocumentVersion {
  id: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  size: string;
  changes: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  versions: DocumentVersion[];
  lastTrained?: string;
  tokensUsed?: number;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  faq: 'FAQ',
  pdf: 'PDF Document',
  manual: 'Manual',
  article: 'Article',
  policy: 'Policy',
};

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  pending: 'Pending',
  processing: 'Training...',
  completed: 'Trained',
  failed: 'Failed',
};

export const DOCUMENT_CATEGORIES = [
  'Product Documentation',
  'Customer Support',
  'Sales Materials',
  'Policies & Procedures',
  'Technical Guides',
  'Onboarding',
  'FAQs',
];

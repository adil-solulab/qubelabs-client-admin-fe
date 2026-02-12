export type FileType = 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'csv' | 'xlsx';

export type FileCategory = 
  | 'FAQ'
  | 'Memo'
  | 'Customer Support'
  | 'Sales Materials'
  | 'Policy'
  | 'Technical Guide'
  | 'Onboarding'
  | 'Training Manual'
  | 'SOP'
  | 'Knowledge Article';

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
  fileType: FileType;
  category: FileCategory;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  versions: DocumentVersion[];
  lastTrained?: string;
  tokensUsed?: number;
}

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  doc: 'DOC',
  txt: 'TXT',
  md: 'Markdown',
  csv: 'CSV',
  xlsx: 'Excel',
};

export const FILE_TYPE_EXTENSIONS: Record<FileType, string> = {
  pdf: '.pdf',
  docx: '.docx',
  doc: '.doc',
  txt: '.txt',
  md: '.md',
  csv: '.csv',
  xlsx: '.xlsx',
};

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  pending: 'Pending',
  processing: 'Training...',
  completed: 'Trained',
  failed: 'Failed',
};

export const FILE_CATEGORIES: FileCategory[] = [
  'FAQ',
  'Memo',
  'Customer Support',
  'Sales Materials',
  'Policy',
  'Technical Guide',
  'Onboarding',
  'Training Manual',
  'SOP',
  'Knowledge Article',
];

export const DOCUMENT_TYPE_LABELS = FILE_TYPE_LABELS;
export const DOCUMENT_CATEGORIES = FILE_CATEGORIES;
export type DocumentType = FileType;

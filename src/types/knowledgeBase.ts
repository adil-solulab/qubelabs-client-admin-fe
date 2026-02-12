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

export type KBSourceType = 'file' | 'url' | 'sitemap' | 'integration';

export type CrawlStatus = 'idle' | 'crawling' | 'completed' | 'failed';

export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';

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
  sourceType: KBSourceType;
  sourceUrl?: string;
  pagesDiscovered?: number;
  pagesCrawled?: number;
  crawlStatus?: CrawlStatus;
  syncFrequency?: SyncFrequency;
  lastSynced?: string;
  integrationName?: string;
  integrationIcon?: string;
  extractedContent?: string;
}

export interface URLSource {
  id: string;
  url: string;
  title: string;
  status: CrawlStatus;
  pagesDiscovered: number;
  pagesCrawled: number;
  size: string;
  addedAt: string;
  addedBy: string;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  lastSynced?: string;
  syncFrequency: SyncFrequency;
  tokensUsed?: number;
  extractedPages?: ExtractedPage[];
}

export interface ExtractedPage {
  url: string;
  title: string;
  wordCount: number;
  status: 'extracted' | 'failed' | 'pending';
}

export interface SitemapSource {
  id: string;
  sitemapUrl: string;
  domain: string;
  status: CrawlStatus;
  totalUrls: number;
  crawledUrls: number;
  size: string;
  addedAt: string;
  addedBy: string;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  lastSynced?: string;
  syncFrequency: SyncFrequency;
  tokensUsed?: number;
  discoveredPages?: ExtractedPage[];
}

export interface IntegrationSource {
  id: string;
  integrationName: string;
  integrationIcon: string;
  sourceType: string;
  status: CrawlStatus;
  itemsImported: number;
  totalItems: number;
  size: string;
  addedAt: string;
  addedBy: string;
  trainingStatus: TrainingStatus;
  trainingProgress: number;
  lastSynced?: string;
  syncFrequency: SyncFrequency;
  tokensUsed?: number;
  connectionDetails?: string;
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

export const SOURCE_TYPE_LABELS: Record<KBSourceType, string> = {
  file: 'File Upload',
  url: 'Website URL',
  sitemap: 'Sitemap',
  integration: 'Integration',
};

export const SYNC_FREQUENCY_LABELS: Record<SyncFrequency, string> = {
  manual: 'Manual',
  hourly: 'Every Hour',
  daily: 'Daily',
  weekly: 'Weekly',
};

export const AVAILABLE_INTEGRATIONS = [
  { id: 'salesforce', name: 'Salesforce', icon: '💼', description: 'Import knowledge articles from Salesforce' },
  { id: 'confluence', name: 'Confluence', icon: '📘', description: 'Sync pages from Confluence spaces' },
  { id: 'notion', name: 'Notion', icon: '📓', description: 'Import pages from Notion workspaces' },
  { id: 'zendesk', name: 'Zendesk', icon: '💬', description: 'Sync help center articles from Zendesk' },
  { id: 'sharepoint', name: 'SharePoint', icon: '📁', description: 'Import documents from SharePoint' },
  { id: 'google_drive', name: 'Google Drive', icon: '📂', description: 'Import files from Google Drive folders' },
  { id: 'aws_s3', name: 'AWS S3', icon: '☁️', description: 'Fetch documents from S3 buckets' },
  { id: 'servicenow', name: 'ServiceNow', icon: '⚙️', description: 'Sync knowledge base articles from ServiceNow' },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🎧', description: 'Import solution articles from Freshdesk' },
  { id: 'database', name: 'Database', icon: '🗄️', description: 'Connect to PostgreSQL, MySQL, or MongoDB' },
];

export const DOCUMENT_TYPE_LABELS = FILE_TYPE_LABELS;
export const DOCUMENT_CATEGORIES = FILE_CATEGORIES;
export type DocumentType = FileType;

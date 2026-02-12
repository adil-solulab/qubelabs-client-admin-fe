import { useState, useCallback } from 'react';
import type { 
  KnowledgeDocument, FileType, FileCategory, TrainingStatus,
  URLSource, SitemapSource, IntegrationSource, CrawlStatus, SyncFrequency
} from '@/types/knowledgeBase';

const generateMockDocuments = (): KnowledgeDocument[] => [
  {
    id: '1',
    name: 'Product FAQ 2024',
    fileType: 'pdf',
    category: 'FAQ',
    size: '245 KB',
    uploadedAt: '2024-05-15',
    uploadedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-05-15',
    tokensUsed: 12450,
    sourceType: 'file',
    versions: [
      { id: 'v3', version: '3.0', uploadedAt: '2024-05-15', uploadedBy: 'John Anderson', size: '245 KB', changes: 'Added new product features' },
      { id: 'v2', version: '2.0', uploadedAt: '2024-03-10', uploadedBy: 'Sarah Mitchell', size: '198 KB', changes: 'Updated pricing information' },
      { id: 'v1', version: '1.0', uploadedAt: '2024-01-20', uploadedBy: 'John Anderson', size: '156 KB', changes: 'Initial version' },
    ],
  },
  {
    id: '2',
    name: 'Customer Support Guidelines',
    fileType: 'docx',
    category: 'Customer Support',
    size: '1.2 MB',
    uploadedAt: '2024-04-20',
    uploadedBy: 'Sarah Mitchell',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-04-20',
    tokensUsed: 45670,
    sourceType: 'file',
    versions: [
      { id: 'v2', version: '2.0', uploadedAt: '2024-04-20', uploadedBy: 'Sarah Mitchell', size: '1.2 MB', changes: 'Added escalation procedures' },
      { id: 'v1', version: '1.0', uploadedAt: '2024-02-15', uploadedBy: 'Sarah Mitchell', size: '980 KB', changes: 'Initial version' },
    ],
  },
  {
    id: '3',
    name: 'Sales Playbook Q2',
    fileType: 'pdf',
    category: 'Sales Materials',
    size: '3.4 MB',
    uploadedAt: '2024-05-01',
    uploadedBy: 'Emily Rodriguez',
    trainingStatus: 'processing',
    trainingProgress: 67,
    tokensUsed: 0,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-05-01', uploadedBy: 'Emily Rodriguez', size: '3.4 MB', changes: 'Initial version' },
    ],
  },
  {
    id: '4',
    name: 'Technical Integration Guide',
    fileType: 'md',
    category: 'Technical Guide',
    size: '2.8 MB',
    uploadedAt: '2024-04-10',
    uploadedBy: 'Michael Chen',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-04-10',
    tokensUsed: 67890,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-04-10', uploadedBy: 'Michael Chen', size: '2.8 MB', changes: 'Initial version' },
    ],
  },
  {
    id: '5',
    name: 'Privacy Policy',
    fileType: 'pdf',
    category: 'Policy',
    size: '156 KB',
    uploadedAt: '2024-03-01',
    uploadedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-03-01',
    tokensUsed: 8920,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-03-01', uploadedBy: 'John Anderson', size: '156 KB', changes: 'Initial version' },
    ],
  },
  {
    id: '6',
    name: 'New Employee Onboarding',
    fileType: 'docx',
    category: 'Onboarding',
    size: '890 KB',
    uploadedAt: '2024-05-18',
    uploadedBy: 'Lisa Park',
    trainingStatus: 'pending',
    trainingProgress: 0,
    tokensUsed: 0,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-05-18', uploadedBy: 'Lisa Park', size: '890 KB', changes: 'Initial version' },
    ],
  },
  {
    id: '7',
    name: 'Internal Communications Memo',
    fileType: 'txt',
    category: 'Memo',
    size: '45 KB',
    uploadedAt: '2024-05-20',
    uploadedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-05-20',
    tokensUsed: 3200,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-05-20', uploadedBy: 'John Anderson', size: '45 KB', changes: 'Initial version' },
    ],
  },
  {
    id: '8',
    name: 'Standard Operating Procedures',
    fileType: 'xlsx',
    category: 'SOP',
    size: '1.5 MB',
    uploadedAt: '2024-04-25',
    uploadedBy: 'Michael Chen',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastTrained: '2024-04-25',
    tokensUsed: 28400,
    sourceType: 'file',
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-04-25', uploadedBy: 'Michael Chen', size: '1.5 MB', changes: 'Initial version' },
    ],
  },
];

const generateMockURLSources = (): URLSource[] => [
  {
    id: 'url-1',
    url: 'https://docs.qubelabs.ai/getting-started',
    title: 'Getting Started Guide',
    status: 'completed',
    pagesDiscovered: 1,
    pagesCrawled: 1,
    size: '128 KB',
    addedAt: '2024-05-10',
    addedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastSynced: '2024-05-10',
    syncFrequency: 'weekly',
    tokensUsed: 8340,
    extractedPages: [
      { url: 'https://docs.qubelabs.ai/getting-started', title: 'Getting Started Guide', wordCount: 2450, status: 'extracted' },
    ],
  },
  {
    id: 'url-2',
    url: 'https://help.qubelabs.ai/troubleshooting',
    title: 'Troubleshooting & FAQ',
    status: 'completed',
    pagesDiscovered: 3,
    pagesCrawled: 3,
    size: '356 KB',
    addedAt: '2024-05-12',
    addedBy: 'Sarah Mitchell',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastSynced: '2024-05-15',
    syncFrequency: 'daily',
    tokensUsed: 18920,
    extractedPages: [
      { url: 'https://help.qubelabs.ai/troubleshooting', title: 'Troubleshooting Overview', wordCount: 1800, status: 'extracted' },
      { url: 'https://help.qubelabs.ai/troubleshooting/common-issues', title: 'Common Issues', wordCount: 3200, status: 'extracted' },
      { url: 'https://help.qubelabs.ai/troubleshooting/error-codes', title: 'Error Codes Reference', wordCount: 2100, status: 'extracted' },
    ],
  },
  {
    id: 'url-3',
    url: 'https://blog.qubelabs.ai/ai-best-practices',
    title: 'AI Best Practices Blog',
    status: 'crawling',
    pagesDiscovered: 5,
    pagesCrawled: 2,
    size: '89 KB',
    addedAt: '2024-05-20',
    addedBy: 'Michael Chen',
    trainingStatus: 'pending',
    trainingProgress: 0,
    syncFrequency: 'manual',
    tokensUsed: 0,
    extractedPages: [
      { url: 'https://blog.qubelabs.ai/ai-best-practices', title: 'AI Best Practices', wordCount: 1500, status: 'extracted' },
      { url: 'https://blog.qubelabs.ai/ai-best-practices/prompt-engineering', title: 'Prompt Engineering Tips', wordCount: 2800, status: 'extracted' },
      { url: 'https://blog.qubelabs.ai/ai-best-practices/training-data', title: 'Training Data Quality', wordCount: 0, status: 'pending' },
      { url: 'https://blog.qubelabs.ai/ai-best-practices/fine-tuning', title: 'Fine Tuning Guide', wordCount: 0, status: 'pending' },
      { url: 'https://blog.qubelabs.ai/ai-best-practices/evaluation', title: 'Model Evaluation', wordCount: 0, status: 'pending' },
    ],
  },
];

const generateMockSitemapSources = (): SitemapSource[] => [
  {
    id: 'sm-1',
    sitemapUrl: 'https://docs.qubelabs.ai/sitemap.xml',
    domain: 'docs.qubelabs.ai',
    status: 'completed',
    totalUrls: 47,
    crawledUrls: 47,
    size: '2.4 MB',
    addedAt: '2024-04-28',
    addedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastSynced: '2024-05-18',
    syncFrequency: 'daily',
    tokensUsed: 156780,
    discoveredPages: [
      { url: 'https://docs.qubelabs.ai/overview', title: 'Platform Overview', wordCount: 3400, status: 'extracted' },
      { url: 'https://docs.qubelabs.ai/api-reference', title: 'API Reference', wordCount: 12500, status: 'extracted' },
      { url: 'https://docs.qubelabs.ai/sdk', title: 'SDK Documentation', wordCount: 8900, status: 'extracted' },
      { url: 'https://docs.qubelabs.ai/webhooks', title: 'Webhook Setup', wordCount: 2100, status: 'extracted' },
      { url: 'https://docs.qubelabs.ai/authentication', title: 'Authentication Guide', wordCount: 4200, status: 'extracted' },
    ],
  },
  {
    id: 'sm-2',
    sitemapUrl: 'https://support.qubelabs.ai/sitemap.xml',
    domain: 'support.qubelabs.ai',
    status: 'crawling',
    totalUrls: 128,
    crawledUrls: 84,
    size: '1.1 MB',
    addedAt: '2024-05-15',
    addedBy: 'Sarah Mitchell',
    trainingStatus: 'pending',
    trainingProgress: 0,
    syncFrequency: 'weekly',
    tokensUsed: 0,
    discoveredPages: [
      { url: 'https://support.qubelabs.ai/billing', title: 'Billing FAQ', wordCount: 1800, status: 'extracted' },
      { url: 'https://support.qubelabs.ai/account', title: 'Account Management', wordCount: 2400, status: 'extracted' },
      { url: 'https://support.qubelabs.ai/integrations', title: 'Integration Guides', wordCount: 0, status: 'pending' },
    ],
  },
];

const generateMockIntegrationSources = (): IntegrationSource[] => [
  {
    id: 'int-1',
    integrationName: 'Salesforce',
    integrationIcon: '💼',
    sourceType: 'Knowledge Articles',
    status: 'completed',
    itemsImported: 156,
    totalItems: 156,
    size: '4.2 MB',
    addedAt: '2024-04-15',
    addedBy: 'John Anderson',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastSynced: '2024-05-19',
    syncFrequency: 'daily',
    tokensUsed: 234560,
    connectionDetails: 'Connected to Acme Corp Salesforce instance',
  },
  {
    id: 'int-2',
    integrationName: 'Confluence',
    integrationIcon: '📘',
    sourceType: 'Wiki Pages',
    status: 'completed',
    itemsImported: 89,
    totalItems: 89,
    size: '2.8 MB',
    addedAt: '2024-05-01',
    addedBy: 'Michael Chen',
    trainingStatus: 'completed',
    trainingProgress: 100,
    lastSynced: '2024-05-17',
    syncFrequency: 'weekly',
    tokensUsed: 145230,
    connectionDetails: 'Engineering space - All pages',
  },
  {
    id: 'int-3',
    integrationName: 'Zendesk',
    integrationIcon: '💬',
    sourceType: 'Help Center Articles',
    status: 'crawling',
    itemsImported: 42,
    totalItems: 78,
    size: '890 KB',
    addedAt: '2024-05-20',
    addedBy: 'Sarah Mitchell',
    trainingStatus: 'pending',
    trainingProgress: 0,
    syncFrequency: 'daily',
    tokensUsed: 0,
    connectionDetails: 'QubeLabs Help Center - All categories',
  },
];

export function useKnowledgeBaseData() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(generateMockDocuments());
  const [urlSources, setUrlSources] = useState<URLSource[]>(generateMockURLSources());
  const [sitemapSources, setSitemapSources] = useState<SitemapSource[]>(generateMockSitemapSources());
  const [integrationSources, setIntegrationSources] = useState<IntegrationSource[]>(generateMockIntegrationSources());
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = useCallback(async (
    file: File,
    metadata: { type: FileType; category: string },
    onProgress: (progress: number) => void
  ): Promise<KnowledgeDocument> => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      onProgress(i);
    }

    const newDoc: KnowledgeDocument = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      fileType: metadata.type,
      category: metadata.category as FileCategory,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'John Anderson',
      trainingStatus: 'pending',
      trainingProgress: 0,
      tokensUsed: 0,
      sourceType: 'file',
      versions: [
        {
          id: 'v1',
          version: '1.0',
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'John Anderson',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          changes: 'Initial version',
        },
      ],
    };

    setDocuments(prev => [...prev, newDoc]);
    return newDoc;
  }, []);

  const addURLSource = useCallback(async (
    urls: string[],
    syncFrequency: SyncFrequency,
    onProgress: (progress: number) => void
  ) => {
    for (const url of urls) {
      const newSource: URLSource = {
        id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        url,
        title: url.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Untitled Page',
        status: 'crawling',
        pagesDiscovered: 0,
        pagesCrawled: 0,
        size: '0 KB',
        addedAt: new Date().toISOString().split('T')[0],
        addedBy: 'John Anderson',
        trainingStatus: 'pending',
        trainingProgress: 0,
        syncFrequency,
        tokensUsed: 0,
        extractedPages: [],
      };
      setUrlSources(prev => [...prev, newSource]);

      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        onProgress(i);
      }

      const discoveredCount = Math.floor(Math.random() * 5) + 1;
      const pages: URLSource['extractedPages'] = Array.from({ length: discoveredCount }, (_, idx) => ({
        url: `${url}/page-${idx + 1}`,
        title: `Page ${idx + 1}`,
        wordCount: Math.floor(Math.random() * 3000) + 500,
        status: 'extracted' as const,
      }));

      setUrlSources(prev =>
        prev.map(s =>
          s.id === newSource.id
            ? {
                ...s,
                status: 'completed' as CrawlStatus,
                pagesDiscovered: discoveredCount,
                pagesCrawled: discoveredCount,
                size: `${Math.floor(Math.random() * 500) + 50} KB`,
                extractedPages: pages,
              }
            : s
        )
      );
    }
  }, []);

  const addSitemapSource = useCallback(async (
    sitemapUrl: string,
    syncFrequency: SyncFrequency,
    onProgress: (progress: number) => void
  ) => {
    const domain = new URL(sitemapUrl).hostname;
    const newSource: SitemapSource = {
      id: `sm-${Date.now()}`,
      sitemapUrl,
      domain,
      status: 'crawling',
      totalUrls: 0,
      crawledUrls: 0,
      size: '0 KB',
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: 'John Anderson',
      trainingStatus: 'pending',
      trainingProgress: 0,
      syncFrequency,
      tokensUsed: 0,
      discoveredPages: [],
    };
    setSitemapSources(prev => [...prev, newSource]);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 400));
      onProgress(i);
    }

    const totalUrls = Math.floor(Math.random() * 80) + 20;
    const pages = Array.from({ length: Math.min(totalUrls, 10) }, (_, idx) => ({
      url: `https://${domain}/page-${idx + 1}`,
      title: `Discovered Page ${idx + 1}`,
      wordCount: Math.floor(Math.random() * 5000) + 500,
      status: 'extracted' as const,
    }));

    setSitemapSources(prev =>
      prev.map(s =>
        s.id === newSource.id
          ? {
              ...s,
              status: 'completed' as CrawlStatus,
              totalUrls,
              crawledUrls: totalUrls,
              size: `${(totalUrls * 0.05).toFixed(1)} MB`,
              discoveredPages: pages,
            }
          : s
      )
    );
  }, []);

  const addIntegrationSource = useCallback(async (
    integrationId: string,
    integrationName: string,
    integrationIcon: string,
    sourceType: string,
    syncFrequency: SyncFrequency,
    onProgress: (progress: number) => void
  ) => {
    const newSource: IntegrationSource = {
      id: `int-${Date.now()}`,
      integrationName,
      integrationIcon,
      sourceType,
      status: 'crawling',
      itemsImported: 0,
      totalItems: 0,
      size: '0 KB',
      addedAt: new Date().toISOString().split('T')[0],
      addedBy: 'John Anderson',
      trainingStatus: 'pending',
      trainingProgress: 0,
      syncFrequency,
      tokensUsed: 0,
      connectionDetails: `Connected to ${integrationName}`,
    };
    setIntegrationSources(prev => [...prev, newSource]);

    for (let i = 0; i <= 100; i += 15) {
      await new Promise(resolve => setTimeout(resolve, 350));
      onProgress(i);
    }

    const totalItems = Math.floor(Math.random() * 100) + 20;
    setIntegrationSources(prev =>
      prev.map(s =>
        s.id === newSource.id
          ? {
              ...s,
              status: 'completed' as CrawlStatus,
              itemsImported: totalItems,
              totalItems,
              size: `${(totalItems * 0.03).toFixed(1)} MB`,
            }
          : s
      )
    );
  }, []);

  const startTraining = useCallback(async (
    documentId: string,
    onProgress: (progress: number) => void
  ) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? { ...doc, trainingStatus: 'processing' as TrainingStatus, trainingProgress: 0 }
          : doc
      )
    );

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, trainingProgress: i }
            : doc
        )
      );
    }

    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? {
              ...doc,
              trainingStatus: 'completed' as TrainingStatus,
              trainingProgress: 100,
              lastTrained: new Date().toISOString().split('T')[0],
              tokensUsed: Math.floor(Math.random() * 50000) + 5000,
            }
          : doc
      )
    );
  }, []);

  const startURLTraining = useCallback(async (
    sourceId: string,
    onProgress: (progress: number) => void
  ) => {
    setUrlSources(prev =>
      prev.map(s => s.id === sourceId ? { ...s, trainingStatus: 'processing' as TrainingStatus, trainingProgress: 0 } : s)
    );
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
      setUrlSources(prev =>
        prev.map(s => s.id === sourceId ? { ...s, trainingProgress: i } : s)
      );
    }
    setUrlSources(prev =>
      prev.map(s => s.id === sourceId ? {
        ...s,
        trainingStatus: 'completed' as TrainingStatus,
        trainingProgress: 100,
        lastSynced: new Date().toISOString().split('T')[0],
        tokensUsed: Math.floor(Math.random() * 30000) + 5000,
      } : s)
    );
  }, []);

  const startSitemapTraining = useCallback(async (
    sourceId: string,
    onProgress: (progress: number) => void
  ) => {
    setSitemapSources(prev =>
      prev.map(s => s.id === sourceId ? { ...s, trainingStatus: 'processing' as TrainingStatus, trainingProgress: 0 } : s)
    );
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
      setSitemapSources(prev =>
        prev.map(s => s.id === sourceId ? { ...s, trainingProgress: i } : s)
      );
    }
    setSitemapSources(prev =>
      prev.map(s => s.id === sourceId ? {
        ...s,
        trainingStatus: 'completed' as TrainingStatus,
        trainingProgress: 100,
        lastSynced: new Date().toISOString().split('T')[0],
        tokensUsed: Math.floor(Math.random() * 200000) + 50000,
      } : s)
    );
  }, []);

  const startIntegrationTraining = useCallback(async (
    sourceId: string,
    onProgress: (progress: number) => void
  ) => {
    setIntegrationSources(prev =>
      prev.map(s => s.id === sourceId ? { ...s, trainingStatus: 'processing' as TrainingStatus, trainingProgress: 0 } : s)
    );
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
      setIntegrationSources(prev =>
        prev.map(s => s.id === sourceId ? { ...s, trainingProgress: i } : s)
      );
    }
    setIntegrationSources(prev =>
      prev.map(s => s.id === sourceId ? {
        ...s,
        trainingStatus: 'completed' as TrainingStatus,
        trainingProgress: 100,
        lastSynced: new Date().toISOString().split('T')[0],
        tokensUsed: Math.floor(Math.random() * 300000) + 50000,
      } : s)
    );
  }, []);

  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setIsLoading(false);
  }, []);

  const deleteURLSource = useCallback(async (sourceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setUrlSources(prev => prev.filter(s => s.id !== sourceId));
  }, []);

  const deleteSitemapSource = useCallback(async (sourceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setSitemapSources(prev => prev.filter(s => s.id !== sourceId));
  }, []);

  const deleteIntegrationSource = useCallback(async (sourceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setIntegrationSources(prev => prev.filter(s => s.id !== sourceId));
  }, []);

  const revertToVersion = useCallback(async (documentId: string, versionId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === documentId) {
          const version = doc.versions.find(v => v.id === versionId);
          if (version) {
            return {
              ...doc,
              size: version.size,
              uploadedAt: new Date().toISOString().split('T')[0],
              trainingStatus: 'pending' as TrainingStatus,
              trainingProgress: 0,
            };
          }
        }
        return doc;
      })
    );
    
    setIsLoading(false);
  }, []);

  const resyncSource = useCallback(async (sourceType: 'url' | 'sitemap' | 'integration', sourceId: string) => {
    if (sourceType === 'url') {
      setUrlSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'crawling' as CrawlStatus } : s));
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUrlSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'completed' as CrawlStatus, lastSynced: new Date().toISOString().split('T')[0] } : s));
    } else if (sourceType === 'sitemap') {
      setSitemapSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'crawling' as CrawlStatus } : s));
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSitemapSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'completed' as CrawlStatus, lastSynced: new Date().toISOString().split('T')[0] } : s));
    } else {
      setIntegrationSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'crawling' as CrawlStatus } : s));
      await new Promise(resolve => setTimeout(resolve, 2500));
      setIntegrationSources(prev => prev.map(s => s.id === sourceId ? { ...s, status: 'completed' as CrawlStatus, lastSynced: new Date().toISOString().split('T')[0] } : s));
    }
  }, []);

  return {
    documents,
    urlSources,
    sitemapSources,
    integrationSources,
    isLoading,
    uploadDocument,
    addURLSource,
    addSitemapSource,
    addIntegrationSource,
    startTraining,
    startURLTraining,
    startSitemapTraining,
    startIntegrationTraining,
    deleteDocument,
    deleteURLSource,
    deleteSitemapSource,
    deleteIntegrationSource,
    revertToVersion,
    resyncSource,
  };
}

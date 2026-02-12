import { useState, useCallback } from 'react';
import type { KnowledgeDocument, FileType, FileCategory, TrainingStatus } from '@/types/knowledgeBase';

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
    versions: [
      { id: 'v1', version: '1.0', uploadedAt: '2024-04-25', uploadedBy: 'Michael Chen', size: '1.5 MB', changes: 'Initial version' },
    ],
  },
];

export function useKnowledgeBaseData() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(generateMockDocuments());
  const [isLoading, setIsLoading] = useState(false);

  const detectFileType = (fileName: string): FileType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'docx': return 'docx';
      case 'doc': return 'doc';
      case 'txt': return 'txt';
      case 'md': return 'md';
      case 'csv': return 'csv';
      case 'xlsx': case 'xls': return 'xlsx';
      default: return 'pdf';
    }
  };

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

  const deleteDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setIsLoading(false);
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

  return {
    documents,
    isLoading,
    uploadDocument,
    startTraining,
    deleteDocument,
    revertToVersion,
  };
}

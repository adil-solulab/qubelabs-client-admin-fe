import { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Brain,
  Play,
  CheckCircle,
  Globe,
  Map,
  Plug,
  Plus,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgeBaseData } from '@/hooks/useKnowledgeBaseData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { DocumentCard } from '@/components/knowledgeBase/DocumentCard';
import { URLSourceCard } from '@/components/knowledgeBase/URLSourceCard';
import { SitemapSourceCard } from '@/components/knowledgeBase/SitemapSourceCard';
import { IntegrationSourceCard } from '@/components/knowledgeBase/IntegrationSourceCard';
import { AddSourceModal } from '@/components/knowledgeBase/AddSourceModal';
import { DeleteDocumentModal } from '@/components/knowledgeBase/DeleteDocumentModal';
import { VersionHistoryModal } from '@/components/knowledgeBase/VersionHistoryModal';
import { TrainingProgressWidget } from '@/components/knowledgeBase/TrainingProgressWidget';
import type { KnowledgeDocument, FileType, FileCategory, TrainingStatus, KBSourceType, URLSource, SitemapSource, IntegrationSource } from '@/types/knowledgeBase';
import { FILE_TYPE_LABELS, FILE_CATEGORIES, TRAINING_STATUS_LABELS } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

type ActiveTab = 'files' | 'urls' | 'sitemaps' | 'integrations';

export default function KnowledgeBasePage() {
  const {
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
  } = useKnowledgeBaseData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('knowledge-base');

  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all');

  const [addSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.fileType === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.trainingStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const filteredURLSources = urlSources.filter(s =>
    s.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSitemapSources = sitemapSources.filter(s =>
    s.sitemapUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIntegrationSources = integrationSources.filter(s =>
    s.integrationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sourceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSources = documents.length + urlSources.length + sitemapSources.length + integrationSources.length;
  const totalTrained =
    documents.filter(d => d.trainingStatus === 'completed').length +
    urlSources.filter(s => s.trainingStatus === 'completed').length +
    sitemapSources.filter(s => s.trainingStatus === 'completed').length +
    integrationSources.filter(s => s.trainingStatus === 'completed').length;
  const totalTraining =
    documents.filter(d => d.trainingStatus === 'processing').length +
    urlSources.filter(s => s.trainingStatus === 'processing').length +
    sitemapSources.filter(s => s.trainingStatus === 'processing').length +
    integrationSources.filter(s => s.trainingStatus === 'processing').length;
  const totalPending =
    documents.filter(d => d.trainingStatus === 'pending').length +
    urlSources.filter(s => s.trainingStatus === 'pending').length +
    sitemapSources.filter(s => s.trainingStatus === 'pending').length +
    integrationSources.filter(s => s.trainingStatus === 'pending').length;

  const handleAddClick = () => {
    withPermission('create', () => {
      setAddSourceModalOpen(true);
    });
  };

  const handleSourceAdded = (label: string) => {
    notify.success('Source added', `"${label}" has been added to your knowledge base.`);
  };

  const handleTrain = async (doc: KnowledgeDocument) => {
    withPermission('edit', async () => {
      notify.info(`Training started for "${doc.name}"`);
      try {
        await startTraining(doc.id, () => {});
        notify.success(`Training complete`, `"${doc.name}" has been trained successfully.`);
      } catch {
        notify.error('Training failed', `Could not train "${doc.name}".`);
      }
    });
  };

  const handleURLTrain = async (source: URLSource) => {
    withPermission('edit', async () => {
      notify.info(`Training started for "${source.title}"`);
      try {
        await startURLTraining(source.id, () => {});
        notify.success('Training complete', `"${source.title}" has been trained successfully.`);
      } catch {
        notify.error('Training failed');
      }
    });
  };

  const handleSitemapTrain = async (source: SitemapSource) => {
    withPermission('edit', async () => {
      notify.info(`Training started for "${source.domain}"`);
      try {
        await startSitemapTraining(source.id, () => {});
        notify.success('Training complete', `"${source.domain}" has been trained successfully.`);
      } catch {
        notify.error('Training failed');
      }
    });
  };

  const handleIntegrationTrain = async (source: IntegrationSource) => {
    withPermission('edit', async () => {
      notify.info(`Training started for "${source.integrationName}"`);
      try {
        await startIntegrationTraining(source.id, () => {});
        notify.success('Training complete', `"${source.integrationName}" has been trained successfully.`);
      } catch {
        notify.error('Training failed');
      }
    });
  };

  const handleDeleteClick = (doc: KnowledgeDocument) => {
    withPermission('delete', () => {
      setSelectedDocument(doc);
      setDeleteModalOpen(true);
    });
  };

  const handleViewHistory = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setHistoryModalOpen(true);
  };

  const handleDelete = async (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    try {
      await deleteDocument(documentId);
      notify.deleted(`Document "${doc?.name}"`);
    } catch {
      notify.error('Delete failed', 'Could not delete document.');
    }
  };

  const handleURLDelete = async (source: URLSource) => {
    withPermission('delete', async () => {
      try {
        await deleteURLSource(source.id);
        notify.deleted(`URL "${source.title}"`);
      } catch {
        notify.error('Delete failed');
      }
    });
  };

  const handleSitemapDelete = async (source: SitemapSource) => {
    withPermission('delete', async () => {
      try {
        await deleteSitemapSource(source.id);
        notify.deleted(`Sitemap "${source.domain}"`);
      } catch {
        notify.error('Delete failed');
      }
    });
  };

  const handleIntegrationDelete = async (source: IntegrationSource) => {
    withPermission('delete', async () => {
      try {
        await deleteIntegrationSource(source.id);
        notify.deleted(`Integration "${source.integrationName}"`);
      } catch {
        notify.error('Delete failed');
      }
    });
  };

  const handleURLResync = async (source: URLSource) => {
    withPermission('edit', async () => {
      notify.info(`Re-crawling "${source.title}"...`);
      await resyncSource('url', source.id);
      notify.success('Re-crawl complete');
    });
  };

  const handleSitemapResync = async (source: SitemapSource) => {
    withPermission('edit', async () => {
      notify.info(`Re-crawling sitemap for "${source.domain}"...`);
      await resyncSource('sitemap', source.id);
      notify.success('Re-crawl complete');
    });
  };

  const handleIntegrationResync = async (source: IntegrationSource) => {
    withPermission('edit', async () => {
      notify.info(`Re-syncing "${source.integrationName}"...`);
      await resyncSource('integration', source.id);
      notify.success('Re-sync complete');
    });
  };

  const handleRevert = async (documentId: string, versionId: string) => {
    withPermission('edit', async () => {
      try {
        await revertToVersion(documentId, versionId);
        notify.success('Version restored', 'Document reverted to selected version.');
      } catch {
        notify.error('Revert failed', 'Could not revert to version.');
      }
    });
  };

  const getAddButtonLabel = () => 'Add Source';

  const getAddButtonIcon = () => <Plus className="w-4 h-4 mr-2" />;

  const getActiveCount = () => {
    switch (activeTab) {
      case 'files': return { filtered: filteredDocuments.length, total: documents.length };
      case 'urls': return { filtered: filteredURLSources.length, total: urlSources.length };
      case 'sitemaps': return { filtered: filteredSitemapSources.length, total: sitemapSources.length };
      case 'integrations': return { filtered: filteredIntegrationSources.length, total: integrationSources.length };
    }
  };

  const counts = getActiveCount();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base & Training</h1>
            <p className="text-sm text-muted-foreground">
              Upload documents, scrape websites, import from sitemaps, and connect integrations
            </p>
          </div>
          <PermissionButton 
            screenId="knowledge-base" 
            action="create" 
            onClick={handleAddClick}
          >
            {getAddButtonIcon()}
            {getAddButtonLabel()}
          </PermissionButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSources}</p>
                  <p className="text-xs text-muted-foreground">Total Sources</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTrained}</p>
                  <p className="text-xs text-muted-foreground">Trained</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTraining}</p>
                  <p className="text-xs text-muted-foreground">Training</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ActiveTab); setSearchQuery(''); }}>
          <TabsList className="w-full justify-start bg-muted/50 h-auto p-1 flex-wrap">
            <TabsTrigger value="files" className="gap-2 data-[state=active]:bg-background">
              <FileText className="w-4 h-4" />
              Files
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{documents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="urls" className="gap-2 data-[state=active]:bg-background">
              <Globe className="w-4 h-4" />
              URLs
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{urlSources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sitemaps" className="gap-2 data-[state=active]:bg-background">
              <Map className="w-4 h-4" />
              Sitemaps
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{sitemapSources.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-background">
              <Plug className="w-4 h-4" />
              Integrations
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{integrationSources.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="gradient-card">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        activeTab === 'files' ? 'Search documents...' :
                        activeTab === 'urls' ? 'Search URLs...' :
                        activeTab === 'sitemaps' ? 'Search sitemaps...' :
                        'Search integrations...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {activeTab === 'files' && (
                    <div className="flex gap-2 flex-wrap">
                      <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FileType | 'all')}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="File Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All File Types</SelectItem>
                          {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>.{value.toUpperCase()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TrainingStatus | 'all')}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {Object.entries(TRAINING_STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as FileCategory | 'all')}>
                        <SelectTrigger className="w-[170px]">
                          <SelectValue placeholder="File Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {FILE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {activeTab === 'files' && (
              <>
                {filteredDocuments.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">No documents found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Upload your first document to get started'}
                      </p>
                      {!searchQuery && typeFilter === 'all' && canCreate && (
                        <Button onClick={handleAddClick}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map(doc => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onTrain={handleTrain}
                        onDelete={handleDeleteClick}
                        onViewHistory={handleViewHistory}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    ))}
                    {canCreate && (
                      <button
                        onClick={handleAddClick}
                        className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Upload another document
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'urls' && (
              <>
                {filteredURLSources.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">No URLs added</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search' : 'Add website URLs to scrape and extract content for your knowledge base'}
                      </p>
                      {!searchQuery && canCreate && (
                        <Button onClick={handleAddClick} size="lg">
                          <Globe className="w-4 h-4 mr-2" />
                          Add URLs
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredURLSources.map(source => (
                      <URLSourceCard
                        key={source.id}
                        source={source}
                        onTrain={handleURLTrain}
                        onDelete={handleURLDelete}
                        onResync={handleURLResync}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    ))}
                    {canCreate && (
                      <button
                        onClick={handleAddClick}
                        className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add more URLs
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'sitemaps' && (
              <>
                {filteredSitemapSources.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Map className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">No sitemaps added</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search' : 'Add a sitemap XML URL to auto-discover and crawl all pages on your website'}
                      </p>
                      {!searchQuery && canCreate && (
                        <Button onClick={handleAddClick} size="lg">
                          <Map className="w-4 h-4 mr-2" />
                          Add Sitemap
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredSitemapSources.map(source => (
                      <SitemapSourceCard
                        key={source.id}
                        source={source}
                        onTrain={handleSitemapTrain}
                        onDelete={handleSitemapDelete}
                        onResync={handleSitemapResync}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    ))}
                    {canCreate && (
                      <button
                        onClick={handleAddClick}
                        className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add another sitemap
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'integrations' && (
              <>
                {filteredIntegrationSources.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Plug className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">No integrations connected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search' : 'Connect services like Salesforce, Confluence, or Zendesk to import content'}
                      </p>
                      {!searchQuery && canCreate && (
                        <Button onClick={handleAddClick} size="lg">
                          <Plug className="w-4 h-4 mr-2" />
                          Add Integration
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredIntegrationSources.map(source => (
                      <IntegrationSourceCard
                        key={source.id}
                        source={source}
                        onTrain={handleIntegrationTrain}
                        onDelete={handleIntegrationDelete}
                        onResync={handleIntegrationResync}
                        canEdit={canEdit}
                        canDelete={canDelete}
                      />
                    ))}
                    {canCreate && (
                      <button
                        onClick={handleAddClick}
                        className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-xl p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add another integration
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            <p className="text-sm text-muted-foreground">
              Showing {counts.filtered} of {counts.total} {activeTab === 'files' ? 'documents' : activeTab}
            </p>
          </div>

          <div className="space-y-4">
            <TrainingProgressWidget documents={documents} />

            <Card className="gradient-card">
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Knowledge Sources
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>File Uploads</span>
                    </div>
                    <Badge variant="secondary">{documents.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Website URLs</span>
                    </div>
                    <Badge variant="secondary">{urlSources.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-emerald-500" />
                      <span>Sitemaps</span>
                    </div>
                    <Badge variant="secondary">{sitemapSources.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Plug className="w-4 h-4 text-purple-500" />
                      <span>Integrations</span>
                    </div>
                    <Badge variant="secondary">{integrationSources.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Quick Tips
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-[10px] mt-0.5">1</Badge>
                    <p className="text-muted-foreground">
                      Upload FAQs and manuals to improve AI response accuracy
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-[10px] mt-0.5">2</Badge>
                    <p className="text-muted-foreground">
                      Add sitemaps to auto-discover and crawl entire help centers
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-[10px] mt-0.5">3</Badge>
                    <p className="text-muted-foreground">
                      Connect integrations to sync knowledge from CRM and support tools
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddSourceModal
        open={addSourceModalOpen}
        onOpenChange={setAddSourceModalOpen}
        onUploadFile={uploadDocument}
        onAddURLs={addURLSource}
        onAddSitemap={addSitemapSource}
        onAddIntegration={addIntegrationSource}
        onComplete={handleSourceAdded}
      />

      <DeleteDocumentModal
        document={selectedDocument}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDelete}
      />

      <VersionHistoryModal
        document={selectedDocument}
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        onRevert={handleRevert}
      />
    </AppLayout>
  );
}

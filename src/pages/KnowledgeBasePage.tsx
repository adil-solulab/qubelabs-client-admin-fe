import { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  Filter,
  FileText,
  Brain,
  Play,
  CheckCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKnowledgeBaseData } from '@/hooks/useKnowledgeBaseData';
import { useToast } from '@/hooks/use-toast';
import { DocumentCard } from '@/components/knowledgeBase/DocumentCard';
import { UploadDocumentModal } from '@/components/knowledgeBase/UploadDocumentModal';
import { DeleteDocumentModal } from '@/components/knowledgeBase/DeleteDocumentModal';
import { VersionHistoryModal } from '@/components/knowledgeBase/VersionHistoryModal';
import { TrainingProgressWidget } from '@/components/knowledgeBase/TrainingProgressWidget';
import type { KnowledgeDocument, DocumentType, TrainingStatus } from '@/types/knowledgeBase';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_CATEGORIES, TRAINING_STATUS_LABELS } from '@/types/knowledgeBase';

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const {
    documents,
    isLoading,
    uploadDocument,
    startTraining,
    deleteDocument,
    revertToVersion,
  } = useKnowledgeBaseData();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.trainingStatus === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Stats
  const stats = {
    total: documents.length,
    trained: documents.filter(d => d.trainingStatus === 'completed').length,
    training: documents.filter(d => d.trainingStatus === 'processing').length,
    pending: documents.filter(d => d.trainingStatus === 'pending').length,
  };

  const handleUploadComplete = (docName: string) => {
    toast({
      title: 'Document Uploaded',
      description: `"${docName}" has been uploaded successfully.`,
    });
  };

  const handleTrain = async (doc: KnowledgeDocument) => {
    toast({
      title: 'Training Started',
      description: `Starting to train on "${doc.name}"...`,
    });

    await startTraining(doc.id, (progress) => {
      // Progress is handled in the hook
    });

    toast({
      title: 'Training Complete',
      description: `"${doc.name}" has been trained successfully.`,
    });
  };

  const handleDeleteClick = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setDeleteModalOpen(true);
  };

  const handleViewHistory = (doc: KnowledgeDocument) => {
    setSelectedDocument(doc);
    setHistoryModalOpen(true);
  };

  const handleDelete = async (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    await deleteDocument(documentId);
    toast({
      title: 'Document Deleted',
      description: `"${doc?.name}" has been removed from the knowledge base.`,
      variant: 'destructive',
    });
  };

  const handleRevert = async (documentId: string, versionId: string) => {
    await revertToVersion(documentId, versionId);
    toast({
      title: 'Version Restored',
      description: 'Document has been reverted to the selected version.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Knowledge Base & Training</h1>
            <p className="text-sm text-muted-foreground">
              Upload documents and train your AI agents with custom knowledge
            </p>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Documents</p>
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
                  <p className="text-2xl font-bold">{stats.trained}</p>
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
                  <p className="text-2xl font-bold">{stats.training}</p>
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
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <Card className="gradient-card">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocumentType | 'all')}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
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
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {DOCUMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
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
                  {!searchQuery && typeFilter === 'all' && (
                    <Button onClick={() => setUploadModalOpen(true)}>
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
                  />
                ))}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <TrainingProgressWidget documents={documents} />

            {/* Quick Tips */}
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
                      Retrain documents when content is updated
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-[10px] mt-0.5">3</Badge>
                    <p className="text-muted-foreground">
                      Use version history to track changes over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={uploadDocument}
        onUploadComplete={handleUploadComplete}
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

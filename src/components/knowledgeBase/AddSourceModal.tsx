import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, Globe, Map, Plug, Plus, X, Loader2,
  CheckCircle, Link2, Trash2, FileSearch, ChevronRight, ArrowLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { FileType, SyncFrequency } from '@/types/knowledgeBase';
import {
  FILE_TYPE_LABELS, FILE_CATEGORIES, SYNC_FREQUENCY_LABELS,
  AVAILABLE_INTEGRATIONS,
} from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

type SourceType = 'file' | 'url' | 'sitemap' | 'integration';
type ModalStep = 'select-type' | 'configure' | 'select-integration' | 'processing' | 'complete';

interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadFile: (
    file: File,
    metadata: { type: FileType; category: string },
    onProgress: (progress: number) => void
  ) => Promise<any>;
  onAddURLs: (urls: string[], syncFrequency: SyncFrequency, onProgress: (p: number) => void) => Promise<void>;
  onAddSitemap: (sitemapUrl: string, syncFrequency: SyncFrequency, onProgress: (p: number) => void) => Promise<void>;
  onAddIntegration: (
    integrationId: string,
    integrationName: string,
    integrationIcon: string,
    sourceType: string,
    syncFrequency: SyncFrequency,
    onProgress: (p: number) => void
  ) => Promise<void>;
  onComplete: (label: string) => void;
  defaultType?: SourceType;
}

const SOURCE_TYPE_OPTIONS: { type: SourceType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'file',
    label: 'Upload File',
    description: 'Upload PDF, DOCX, TXT, MD, CSV, or XLSX documents',
    icon: <Upload className="w-5 h-5" />,
  },
  {
    type: 'url',
    label: 'Website URL',
    description: 'Scrape web pages to extract content automatically',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    type: 'sitemap',
    label: 'Sitemap',
    description: 'Import all pages from a sitemap XML file',
    icon: <Map className="w-5 h-5" />,
  },
  {
    type: 'integration',
    label: 'Integration',
    description: 'Connect a third-party service to import content',
    icon: <Plug className="w-5 h-5" />,
  },
];

export function AddSourceModal({
  open,
  onOpenChange,
  onUploadFile,
  onAddURLs,
  onAddSitemap,
  onAddIntegration,
  onComplete,
  defaultType,
}: AddSourceModalProps) {
  const [step, setStep] = useState<ModalStep>('select-type');
  const [sourceType, setSourceType] = useState<SourceType | null>(defaultType ?? null);
  const [progress, setProgress] = useState(0);

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [category, setCategory] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUrl, setCurrentUrl] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [urlError, setUrlError] = useState('');

  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapError, setSitemapError] = useState('');

  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('manual');

  const [selectedIntegration, setSelectedIntegration] = useState<typeof AVAILABLE_INTEGRATIONS[0] | null>(null);

  const resetAll = () => {
    setStep('select-type');
    setSourceType(defaultType ?? null);
    setProgress(0);
    setFile(null);
    setFileType('pdf');
    setCategory('');
    setDragActive(false);
    setCurrentUrl('');
    setUrls([]);
    setUrlError('');
    setSitemapUrl('');
    setSitemapError('');
    setSyncFrequency('manual');
    setSelectedIntegration(null);
  };

  const handleClose = () => {
    resetAll();
    onOpenChange(false);
  };

  const handleSelectType = (type: SourceType) => {
    setSourceType(type);
    if (type === 'integration') {
      setStep('select-integration');
    } else {
      setStep('configure');
      if (type === 'sitemap') setSyncFrequency('daily');
      if (type === 'url') setSyncFrequency('manual');
    }
  };

  const handleSelectIntegration = (integration: typeof AVAILABLE_INTEGRATIONS[0]) => {
    setSelectedIntegration(integration);
    setSyncFrequency('daily');
    setStep('configure');
  };

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileType(detectFileType(droppedFile.name));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(detectFileType(selectedFile.name));
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'xls': case 'xlsx': return '📊';
      case 'csv': return '📊';
      case 'txt': return '📃';
      case 'md': return '📋';
      default: return '📁';
    }
  };

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  const handleAddUrl = () => {
    const trimmed = currentUrl.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) { setUrlError('Please enter a valid URL (e.g., https://example.com/page)'); return; }
    if (urls.includes(trimmed)) { setUrlError('This URL has already been added'); return; }
    setUrls(prev => [...prev, trimmed]);
    setCurrentUrl('');
    setUrlError('');
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); }
  };

  const isValidSitemapUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname.endsWith('.xml') || parsed.pathname.includes('sitemap');
    } catch { return false; }
  };

  const handleSubmit = async () => {
    setStep('processing');
    setProgress(0);

    try {
      if (sourceType === 'file' && file && category) {
        const doc = await onUploadFile(file, { type: fileType, category }, setProgress);
        onComplete(doc.name);
      } else if (sourceType === 'url' && urls.length > 0) {
        await onAddURLs(urls, syncFrequency, setProgress);
        onComplete(`${urls.length} URL${urls.length > 1 ? 's' : ''}`);
      } else if (sourceType === 'sitemap') {
        const trimmed = sitemapUrl.trim();
        if (!isValidSitemapUrl(trimmed)) {
          setSitemapError('Please enter a valid sitemap URL (e.g., https://example.com/sitemap.xml)');
          setStep('configure');
          return;
        }
        await onAddSitemap(trimmed, syncFrequency, setProgress);
        onComplete(`Sitemap`);
      } else if (sourceType === 'integration' && selectedIntegration) {
        const sourceTypeMap: Record<string, string> = {
          salesforce: 'Knowledge Articles',
          confluence: 'Wiki Pages',
          notion: 'Pages & Databases',
          zendesk: 'Help Center Articles',
          sharepoint: 'Documents',
          google_drive: 'Files & Folders',
          aws_s3: 'Bucket Objects',
          servicenow: 'Knowledge Articles',
          freshdesk: 'Solution Articles',
          database: 'Table Records',
        };
        await onAddIntegration(
          selectedIntegration.id,
          selectedIntegration.name,
          selectedIntegration.icon,
          sourceTypeMap[selectedIntegration.id] || 'Documents',
          syncFrequency,
          setProgress
        );
        onComplete(selectedIntegration.name);
      }
      setStep('complete');
    } catch {
      setStep('configure');
    }
  };

  const canSubmit = () => {
    if (sourceType === 'file') return !!file && !!category;
    if (sourceType === 'url') return urls.length > 0;
    if (sourceType === 'sitemap') return !!sitemapUrl.trim();
    if (sourceType === 'integration') return !!selectedIntegration;
    return false;
  };

  const getSubmitLabel = () => {
    if (sourceType === 'file') return 'Upload Document';
    if (sourceType === 'url') return `Crawl ${urls.length > 0 ? `${urls.length} URL${urls.length > 1 ? 's' : ''}` : 'URLs'}`;
    if (sourceType === 'sitemap') return 'Discover Pages';
    if (sourceType === 'integration') return 'Connect & Import';
    return 'Add';
  };

  const getSubmitIcon = () => {
    if (sourceType === 'file') return <Upload className="w-4 h-4 mr-2" />;
    if (sourceType === 'url') return <Globe className="w-4 h-4 mr-2" />;
    if (sourceType === 'sitemap') return <Map className="w-4 h-4 mr-2" />;
    if (sourceType === 'integration') return <Plug className="w-4 h-4 mr-2" />;
    return null;
  };

  const getProcessingLabel = () => {
    if (sourceType === 'file') return 'Uploading document...';
    if (sourceType === 'url') return 'Crawling & extracting content...';
    if (sourceType === 'sitemap') return 'Discovering & crawling pages...';
    if (sourceType === 'integration') return `Importing from ${selectedIntegration?.name}...`;
    return 'Processing...';
  };

  const getCompleteLabel = () => {
    if (sourceType === 'file') return 'Upload Complete!';
    if (sourceType === 'url') return 'Content Extracted!';
    if (sourceType === 'sitemap') return 'Sitemap Imported!';
    if (sourceType === 'integration') return 'Import Complete!';
    return 'Done!';
  };

  const resetFormState = () => {
    setFile(null);
    setFileType('pdf');
    setCategory('');
    setCurrentUrl('');
    setUrls([]);
    setUrlError('');
    setSitemapUrl('');
    setSitemapError('');
    setSyncFrequency('manual');
    setSelectedIntegration(null);
  };

  const handleBack = () => {
    if (step === 'configure' && sourceType === 'integration') {
      setStep('select-integration');
      setSelectedIntegration(null);
    } else if (step === 'configure' || step === 'select-integration') {
      resetFormState();
      setStep('select-type');
      setSourceType(null);
    }
  };

  const getHeaderIcon = () => {
    if (!sourceType || step === 'select-type') return <Plus className="w-4 h-4 text-primary-foreground" />;
    const opt = SOURCE_TYPE_OPTIONS.find(o => o.type === sourceType);
    return opt ? opt.icon : <Plus className="w-4 h-4 text-primary-foreground" />;
  };

  const getTitle = () => {
    if (step === 'select-type') return 'Add Knowledge Source';
    if (step === 'select-integration') return 'Select Integration';
    if (step === 'processing') return getProcessingLabel();
    if (step === 'complete') return getCompleteLabel();
    if (sourceType === 'file') return 'Upload Document';
    if (sourceType === 'url') return 'Add Website URLs';
    if (sourceType === 'sitemap') return 'Import from Sitemap';
    if (sourceType === 'integration' && selectedIntegration) return selectedIntegration.name;
    return 'Add Source';
  };

  const getDescription = () => {
    if (step === 'select-type') return 'Choose how you want to add content to your knowledge base.';
    if (step === 'select-integration') return 'Connect a third-party service to import content automatically.';
    if (step === 'processing' || step === 'complete') return '';
    if (sourceType === 'file') return 'Upload files to train your AI agents with custom knowledge.';
    if (sourceType === 'url') return 'Scrape web pages to extract content for your knowledge base.';
    if (sourceType === 'sitemap') return 'Provide a sitemap XML URL to discover and crawl all pages.';
    if (sourceType === 'integration') return `Configure the ${selectedIntegration?.name} integration to import content.`;
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
              {getHeaderIcon()}
            </div>
            {getTitle()}
          </DialogTitle>
          {getDescription() && (
            <DialogDescription>{getDescription()}</DialogDescription>
          )}
        </DialogHeader>

        {step === 'select-type' && (
          <div className="grid grid-cols-2 gap-3 py-1">
            {SOURCE_TYPE_OPTIONS.map((opt) => (
              <Card
                key={opt.type}
                className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
                onClick={() => handleSelectType(opt.type)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition-colors">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{opt.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 'select-integration' && (
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto py-1">
            {AVAILABLE_INTEGRATIONS.map((integration) => (
              <Card
                key={integration.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                onClick={() => handleSelectIntegration(integration)}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{integration.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{integration.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 'configure' && sourceType === 'file' && (
          <div className="space-y-4">
            <div
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                file && 'border-success bg-success/5'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-xl bg-success/10 mx-auto flex items-center justify-center text-2xl">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[250px] mx-auto">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-14 h-14 rounded-xl bg-muted mx-auto flex items-center justify-center">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Drop your file here, or{' '}
                      <button onClick={() => fileInputRef.current?.click()} className="text-primary hover:underline">browse</button>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT, MD, CSV, XLSX up to 50MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>File Type</Label>
              <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>.{value.toUpperCase()} - {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 'configure' && sourceType === 'url' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/docs/page"
                    value={currentUrl}
                    onChange={(e) => { setCurrentUrl(e.target.value); setUrlError(''); }}
                    onKeyDown={handleUrlKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleAddUrl}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            </div>

            {urls.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{urls.length} URL{urls.length > 1 ? 's' : ''} added</Label>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 border rounded-lg p-2">
                  {urls.map((url) => (
                    <div key={url} className="flex items-center gap-2 group bg-muted/50 rounded-md px-3 py-2">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1 font-mono">{url}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setUrls(prev => prev.filter(u => u !== url))}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Auto-Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as SyncFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SYNC_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 'configure' && sourceType === 'sitemap' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sitemap URL</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => { setSitemapUrl(e.target.value); setSitemapError(''); }}
                  className="pl-9"
                />
              </div>
              {sitemapError && <p className="text-xs text-destructive">{sitemapError}</p>}
              <p className="text-xs text-muted-foreground">The sitemap must be in XML format. Common locations: /sitemap.xml, /sitemap_index.xml</p>
            </div>

            <div className="space-y-2">
              <Label>Auto-Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as SyncFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SYNC_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5" />
                How sitemap discovery works:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">1</Badge>
                  The sitemap XML is parsed to discover all page URLs
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">2</Badge>
                  Each page is crawled and content is extracted
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">3</Badge>
                  Content is indexed and ready for AI training
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 'configure' && sourceType === 'integration' && selectedIntegration && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedIntegration.icon}</span>
              <div>
                <p className="font-medium">{selectedIntegration.name}</p>
                <p className="text-xs text-muted-foreground">{selectedIntegration.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as SyncFrequency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SYNC_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">How often to sync new content from {selectedIntegration.name}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium">What will be imported:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">1</Badge>
                  Connect to your {selectedIntegration.name} account
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">2</Badge>
                  Discover available content and articles
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">3</Badge>
                  Import and index all content for AI training
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">{getProcessingLabel()}</p>
              {sourceType === 'url' && (
                <p className="text-sm text-muted-foreground mt-1">Processing {urls.length} URL{urls.length > 1 ? 's' : ''}</p>
              )}
              {sourceType === 'file' && file && (
                <p className="text-sm text-muted-foreground mt-1">{file.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">{getCompleteLabel()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {sourceType === 'file' && 'Your document is ready for training.'}
                {sourceType === 'url' && `${urls.length} URL${urls.length > 1 ? 's' : ''} crawled successfully. Content is ready for training.`}
                {sourceType === 'sitemap' && 'Pages discovered and content extracted. Ready for training.'}
                {sourceType === 'integration' && `Content from ${selectedIntegration?.name} imported successfully. Ready for training.`}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 'select-type' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {step === 'select-integration' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step === 'configure' && (
            <>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit()}>
                {getSubmitIcon()}
                {getSubmitLabel()}
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose} className="w-full">Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

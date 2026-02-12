import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2, File } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import type { FileType } from '@/types/knowledgeBase';
import { FILE_TYPE_LABELS, FILE_CATEGORIES } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    file: File,
    metadata: { type: FileType; category: string },
    onProgress: (progress: number) => void
  ) => Promise<any>;
  onUploadComplete: (docName: string) => void;
}

type UploadState = 'idle' | 'uploading' | 'complete';

export function UploadDocumentModal({
  open,
  onOpenChange,
  onUpload,
  onUploadComplete,
}: UploadDocumentModalProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('pdf');
  const [category, setCategory] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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

  const handleUpload = async () => {
    if (!file || !category) return;

    setState('uploading');
    setProgress(0);

    try {
      const doc = await onUpload(file, { type: fileType, category }, setProgress);
      setState('complete');
      onUploadComplete(doc.name);
    } catch (error) {
      setState('idle');
    }
  };

  const handleClose = () => {
    setState('idle');
    setFile(null);
    setFileType('pdf');
    setCategory('');
    setProgress(0);
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Upload className="w-4 h-4 text-primary-foreground" />
            </div>
            Upload Document
          </DialogTitle>
          <DialogDescription>
            Upload files to train your AI agents with custom knowledge.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
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
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
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
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, DOCX, TXT, MD, CSV, XLSX up to 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>File Type</Label>
              <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      .{value.toUpperCase()} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {state === 'uploading' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Uploading document...</p>
              <p className="text-sm text-muted-foreground mt-1">{file?.name}</p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {state === 'complete' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Upload Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your document is ready for training
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {state === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file || !category}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </>
          )}
          {state === 'complete' && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

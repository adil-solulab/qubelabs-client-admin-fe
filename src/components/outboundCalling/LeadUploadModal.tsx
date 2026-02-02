import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { UploadProgress } from '@/types/outboundCalling';

interface LeadUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  onUpload: (file: File) => Promise<{ success: boolean; leadsAdded: number }>;
  onClearProgress: () => void;
}

export function LeadUploadModal({
  open,
  onOpenChange,
  uploadProgress,
  isUploading,
  onUpload,
  onClearProgress,
}: LeadUploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      onClearProgress();
      onOpenChange(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="w-8 h-8 text-destructive" />;
    return <FileSpreadsheet className="w-8 h-8 text-success" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Leads</DialogTitle>
          <DialogDescription>
            Upload your leads file to add to the campaign. Supported formats: Excel, CSV, PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upload Area */}
          {!uploadProgress && (
            <>
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                  dragOver && 'border-primary bg-primary/5',
                  selectedFile ? 'border-success bg-success/5' : 'border-border hover:border-primary/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accepted Formats */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx, .xls)
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> CSV
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> PDF
                </span>
              </div>
            </>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/30">
                {getFileIcon(uploadProgress.fileName)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadProgress.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress.status === 'uploading' && 'Uploading...'}
                    {uploadProgress.status === 'processing' && 'Processing leads...'}
                    {uploadProgress.status === 'completed' && 'Upload complete!'}
                    {uploadProgress.status === 'error' && 'Upload failed'}
                  </p>
                </div>
                {uploadProgress.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                )}
                {uploadProgress.status === 'error' && (
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  </div>
                )}
                {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
              </div>

              <Progress value={uploadProgress.progress} className="h-2" />

              {uploadProgress.status === 'completed' && (
                <div className="p-4 rounded-xl border bg-success/5 border-success/30">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Successfully imported</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Leads</p>
                      <p className="font-semibold text-lg">{uploadProgress.totalLeads}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid Leads</p>
                      <p className="font-semibold text-lg text-success">{uploadProgress.validLeads}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {uploadProgress?.status === 'completed' ? 'Done' : 'Cancel'}
          </Button>
          {!uploadProgress && (
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Leads
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

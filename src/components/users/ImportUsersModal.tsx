import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File, onProgress: (progress: number) => void) => Promise<{ success: number; failed: number }>;
}

type ImportState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export function ImportUsersModal({ open, onOpenChange, onImport }: ImportUsersModalProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setState('uploading');
    setProgress(0);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 500));
      setState('processing');
      
      const importResult = await onImport(file, setProgress);
      
      setResult(importResult);
      setState('complete');
    } catch (error) {
      setState('error');
    }
  };

  const handleClose = () => {
    setState('idle');
    setFile(null);
    setProgress(0);
    setResult(null);
    onOpenChange(false);
  };

  const handleReset = () => {
    setState('idle');
    setFile(null);
    setProgress(0);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Upload className="w-4 h-4 text-primary-foreground" />
            </div>
            Import Users
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to bulk import users.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <div className="space-y-4">
            {/* Drop Zone */}
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
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-success/10 mx-auto flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
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
                  <div className="w-12 h-12 rounded-xl bg-muted mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
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
                      Supports CSV and Excel files
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Need a template?</span>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}

        {(state === 'uploading' || state === 'processing') && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">
                {state === 'uploading' ? 'Uploading file...' : 'Processing users...'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we import your data
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {state === 'complete' && result && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Import Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your users have been imported successfully
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                <p className="text-2xl font-bold text-success">{result.success}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </div>
              {result.failed > 0 && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-center">
                  <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              )}
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Import Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                There was an error processing your file. Please try again.
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
              <Button onClick={handleImport} disabled={!file}>
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </Button>
            </>
          )}
          {state === 'complete' && (
            <>
              <Button variant="outline" onClick={handleReset}>
                Import More
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
          {state === 'error' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleReset}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

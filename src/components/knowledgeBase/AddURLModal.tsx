import { useState } from 'react';
import { Globe, Plus, X, Loader2, CheckCircle, Link2, Trash2 } from 'lucide-react';
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
import type { SyncFrequency } from '@/types/knowledgeBase';
import { SYNC_FREQUENCY_LABELS } from '@/types/knowledgeBase';

interface AddURLModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (urls: string[], syncFrequency: SyncFrequency, onProgress: (p: number) => void) => Promise<void>;
}

type ModalState = 'idle' | 'processing' | 'complete';

export function AddURLModal({ open, onOpenChange, onAdd }: AddURLModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [currentUrl, setCurrentUrl] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('manual');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    const trimmed = currentUrl.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid URL (e.g., https://example.com/page)');
      return;
    }
    if (urls.includes(trimmed)) {
      setError('This URL has already been added');
      return;
    }
    setUrls(prev => [...prev, trimmed]);
    setCurrentUrl('');
    setError('');
  };

  const handleRemoveUrl = (url: string) => {
    setUrls(prev => prev.filter(u => u !== url));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddUrl();
    }
  };

  const handleSubmit = async () => {
    if (urls.length === 0) return;
    setState('processing');
    setProgress(0);
    try {
      await onAdd(urls, syncFrequency, setProgress);
      setState('complete');
    } catch {
      setState('idle');
      setError('Failed to crawl URLs. Please try again.');
    }
  };

  const handleClose = () => {
    setState('idle');
    setCurrentUrl('');
    setUrls([]);
    setSyncFrequency('manual');
    setProgress(0);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            Add Website URLs
          </DialogTitle>
          <DialogDescription>
            Scrape web pages to extract content for your knowledge base. Add one or multiple URLs.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/docs/page"
                    value={currentUrl}
                    onChange={(e) => { setCurrentUrl(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleAddUrl}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {urls.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  {urls.length} URL{urls.length > 1 ? 's' : ''} added
                </Label>
                <div className="max-h-[200px] overflow-y-auto space-y-1.5 border rounded-lg p-2">
                  {urls.map((url) => (
                    <div key={url} className="flex items-center gap-2 group bg-muted/50 rounded-md px-3 py-2">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate flex-1 font-mono">{url}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveUrl(url)}
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SYNC_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how often to re-crawl these URLs for updated content
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium">What happens next:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">1</Badge>
                  Each URL is crawled and its content is extracted
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">2</Badge>
                  HTML is cleaned and converted to plain text
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">3</Badge>
                  Content is ready for AI training
                </li>
              </ul>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Crawling & extracting content...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Processing {urls.length} URL{urls.length > 1 ? 's' : ''}
              </p>
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
              <p className="font-medium text-lg">Content Extracted!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {urls.length} URL{urls.length > 1 ? 's' : ''} crawled successfully. Content is ready for training.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {state === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={urls.length === 0}>
                <Globe className="w-4 h-4 mr-2" />
                Crawl {urls.length > 0 ? `${urls.length} URL${urls.length > 1 ? 's' : ''}` : 'URLs'}
              </Button>
            </>
          )}
          {state === 'complete' && (
            <Button onClick={handleClose} className="w-full">Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

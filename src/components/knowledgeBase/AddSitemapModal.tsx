import { useState } from 'react';
import { Map, Loader2, CheckCircle, Link2, FileSearch } from 'lucide-react';
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

interface AddSitemapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (sitemapUrl: string, syncFrequency: SyncFrequency, onProgress: (p: number) => void) => Promise<void>;
}

type ModalState = 'idle' | 'processing' | 'complete';

export function AddSitemapModal({ open, onOpenChange, onAdd }: AddSitemapModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('daily');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const isValidSitemapUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname.endsWith('.xml') || parsed.pathname.includes('sitemap');
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const trimmed = sitemapUrl.trim();
    if (!trimmed) return;

    if (!isValidSitemapUrl(trimmed)) {
      setError('Please enter a valid sitemap URL (e.g., https://example.com/sitemap.xml)');
      return;
    }

    setState('processing');
    setProgress(0);
    try {
      await onAdd(trimmed, syncFrequency, setProgress);
      setState('complete');
    } catch {
      setState('idle');
      setError('Failed to parse sitemap. Please check the URL and try again.');
    }
  };

  const handleClose = () => {
    setState('idle');
    setSitemapUrl('');
    setSyncFrequency('daily');
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
              <Map className="w-4 h-4 text-primary-foreground" />
            </div>
            Import from Sitemap
          </DialogTitle>
          <DialogDescription>
            Provide a sitemap XML URL to automatically discover and crawl all pages on your website.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sitemap URL</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => { setSitemapUrl(e.target.value); setError(''); }}
                  className="pl-9"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                The sitemap must be in XML format. Common locations: /sitemap.xml, /sitemap_index.xml
              </p>
            </div>

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
                Re-crawl the sitemap periodically to pick up new or updated pages
              </p>
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
                  Each page is crawled and content is extracted automatically
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">3</Badge>
                  HTML is cleaned, boilerplate removed, and text normalized
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">4</Badge>
                  All extracted content is indexed and ready for AI training
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
              <p className="font-medium">Discovering & crawling pages...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Parsing sitemap and extracting page content
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
              <p className="font-medium text-lg">Sitemap Imported!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pages discovered and content extracted. Ready for training.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {state === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!sitemapUrl.trim()}>
                <Map className="w-4 h-4 mr-2" />
                Discover Pages
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

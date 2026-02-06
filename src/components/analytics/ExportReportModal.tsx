import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface ExportReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'pdf' | 'csv' | 'excel') => Promise<{ success: boolean }>;
}

const exportFormats = [
  { id: 'pdf', label: 'PDF Report', description: 'Full report with charts', icon: FileText },
  { id: 'csv', label: 'CSV', description: 'Raw data export', icon: FileSpreadsheet },
  { id: 'excel', label: 'Excel', description: 'Spreadsheet with formatting', icon: FileSpreadsheet },
];

const reportSections = [
  { id: 'conversations', label: 'Conversation Analytics' },
  { id: 'agents', label: 'Agent Performance' },
  { id: 'csat', label: 'CSAT & NPS Scores' },
  { id: 'channels', label: 'Channel Utilization' },
  { id: 'sentiment', label: 'Sentiment Trends' },
];

export function ExportReportModal({
  open,
  onOpenChange,
  onExport,
}: ExportReportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>(reportSections.map(s => s.id));
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    await onExport(format);
    setIsExporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Export Report</DialogTitle>
          <DialogDescription>
            Configure and download your analytics report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'pdf' | 'csv' | 'excel')}>
              <div className="grid grid-cols-3 gap-3">
                {exportFormats.map(f => (
                  <div key={f.id}>
                    <RadioGroupItem value={f.id} id={f.id} className="peer sr-only" />
                    <Label
                      htmlFor={f.id}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                        'hover:border-primary/50 hover:bg-muted/50',
                        format === f.id && 'border-primary bg-primary/5'
                      )}
                    >
                      <f.icon className={cn(
                        'w-6 h-6',
                        format === f.id ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="font-medium text-sm">{f.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center">{f.description}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Sections</Label>
            <div className="space-y-2">
              {reportSections.map(section => (
                <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={section.id}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label htmlFor={section.id} className="flex-1 cursor-pointer text-sm">
                    {section.label}
                  </Label>
                  {selectedSections.includes(section.id) && (
                    <Check className="w-4 h-4 text-success" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Include Charts */}
          {format === 'pdf' && (
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(!!checked)}
              />
              <Label htmlFor="include-charts" className="flex-1 cursor-pointer text-sm">
                Include visualizations and charts
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedSections.length === 0}>
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Generating...' : 'Export Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

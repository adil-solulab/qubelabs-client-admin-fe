import { useState } from 'react';
import { Settings2, RotateCcw, LayoutGrid, BarChart3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalyticsWidgetId, AnalyticsWidgetConfig } from '@/hooks/useDashboardConfig';

interface CustomizeDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registry: AnalyticsWidgetConfig[];
  enabledWidgets: AnalyticsWidgetId[];
  onSave: (widgets: AnalyticsWidgetId[]) => void;
  onReset: () => void;
}

export function CustomizeDashboardModal({
  open,
  onOpenChange,
  registry,
  enabledWidgets,
  onSave,
  onReset,
}: CustomizeDashboardModalProps) {
  const [localEnabled, setLocalEnabled] = useState<AnalyticsWidgetId[]>(enabledWidgets);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLocalEnabled(enabledWidgets);
    }
    onOpenChange(isOpen);
  };

  const toggleLocal = (id: AnalyticsWidgetId) => {
    setLocalEnabled((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(localEnabled);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  const kpiWidgets = registry.filter((w) => w.category === 'kpi');
  const chartWidgets = registry.filter((w) => w.category === 'chart');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Select which analytics widgets appear on your dashboard. Changes apply immediately for your role.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-2">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">KPI Cards</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {kpiWidgets.filter((w) => localEnabled.includes(w.id)).length}/{kpiWidgets.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {kpiWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{widget.label}</p>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                    </div>
                    <Switch
                      checked={localEnabled.includes(widget.id)}
                      onCheckedChange={() => toggleLocal(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Charts & Tables</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {chartWidgets.filter((w) => localEnabled.includes(w.id)).length}/{chartWidgets.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {chartWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{widget.label}</p>
                      <p className="text-xs text-muted-foreground">{widget.description}</p>
                    </div>
                    <Switch
                      checked={localEnabled.includes(widget.id)}
                      onCheckedChange={() => toggleLocal(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

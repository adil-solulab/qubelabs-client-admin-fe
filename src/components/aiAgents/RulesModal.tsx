import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: string[];
  onSave: (rules: string[]) => void;
}

export function RulesModal({ open, onOpenChange, rules, onSave }: RulesModalProps) {
  const [localRules, setLocalRules] = useState<string[]>(rules.length > 0 ? [...rules] : ['']);

  const handleAdd = () => {
    setLocalRules(prev => [...prev, '']);
  };

  const handleRemove = (index: number) => {
    setLocalRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    setLocalRules(prev => prev.map((r, i) => i === index ? value : r));
  };

  const handleSave = () => {
    const filtered = localRules.filter(r => r.trim() !== '');
    onSave(filtered);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg">What rules should super agent follow in every conversation?</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Order of these steps is crucial and will be consistently followed in every conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {localRules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={rule}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="Enter a rule..."
                className="flex-1"
              />
              {localRules.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

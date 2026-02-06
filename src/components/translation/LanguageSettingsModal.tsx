import { useState } from 'react';
import { Globe, Languages, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { notify } from '@/hooks/useNotification';
import { TranslationSettings, SUPPORTED_LANGUAGES, LanguageCode } from '@/types/translation';
import { cn } from '@/lib/utils';

interface LanguageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TranslationSettings;
  onUpdateSettings: (settings: Partial<TranslationSettings>) => void;
}

export function LanguageSettingsModal({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: LanguageSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<TranslationSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onUpdateSettings(localSettings);
    setIsSaving(false);
    notify.saved('Language preferences');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Translation Settings
          </DialogTitle>
          <DialogDescription>
            Configure your language preferences for real-time translation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agent Language Preference */}
          <div className="space-y-2">
            <Label htmlFor="agentLanguage">Your Preferred Language</Label>
            <Select
              value={localSettings.agentPreferredLanguage}
              onValueChange={(value: LanguageCode) =>
                setLocalSettings(prev => ({ ...prev, agentPreferredLanguage: value }))
              }
            >
              <SelectTrigger id="agentLanguage">
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-muted-foreground">({lang.nativeName})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Incoming messages will be translated to this language
            </p>
          </div>

          <Separator />

          {/* Auto-detect Customer Language */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoDetect">Auto-detect Customer Language</Label>
              <p className="text-xs text-muted-foreground">
                Automatically identify the customer's language
              </p>
            </div>
            <Switch
              id="autoDetect"
              checked={localSettings.autoDetectCustomerLanguage}
              onCheckedChange={(checked) =>
                setLocalSettings(prev => ({ ...prev, autoDetectCustomerLanguage: checked }))
              }
            />
          </div>

          {/* Show Original with Translation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showOriginal">Show Original Text</Label>
              <p className="text-xs text-muted-foreground">
                Display original message with translation
              </p>
            </div>
            <Switch
              id="showOriginal"
              checked={localSettings.showOriginalWithTranslation}
              onCheckedChange={(checked) =>
                setLocalSettings(prev => ({ ...prev, showOriginalWithTranslation: checked }))
              }
            />
          </div>

          {/* Voice Translation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voiceTranslation">Voice Translation</Label>
              <p className="text-xs text-muted-foreground">
                Enable real-time voice translation for calls
              </p>
            </div>
            <Switch
              id="voiceTranslation"
              checked={localSettings.voiceTranslationEnabled}
              onCheckedChange={(checked) =>
                setLocalSettings(prev => ({ ...prev, voiceTranslationEnabled: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

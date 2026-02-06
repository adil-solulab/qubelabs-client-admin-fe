import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SUPPORTED_LANGUAGES, LanguageCode, ConversationTranslation, getLanguageByCode } from '@/types/translation';
import { cn } from '@/lib/utils';

interface TranslationControlsProps {
  conversationTranslation?: ConversationTranslation;
  onToggleTranslation: (enabled: boolean) => void;
  onSetCustomerLanguage: (language: LanguageCode) => void;
  onOpenSettings: () => void;
  className?: string;
}

export function TranslationControls({
  conversationTranslation,
  onToggleTranslation,
  onSetCustomerLanguage,
  onOpenSettings,
  className,
}: TranslationControlsProps) {
  const customerLang = conversationTranslation 
    ? getLanguageByCode(conversationTranslation.customerLanguage)
    : null;
  const agentLang = conversationTranslation
    ? getLanguageByCode(conversationTranslation.agentLanguage)
    : null;

  const isEnabled = conversationTranslation?.translationEnabled ?? false;
  const needsTranslation = conversationTranslation 
    ? conversationTranslation.customerLanguage !== conversationTranslation.agentLanguage
    : false;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Translation Status Badge */}
      {customerLang && (
        <Badge 
          variant={isEnabled ? 'default' : 'secondary'}
          className={cn(
            'gap-1 text-[10px]',
            isEnabled && 'bg-blue-500 hover:bg-blue-600'
          )}
        >
          <Globe className="w-2.5 h-2.5" />
          {customerLang.flag} → {agentLang?.flag}
          {conversationTranslation?.isAutoDetected && (
            <span className="opacity-70">(auto)</span>
          )}
        </Badge>
      )}

      {/* Translation Toggle */}
      {needsTranslation && (
        <div className="flex items-center gap-1.5">
          <Switch
            id="translation-toggle"
            checked={isEnabled}
            onCheckedChange={onToggleTranslation}
            className="scale-75"
          />
          <label 
            htmlFor="translation-toggle" 
            className="text-[10px] text-muted-foreground cursor-pointer"
          >
            Translate
          </label>
        </div>
      )}

      {/* Language Override Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]">
            <Globe className="w-3 h-3 mr-1" />
            Language
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs">Customer Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_LANGUAGES.slice(0, 8).map(lang => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onSetCustomerLanguage(lang.code)}
              className="text-sm"
            >
              <span className="mr-2">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {conversationTranslation?.customerLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenSettings} className="text-sm">
            <Globe className="w-4 h-4 mr-2" />
            Translation Settings...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

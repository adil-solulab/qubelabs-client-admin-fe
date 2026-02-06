import { useState } from 'react';
import { Languages, Eye, EyeOff, Volume2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TranslatedMessage as TranslatedMessageType, getLanguageByCode } from '@/types/translation';
import { cn } from '@/lib/utils';

interface TranslatedMessageProps {
  originalText: string;
  translation?: TranslatedMessageType;
  isTranslating?: boolean;
  showOriginalByDefault?: boolean;
  isCustomerMessage?: boolean;
  className?: string;
}

export function TranslatedMessage({
  originalText,
  translation,
  isTranslating = false,
  showOriginalByDefault = false,
  isCustomerMessage = true,
  className,
}: TranslatedMessageProps) {
  const [showOriginal, setShowOriginal] = useState(showOriginalByDefault);

  // No translation needed or available
  if (!translation && !isTranslating) {
    return <p className={cn('text-sm', className)}>{originalText}</p>;
  }

  const fromLang = getLanguageByCode(translation?.originalLanguage || 'en');
  const toLang = getLanguageByCode(translation?.targetLanguage || 'en');

  return (
    <div className={cn('space-y-1', className)}>
      {/* Translation Badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge 
          variant="secondary" 
          className={cn(
            'text-[10px] gap-1 px-1.5 py-0',
            isCustomerMessage 
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
              : 'bg-green-500/10 text-green-600 dark:text-green-400'
          )}
        >
          <Languages className="w-2.5 h-2.5" />
          Translated
        </Badge>
        
        {translation && (
          <span className="text-[10px] text-muted-foreground">
            {fromLang?.flag} → {toLang?.flag}
          </span>
        )}
        
        {translation?.confidence && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground cursor-help">
                {Math.round(translation.confidence * 100)}%
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Translation confidence</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Translated Text */}
      {isTranslating ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Translating...</span>
        </div>
      ) : (
        <p className="text-sm">{translation?.translatedText || originalText}</p>
      )}

      {/* Original Text Toggle */}
      {translation && !isTranslating && (
        <div className="pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? (
              <>
                <EyeOff className="w-2.5 h-2.5 mr-1" />
                Hide original
              </>
            ) : (
              <>
                <Eye className="w-2.5 h-2.5 mr-1" />
                Show original
              </>
            )}
          </Button>
          
          {showOriginal && (
            <div className="mt-1 p-2 rounded bg-muted/50 border border-dashed">
              <p className="text-[10px] text-muted-foreground font-medium mb-0.5">
                Original ({fromLang?.name}):
              </p>
              <p className="text-xs text-muted-foreground italic">
                {translation.originalText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

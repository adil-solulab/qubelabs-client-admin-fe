import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageCode, getLanguageByCode } from '@/types/translation';
import { cn } from '@/lib/utils';

interface LanguageIndicatorProps {
  languageCode: LanguageCode;
  isAutoDetected?: boolean;
  variant?: 'badge' | 'inline' | 'icon-only';
  size?: 'sm' | 'md';
  className?: string;
}

export function LanguageIndicator({
  languageCode,
  isAutoDetected = false,
  variant = 'badge',
  size = 'sm',
  className,
}: LanguageIndicatorProps) {
  const language = getLanguageByCode(languageCode);
  
  if (!language) return null;

  if (variant === 'icon-only') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('cursor-help', className)}>
            {language.flag}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{language.name}</p>
          {isAutoDetected && (
            <p className="text-xs text-muted-foreground">Auto-detected</p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-muted-foreground',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}>
        <span>{language.flag}</span>
        <span>{language.name}</span>
        {isAutoDetected && (
          <span className="text-[10px] opacity-60">(auto)</span>
        )}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-normal',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
        className
      )}
    >
      <span>{language.flag}</span>
      <span>{language.code.toUpperCase()}</span>
      {isAutoDetected && (
        <Globe className="w-2.5 h-2.5 text-muted-foreground" />
      )}
    </Badge>
  );
}

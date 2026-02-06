import { useState, useEffect } from 'react';
import { Languages, Mic, Volume2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { VoiceTranslationState, LanguageCode, getLanguageByCode } from '@/types/translation';
import { cn } from '@/lib/utils';

interface VoiceTranslationPanelProps {
  voiceState: VoiceTranslationState;
  customerLanguage: LanguageCode;
  agentLanguage: LanguageCode;
  onStartListening: () => void;
  onStopListening: () => void;
  className?: string;
}

export function VoiceTranslationPanel({
  voiceState,
  customerLanguage,
  agentLanguage,
  onStartListening,
  onStopListening,
  className,
}: VoiceTranslationPanelProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  
  const customerLang = getLanguageByCode(customerLanguage);
  const agentLang = getLanguageByCode(agentLanguage);

  // Simulate audio level animation
  useEffect(() => {
    if (voiceState.isListening) {
      const interval = setInterval(() => {
        setAudioLevel(20 + Math.random() * 60);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [voiceState.isListening]);

  return (
    <Card className={cn('gradient-card border-primary/20', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Languages className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Voice Translation</p>
              <p className="text-[10px] text-muted-foreground">
                {customerLang?.flag} {customerLang?.name} → {agentLang?.flag} {agentLang?.name}
              </p>
            </div>
          </div>
          
          <Badge 
            variant={voiceState.isListening ? 'default' : 'secondary'}
            className={cn(
              'gap-1',
              voiceState.isListening && 'bg-success text-success-foreground animate-pulse'
            )}
          >
            {voiceState.isListening ? (
              <>
                <Mic className="w-3 h-3" />
                Live
              </>
            ) : (
              'Ready'
            )}
          </Badge>
        </div>

        {/* Audio Level Indicator */}
        {voiceState.isListening && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Audio Level</span>
            </div>
            <Progress value={audioLevel} className="h-1" />
          </div>
        )}

        {/* Live Transcript */}
        {voiceState.liveTranscript && (
          <div className="space-y-2 mb-3">
            <div className="p-2 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  {customerLang?.flag} Original
                </Badge>
                {voiceState.isListening && (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground italic whitespace-pre-wrap break-words">
                {voiceState.liveTranscript}
              </p>
            </div>
            
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-1 mb-1">
                <Badge className="text-[9px] px-1 py-0 bg-primary/20 text-primary">
                  {agentLang?.flag} Translated
                </Badge>
                {voiceState.isTranslating && (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                )}
              </div>
              <p className="text-xs whitespace-pre-wrap break-words">
                {voiceState.translatedTranscript || 'Translating...'}
              </p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!voiceState.isListening ? (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onStartListening}
            >
              <Mic className="w-3 h-3 mr-1" />
              Start Translation
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={onStopListening}
            >
              <Mic className="w-3 h-3 mr-1" />
              Stop
            </Button>
          )}
        </div>
        
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          💡 Customer speaks in {customerLang?.name}, you hear in {agentLang?.name}
        </p>
      </CardContent>
    </Card>
  );
}

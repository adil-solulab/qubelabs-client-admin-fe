import {
  Mic, MicOff, Pause, Play, Volume2, VolumeX, PhoneOff,
  Download, FileText, Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh,
  Bot, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';
import type { NetworkQuality, RecordingInfo } from '@/types/liveOps';

interface VoiceCallControlsProps {
  voiceMuted: boolean;
  voiceOnHold: boolean;
  voiceSpeaker: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  networkQuality?: NetworkQuality;
  recordingInfo?: RecordingInfo;
  isAiHandled?: boolean;
  showEndCall?: boolean;
}

const NETWORK_CONFIG: Record<NetworkQuality, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  excellent: { icon: SignalHigh, label: 'Excellent', color: 'text-success' },
  good: { icon: Signal, label: 'Good', color: 'text-success' },
  fair: { icon: SignalMedium, label: 'Fair', color: 'text-warning' },
  poor: { icon: SignalLow, label: 'Poor', color: 'text-destructive' },
};

export function VoiceCallControls({
  voiceMuted,
  voiceOnHold,
  voiceSpeaker,
  onToggleMute,
  onToggleHold,
  onToggleSpeaker,
  onEndCall,
  networkQuality,
  recordingInfo,
  isAiHandled,
  showEndCall = true,
}: VoiceCallControlsProps) {
  const handleDownloadRecording = () => {
    notify.success('Download Started', 'Call recording is being downloaded');
  };

  const handleDownloadTranscript = () => {
    notify.success('Download Started', 'Call transcript is being downloaded');
  };

  return (
    <div className="p-3 border-t flex-shrink-0 space-y-2">
      {networkQuality && (
        <div className="flex items-center justify-center gap-2 mb-1">
          <NetworkIndicator quality={networkQuality} />
          {recordingInfo?.available && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownloadRecording}>
                    <Download className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Recording</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDownloadTranscript}>
                    <FileText className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Transcript</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={voiceMuted ? 'destructive' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onToggleMute}
            >
              {voiceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{voiceMuted ? 'Unmute' : 'Mute'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={voiceOnHold ? 'secondary' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onToggleHold}
            >
              {voiceOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{voiceOnHold ? 'Resume' : 'Hold'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={voiceSpeaker ? 'secondary' : 'outline'}
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onToggleSpeaker}
            >
              {voiceSpeaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{voiceSpeaker ? 'Speaker Off' : 'Speaker On'}</TooltipContent>
        </Tooltip>

        {showEndCall && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={onEndCall}
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>End Call</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {voiceMuted && <Badge variant="destructive" className="text-[10px]">Muted</Badge>}
        {voiceOnHold && <Badge variant="secondary" className="text-[10px]">On Hold</Badge>}
        {voiceSpeaker && <Badge variant="secondary" className="text-[10px]">Speaker</Badge>}
        {isAiHandled && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary"><Bot className="w-2.5 h-2.5 mr-0.5" />AI Handling</Badge>}
      </div>
    </div>
  );
}

function NetworkIndicator({ quality }: { quality: NetworkQuality }) {
  const config = NETWORK_CONFIG[quality];
  const Icon = config.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center gap-1 text-[10px] font-medium', config.color)}>
          <Icon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>Network Quality: {config.label}</TooltipContent>
    </Tooltip>
  );
}

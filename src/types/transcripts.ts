export type TranscriptChannel = 'voice' | 'chat' | 'email';
export type TranscriptStatus = 'completed' | 'in_progress' | 'failed';
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface TranscriptEntry {
  timestamp: string;
  speaker: 'agent' | 'customer' | 'bot' | 'system';
  text: string;
  sentiment?: SentimentType;
}

export interface Transcript {
  id: string;
  sessionId: string;
  channel: TranscriptChannel;
  status: TranscriptStatus;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  agentName: string;
  agentId: string;
  botName?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  hasRecording: boolean;
  recordingUrl?: string;
  sentiment: SentimentType;
  entries: TranscriptEntry[];
  tags: string[];
  summary?: string;
  language: string;
  flowName?: string;
  createdAt: string;
}

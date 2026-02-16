import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  MessageSquare,
  Mail,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  X,
  Clock,
  User,
  Bot,
  ChevronRight,
  FileText,
  CheckSquare,
  Square,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Volume2,
  SkipBack,
  SkipForward,
  ArrowLeft,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranscriptsData } from '@/hooks/useTranscriptsData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
import type { Transcript, TranscriptChannel, SentimentType } from '@/types/transcripts';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const channelIcon = (channel: TranscriptChannel) => {
  switch (channel) {
    case 'voice': return <Phone className="w-3.5 h-3.5" />;
    case 'chat': return <MessageSquare className="w-3.5 h-3.5" />;
    case 'email': return <Mail className="w-3.5 h-3.5" />;
  }
};

const channelColor = (channel: TranscriptChannel) => {
  switch (channel) {
    case 'voice': return 'text-blue-600 bg-blue-500/10';
    case 'chat': return 'text-green-600 bg-green-500/10';
    case 'email': return 'text-purple-600 bg-purple-500/10';
  }
};

const sentimentIcon = (sentiment: SentimentType) => {
  switch (sentiment) {
    case 'positive': return <ThumbsUp className="w-3.5 h-3.5 text-green-500" />;
    case 'neutral': return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    case 'negative': return <ThumbsDown className="w-3.5 h-3.5 text-red-500" />;
  }
};

export default function TranscriptsPage() {
  const {
    transcripts,
    selectedTranscript,
    selectedTranscriptId,
    setSelectedTranscriptId,
    filters,
    updateFilter,
    deleteTranscript,
    deleteMultiple,
    stats,
  } = useTranscriptsData();

  const { canDelete, canExport, canView } = usePermission('transcripts');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | string[] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackVolume, setPlaybackVolume] = useState(80);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === transcripts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transcripts.map(t => t.id)));
    }
  };

  const handleDelete = (target: string | string[]) => {
    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (Array.isArray(deleteTarget)) {
      deleteMultiple(deleteTarget);
      setSelectedIds(new Set());
      notify.deleted(`${deleteTarget.length} transcript(s)`);
    } else {
      deleteTranscript(deleteTarget);
      notify.deleted('Transcript');
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleExport = (transcript: Transcript) => {
    const text = transcript.entries.map(e => 
      `[${e.timestamp}] ${e.speaker.toUpperCase()}: ${e.text}`
    ).join('\n');
    const blob = new Blob([`Session: ${transcript.sessionId}\nCustomer: ${transcript.customerName}\nAgent: ${transcript.agentName}\nDate: ${formatFullDate(transcript.startTime)}\nDuration: ${formatDuration(transcript.duration)}\n\n---\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${transcript.sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify.success('Transcript exported');
  };

  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, []);

  useEffect(() => {
    if (!selectedTranscriptId) {
      if (playbackRef.current) { clearInterval(playbackRef.current); playbackRef.current = null; }
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  }, [selectedTranscriptId]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (playbackRef.current) { clearInterval(playbackRef.current); playbackRef.current = null; }
      setIsPlaying(false);
    } else if (selectedTranscript) {
      setIsPlaying(true);
      playbackRef.current = setInterval(() => {
        setPlaybackPosition(prev => {
          if (prev >= (selectedTranscript.duration || 100)) {
            if (playbackRef.current) { clearInterval(playbackRef.current); playbackRef.current = null; }
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  if (selectedTranscript) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedTranscriptId(null); setIsPlaying(false); setPlaybackPosition(0); }}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button className="hover:text-primary transition-colors" onClick={() => { setSelectedTranscriptId(null); setIsPlaying(false); setPlaybackPosition(0); }}>
                Transcripts
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-semibold">{selectedTranscript.sessionId}</span>
            </div>
            <Badge className={cn('text-xs', channelColor(selectedTranscript.channel))}>
              {channelIcon(selectedTranscript.channel)}
              <span className="ml-1 capitalize">{selectedTranscript.channel}</span>
            </Badge>
            <Badge variant={selectedTranscript.status === 'completed' ? 'default' : selectedTranscript.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
              {selectedTranscript.status}
            </Badge>
            <div className="flex-1" />
            {canExport && (
              <Button variant="outline" size="sm" onClick={() => handleExport(selectedTranscript)}>
                <Download className="w-4 h-4 mr-1.5" />
                Export
              </Button>
            )}
            {canDelete && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(selectedTranscript.id)}>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
              {selectedTranscript.hasRecording && (
                <Card className="mb-4 flex-shrink-0">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full flex-shrink-0" onClick={togglePlayback}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[playbackPosition]}
                            max={selectedTranscript.duration}
                            step={1}
                            onValueChange={([v]) => setPlaybackPosition(v)}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDuration(playbackPosition)}</span>
                          <span>{formatDuration(selectedTranscript.duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlaybackPosition(Math.max(0, playbackPosition - 10))}>
                          <SkipBack className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlaybackPosition(Math.min(selectedTranscript.duration, playbackPosition + 10))}>
                          <SkipForward className="w-3.5 h-3.5" />
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <Slider
                          value={[playbackVolume]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => setPlaybackVolume(v)}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base">Conversation</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  <ScrollArea className="h-full px-5 pb-4">
                    <div className="space-y-4">
                      {selectedTranscript.entries.map((entry, idx) => (
                        <div key={idx} className={cn(
                          'flex gap-3',
                          entry.speaker === 'customer' && 'flex-row-reverse'
                        )}>
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            entry.speaker === 'agent' && 'bg-blue-500/10',
                            entry.speaker === 'customer' && 'bg-primary/10',
                            entry.speaker === 'bot' && 'bg-amber-500/10',
                            entry.speaker === 'system' && 'bg-gray-500/10',
                          )}>
                            {entry.speaker === 'agent' && <User className="w-4 h-4 text-blue-500" />}
                            {entry.speaker === 'customer' && <User className="w-4 h-4 text-primary" />}
                            {entry.speaker === 'bot' && <Bot className="w-4 h-4 text-amber-500" />}
                            {entry.speaker === 'system' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div className={cn(
                            'max-w-[75%] rounded-xl px-4 py-2.5',
                            entry.speaker === 'agent' && 'bg-blue-500/5 border border-blue-500/10',
                            entry.speaker === 'customer' && 'bg-primary/5 border border-primary/10',
                            entry.speaker === 'bot' && 'bg-amber-500/5 border border-amber-500/10',
                            entry.speaker === 'system' && 'bg-muted/50 border border-border',
                          )}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                'text-xs font-semibold capitalize',
                                entry.speaker === 'agent' && 'text-blue-600',
                                entry.speaker === 'customer' && 'text-primary',
                                entry.speaker === 'bot' && 'text-amber-600',
                                entry.speaker === 'system' && 'text-muted-foreground',
                              )}>
                                {entry.speaker === 'agent' ? selectedTranscript.agentName : 
                                 entry.speaker === 'bot' ? (selectedTranscript.botName || 'Bot') :
                                 entry.speaker === 'customer' ? selectedTranscript.customerName :
                                 'System'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                              {entry.sentiment && sentimentIcon(entry.sentiment)}
                            </div>
                            <p className={cn(
                              'text-sm whitespace-pre-wrap',
                              entry.speaker === 'system' && 'text-muted-foreground italic text-xs'
                            )}>{entry.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="w-72 flex-shrink-0 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID</span>
                    <span className="font-mono text-xs">{selectedTranscript.sessionId}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{selectedTranscript.customerName}</span>
                  </div>
                  {selectedTranscript.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-xs">{selectedTranscript.customerPhone}</span>
                    </div>
                  )}
                  {selectedTranscript.customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-xs truncate max-w-[140px]">{selectedTranscript.customerEmail}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agent</span>
                    <span className="font-medium">{selectedTranscript.agentName}</span>
                  </div>
                  {selectedTranscript.botName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bot</span>
                      <span>{selectedTranscript.botName}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="text-xs">{formatFullDate(selectedTranscript.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{formatDuration(selectedTranscript.duration)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sentiment</span>
                    <div className="flex items-center gap-1.5">
                      {sentimentIcon(selectedTranscript.sentiment)}
                      <span className="capitalize text-xs">{selectedTranscript.sentiment}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="uppercase text-xs">{selectedTranscript.language}</span>
                  </div>
                  {selectedTranscript.flowName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flow</span>
                      <span className="text-xs">{selectedTranscript.flowName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Recording</span>
                    <Badge variant={selectedTranscript.hasRecording ? 'default' : 'secondary'} className="text-xs">
                      {selectedTranscript.hasRecording ? 'Available' : 'None'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {selectedTranscript.summary && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedTranscript.summary}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTranscript.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transcript</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the transcript and its recording. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transcripts</h1>
            <p className="text-muted-foreground mt-1">View, listen, and manage conversation recordings</p>
          </div>
          {selectedIds.size > 0 && canDelete && (
            <Button variant="destructive" size="sm" onClick={() => handleDelete(Array.from(selectedIds))}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete {selectedIds.size} selected
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total Transcripts</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.voice}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Voice Calls</p>
                </div>
                <Phone className="w-8 h-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.withRecording}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">With Recording</p>
                </div>
                <Volume2 className="w-8 h-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Avg Duration</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transcripts..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.channel} onValueChange={(v) => updateFilter('channel', v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => updateFilter('status', v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sentiment} onValueChange={(v) => updateFilter('sentiment', v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={filters.hasRecording !== null ? 'secondary' : 'outline'} 
            size="sm"
            onClick={() => updateFilter('hasRecording', filters.hasRecording === true ? null : true)}
          >
            <Volume2 className="w-4 h-4 mr-1.5" />
            Has Recording
          </Button>
        </div>

        <Card>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 w-10">
                    <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                      {selectedIds.size === transcripts.length && transcripts.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Session</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Agent</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Channel</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Duration</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Sentiment</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Recording</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transcripts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No transcripts found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  transcripts.map(t => (
                    <tr 
                      key={t.id} 
                      className={cn(
                        'border-b hover:bg-muted/30 transition-colors cursor-pointer',
                        selectedIds.has(t.id) && 'bg-primary/5'
                      )}
                      onClick={() => canView && setSelectedTranscriptId(t.id)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(t.id)} className="text-muted-foreground hover:text-foreground">
                          {selectedIds.has(t.id) ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs text-primary hover:underline">{t.sessionId}</span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-medium">{t.customerName}</p>
                          <p className="text-xs text-muted-foreground">{t.customerPhone || t.customerEmail || '-'}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{t.agentName}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={cn('text-xs gap-1', channelColor(t.channel))}>
                          {channelIcon(t.channel)}
                          <span className="capitalize">{t.channel}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">{formatDuration(t.duration)}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {sentimentIcon(t.sentiment)}
                          <span className="text-xs capitalize">{t.sentiment}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {t.hasRecording ? (
                          <Badge variant="outline" className="text-xs gap-1 text-green-600">
                            <Volume2 className="w-3 h-3" />
                            Available
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">{formatDate(t.createdAt)}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={t.status === 'completed' ? 'default' : t.status === 'failed' ? 'destructive' : 'secondary'} className={cn('text-xs', t.status === 'completed' && 'bg-green-500')}>
                          {t.status === 'in_progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {t.hasRecording && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedTranscriptId(t.id); }}>
                              <Play className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canExport && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleExport(t)}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {Array.isArray(deleteTarget) ? `${deleteTarget.length} Transcript(s)` : 'Transcript'}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected transcript(s) and their recordings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

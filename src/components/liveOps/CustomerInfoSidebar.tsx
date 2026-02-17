import { useState } from 'react';
import {
  Phone, Mail, Building2, MapPin, Crown, DollarSign, Tag, Clock,
  Plus, X, Sparkles, Bot, MessageSquare, Zap, BookOpen, ChevronDown, ChevronUp, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CustomerInfo, CoPilotSuggestion, PreviousInteraction } from '@/types/liveOps';
import { CHANNEL_CONFIG } from '@/types/liveOps';

interface CustomerInfoSidebarProps {
  customerName: string;
  customerInfo?: CustomerInfo;
  coPilotSuggestions?: CoPilotSuggestion[];
  notes?: string[];
  onAddNote?: (note: string) => void;
  onUseSuggestion?: (suggestion: CoPilotSuggestion) => void;
  onClose: () => void;
  readOnly?: boolean;
}

const TIER_CONFIG = {
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground' },
  premium: { label: 'Premium', color: 'bg-amber-500/10 text-amber-600' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-500/10 text-purple-600' },
};

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  resolved: { label: 'Resolved', color: 'text-success' },
  escalated: { label: 'Escalated', color: 'text-destructive' },
  callback: { label: 'Callback', color: 'text-warning' },
};

const SUGGESTION_ICON = {
  intent: Bot,
  reply: MessageSquare,
  action: Zap,
  knowledge: BookOpen,
};

const SUGGESTION_COLOR = {
  intent: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  reply: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
  action: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
  knowledge: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
};

export function CustomerInfoSidebar({
  customerName,
  customerInfo,
  coPilotSuggestions,
  notes,
  onAddNote,
  onUseSuggestion,
  onClose,
  readOnly = false,
}: CustomerInfoSidebarProps) {
  const [newNote, setNewNote] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [copilotExpanded, setCopilotExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-l overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Customer Info</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {customerName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{customerName}</p>
              {customerInfo?.tier && (
                <Badge variant="outline" className={cn('text-[10px] mt-0.5', TIER_CONFIG[customerInfo.tier].color)}>
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  {TIER_CONFIG[customerInfo.tier].label}
                </Badge>
              )}
            </div>
          </div>

          {customerInfo && (
            <div className="space-y-2 text-xs">
              {customerInfo.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{customerInfo.phone}</span>
                </div>
              )}
              {customerInfo.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{customerInfo.email}</span>
                </div>
              )}
              {customerInfo.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  <span>{customerInfo.company}</span>
                </div>
              )}
              {customerInfo.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{customerInfo.location}</span>
                </div>
              )}
              {customerInfo.crmId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  <span>CRM: {customerInfo.crmId}</span>
                </div>
              )}
              {customerInfo.lifetimeValue && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>LTV: {customerInfo.lifetimeValue}</span>
                </div>
              )}
              {customerInfo.tags && customerInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {customerInfo.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {coPilotSuggestions && coPilotSuggestions.length > 0 && (
          <div className="border-b">
            <button
              onClick={() => setCopilotExpanded(!copilotExpanded)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">AI Co-Pilot</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{coPilotSuggestions.length}</Badge>
              </div>
              {copilotExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {copilotExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {coPilotSuggestions.map((suggestion) => {
                  const Icon = SUGGESTION_ICON[suggestion.type];
                  return (
                    <div
                      key={suggestion.id}
                      className={cn('p-2.5 rounded-lg border text-xs transition-all', SUGGESTION_COLOR[suggestion.type], !readOnly && 'cursor-pointer hover:shadow-sm')}
                      onClick={() => !readOnly && onUseSuggestion?.(suggestion)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-medium capitalize">{suggestion.type}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{suggestion.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {customerInfo?.previousInteractions && customerInfo.previousInteractions.length > 0 && (
          <div className="border-b">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Interaction History</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {customerInfo.previousInteractions.length}
                </Badge>
              </div>
              {historyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {historyExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {customerInfo.previousInteractions.map((interaction) => (
                  <InteractionCard key={interaction.id} interaction={interaction} />
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold">Notes</span>
              {notes && notes.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{notes.length}</Badge>
              )}
            </div>
            {notesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {notesExpanded && (
            <div className="px-3 pb-3 space-y-2">
              {notes && notes.map((note, i) => (
                <div key={i} className="p-2 rounded bg-muted/50 text-[11px] text-muted-foreground">
                  {note}
                </div>
              ))}
              {onAddNote && !readOnly && (
                <div className="space-y-1.5">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="text-xs min-h-[60px] resize-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              )}
              {readOnly && (
                <p className="text-[10px] text-muted-foreground italic">
                  Take over the conversation to add notes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InteractionCard({ interaction }: { interaction: PreviousInteraction }) {
  const channel = CHANNEL_CONFIG[interaction.channel];
  const outcome = OUTCOME_CONFIG[interaction.outcome];
  return (
    <div className="p-2 rounded-lg border bg-muted/30 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span>{channel.icon}</span>
          <span className="font-medium">{interaction.topic}</span>
        </div>
        <span className={cn('font-medium', outcome.color)}>{outcome.label}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{interaction.date}</span>
        {interaction.agent && <span>by {interaction.agent}</span>}
      </div>
    </div>
  );
}

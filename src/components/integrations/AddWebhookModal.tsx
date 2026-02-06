import { useState } from 'react';
import { Webhook, Plus, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { notify } from '@/hooks/useNotification';

const AVAILABLE_EVENTS = [
  { id: 'conversation.started', label: 'Conversation Started' },
  { id: 'conversation.ended', label: 'Conversation Ended' },
  { id: 'message.received', label: 'Message Received' },
  { id: 'message.sent', label: 'Message Sent' },
  { id: 'ticket.created', label: 'Ticket Created' },
  { id: 'ticket.updated', label: 'Ticket Updated' },
  { id: 'ticket.resolved', label: 'Ticket Resolved' },
  { id: 'agent.assigned', label: 'Agent Assigned' },
];

interface AddWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, url: string, events: string[]) => Promise<{ success: boolean }>;
}

export function AddWebhookModal({
  open,
  onOpenChange,
  onAdd,
}: AddWebhookModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string; events?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; url?: string; events?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!url.startsWith('https://')) {
      newErrors.url = 'URL must start with https://';
    }

    if (selectedEvents.length === 0) {
      newErrors.events = 'Select at least one event';
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    const firstMessage = newErrors.name || newErrors.url || newErrors.events;
    return { isValid, firstMessage };
  };

  const handleAdd = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      notify.validationError(validation.firstMessage);
      return;
    }
    
    setIsAdding(true);
    const result = await onAdd(name, url, selectedEvents);
    setIsAdding(false);
    
    if (result.success) {
      setName('');
      setUrl('');
      setSelectedEvents([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setName('');
      setUrl('');
      setSelectedEvents([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
    if (errors.events) {
      setErrors(prev => ({ ...prev, events: undefined }));
    }
  };

  const removeEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(e => e !== eventId));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Webhook className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Webhook Endpoint</DialogTitle>
              <DialogDescription className="mt-1">
                Configure a new endpoint to receive real-time events
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="webhookName">Endpoint Name</Label>
            <Input
              id="webhookName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Conversation Events"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
              }}
              placeholder="https://your-domain.com/webhook"
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be a secure HTTPS endpoint
            </p>
          </div>

          {/* Selected Events */}
          {selectedEvents.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Events</Label>
              <div className="flex flex-wrap gap-2">
                {selectedEvents.map(eventId => {
                  const event = AVAILABLE_EVENTS.find(e => e.id === eventId);
                  return (
                    <Badge key={eventId} variant="secondary" className="gap-1 pr-1">
                      {event?.label || eventId}
                      <button
                        type="button"
                        onClick={() => removeEvent(eventId)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events Selection */}
          <div className="space-y-3">
            <Label className={errors.events ? 'text-destructive' : ''}>
              Subscribe to Events
            </Label>
            {errors.events && (
              <p className="text-xs text-destructive">{errors.events}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_EVENTS.map(event => (
                <div
                  key={event.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => toggleEvent(event.id)}
                  />
                  <label
                    htmlFor={event.id}
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {event.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isAdding}>
            {isAdding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isAdding ? 'Adding...' : 'Add Endpoint'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

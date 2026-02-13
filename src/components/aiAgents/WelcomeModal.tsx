import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type WelcomeMode = 'send_message' | 'instruct' | 'trigger_flow';

interface WelcomeModeOption {
  id: WelcomeMode;
  label: string;
  description: string;
}

const WELCOME_MODES: WelcomeModeOption[] = [
  { id: 'instruct', label: 'Instruct super agent', description: 'Craft a flexible welcome by giving direct instructions to the AI.' },
  { id: 'trigger_flow', label: 'Trigger welcome flow', description: 'Automate structured conversations with pre-defined steps' },
  { id: 'send_message', label: 'Send message', description: 'Deliver a predefined greeting to get things started quickly.' },
];

const MOCK_FLOWS = [
  { id: 'flow-1', name: 'Customer Support Flow' },
  { id: 'flow-2', name: 'Handle Customer Queries' },
  { id: 'flow-3', name: 'Product FAQ' },
  { id: 'flow-4', name: 'Billing FAQ' },
  { id: 'flow-5', name: 'Appointment Booking' },
];

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  greeting: string;
  onSave: (mode: WelcomeMode, greeting: string, flowId?: string) => void;
}

export function WelcomeModal({ open, onOpenChange, greeting, onSave }: WelcomeModalProps) {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<WelcomeMode>('send_message');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [message, setMessage] = useState(greeting);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentMode = WELCOME_MODES.find(m => m.id === selectedMode)!;

  const handleSave = () => {
    onSave(selectedMode, message, selectedFlowId || undefined);
    onOpenChange(false);
  };

  const handleSelectMode = (mode: WelcomeMode) => {
    setSelectedMode(mode);
    setShowModeDropdown(false);
  };

  const handleViewWelcomeFlow = () => {
    if (selectedFlowId) {
      const flow = MOCK_FLOWS.find(f => f.id === selectedFlowId);
      if (flow) {
        navigate(`/flow-builder?openFlow=${encodeURIComponent(flow.name)}`);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Choose how super agent welcomes</DialogTitle>
          <DialogDescription>
            Decide how you want super agent to welcome your customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Choose how to welcome</h4>

            <div className="relative">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="w-full flex items-center justify-between p-3 border-2 border-primary rounded-lg text-left"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{currentMode.label}</p>
                  <p className="text-xs text-muted-foreground">{currentMode.description}</p>
                </div>
                <span className="text-sm font-medium text-primary hover:underline flex-shrink-0 ml-3">Change</span>
              </button>

              {showModeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
                  {WELCOME_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectMode(mode.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-accent transition-colors",
                        selectedMode === mode.id && "bg-accent"
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">{mode.label}</p>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedMode === 'send_message' && (
            <>
              <div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your welcome message..."
                  className="min-h-[100px] resize-y"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Conversation starters</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">Show suggestions with welcome message</span>
                  <Switch checked={showSuggestions} onCheckedChange={setShowSuggestions} />
                </div>
              </div>
            </>
          )}

          {selectedMode === 'instruct' && (
            <div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write instructions for how the super agent should welcome customers..."
                className="min-h-[100px] resize-y"
              />
            </div>
          )}

          {selectedMode === 'trigger_flow' && (
            <>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Here's how your customer will be welcomed</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Your conversation will be routed to the welcome flow in Flows section
                </p>

                <Select value={selectedFlowId} onValueChange={setSelectedFlowId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_FLOWS.map(flow => (
                      <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedFlowId && (
                  <button
                    onClick={handleViewWelcomeFlow}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View welcome flow
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Conversation starters</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use quick reply buttons within welcome flow to show suggestions
                </p>
                {selectedFlowId && (
                  <button
                    onClick={handleViewWelcomeFlow}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View welcome flow
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { 
  Search, MessageSquare, GitBranch, Plug, Phone, Bot, ArrowRightLeft, CircleStop, 
  ChevronLeft, ChevronRight, ChevronDown,
  MessageCircle, Hash, Send, Users,
  Ticket, ClipboardList,
  BarChart3, Cloud, Hexagon,
  TextCursor, Zap, LayoutGrid, UserCircle, AtSign, Smartphone, Calendar,
  RefreshCw, Database, Code, Box, Timer, Bell, Globe, ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NODE_TYPE_CONFIG, FLOW_NODE_CATEGORIES, WORKFLOW_NODE_CATEGORIES, type NodeType, type FlowType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface NodeToolsSidebarProps {
  onAddNode: (type: NodeType) => void;
  canEdit: boolean;
  flowType?: FlowType;
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  start: <div className="w-5 h-5 rounded-full bg-success/80 flex items-center justify-center text-white text-[10px] font-bold">S</div>,
  message: <MessageSquare className="w-5 h-5" />,
  condition: <GitBranch className="w-5 h-5" />,
  api_call: <Plug className="w-5 h-5" />,
  dtmf: <Phone className="w-5 h-5" />,
  assistant: <Bot className="w-5 h-5" />,
  transfer: <ArrowRightLeft className="w-5 h-5" />,
  end: <CircleStop className="w-5 h-5" />,
  whatsapp: <MessageCircle className="w-5 h-5" />,
  slack: <Hash className="w-5 h-5" />,
  telegram: <Send className="w-5 h-5" />,
  teams: <Users className="w-5 h-5" />,
  zendesk: <Ticket className="w-5 h-5" />,
  freshdesk: <ClipboardList className="w-5 h-5" />,
  zoho_crm: <BarChart3 className="w-5 h-5" />,
  salesforce: <Cloud className="w-5 h-5" />,
  hubspot: <Hexagon className="w-5 h-5" />,
  text_input: <TextCursor className="w-5 h-5" />,
  quick_reply: <Zap className="w-5 h-5" />,
  carousel: <LayoutGrid className="w-5 h-5" />,
  name_input: <UserCircle className="w-5 h-5" />,
  email_input: <AtSign className="w-5 h-5" />,
  phone_input: <Smartphone className="w-5 h-5" />,
  date_input: <Calendar className="w-5 h-5" />,
  execute_flow: <RefreshCw className="w-5 h-5" />,
  raise_ticket: <Ticket className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  function: <Code className="w-5 h-5" />,
  variable: <Box className="w-5 h-5" />,
  delay: <Timer className="w-5 h-5" />,
  notification: <Bell className="w-5 h-5" />,
  event_trigger: <Globe className="w-5 h-5" />,
  safety_check: <ShieldCheck className="w-5 h-5" />,
};

const NODE_DESCRIPTIONS: Record<NodeType, string> = {
  start: 'Entry point of the flow',
  message: 'Send a message to the user',
  condition: 'Branch based on conditions',
  api_call: 'Make an external API request',
  dtmf: 'Capture keypad input',
  assistant: 'Hand off to an AI assistant',
  transfer: 'Transfer to a live agent',
  end: 'End the conversation',
  whatsapp: 'Send or receive WhatsApp messages',
  slack: 'Post messages to Slack channels',
  telegram: 'Send Telegram bot messages',
  teams: 'Send Microsoft Teams notifications',
  zendesk: 'Create or update Zendesk tickets',
  freshdesk: 'Manage Freshdesk support tickets',
  zoho_crm: 'Sync data with Zoho CRM',
  salesforce: 'Manage Salesforce records',
  hubspot: 'Update HubSpot contacts & deals',
  text_input: 'Collect text input from user',
  quick_reply: 'Show quick reply buttons',
  carousel: 'Display a carousel of cards',
  name_input: 'Capture user\'s name',
  email_input: 'Capture email address',
  phone_input: 'Capture phone number',
  date_input: 'Capture date or time',
  execute_flow: 'Call another flow',
  raise_ticket: 'Escalate to live agent',
  database: 'Read or write database records',
  function: 'Run custom code logic',
  variable: 'Set or transform variables',
  delay: 'Add a time delay',
  notification: 'Send a notification',
  event_trigger: 'Trigger an external event',
  safety_check: 'Risk & safety checkpoint for AI guardrails',
};

export function NodeToolsSidebar({ onAddNode, canEdit, flowType = 'flow' }: NodeToolsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const categoriesMap = flowType === 'workflow' ? WORKFLOW_NODE_CATEGORIES : FLOW_NODE_CATEGORIES;
  const categoryOrder = Object.keys(categoriesMap);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getFilteredTypesForCategory = (category: string) => {
    return categoriesMap[category].types.filter(type => {
      if (!searchQuery) return true;
      const config = NODE_TYPE_CONFIG[type];
      return config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
             NODE_DESCRIPTIONS[type].toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const allFilteredTypes = categoryOrder.flatMap(cat => getFilteredTypesForCategory(cat));

  if (collapsed) {
    return (
      <TooltipProvider>
        <div className="w-12 bg-card border-r flex flex-col items-center py-3 gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors mb-2"
                onClick={() => setCollapsed(false)}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand tools panel</TooltipContent>
          </Tooltip>

          {categoryOrder.map(cat => {
            const types = categoriesMap[cat].types;
            return types.map(type => {
              const config = NODE_TYPE_CONFIG[type];
              return (
                <Tooltip key={type}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                        canEdit
                          ? 'hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95'
                          : 'opacity-40 cursor-not-allowed',
                        config.color
                      )}
                      onClick={() => canEdit && onAddNode(type)}
                      disabled={!canEdit}
                    >
                      {NODE_ICONS[type]}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{NODE_DESCRIPTIONS[type]}</p>
                  </TooltipContent>
                </Tooltip>
              );
            });
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="w-56 bg-card border-r flex flex-col flex-shrink-0">
      <div className="px-3 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Node Tools</span>
        <button
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {categoryOrder.map(cat => {
          const catConfig = categoriesMap[cat];
          const filteredTypes = getFilteredTypesForCategory(cat);
          if (filteredTypes.length === 0) return null;
          const isCollapsed = collapsedCategories[cat];

          return (
            <div key={cat}>
              <button
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => toggleCategory(cat)}
              >
                <span>{catConfig.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {filteredTypes.map(type => {
                    const config = NODE_TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group',
                          canEdit
                            ? 'hover:bg-primary/10 cursor-pointer active:scale-[0.98]'
                            : 'opacity-40 cursor-not-allowed'
                        )}
                        onClick={() => canEdit && onAddNode(type)}
                        disabled={!canEdit}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                          config.bgColor,
                          config.color
                        )}>
                          {NODE_ICONS[type]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{config.label}</div>
                          <div className="text-[11px] text-muted-foreground truncate leading-tight">{NODE_DESCRIPTIONS[type]}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {allFilteredTypes.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-6">
            No matching nodes
          </div>
        )}
      </div>
    </div>
  );
}

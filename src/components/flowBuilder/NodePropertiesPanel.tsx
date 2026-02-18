import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Trash2, Save, Check, Plus, Minus, Zap, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteNodeModal } from './DeleteNodeModal';
import type { FlowNode, NodeData } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';
import { notify } from '@/hooks/useNotification';

interface NodePropertiesPanelProps {
  node: FlowNode;
  onUpdate: (updates: Partial<NodeData>) => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenWorkflowModal?: () => void;
  flowNodes?: FlowNode[];
}

export function NodePropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onClose,
  onOpenWorkflowModal,
  flowNodes,
}: NodePropertiesPanelProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleUpdate = useCallback((updates: Partial<NodeData>) => {
    onUpdate(updates);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setShowSaved(true);
    saveTimeoutRef.current = setTimeout(() => {
      setShowSaved(false);
    }, 1500);
  }, [onUpdate]);
  
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  const handleDelete = () => {
    onDelete();
    notify.deleted(`Node "${node.data.label}" deleted`);
    setDeleteModalOpen(false);
  };
  const config = NODE_TYPE_CONFIG[node.type];

  return (
    <>
      <Card className="w-80 gradient-card max-h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">{config.icon}</span>
              {config.label} Properties
              {showSaved && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-success/10 text-success">
                  <Check className="w-3 h-3" />
                  Saved
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={node.data.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Node label..."
            />
          </div>

          {node.type === 'message' && (() => {
            const workflowOutputs = (flowNodes || [])
              .filter(n => n.type === 'run_workflow' && n.data.runWorkflowConfig?.outputs?.length)
              .flatMap(n => (n.data.runWorkflowConfig!.outputs).map(o => ({
                token: `{{workflow.${o.name}}}`,
                type: o.type,
                workflowName: n.data.runWorkflowConfig!.targetWorkflowName,
              })));
            return (
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  value={node.data.content || ''}
                  onChange={(e) => handleUpdate({ content: e.target.value })}
                  placeholder="Enter message..."
                  rows={4}
                />
                {workflowOutputs.length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Available workflow variables:</Label>
                    <div className="flex flex-wrap gap-1">
                      {workflowOutputs.map(({ token, type, workflowName }) => (
                        <button
                          key={token}
                          onClick={() => {
                            const current = node.data.content || '';
                            handleUpdate({ content: current + token });
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                          title={`${workflowName} — ${type}`}
                        >
                          {token}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {node.type === 'condition' && (
            <>
              <div className="space-y-2">
                <Label>Variable</Label>
                <Input
                  value={node.data.condition?.variable || ''}
                  onChange={(e) => handleUpdate({
                    condition: { ...node.data.condition!, variable: e.target.value }
                  })}
                  placeholder="e.g., intent, sentiment"
                />
              </div>
              <div className="space-y-2">
                <Label>Operator</Label>
                <Select
                  value={node.data.condition?.operator || 'equals'}
                  onValueChange={(value) => handleUpdate({
                    condition: { ...node.data.condition!, operator: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={node.data.condition?.value || ''}
                  onChange={(e) => handleUpdate({
                    condition: { ...node.data.condition!, value: e.target.value }
                  })}
                  placeholder="Comparison value..."
                />
              </div>
            </>
          )}

          {node.type === 'api_call' && (
            <>
              <div className="space-y-2">
                <Label>HTTP Method</Label>
                <Select
                  value={node.data.apiConfig?.method || 'GET'}
                  onValueChange={(value) => handleUpdate({
                    apiConfig: { ...node.data.apiConfig!, method: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={node.data.apiConfig?.url || ''}
                  onChange={(e) => handleUpdate({
                    apiConfig: { ...node.data.apiConfig!, url: e.target.value }
                  })}
                  placeholder="/api/endpoint"
                />
              </div>
              <div className="space-y-2">
                <Label>Request Body (JSON)</Label>
                <Textarea
                  value={node.data.apiConfig?.body || ''}
                  onChange={(e) => handleUpdate({
                    apiConfig: { ...node.data.apiConfig!, body: e.target.value }
                  })}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="font-mono text-xs"
                />
              </div>
            </>
          )}

          {node.type === 'transfer' && (
            <div className="space-y-2">
              <Label>Transfer To</Label>
              <Select
                value={node.data.transferTo || ''}
                onValueChange={(value) => handleUpdate({ transferTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales Team">Sales Team</SelectItem>
                  <SelectItem value="Support Team">Support Team</SelectItem>
                  <SelectItem value="Technical Team">Technical Team</SelectItem>
                  <SelectItem value="Billing Team">Billing Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {node.type === 'dtmf' && (
            <>
              <div className="space-y-2">
                <Label>Voice Prompt</Label>
                <Textarea
                  value={node.data.dtmfConfig?.prompt || ''}
                  onChange={(e) => handleUpdate({
                    dtmfConfig: { ...node.data.dtmfConfig!, prompt: e.target.value }
                  })}
                  placeholder="Press 1 for sales..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Timeout (sec)</Label>
                  <Input
                    type="number"
                    value={node.data.dtmfConfig?.timeout || 10}
                    onChange={(e) => handleUpdate({
                      dtmfConfig: { ...node.data.dtmfConfig!, timeout: parseInt(e.target.value) }
                    })}
                    min={1}
                    max={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Digits</Label>
                  <Input
                    type="number"
                    value={node.data.dtmfConfig?.maxDigits || 1}
                    onChange={(e) => handleUpdate({
                      dtmfConfig: { ...node.data.dtmfConfig!, maxDigits: parseInt(e.target.value) }
                    })}
                    min={1}
                    max={10}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Key Branches</Label>
                <div className="space-y-2">
                  {node.data.dtmfConfig?.branches.map((branch, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded border bg-muted/30">
                      <Badge variant="outline" className="w-8 text-center">{branch.key}</Badge>
                      <span className="text-sm flex-1">{branch.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {node.type === 'assistant' && (
            <>
              <div className="space-y-2">
                <Label>AI Persona</Label>
                <Select
                  value={node.data.assistantConfig?.personaId || ''}
                  onValueChange={(value) => handleUpdate({
                    assistantConfig: { 
                      ...node.data.assistantConfig!, 
                      personaId: value,
                      personaName: value === 'persona-1' ? 'Sales Agent' : value === 'persona-2' ? 'Support Agent' : 'General Assistant'
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select persona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persona-1">🎯 Sales Agent</SelectItem>
                    <SelectItem value="persona-2">🛠️ Support Agent</SelectItem>
                    <SelectItem value="persona-3">🤖 General Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Handoff Condition</Label>
                <Select
                  value={node.data.assistantConfig?.handoffCondition || 'escalation_requested'}
                  onValueChange={(value) => handleUpdate({
                    assistantConfig: { ...node.data.assistantConfig!, handoffCondition: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escalation_requested">Escalation Requested</SelectItem>
                    <SelectItem value="negative_sentiment">Negative Sentiment Detected</SelectItem>
                    <SelectItem value="task_complete">Task Complete</SelectItem>
                    <SelectItem value="timeout">Conversation Timeout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {['whatsapp', 'slack', 'telegram', 'teams'].includes(node.type) && (
            <>
              <div className="space-y-2">
                <Label>Recipient / Channel ID</Label>
                <Input
                  value={node.data.channelConfig?.recipientId || ''}
                  onChange={(e) => handleUpdate({
                    channelConfig: { ...node.data.channelConfig!, recipientId: e.target.value }
                  })}
                  placeholder={node.type === 'slack' ? '#channel-name' : node.type === 'teams' ? 'Team channel ID' : 'Phone number or chat ID'}
                />
              </div>
              <div className="space-y-2">
                <Label>Message Template</Label>
                <Textarea
                  value={node.data.channelConfig?.messageTemplate || ''}
                  onChange={(e) => handleUpdate({
                    channelConfig: { ...node.data.channelConfig!, messageTemplate: e.target.value }
                  })}
                  placeholder="Type your message template... Use {{variable}} for dynamic content"
                  rows={4}
                />
              </div>
            </>
          )}

          {['zendesk', 'freshdesk'].includes(node.type) && (
            <>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={node.data.ticketConfig?.action || 'create'}
                  onValueChange={(value) => handleUpdate({
                    ticketConfig: { ...node.data.ticketConfig!, action: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create Ticket</SelectItem>
                    <SelectItem value="update">Update Ticket</SelectItem>
                    <SelectItem value="close">Close Ticket</SelectItem>
                    <SelectItem value="get">Get Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={node.data.ticketConfig?.subject || ''}
                  onChange={(e) => handleUpdate({
                    ticketConfig: { ...node.data.ticketConfig!, subject: e.target.value }
                  })}
                  placeholder="Ticket subject..."
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={node.data.ticketConfig?.priority || 'medium'}
                  onValueChange={(value) => handleUpdate({
                    ticketConfig: { ...node.data.ticketConfig!, priority: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Input
                  value={node.data.ticketConfig?.assignee || ''}
                  onChange={(e) => handleUpdate({
                    ticketConfig: { ...node.data.ticketConfig!, assignee: e.target.value }
                  })}
                  placeholder="Agent or team name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={node.data.ticketConfig?.tags || ''}
                  onChange={(e) => handleUpdate({
                    ticketConfig: { ...node.data.ticketConfig!, tags: e.target.value }
                  })}
                  placeholder="Comma-separated tags..."
                />
              </div>
            </>
          )}

          {['zoho_crm', 'salesforce', 'hubspot'].includes(node.type) && (
            <>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={node.data.crmConfig?.action || 'create_contact'}
                  onValueChange={(value) => handleUpdate({
                    crmConfig: { ...node.data.crmConfig!, action: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_contact">Create Contact</SelectItem>
                    <SelectItem value="update_contact">Update Contact</SelectItem>
                    <SelectItem value="get_contact">Get Contact</SelectItem>
                    <SelectItem value="create_deal">Create Deal</SelectItem>
                    <SelectItem value="update_deal">Update Deal</SelectItem>
                    <SelectItem value="search">Search Records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Object Type</Label>
                <Select
                  value={node.data.crmConfig?.objectType || 'contact'}
                  onValueChange={(value) => handleUpdate({
                    crmConfig: { ...node.data.crmConfig!, objectType: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="deal">Deal</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Field Mapping (JSON)</Label>
                <Textarea
                  value={node.data.crmConfig?.fieldMapping || ''}
                  onChange={(e) => handleUpdate({
                    crmConfig: { ...node.data.crmConfig!, fieldMapping: e.target.value }
                  })}
                  placeholder='{"first_name": "{{name}}", "email": "{{email}}"}'
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            </>
          )}

          {['text_input', 'name_input', 'email_input', 'phone_input', 'date_input'].includes(node.type) && (
            <>
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={node.data.textInputConfig?.placeholder || ''}
                  onChange={(e) => handleUpdate({
                    textInputConfig: { ...node.data.textInputConfig!, placeholder: e.target.value }
                  })}
                  placeholder="Placeholder text..."
                />
              </div>
              <div className="space-y-2">
                <Label>Validation Type</Label>
                <Select
                  value={node.data.textInputConfig?.validationType || 'none'}
                  onValueChange={(value) => handleUpdate({
                    textInputConfig: { ...node.data.textInputConfig!, validationType: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {node.data.textInputConfig?.validationType === 'regex' && (
                <div className="space-y-2">
                  <Label>Validation Pattern</Label>
                  <Input
                    value={node.data.textInputConfig?.validationPattern || ''}
                    onChange={(e) => handleUpdate({
                      textInputConfig: { ...node.data.textInputConfig!, validationPattern: e.target.value }
                    })}
                    placeholder="e.g., ^[A-Z]{3}[0-9]{4}$"
                    className="font-mono text-xs"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Required</Label>
                <Switch
                  checked={node.data.textInputConfig?.required ?? true}
                  onCheckedChange={(checked) => handleUpdate({
                    textInputConfig: { ...node.data.textInputConfig!, required: checked }
                  })}
                />
              </div>
            </>
          )}

          {node.type === 'quick_reply' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const options = [...(node.data.quickReplyConfig?.options || [])];
                      options.push({ label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` });
                      handleUpdate({ quickReplyConfig: { ...node.data.quickReplyConfig!, options } });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {node.data.quickReplyConfig?.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={opt.label}
                        onChange={(e) => {
                          const options = [...(node.data.quickReplyConfig?.options || [])];
                          options[idx] = { ...options[idx], label: e.target.value };
                          handleUpdate({ quickReplyConfig: { ...node.data.quickReplyConfig!, options } });
                        }}
                        placeholder="Label"
                        className="text-xs"
                      />
                      <Input
                        value={opt.value}
                        onChange={(e) => {
                          const options = [...(node.data.quickReplyConfig?.options || [])];
                          options[idx] = { ...options[idx], value: e.target.value };
                          handleUpdate({ quickReplyConfig: { ...node.data.quickReplyConfig!, options } });
                        }}
                        placeholder="Value"
                        className="text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => {
                          const options = (node.data.quickReplyConfig?.options || []).filter((_, i) => i !== idx);
                          handleUpdate({ quickReplyConfig: { ...node.data.quickReplyConfig!, options } });
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Multiple</Label>
                <Switch
                  checked={node.data.quickReplyConfig?.allowMultiple ?? false}
                  onCheckedChange={(checked) => handleUpdate({
                    quickReplyConfig: { ...node.data.quickReplyConfig!, allowMultiple: checked }
                  })}
                />
              </div>
            </>
          )}

          {node.type === 'carousel' && (
            <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
              Configure carousel cards in the visual editor. Each card can have a title, description, image, and action buttons.
            </div>
          )}

          {node.type === 'execute_flow' && (
            <>
              <div className="space-y-2">
                <Label>Target Flow Name</Label>
                <Input
                  value={node.data.executeFlowConfig?.targetFlowName || ''}
                  onChange={(e) => handleUpdate({
                    executeFlowConfig: { ...node.data.executeFlowConfig!, targetFlowName: e.target.value, targetFlowId: '' }
                  })}
                  placeholder="Enter flow name..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Return After Completion</Label>
                <Switch
                  checked={node.data.executeFlowConfig?.returnAfter ?? true}
                  onCheckedChange={(checked) => handleUpdate({
                    executeFlowConfig: { ...node.data.executeFlowConfig!, returnAfter: checked }
                  })}
                />
              </div>
            </>
          )}

          {node.type === 'raise_ticket' && (
            <>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={node.data.raiseTicketConfig?.priority || 'medium'}
                  onValueChange={(value) => handleUpdate({
                    raiseTicketConfig: { ...node.data.raiseTicketConfig!, priority: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={node.data.raiseTicketConfig?.department || ''}
                  onChange={(e) => handleUpdate({
                    raiseTicketConfig: { ...node.data.raiseTicketConfig!, department: e.target.value }
                  })}
                  placeholder="e.g., Support, Sales"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={node.data.raiseTicketConfig?.message || ''}
                  onChange={(e) => handleUpdate({
                    raiseTicketConfig: { ...node.data.raiseTicketConfig!, message: e.target.value }
                  })}
                  placeholder="Ticket message..."
                  rows={3}
                />
              </div>
            </>
          )}

          {node.type === 'database' && (
            <>
              <div className="space-y-2">
                <Label>Operation</Label>
                <Select
                  value={node.data.databaseConfig?.operation || 'read'}
                  onValueChange={(value) => handleUpdate({
                    databaseConfig: { ...node.data.databaseConfig!, operation: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="query">Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Table</Label>
                <Input
                  value={node.data.databaseConfig?.table || ''}
                  onChange={(e) => handleUpdate({
                    databaseConfig: { ...node.data.databaseConfig!, table: e.target.value }
                  })}
                  placeholder="Table name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Fields</Label>
                <Input
                  value={node.data.databaseConfig?.fields || ''}
                  onChange={(e) => handleUpdate({
                    databaseConfig: { ...node.data.databaseConfig!, fields: e.target.value }
                  })}
                  placeholder="id, name, email"
                />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Input
                  value={node.data.databaseConfig?.condition || ''}
                  onChange={(e) => handleUpdate({
                    databaseConfig: { ...node.data.databaseConfig!, condition: e.target.value }
                  })}
                  placeholder="WHERE id = {{userId}}"
                />
              </div>
            </>
          )}

          {node.type === 'function' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Code</Label>
                  <Badge variant="outline" className="text-[10px]">JavaScript</Badge>
                </div>
                <Textarea
                  value={node.data.functionConfig?.code || ''}
                  onChange={(e) => handleUpdate({
                    functionConfig: { ...node.data.functionConfig!, code: e.target.value }
                  })}
                  placeholder="// Write your logic here"
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={node.data.functionConfig?.timeout || 30}
                  onChange={(e) => handleUpdate({
                    functionConfig: { ...node.data.functionConfig!, timeout: parseInt(e.target.value) }
                  })}
                  min={1}
                  max={300}
                />
              </div>
            </>
          )}

          {node.type === 'variable' && (
            <>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={node.data.variableConfig?.action || 'set'}
                  onValueChange={(value) => handleUpdate({
                    variableConfig: { ...node.data.variableConfig!, action: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="get">Get</SelectItem>
                    <SelectItem value="transform">Transform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Variable Name</Label>
                <Input
                  value={node.data.variableConfig?.variableName || ''}
                  onChange={(e) => handleUpdate({
                    variableConfig: { ...node.data.variableConfig!, variableName: e.target.value }
                  })}
                  placeholder="variable_name"
                />
              </div>
              {node.data.variableConfig?.action === 'set' && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={node.data.variableConfig?.value || ''}
                    onChange={(e) => handleUpdate({
                      variableConfig: { ...node.data.variableConfig!, value: e.target.value }
                    })}
                    placeholder="Value or {{expression}}"
                  />
                </div>
              )}
              {node.data.variableConfig?.action === 'transform' && (
                <div className="space-y-2">
                  <Label>Transform Expression</Label>
                  <Input
                    value={node.data.variableConfig?.transformExpression || ''}
                    onChange={(e) => handleUpdate({
                      variableConfig: { ...node.data.variableConfig!, transformExpression: e.target.value }
                    })}
                    placeholder="e.g., toUpperCase() or split(',')"
                  />
                </div>
              )}
            </>
          )}

          {node.type === 'delay' && (
            <>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  type="number"
                  value={node.data.delayConfig?.duration || 5}
                  onChange={(e) => handleUpdate({
                    delayConfig: { ...node.data.delayConfig!, duration: parseInt(e.target.value) }
                  })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={node.data.delayConfig?.unit || 'seconds'}
                  onValueChange={(value) => handleUpdate({
                    delayConfig: { ...node.data.delayConfig!, unit: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {node.type === 'notification' && (
            <>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={node.data.notificationConfig?.type || 'email'}
                  onValueChange={(value) => handleUpdate({
                    notificationConfig: { ...node.data.notificationConfig!, type: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Input
                  value={node.data.notificationConfig?.recipient || ''}
                  onChange={(e) => handleUpdate({
                    notificationConfig: { ...node.data.notificationConfig!, recipient: e.target.value }
                  })}
                  placeholder="Recipient address or ID..."
                />
              </div>
              {node.data.notificationConfig?.type === 'email' && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={node.data.notificationConfig?.subject || ''}
                    onChange={(e) => handleUpdate({
                      notificationConfig: { ...node.data.notificationConfig!, subject: e.target.value }
                    })}
                    placeholder="Email subject..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={node.data.notificationConfig?.body || ''}
                  onChange={(e) => handleUpdate({
                    notificationConfig: { ...node.data.notificationConfig!, body: e.target.value }
                  })}
                  placeholder="Notification content..."
                  rows={4}
                />
              </div>
            </>
          )}

          {node.type === 'event_trigger' && (
            <>
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input
                  value={node.data.eventTriggerConfig?.eventName || ''}
                  onChange={(e) => handleUpdate({
                    eventTriggerConfig: { ...node.data.eventTriggerConfig!, eventName: e.target.value }
                  })}
                  placeholder="e.g., order.completed"
                />
              </div>
              <div className="space-y-2">
                <Label>Payload (JSON)</Label>
                <Textarea
                  value={node.data.eventTriggerConfig?.payload || ''}
                  onChange={(e) => handleUpdate({
                    eventTriggerConfig: { ...node.data.eventTriggerConfig!, payload: e.target.value }
                  })}
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            </>
          )}

          {node.type === 'run_workflow' && (
            <div className="space-y-3">
              {node.data.runWorkflowConfig?.targetWorkflowId ? (
                <>
                  <div className="p-3 rounded-lg border bg-purple-500/5 border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{node.data.runWorkflowConfig.targetWorkflowName}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      ID: {node.data.runWorkflowConfig.targetWorkflowId}
                    </Badge>
                  </div>

                  {node.data.runWorkflowConfig.outputs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Output Variables</Label>
                      <p className="text-[11px] text-muted-foreground">
                        These variables are available in downstream nodes as {'{{workflow.variable_name}}'}
                      </p>
                      <div className="space-y-1.5">
                        {node.data.runWorkflowConfig.outputs.map((output) => (
                          <div key={output.name} className="flex items-center justify-between p-2 rounded border bg-muted/30">
                            <code className="text-xs font-mono text-purple-600 dark:text-purple-400">
                              {`{{workflow.${output.name}}}`}
                            </code>
                            <Badge variant="outline" className="text-[10px]">{output.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-purple-600 border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    onClick={onOpenWorkflowModal}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Change Workflow
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-purple-500/50" />
                  <p className="text-sm text-muted-foreground mb-3">No workflow selected</p>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={onOpenWorkflowModal}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Select Workflow
                  </Button>
                </div>
              )}
            </div>
          )}

          {['voice_output', 'chat_output', 'email_output', 'whatsapp_output', 'sms_output'].includes(node.type) && (() => {
            const channelLabels: Record<string, string> = {
              voice_output: 'Voice',
              chat_output: 'Chat',
              email_output: 'Email',
              whatsapp_output: 'WhatsApp',
              sms_output: 'SMS',
            };
            const formatLabels: Record<string, string> = {
              ssml: 'SSML (Speech Synthesis)',
              rich_text: 'Rich Text (Markdown)',
              html: 'HTML Template',
              whatsapp: 'WhatsApp Template',
              plain_text: 'Plain Text',
            };
            const cfg = node.data.channelOutputConfig || {
              channel: node.type.replace('_output', '') as 'voice' | 'chat' | 'email' | 'whatsapp' | 'sms',
              messageTemplate: '',
              formatting: 'plain_text',
            };
            return (
              <>
                <div className="space-y-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Channel</p>
                    <p className="text-sm font-semibold">{channelLabels[node.type] || 'Unknown'}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-muted-foreground">Format</p>
                    <p className="text-sm">{formatLabels[cfg.formatting || ''] || cfg.formatting}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Message Template</Label>
                    <Textarea
                      value={cfg.messageTemplate}
                      onChange={(e) => handleUpdate({
                        channelOutputConfig: { ...cfg, messageTemplate: e.target.value },
                      })}
                      placeholder={`Enter ${channelLabels[node.type] || ''} message template...`}
                      rows={5}
                      className="resize-none text-sm font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Use {'{{variable}}'} syntax to insert dynamic values
                    </p>
                  </div>
                </div>
              </>
            );
          })()}

          {node.type === 'safety_check' && (() => {
            const sc = node.data.safetyConfig || {
              botType: 'chat' as const,
              checks: { sentimentAnalysis: true, piiDetection: true, policyViolation: true, profanityFilter: true, topicGuardrail: false },
              sentimentThreshold: 'medium' as const,
              sentimentEscalateOnRepeated: false,
              sentimentRepeatCount: 3,
              piiTypes: ['credit_card', 'ssn', 'phone', 'email', 'address'] as ('credit_card' | 'ssn' | 'phone' | 'email' | 'address' | 'name' | 'government_id' | 'date_of_birth')[],
              policyCategories: ['harassment', 'threats', 'abuse'] as ('harassment' | 'threats' | 'abuse' | 'fraud' | 'scams' | 'data_leakage' | 'confidential_content')[],
              profanitySeverity: 'moderate' as const,
              profanityGraceCount: 1,
              blockedTopics: '',
              onHighRisk: 'escalate_supervisor' as const,
              onMediumRisk: 'continue_with_warning' as const,
              onPiiDetected: 'mask_and_continue' as const,
              onSensitiveTopic: 'safe_fallback' as const,
              customRules: '',
              enableLogging: true,
            };
            const updateSafety = (updates: Partial<typeof sc>) => {
              handleUpdate({ safetyConfig: { ...sc, ...updates } });
            };
            const toggleCheck = (key: keyof typeof sc.checks) => {
              updateSafety({ checks: { ...sc.checks, [key]: !sc.checks[key] } });
            };
            type PiiType = 'credit_card' | 'ssn' | 'phone' | 'email' | 'address' | 'name' | 'government_id' | 'date_of_birth';
            const togglePiiType = (type: PiiType) => {
              const current = (sc.piiTypes || []) as PiiType[];
              const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
              updateSafety({ piiTypes: next });
            };
            type PolicyCat = 'harassment' | 'threats' | 'abuse' | 'fraud' | 'scams' | 'data_leakage' | 'confidential_content';
            const togglePolicyCat = (cat: PolicyCat) => {
              const current = (sc.policyCategories || []) as PolicyCat[];
              const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
              updateSafety({ policyCategories: next });
            };
            const isVoice = sc.botType === 'voice' || sc.botType === 'both';
            const suggestedThreshold = sc.botType === 'voice' ? 'Low (recommended for voice)' : sc.botType === 'chat' ? 'Medium (recommended for chat)' : 'Low for voice, Medium for chat';
            const customRuleTemplates = [
              'If user mentions refund + anger → escalate immediately',
              'If user mentions cancel account + negative sentiment → route to retention agent',
              'If user mentions competitor → route to sales agent',
              'If user asks a forbidden topic → predefined response + block',
              'If bot detects hallucination risk → fallback to safe scripted message',
            ];
            const addRuleTemplate = (rule: string) => {
              const current = sc.customRules || '';
              const newRules = current ? `${current}\n${rule}` : rule;
              updateSafety({ customRules: newRules });
            };
            return (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <Label className="text-sm font-semibold">Bot Type</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Select your bot type to get optimized safety recommendations</p>
                  <Select value={sc.botType || 'chat'} onValueChange={(v) => updateSafety({ botType: v as 'voice' | 'chat' | 'both' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">Chat Bot</SelectItem>
                      <SelectItem value="voice">Voice Bot</SelectItem>
                      <SelectItem value="both">Both (Voice + Chat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <Label className="text-sm font-semibold">Risk Checks</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Enable the safety checks this node performs on each message</p>
                  <div className="space-y-2.5">
                    {[
                      { key: 'sentimentAnalysis' as const, label: 'Sentiment Analysis', desc: isVoice ? 'Detect anger via tone + content analysis' : 'Detect anger, frustration, or negative tone' },
                      { key: 'piiDetection' as const, label: 'PII Detection', desc: 'Detect credit cards, SSN, personal data, gov IDs' },
                      { key: 'policyViolation' as const, label: 'Policy Violation', desc: 'Check for harassment, threats, fraud, abuse' },
                      { key: 'profanityFilter' as const, label: 'Profanity Filter', desc: 'Detect and handle offensive language with grace count' },
                      { key: 'topicGuardrail' as const, label: 'Topic Guardrail', desc: 'Block restricted subjects (medical, legal, etc.)' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Switch checked={sc.checks[key]} onCheckedChange={() => toggleCheck(key)} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{label}</p>
                            {key === 'topicGuardrail' && !sc.checks[key] && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Recommended</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {sc.checks.sentimentAnalysis && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sentiment Settings</Label>
                    <div className="space-y-2">
                      <Label>Anger/Frustration Threshold</Label>
                      <Select value={sc.sentimentThreshold} onValueChange={(v) => updateSafety({ sentimentThreshold: v as 'low' | 'medium' | 'high' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low — Flag mild frustration</SelectItem>
                          <SelectItem value="medium">Medium — Flag clear anger</SelectItem>
                          <SelectItem value="high">High — Only flag extreme hostility</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">Tip: {suggestedThreshold}</p>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Switch checked={sc.sentimentEscalateOnRepeated ?? false} onCheckedChange={(v) => updateSafety({ sentimentEscalateOnRepeated: v })} className="mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Escalate on Repeated Negative</p>
                        <p className="text-[11px] text-muted-foreground">Auto-escalate if negative sentiment repeats within recent messages</p>
                      </div>
                    </div>
                    {(sc.sentimentEscalateOnRepeated) && (
                      <div className="space-y-2 pl-2">
                        <Label className="text-xs">Repeat Count Before Escalation</Label>
                        <Select value={String(sc.sentimentRepeatCount || 3)} onValueChange={(v) => updateSafety({ sentimentRepeatCount: parseInt(v) })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 negative messages</SelectItem>
                            <SelectItem value="3">3 negative messages</SelectItem>
                            <SelectItem value="4">4 negative messages</SelectItem>
                            <SelectItem value="5">5 negative messages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {sc.checks.piiDetection && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">PII Detection Settings</Label>
                    <div className="space-y-2">
                      <Label>PII Types to Detect</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {([
                          { type: 'credit_card' as PiiType, label: 'Credit Card' },
                          { type: 'ssn' as PiiType, label: 'SSN' },
                          { type: 'phone' as PiiType, label: 'Phone' },
                          { type: 'email' as PiiType, label: 'Email' },
                          { type: 'address' as PiiType, label: 'Address' },
                          { type: 'name' as PiiType, label: 'Name' },
                          { type: 'government_id' as PiiType, label: 'Gov ID' },
                          { type: 'date_of_birth' as PiiType, label: 'Date of Birth' },
                        ]).map(({ type, label }) => (
                          <button
                            key={type}
                            onClick={() => togglePiiType(type)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                              ((sc.piiTypes || []) as PiiType[]).includes(type)
                                ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Select all PII types relevant to your business and compliance requirements (GDPR, HIPAA, PCI-DSS)</p>
                    </div>
                  </div>
                )}

                {sc.checks.policyViolation && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Policy Violation Categories</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {([
                        { cat: 'harassment' as PolicyCat, label: 'Harassment' },
                        { cat: 'threats' as PolicyCat, label: 'Threats' },
                        { cat: 'abuse' as PolicyCat, label: 'Abuse' },
                        { cat: 'fraud' as PolicyCat, label: 'Fraud' },
                        { cat: 'scams' as PolicyCat, label: 'Scams' },
                        { cat: 'data_leakage' as PolicyCat, label: 'Data Leakage' },
                        { cat: 'confidential_content' as PolicyCat, label: 'Confidential' },
                      ]).map(({ cat, label }) => (
                        <button
                          key={cat}
                          onClick={() => togglePolicyCat(cat)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            ((sc.policyCategories || []) as PolicyCat[]).includes(cat)
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                              : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Choose categories based on your use case: CS bots need harassment/threats/abuse, commerce bots need fraud/scams, internal bots need data leakage/confidential</p>
                  </div>
                )}

                {sc.checks.profanityFilter && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profanity Filter Settings</Label>
                    <div className="space-y-2">
                      <Label>Filter Strength</Label>
                      <Select value={sc.profanitySeverity || 'moderate'} onValueChange={(v) => updateSafety({ profanitySeverity: v as 'mild' | 'moderate' | 'strong' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild — Allow mild language, flag strong</SelectItem>
                          <SelectItem value="moderate">Moderate — Flag most offensive language</SelectItem>
                          <SelectItem value="strong">Strong — Flag all profanity strictly</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">CS bots: use Mild (don't block flow). Public bots: use Strong.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Count</Label>
                      <Select value={String(sc.profanityGraceCount ?? 1)} onValueChange={(v) => updateSafety({ profanityGraceCount: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No grace — immediate action</SelectItem>
                          <SelectItem value="1">1st occurrence: warn, 2nd: action</SelectItem>
                          <SelectItem value="2">Allow 2 warnings before action</SelectItem>
                          <SelectItem value="3">Allow 3 warnings before action</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">Set how many profanity occurrences before escalating or restricting</p>
                    </div>
                  </div>
                )}

                {sc.checks.topicGuardrail && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Guardrail Settings</Label>
                    <div className="space-y-2">
                      <Label>Blocked Topics</Label>
                      <Textarea
                        value={sc.blockedTopics}
                        onChange={(e) => updateSafety({ blockedTopics: e.target.value })}
                        placeholder="One topic per line, e.g.&#10;Medical advice&#10;Legal advice&#10;Sexual content&#10;Violence&#10;Politics"
                        rows={4}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quick-add common topics:</Label>
                      <div className="flex flex-wrap gap-1">
                        {['Medical advice', 'Legal advice', 'Sexual content', 'Violence', 'Politics', 'Competitor pricing', 'Internal policies'].map(topic => (
                          <button
                            key={topic}
                            onClick={() => {
                              const current = sc.blockedTopics || '';
                              if (!current.toLowerCase().includes(topic.toLowerCase())) {
                                updateSafety({ blockedTopics: current ? `${current}\n${topic}` : topic });
                              }
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/50 border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            + {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Topic guardrails prevent your bot from answering restricted subjects and reduce hallucinations</p>
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    <Label className="text-sm font-semibold">Risk Actions</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Define what happens when each type of risk is detected</p>

                  <div className="space-y-2">
                    <Label className="text-xs">On High Risk</Label>
                    <Select value={sc.onHighRisk} onValueChange={(v) => updateSafety({ onHighRisk: v as typeof sc.onHighRisk })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warn_then_escalate">Warn First, Then Escalate</SelectItem>
                        <SelectItem value="transfer_agent">Transfer to Live Agent</SelectItem>
                        <SelectItem value="escalate_supervisor">Escalate to Supervisor</SelectItem>
                        <SelectItem value="send_warning">Send Warning Message</SelectItem>
                        <SelectItem value="end_conversation">End Conversation</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">"Warn First, Then Escalate" asks a clarifying question on first occurrence, escalates on second</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">On Medium Risk</Label>
                    <Select value={sc.onMediumRisk} onValueChange={(v) => updateSafety({ onMediumRisk: v as typeof sc.onMediumRisk })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="continue_with_warning">Continue with Warning</SelectItem>
                        <SelectItem value="continue_with_disclaimer">Continue with Disclaimer</SelectItem>
                        <SelectItem value="transfer_agent">Transfer to Live Agent</SelectItem>
                        <SelectItem value="log_only">Log Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sc.checks.piiDetection && (
                    <div className="space-y-2">
                      <Label className="text-xs">On PII Detected</Label>
                      <Select value={sc.onPiiDetected} onValueChange={(v) => updateSafety({ onPiiDetected: v as typeof sc.onPiiDetected })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mask_and_continue">Mask Data & Continue</SelectItem>
                          <SelectItem value="mask_log_continue">Mask, Log & Continue</SelectItem>
                          <SelectItem value="block_and_warn">Block & Warn User</SelectItem>
                          <SelectItem value="transfer_agent">Transfer to Live Agent</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">"Mask, Log & Continue" masks PII and creates a compliance audit entry</p>
                    </div>
                  )}

                  {sc.checks.topicGuardrail && (
                    <div className="space-y-2">
                      <Label className="text-xs">On Sensitive Topic</Label>
                      <Select value={sc.onSensitiveTopic || 'safe_fallback'} onValueChange={(v) => updateSafety({ onSensitiveTopic: v as typeof sc.onSensitiveTopic })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safe_fallback">Safe Scripted Fallback</SelectItem>
                          <SelectItem value="block_and_redirect">Block & Redirect</SelectItem>
                          <SelectItem value="transfer_agent">Transfer to Live Agent</SelectItem>
                          <SelectItem value="log_only">Log Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <Label className="text-sm font-semibold">Custom Rules</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Business-specific safety rules in natural language. Add at least 4-5 rules for best protection.</p>
                  <Textarea
                    value={sc.customRules}
                    onChange={(e) => updateSafety({ customRules: e.target.value })}
                    placeholder="Write custom safety rules, e.g.&#10;If user mentions refund + anger → escalate immediately&#10;If user mentions cancel account → route to retention agent"
                    rows={4}
                    className="text-xs"
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Quick-add rule templates:</Label>
                    <div className="space-y-1">
                      {customRuleTemplates.map((rule, i) => (
                        <button
                          key={i}
                          onClick={() => addRuleTemplate(rule)}
                          className="w-full text-left px-2.5 py-1.5 rounded text-[11px] bg-muted/30 border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          + {rule}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Audit Logging</p>
                    <p className="text-[11px] text-muted-foreground">Log all safety events for compliance review</p>
                  </div>
                  <Switch checked={sc.enableLogging} onCheckedChange={(v) => updateSafety({ enableLogging: v })} />
                </div>
              </>
            );
          })()}

          {node.type !== 'start' && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setDeleteModalOpen(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Node
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <DeleteNodeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        nodeName={node.data.label}
      />
    </>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Trash2, Save, Check, Plus, Minus } from 'lucide-react';
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
}

export function NodePropertiesPanel({
  node,
  onUpdate,
  onDelete,
  onClose,
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

          {node.type === 'message' && (
            <div className="space-y-2">
              <Label>Message Content</Label>
              <Textarea
                value={node.data.content || ''}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                placeholder="Enter message..."
                rows={4}
              />
            </div>
          )}

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

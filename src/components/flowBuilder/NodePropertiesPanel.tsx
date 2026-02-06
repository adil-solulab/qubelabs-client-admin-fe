import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Trash2, Save, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  
  // Debounced update with save indicator
  const handleUpdate = useCallback((updates: Partial<NodeData>) => {
    onUpdate(updates);
    
    // Show saved indicator with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setShowSaved(true);
    saveTimeoutRef.current = setTimeout(() => {
      setShowSaved(false);
    }, 1500);
  }, [onUpdate]);
  
  // Cleanup timeout
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
          {/* Label */}
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={node.data.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
              placeholder="Node label..."
            />
          </div>

          {/* Message Content */}
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

          {/* Condition Settings */}
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

          {/* API Call Settings */}
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

          {/* Transfer Settings */}
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

          {/* DTMF Settings */}
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

          {/* Assistant Settings */}
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

          {/* Delete Button */}
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

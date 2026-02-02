import { X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FlowNode, NodeData } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';

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
  const config = NODE_TYPE_CONFIG[node.type];

  return (
    <Card className="w-80 gradient-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            {config.label} Properties
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Label */}
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Node label..."
          />
        </div>

        {/* Message Content */}
        {node.type === 'message' && (
          <div className="space-y-2">
            <Label>Message Content</Label>
            <Textarea
              value={node.data.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
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
                onChange={(e) => onUpdate({
                  condition: { ...node.data.condition!, variable: e.target.value }
                })}
                placeholder="e.g., intent, sentiment"
              />
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={node.data.condition?.operator || 'equals'}
                onValueChange={(value) => onUpdate({
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
                onChange={(e) => onUpdate({
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
                onValueChange={(value) => onUpdate({
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
                onChange={(e) => onUpdate({
                  apiConfig: { ...node.data.apiConfig!, url: e.target.value }
                })}
                placeholder="/api/endpoint"
              />
            </div>
            <div className="space-y-2">
              <Label>Request Body (JSON)</Label>
              <Textarea
                value={node.data.apiConfig?.body || ''}
                onChange={(e) => onUpdate({
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
              onValueChange={(value) => onUpdate({ transferTo: value })}
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

        {/* Delete Button */}
        {node.type !== 'start' && (
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              onClick={onDelete}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

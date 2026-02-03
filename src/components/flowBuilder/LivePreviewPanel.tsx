import { useState, useEffect } from 'react';
import { Play, RotateCcw, MessageSquare, Bot, User, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FlowNode, Flow } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface LivePreviewPanelProps {
  flow: Flow;
}

interface PreviewMessage {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  nodeId?: string;
}

export function LivePreviewPanel({ flow }: LivePreviewPanelProps) {
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  const resetPreview = () => {
    setMessages([]);
    setCurrentNodeId(null);
    setUserInput('');
    setIsRunning(false);
    setWaitingForInput(false);
  };

  const startPreview = () => {
    resetPreview();
    setIsRunning(true);
    
    // Find start node
    const startNode = flow.nodes.find(n => n.type === 'start');
    if (startNode) {
      setCurrentNodeId(startNode.id);
      processNode(startNode);
    }
  };

  const processNode = async (node: FlowNode) => {
    const config = NODE_TYPE_CONFIG[node.type];
    
    // Add system message for node transition
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      type: 'system',
      content: `→ ${config.label}: ${node.data.label}`,
      nodeId: node.id,
    }]);

    await new Promise(resolve => setTimeout(resolve, 500));

    switch (node.type) {
      case 'start':
        // Move to next node
        moveToNextNode(node);
        break;

      case 'message':
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: node.data.content || 'No message configured',
          nodeId: node.id,
        }]);
        await new Promise(resolve => setTimeout(resolve, 800));
        moveToNextNode(node);
        break;

      case 'condition':
        // Wait for user input to evaluate condition
        setWaitingForInput(true);
        break;

      case 'api_call':
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}`,
          type: 'system',
          content: `📡 Calling ${node.data.apiConfig?.method} ${node.data.apiConfig?.url}...`,
          nodeId: node.id,
        }]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}`,
          type: 'system',
          content: '✓ API call successful',
          nodeId: node.id,
        }]);
        moveToNextNode(node);
        break;

      case 'transfer':
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: `Transferring you to ${node.data.transferTo}...`,
          nodeId: node.id,
        }]);
        await new Promise(resolve => setTimeout(resolve, 500));
        moveToNextNode(node);
        break;

      case 'end':
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}`,
          type: 'system',
          content: '🏁 Flow completed',
          nodeId: node.id,
        }]);
        setIsRunning(false);
        break;
    }
  };

  const moveToNextNode = (currentNode: FlowNode) => {
    // Find next node via edges, not connections array
    const outgoingEdge = flow.edges.find(e => e.source === currentNode.id && !e.label);
    if (outgoingEdge) {
      const nextNode = flow.nodes.find(n => n.id === outgoingEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        processNode(nextNode);
        return;
      }
    }
    
    // Fallback: check connections array
    if (currentNode.connections.length > 0) {
      const nextNodeId = currentNode.connections[0];
      const nextNode = flow.nodes.find(n => n.id === nextNodeId);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        processNode(nextNode);
        return;
      }
    }
    
    setIsRunning(false);
  };

  const handleUserInput = async () => {
    if (!userInput.trim() || !waitingForInput) return;

    const currentNode = flow.nodes.find(n => n.id === currentNodeId);
    if (!currentNode || currentNode.type !== 'condition') return;

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInput,
    }]);

    setWaitingForInput(false);

    // Evaluate condition
    const condition = currentNode.data.condition;
    let result = false;

    if (condition) {
      const inputLower = userInput.toLowerCase();
      const valueLower = condition.value.toLowerCase();

      switch (condition.operator) {
        case 'equals':
          result = inputLower === valueLower;
          break;
        case 'contains':
          result = inputLower.includes(valueLower);
          break;
        default:
          result = false;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      type: 'system',
      content: `Condition evaluated: ${result ? 'Yes' : 'No'}`,
    }]);

    // Move to yes or no branch via edges
    const yesEdge = flow.edges.find(e => e.source === currentNodeId && e.label === 'Yes');
    const noEdge = flow.edges.find(e => e.source === currentNodeId && e.label === 'No');
    const targetEdge = result ? yesEdge : noEdge;
    
    if (targetEdge) {
      const nextNode = flow.nodes.find(n => n.id === targetEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        processNode(nextNode);
      }
    } else {
      // Fallback to old method
      const nextNodeId = result ? currentNode.data.yesConnection : currentNode.data.noConnection;
      if (nextNodeId) {
        const nextNode = flow.nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          setCurrentNodeId(nextNode.id);
          processNode(nextNode);
        }
      }
    }

    setUserInput('');
  };

  return (
    <Card className="w-80 gradient-card flex flex-col h-full">
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Live Preview
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetPreview}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click "Start Preview" to test your flow
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.type === 'user' && 'justify-end'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2',
                      msg.type === 'bot' && 'bg-muted',
                      msg.type === 'user' && 'bg-primary text-primary-foreground',
                      msg.type === 'system' && 'bg-transparent text-xs text-muted-foreground italic'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input / Controls */}
        <div className="p-4 border-t flex-shrink-0">
          {!isRunning ? (
            <Button onClick={startPreview} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Preview
            </Button>
          ) : waitingForInput ? (
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                onKeyDown={(e) => e.key === 'Enter' && handleUserInput()}
              />
              <Button onClick={handleUserInput}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Badge variant="secondary" className="animate-pulse">
                Processing...
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

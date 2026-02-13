import { useState, useRef, useEffect } from 'react';
import { 
  Play, RotateCcw, MessageSquare, Bot, User, ChevronRight, 
  Phone, PhoneOff, Mic, MicOff, Volume2, Hash, 
  CheckCircle2, XCircle, Clock, Loader2, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FlowNode, Flow } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface TestPanelProps {
  flow: Flow;
}

type TestMode = 'chat' | 'voice';

interface TestMessage {
  id: string;
  type: 'bot' | 'user' | 'system' | 'voice' | 'dtmf' | 'error';
  content: string;
  nodeId?: string;
  timestamp: Date;
  duration?: number;
  status?: 'success' | 'error' | 'pending' | 'processing';
}

interface TestStats {
  nodesVisited: number;
  totalNodes: number;
  startTime: Date | null;
  endTime: Date | null;
  errors: number;
  apiCalls: number;
}

export function TestPanel({ flow }: TestPanelProps) {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [waitingForDTMF, setWaitingForDTMF] = useState(false);
  const [testMode, setTestMode] = useState<TestMode>(flow.channel === 'voice' ? 'voice' : 'chat');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [testLanguage, setTestLanguage] = useState('en');
  const [stats, setStats] = useState<TestStats>({
    nodesVisited: 0,
    totalNodes: flow.nodes.length,
    startTime: null,
    endTime: null,
    errors: 0,
    apiCalls: 0,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addMessage = (msg: Omit<TestMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
    }]);
  };

  const resetTest = () => {
    setMessages([]);
    setCurrentNodeId(null);
    setUserInput('');
    setIsRunning(false);
    setWaitingForInput(false);
    setWaitingForDTMF(false);
    setIsCallActive(false);
    setIsMuted(false);
    setCallDuration(0);
    setStats({
      nodesVisited: 0,
      totalNodes: flow.nodes.length,
      startTime: null,
      endTime: null,
      errors: 0,
      apiCalls: 0,
    });
  };

  const startTest = () => {
    resetTest();
    setIsRunning(true);
    const now = new Date();
    setStats(prev => ({ ...prev, startTime: now }));
    
    if (testMode === 'voice') {
      setIsCallActive(true);
      addMessage({
        type: 'voice',
        content: 'Initiating voice call...',
        status: 'processing',
      });
      setTimeout(() => {
        addMessage({
          type: 'voice',
          content: 'Call connected',
          status: 'success',
        });
        const startNode = flow.nodes.find(n => n.type === 'start');
        if (startNode) {
          setCurrentNodeId(startNode.id);
          processNode(startNode);
        }
      }, 1500);
    } else {
      addMessage({
        type: 'system',
        content: 'Test session started',
        status: 'success',
      });
      const startNode = flow.nodes.find(n => n.type === 'start');
      if (startNode) {
        setCurrentNodeId(startNode.id);
        processNode(startNode);
      }
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    addMessage({
      type: 'voice',
      content: `Call ended (${formatDuration(callDuration)})`,
      status: 'success',
    });
    setIsRunning(false);
    setStats(prev => ({ ...prev, endTime: new Date() }));
  };

  const processNode = async (node: FlowNode) => {
    const config = NODE_TYPE_CONFIG[node.type];
    
    setStats(prev => ({ ...prev, nodesVisited: prev.nodesVisited + 1 }));

    addMessage({
      type: 'system',
      content: `${config.icon} ${config.label}: ${node.data.label}`,
      nodeId: node.id,
      status: 'processing',
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    switch (node.type) {
      case 'start':
        moveToNextNode(node);
        break;

      case 'message':
        if (testMode === 'voice') {
          addMessage({
            type: 'voice',
            content: `Speaking: "${node.data.content || 'No message configured'}"`,
            nodeId: node.id,
            status: 'success',
          });
        } else {
          addMessage({
            type: 'bot',
            content: node.data.content || 'No message configured',
            nodeId: node.id,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        moveToNextNode(node);
        break;

      case 'condition':
        addMessage({
          type: 'system',
          content: `Waiting for input to evaluate: "${node.data.condition?.variable || 'user_input'}" ${node.data.condition?.operator || 'equals'} "${node.data.condition?.value || ''}"`,
          nodeId: node.id,
          status: 'pending',
        });
        setWaitingForInput(true);
        break;

      case 'api_call': {
        setStats(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
        const method = node.data.apiConfig?.method || 'GET';
        const url = node.data.apiConfig?.url || 'https://api.example.com';
        addMessage({
          type: 'system',
          content: `API ${method} ${url}`,
          nodeId: node.id,
          status: 'processing',
        });
        await new Promise(resolve => setTimeout(resolve, 1200));
        const success = Math.random() > 0.1;
        if (success) {
          addMessage({
            type: 'system',
            content: `API Response: 200 OK (${Math.floor(Math.random() * 300 + 50)}ms)\nResponse: { "status": "success", "data": { ... } }`,
            nodeId: node.id,
            status: 'success',
          });
        } else {
          setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
          addMessage({
            type: 'error',
            content: `API Response: 500 Internal Server Error (${Math.floor(Math.random() * 1000 + 500)}ms)`,
            nodeId: node.id,
            status: 'error',
          });
        }
        moveToNextNode(node);
        break;
      }

      case 'dtmf': {
        const prompt = node.data.dtmfConfig?.prompt || 'Please enter your selection';
        const maxDigits = node.data.dtmfConfig?.maxDigits || 1;
        const timeout = node.data.dtmfConfig?.timeout || 5;
        if (testMode === 'voice') {
          addMessage({
            type: 'voice',
            content: `Speaking: "${prompt}"`,
            nodeId: node.id,
            status: 'success',
          });
        } else {
          addMessage({
            type: 'bot',
            content: prompt,
            nodeId: node.id,
          });
        }
        addMessage({
          type: 'system',
          content: `Waiting for DTMF input (max ${maxDigits} digits, ${timeout}s timeout)...`,
          nodeId: node.id,
          status: 'pending',
        });
        setWaitingForDTMF(true);
        break;
      }

      case 'assistant': {
        addMessage({
          type: 'system',
          content: 'AI Assistant processing...',
          nodeId: node.id,
          status: 'processing',
        });
        await new Promise(resolve => setTimeout(resolve, 1800));
        const responses = [
          "I understand your concern. Let me help you with that right away.",
          "Based on your account information, I can see the details you need.",
          "I've reviewed your request and here's what I found.",
          "Thank you for your patience. I have the information ready for you.",
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        if (testMode === 'voice') {
          addMessage({
            type: 'voice',
            content: `AI Speaking: "${response}"`,
            nodeId: node.id,
            status: 'success',
          });
        } else {
          addMessage({
            type: 'bot',
            content: response,
            nodeId: node.id,
          });
        }
        moveToNextNode(node);
        break;
      }

      case 'transfer': {
        const target = node.data.transferTo || 'Agent';
        if (testMode === 'voice') {
          addMessage({
            type: 'voice',
            content: `Transferring call to ${target}...`,
            nodeId: node.id,
            status: 'processing',
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
          addMessage({
            type: 'voice',
            content: `Call transferred to ${target}`,
            nodeId: node.id,
            status: 'success',
          });
        } else {
          addMessage({
            type: 'bot',
            content: `Transferring you to ${target}...`,
            nodeId: node.id,
          });
          await new Promise(resolve => setTimeout(resolve, 800));
          addMessage({
            type: 'system',
            content: `Transferred to ${target}`,
            nodeId: node.id,
            status: 'success',
          });
        }
        moveToNextNode(node);
        break;
      }

      case 'whatsapp':
      case 'slack':
      case 'telegram':
      case 'teams':
        addMessage({
          type: 'system',
          content: `Sending via ${config.label}: "${node.data.channelConfig?.messageTemplate || 'Message template'}"`,
          nodeId: node.id,
          status: 'processing',
        });
        await new Promise(resolve => setTimeout(resolve, 800));
        addMessage({
          type: 'system',
          content: `${config.label} message delivered`,
          nodeId: node.id,
          status: 'success',
        });
        moveToNextNode(node);
        break;

      case 'zendesk':
      case 'freshdesk':
        addMessage({
          type: 'system',
          content: `${config.label}: ${node.data.ticketConfig?.action || 'create'} ticket "${node.data.ticketConfig?.subject || 'New Ticket'}" (Priority: ${node.data.ticketConfig?.priority || 'medium'})`,
          nodeId: node.id,
          status: 'processing',
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        addMessage({
          type: 'system',
          content: `Ticket #${Math.floor(Math.random() * 90000 + 10000)} created successfully`,
          nodeId: node.id,
          status: 'success',
        });
        moveToNextNode(node);
        break;

      case 'zoho_crm':
      case 'salesforce':
      case 'hubspot':
        addMessage({
          type: 'system',
          content: `${config.label}: ${node.data.crmConfig?.action || 'create_contact'} → ${node.data.crmConfig?.objectType || 'contact'}`,
          nodeId: node.id,
          status: 'processing',
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        addMessage({
          type: 'system',
          content: `CRM record updated (ID: ${Math.random().toString(36).slice(2, 10).toUpperCase()})`,
          nodeId: node.id,
          status: 'success',
        });
        moveToNextNode(node);
        break;

      case 'end':
        if (testMode === 'voice' && isCallActive) {
          addMessage({
            type: 'voice',
            content: 'Call ending...',
            nodeId: node.id,
            status: 'processing',
          });
          await new Promise(resolve => setTimeout(resolve, 500));
          endCall();
        } else {
          addMessage({
            type: 'system',
            content: 'Test completed',
            nodeId: node.id,
            status: 'success',
          });
          setIsRunning(false);
          setStats(prev => ({ ...prev, endTime: new Date() }));
        }
        break;
    }
  };

  const moveToNextNode = (currentNode: FlowNode) => {
    const outgoingEdge = flow.edges.find(e => e.source === currentNode.id && !e.label);
    if (outgoingEdge) {
      const nextNode = flow.nodes.find(n => n.id === outgoingEdge.target);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        processNode(nextNode);
        return;
      }
    }
    
    if (currentNode.connections.length > 0) {
      const nextNodeId = currentNode.connections[0];
      const nextNode = flow.nodes.find(n => n.id === nextNodeId);
      if (nextNode) {
        setCurrentNodeId(nextNode.id);
        processNode(nextNode);
        return;
      }
    }
    
    if (testMode === 'voice' && isCallActive) {
      endCall();
    } else {
      setIsRunning(false);
      setStats(prev => ({ ...prev, endTime: new Date() }));
    }
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    if (waitingForDTMF) {
      handleDTMFInput(userInput.trim());
      return;
    }

    if (!waitingForInput) return;

    const currentNode = flow.nodes.find(n => n.id === currentNodeId);
    if (!currentNode || currentNode.type !== 'condition') return;

    addMessage({
      type: 'user',
      content: userInput,
    });

    setWaitingForInput(false);

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

    addMessage({
      type: 'system',
      content: `Condition: ${result ? 'Yes (matched)' : 'No (not matched)'}`,
      status: result ? 'success' : 'error',
    });

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

  const handleDTMFInput = async (digits: string) => {
    addMessage({
      type: 'dtmf',
      content: `DTMF: ${digits}`,
    });

    setWaitingForDTMF(false);

    const currentNode = flow.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    await new Promise(resolve => setTimeout(resolve, 300));

    addMessage({
      type: 'system',
      content: `DTMF received: "${digits}" → Processing...`,
      status: 'success',
    });

    moveToNextNode(currentNode);
    setUserInput('');
  };

  const handleDTMFKeypad = (digit: string) => {
    if (!waitingForDTMF) return;
    handleDTMFInput(digit);
  };

  const getElapsedTime = () => {
    if (!stats.startTime) return '0s';
    const end = stats.endTime || new Date();
    const seconds = Math.floor((end.getTime() - stats.startTime.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const dtmfKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  return (
    <Card className="w-[340px] gradient-card flex flex-col h-full">
      <CardHeader className="pb-2 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Test
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetTest}>
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Tabs value={testMode} onValueChange={(v) => { setTestMode(v as TestMode); resetTest(); }} className="w-full">
            <TabsList className="w-full h-8">
              <TabsTrigger value="chat" className="flex-1 text-xs gap-1 h-7">
                <MessageSquare className="w-3 h-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex-1 text-xs gap-1 h-7">
                <Phone className="w-3 h-3" />
                Voice
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Select value={testLanguage} onValueChange={setTestLanguage}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="en-gb">English (UK)</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isCallActive && (
          <div className="flex items-center justify-between mt-2 px-2 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">Call Active</span>
            </div>
            <span className="text-xs font-mono text-green-600">{formatDuration(callDuration)}</span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-3 h-3 text-red-500" /> : <Mic className="w-3 h-3 text-green-600" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={endCall}
              >
                <PhoneOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2.5" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click "Start Test" to run your flow
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {testMode === 'voice' ? 'Simulates a voice call through your flow' : 'Simulates a chat conversation through your flow'}
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2',
                    msg.type === 'user' && 'justify-end',
                    msg.type === 'dtmf' && 'justify-end'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  {msg.type === 'voice' && (
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {msg.status === 'processing' ? (
                        <Loader2 className="w-3 h-3 text-green-600 animate-spin" />
                      ) : (
                        <Volume2 className="w-3 h-3 text-green-600" />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-1.5',
                      msg.type === 'bot' && 'bg-muted',
                      msg.type === 'user' && 'bg-primary text-primary-foreground',
                      msg.type === 'dtmf' && 'bg-amber-500/10 border border-amber-500/20',
                      msg.type === 'voice' && 'bg-green-500/5 border border-green-500/10',
                      msg.type === 'error' && 'bg-red-500/5 border border-red-500/10',
                      msg.type === 'system' && 'bg-transparent'
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      {msg.status === 'success' && msg.type === 'system' && (
                        <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      {msg.status === 'error' && (
                        <XCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      {msg.status === 'pending' && (
                        <Clock className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      {msg.status === 'processing' && msg.type === 'system' && (
                        <Loader2 className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                      )}
                      {msg.type === 'dtmf' && (
                        <Hash className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      {msg.type === 'error' && (
                        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={cn(
                        'text-xs whitespace-pre-wrap',
                        msg.type === 'system' && 'text-muted-foreground',
                        msg.type === 'error' && 'text-red-600',
                        msg.type === 'dtmf' && 'text-amber-600 font-mono font-medium',
                        msg.type === 'voice' && 'text-green-700'
                      )}>{msg.content}</p>
                    </div>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {isRunning && stats.nodesVisited > 0 && (
          <div className="px-3 py-2 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{stats.nodesVisited}/{stats.totalNodes} nodes</span>
              <span>{stats.apiCalls} API calls</span>
              <span>{getElapsedTime()}</span>
              {stats.errors > 0 && <span className="text-red-500">{stats.errors} errors</span>}
            </div>
          </div>
        )}

        {waitingForDTMF && testMode === 'voice' && (
          <div className="px-3 py-2 border-t">
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
              {dtmfKeys.map(key => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm font-mono font-bold hover:bg-primary/10"
                  onClick={() => handleDTMFKeypad(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t flex-shrink-0">
          {!isRunning ? (
            <Button onClick={startTest} className="w-full">
              {testMode === 'voice' ? (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Start Voice Test
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Test
                </>
              )}
            </Button>
          ) : (waitingForInput || (waitingForDTMF && testMode === 'chat')) ? (
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={waitingForDTMF ? "Enter digits..." : "Type your response..."}
                onKeyDown={(e) => e.key === 'Enter' && handleUserInput()}
                className="text-sm"
              />
              <Button onClick={handleUserInput} size="icon" className="flex-shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Badge variant="secondary" className="animate-pulse gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing...
              </Badge>
            </div>
          )}
        </div>

        {!isRunning && stats.endTime && (
          <div className="px-3 pb-3 border-t pt-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Nodes visited</span>
                <span className="font-medium">{stats.nodesVisited}/{stats.totalNodes}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>API calls</span>
                <span className="font-medium">{stats.apiCalls}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Duration</span>
                <span className="font-medium">{getElapsedTime()}</span>
              </div>
              {stats.errors > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Errors</span>
                  <span className="font-medium">{stats.errors}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Result</span>
                <Badge variant={stats.errors > 0 ? 'destructive' : 'default'} className={cn('text-xs', stats.errors === 0 && 'bg-green-500')}>
                  {stats.errors > 0 ? 'Completed with errors' : 'Passed'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, XCircle, AlertTriangle, Info, Send, Bot } from 'lucide-react';
import { showToast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 500 },
  { name: 'Thu', value: 280 },
  { name: 'Fri', value: 590 },
  { name: 'Sat', value: 320 },
  { name: 'Sun', value: 450 },
];

const tableData = [
  { id: 1, name: 'John Doe', status: 'Active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', status: 'Pending', role: 'User' },
  { id: 3, name: 'Bob Johnson', status: 'Inactive', role: 'Viewer' },
];

export function ComponentPreviewPanel() {
  const triggerToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const toasts = {
      success: () => showToast.success({ title: 'Success!', description: 'This is a success toast preview', showProgress: true }),
      error: () => showToast.error({ title: 'Error!', description: 'This is an error toast preview', showProgress: true }),
      warning: () => showToast.warning({ title: 'Warning!', description: 'This is a warning toast preview', showProgress: true }),
      info: () => showToast.info({ title: 'Info', description: 'This is an info toast preview', showProgress: true }),
    };
    toasts[type]();
  };

  return (
    <div className="space-y-6">
      {/* Buttons Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Buttons</h4>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      {/* Cards Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Cards</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sample Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
              <Progress value={65} className="mt-3 h-2" />
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Gradient Card
                <Badge>New</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <span className="text-sm">Toggle option</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Tables</h4>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'Active' ? 'default' : row.status === 'Pending' ? 'secondary' : 'outline'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Charts Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Charts</h4>
        <Card className="p-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--popover-foreground))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Toasters Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Toasters</h4>
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerToast('success')}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-success" />
              Success Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerToast('error')}
              className="gap-2"
            >
              <XCircle className="w-4 h-4 text-destructive" />
              Error Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerToast('warning')}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-warning" />
              Warning Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => triggerToast('info')}
              className="gap-2"
            >
              <Info className="w-4 h-4 text-primary" />
              Info Toast
            </Button>
          </div>
        </Card>
      </div>

      {/* Chat Widget Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Chat Widget</h4>
        <Card className="p-4 max-w-sm">
          <div className="space-y-4">
            {/* Chat Header */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI Assistant</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Online
                </p>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">Hello! How can I help you today?</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">I need help with my account settings.</p>
                </div>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 text-sm rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showToast.info({ title: 'Preview Only', description: 'This is a visual preview of the chat widget styling.' });
                  }
                }}
              />
              <Button 
                size="icon" 
                className="rounded-full"
                onClick={() => showToast.info({ title: 'Preview Only', description: 'This is a visual preview of the chat widget styling.' })}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

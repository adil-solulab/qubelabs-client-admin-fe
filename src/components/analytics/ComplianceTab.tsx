import { Shield, AlertTriangle, FileWarning, Gauge } from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ComplianceAnalytics } from '@/types/analytics';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

const severityColors: Record<string, string> = {
  high: 'text-destructive border-destructive',
  medium: 'text-warning border-warning',
  low: 'text-success border-success',
};

const statusColors: Record<string, string> = {
  open: 'bg-destructive text-destructive-foreground',
  reviewing: 'bg-warning text-warning-foreground',
  resolved: 'bg-success text-success-foreground',
};

interface ComplianceTabProps {
  complianceAnalytics: ComplianceAnalytics;
}

export function ComplianceTab({ complianceAnalytics }: ComplianceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Shield className="w-5 h-5 text-success" />
            <p className="text-2xl font-bold mt-2">{complianceAnalytics.complianceRate}%</p>
            <p className="text-xs text-muted-foreground">Compliance Rate</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <p className="text-2xl font-bold mt-2">{complianceAnalytics.flaggedInteractions}</p>
            <p className="text-xs text-muted-foreground">Flagged Interactions</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <FileWarning className="w-5 h-5 text-destructive" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                complianceAnalytics.violationsTrend < 0 ? 'text-success' : 'text-destructive'
              )}>
                {complianceAnalytics.violationsTrend}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{complianceAnalytics.policyViolations}</p>
            <p className="text-xs text-muted-foreground">Policy Violations</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Gauge className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                complianceAnalytics.riskScoreTrend < 0 ? 'text-success' : 'text-destructive'
              )}>
                {complianceAnalytics.riskScoreTrend}
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{complianceAnalytics.avgRiskScore}</p>
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={complianceAnalytics.riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="level"
                  >
                    {complianceAnalytics.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Flagged vs Resolved Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={complianceAnalytics.flaggedOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} dot={false} name="Flagged" />
                <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Violation Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceAnalytics.violationCategories.map(cat => (
                <TableRow key={cat.category}>
                  <TableCell className="font-medium">{cat.category}</TableCell>
                  <TableCell className="text-right">{cat.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', severityColors[cat.severity])}>
                      {cat.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceAnalytics.recentViolations.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.type}</TableCell>
                  <TableCell>{v.agent}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize', severityColors[v.severity])}>
                      {v.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{v.timestamp}</TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', statusColors[v.status])}>
                      {v.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

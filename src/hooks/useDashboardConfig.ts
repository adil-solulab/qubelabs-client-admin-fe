import { useState, useCallback } from 'react';

export type AnalyticsWidgetId =
  | 'conversation-volume'
  | 'sentiment-trends'
  | 'channel-utilization'
  | 'csat-trend'
  | 'nps-breakdown'
  | 'agent-performance'
  | 'total-conversations'
  | 'resolution-rate'
  | 'avg-duration'
  | 'csat-score'
  | 'nps-score'
  | 'handoff-rate'
  | 'time-saved'
  | 'effort-saved'
  | 'conversion-rate'
  | 'engagement-rate';

export interface AnalyticsWidgetConfig {
  id: AnalyticsWidgetId;
  label: string;
  description: string;
  category: 'kpi' | 'chart';
  defaultEnabled: boolean;
}

export const ANALYTICS_WIDGET_REGISTRY: AnalyticsWidgetConfig[] = [
  { id: 'total-conversations', label: 'Total Conversations', description: 'Total conversation count with trend', category: 'kpi', defaultEnabled: true },
  { id: 'resolution-rate', label: 'Resolution Rate', description: 'Percentage of resolved conversations', category: 'kpi', defaultEnabled: true },
  { id: 'avg-duration', label: 'Avg Duration', description: 'Average conversation duration', category: 'kpi', defaultEnabled: true },
  { id: 'csat-score', label: 'CSAT Score', description: 'Customer satisfaction score with trend', category: 'kpi', defaultEnabled: true },
  { id: 'nps-score', label: 'NPS Score', description: 'Net promoter score with trend', category: 'kpi', defaultEnabled: false },
  { id: 'handoff-rate', label: 'Handoff Rate', description: 'Human handoff percentage', category: 'kpi', defaultEnabled: false },
  { id: 'time-saved', label: 'Time Saved', description: 'Total hours saved by AI automation', category: 'kpi', defaultEnabled: false },
  { id: 'effort-saved', label: 'Effort Saved', description: 'Percentage of effort automated', category: 'kpi', defaultEnabled: false },
  { id: 'conversion-rate', label: 'Conversion Rate', description: 'Lead-to-customer conversion percentage', category: 'kpi', defaultEnabled: false },
  { id: 'engagement-rate', label: 'Engagement Rate', description: 'User engagement percentage', category: 'kpi', defaultEnabled: false },
  { id: 'conversation-volume', label: 'Conversation Volume', description: 'Area chart showing voice, chat, and email trends', category: 'chart', defaultEnabled: true },
  { id: 'sentiment-trends', label: 'Sentiment Trends', description: 'Line chart tracking positive, neutral, negative sentiment', category: 'chart', defaultEnabled: true },
  { id: 'channel-utilization', label: 'Channel Utilization', description: 'Pie chart of channel distribution', category: 'chart', defaultEnabled: false },
  { id: 'csat-trend', label: 'CSAT Trend', description: 'Bar chart showing CSAT score over time', category: 'chart', defaultEnabled: false },
  { id: 'nps-breakdown', label: 'NPS Breakdown', description: 'Pie chart of promoters, passives, detractors', category: 'chart', defaultEnabled: false },
  { id: 'agent-performance', label: 'Agent Performance', description: 'Table of agent metrics and rankings', category: 'chart', defaultEnabled: false },
];

const DEFAULT_ENABLED = ANALYTICS_WIDGET_REGISTRY
  .filter((w) => w.defaultEnabled)
  .map((w) => w.id);

export function useDashboardConfig() {
  const [enabledWidgets, setEnabledWidgets] = useState<AnalyticsWidgetId[]>(DEFAULT_ENABLED);

  const toggleWidget = useCallback((widgetId: AnalyticsWidgetId) => {
    setEnabledWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  }, []);

  const isWidgetEnabled = useCallback(
    (widgetId: AnalyticsWidgetId) => enabledWidgets.includes(widgetId),
    [enabledWidgets]
  );

  const setWidgets = useCallback((widgets: AnalyticsWidgetId[]) => {
    setEnabledWidgets(widgets);
  }, []);

  const resetToDefaults = useCallback(() => {
    setEnabledWidgets(DEFAULT_ENABLED);
  }, []);

  return {
    enabledWidgets,
    toggleWidget,
    isWidgetEnabled,
    setWidgets,
    resetToDefaults,
    registry: ANALYTICS_WIDGET_REGISTRY,
  };
}

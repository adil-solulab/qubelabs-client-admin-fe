import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, TrendingUp, TrendingDown, Minus, Info, ArrowRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SentimentData } from '@/types/dashboard';

interface SentimentWidgetProps {
  sentiment: SentimentData;
  isLoading?: boolean;
}

export function SentimentWidget({ sentiment, isLoading }: SentimentWidgetProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getTrendIcon = () => {
    switch (sentiment.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (sentiment.trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <>
      <DashboardWidget
        title="Sentiment Summary"
        icon={Smile}
        iconColor="text-success"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
        definition="AI-powered analysis of customer mood based on voice tone, word choice, and conversation context"
        action={
          <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">{sentiment.change}%</span>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Positive */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Positive</span>
              <span className="font-medium text-sentiment-positive">{sentiment.positive}%</span>
            </div>
            <Progress 
              value={sentiment.positive} 
              className="h-2 bg-muted"
              indicatorClassName="bg-sentiment-positive"
            />
          </div>
          
          {/* Neutral */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Neutral</span>
              <span className="font-medium text-sentiment-neutral">{sentiment.neutral}%</span>
            </div>
            <Progress 
              value={sentiment.neutral} 
              className="h-2 bg-muted"
              indicatorClassName="bg-sentiment-neutral"
            />
          </div>
          
          {/* Negative */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Negative</span>
              <span className="font-medium text-sentiment-negative">{sentiment.negative}%</span>
            </div>
            <Progress 
              value={sentiment.negative} 
              className="h-2 bg-muted"
              indicatorClassName="bg-sentiment-negative"
            />
          </div>
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-success" />
              Sentiment Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of customer sentiment across all channels.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
              <div className="text-5xl font-bold text-success mb-2">
                {sentiment.positive}%
              </div>
              <p className="text-sm text-muted-foreground">
                Overall Positive Sentiment Score
              </p>
              <div className={cn('flex items-center justify-center gap-1 mt-2', getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {sentiment.trend === 'up' ? '+' : sentiment.trend === 'down' ? '-' : ''}{sentiment.change}% from last period
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Sentiment Breakdown</h4>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-lg">😊</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Positive</span>
                    <span className="font-bold text-success">{sentiment.positive}%</span>
                  </div>
                  <Progress value={sentiment.positive} className="h-2" indicatorClassName="bg-success" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg">😐</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Neutral</span>
                    <span className="font-bold text-muted-foreground">{sentiment.neutral}%</span>
                  </div>
                  <Progress value={sentiment.neutral} className="h-2" />
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-lg">😟</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Negative</span>
                    <span className="font-bold text-destructive">{sentiment.negative}%</span>
                  </div>
                  <Progress value={sentiment.negative} className="h-2" indicatorClassName="bg-destructive" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Sentiment is calculated using AI analysis of voice tone, chat messages, and email content across all channels.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { navigate('/analytics'); setIsOpen(false); }}>
              View Detailed Analytics
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

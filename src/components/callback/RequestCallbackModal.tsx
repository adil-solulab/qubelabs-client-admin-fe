import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Phone, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { notify } from '@/hooks/useNotification';
import { CallbackPriority } from '@/types/callback';
import { cn } from '@/lib/utils';

interface RequestCallbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    reason: string;
    priority?: CallbackPriority;
    scheduledTime?: Date;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function RequestCallbackModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: RequestCallbackModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<CallbackPriority>('normal');
  const [scheduleCallback, setScheduleCallback] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('10:00');

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setReason('');
    setPriority('normal');
    setScheduleCallback(false);
    setScheduledDate(undefined);
    setScheduledTime('10:00');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !reason.trim()) {
      notify.error('Missing information', 'Please fill in all required fields.');
      return;
    }

    let finalScheduledTime: Date | undefined;
    if (scheduleCallback && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      finalScheduledTime = new Date(scheduledDate);
      finalScheduledTime.setHours(hours, minutes, 0, 0);

      if (finalScheduledTime <= new Date()) {
        notify.error('Invalid time', 'Scheduled time must be in the future.');
        return;
      }
    }

    await onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      reason: reason.trim(),
      priority,
      scheduledTime: finalScheduledTime,
    });

    resetForm();
    onOpenChange(false);
    notify.success(
      scheduleCallback ? 'Callback scheduled' : 'Callback requested',
      scheduleCallback
        ? `Your callback is scheduled for ${format(finalScheduledTime!, 'PPp')}`
        : 'You will receive a callback shortly.'
    );
  };

  // Generate time slots (business hours)
  const timeSlots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Request Callback
          </DialogTitle>
          <DialogDescription>
            No agents available? We'll call you back as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Customer Info */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Callback *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe why you need to speak with us..."
              rows={3}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v: CallbackPriority) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High - Important matter</SelectItem>
                <SelectItem value="urgent">Urgent - Needs immediate attention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Schedule Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="schedule">Schedule for later?</Label>
                <p className="text-xs text-muted-foreground">
                  Choose a specific time for your callback
                </p>
              </div>
              <Switch
                id="schedule"
                checked={scheduleCallback}
                onCheckedChange={setScheduleCallback}
              />
            </div>

            {scheduleCallback && (
              <div className="flex gap-2 animate-fade-in">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Select value={scheduledTime} onValueChange={setScheduledTime}>
                  <SelectTrigger className="w-[120px]">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-muted-foreground">
              <p>
                {scheduleCallback
                  ? 'We will call you at your scheduled time. Please ensure you\'re available.'
                  : 'Average callback time is 10-15 minutes. We\'ll call you as soon as an agent is available.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : scheduleCallback ? 'Schedule Callback' : 'Request Callback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

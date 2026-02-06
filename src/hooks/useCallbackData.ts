import { useState, useCallback, useEffect } from 'react';
import {
  CallbackRequest,
  CallbackStatus,
  CallbackPriority,
  CallbackQueueStats,
  AgentCallbackNotification,
  CallbackRetryConfig,
  CallbackNote,
  DEFAULT_RETRY_CONFIG,
} from '@/types/callback';
import { notify } from '@/hooks/useNotification';

const STORAGE_KEY = 'callback_queue_data';

// Generate initial mock data
const generateMockCallbacks = (): CallbackRequest[] => {
  const now = new Date();
  return [
    {
      id: 'cb-1',
      customerId: 'cust-101',
      customerName: 'Robert Martinez',
      customerPhone: '+1 (555) 123-4567',
      customerEmail: 'robert.m@email.com',
      reason: 'Billing dispute - overcharge on account',
      priority: 'high',
      status: 'pending',
      queuePosition: 1,
      createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      estimatedWaitTime: 8,
      retryCount: 0,
      maxRetries: 3,
      retryInterval: 15,
      channel: 'voice',
      notes: [
        { id: 'n1', content: 'Callback request created', createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' }
      ],
    },
    {
      id: 'cb-2',
      customerId: 'cust-102',
      customerName: 'Jennifer Lee',
      customerPhone: '+1 (555) 234-5678',
      reason: 'Technical support needed',
      priority: 'normal',
      status: 'pending',
      queuePosition: 2,
      createdAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
      estimatedWaitTime: 15,
      retryCount: 0,
      maxRetries: 3,
      retryInterval: 15,
      channel: 'voice',
      notes: [
        { id: 'n2', content: 'Callback request created', createdAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' }
      ],
    },
    {
      id: 'cb-3',
      customerId: 'cust-103',
      customerName: 'William Thompson',
      customerPhone: '+1 (555) 345-6789',
      reason: 'Account cancellation inquiry',
      priority: 'urgent',
      status: 'notified',
      queuePosition: 0,
      createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
      estimatedWaitTime: 2,
      retryCount: 1,
      maxRetries: 3,
      retryInterval: 15,
      lastAttemptAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      channel: 'voice',
      notes: [
        { id: 'n3', content: 'Callback request created', createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' },
        { id: 'n4', content: 'First attempt failed - no answer', createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), createdBy: 'System', type: 'retry' },
        { id: 'n5', content: 'Agent John Smith notified', createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' },
      ],
    },
    {
      id: 'cb-4',
      customerId: 'cust-104',
      customerName: 'Amanda Garcia',
      customerPhone: '+1 (555) 456-7890',
      reason: 'Product inquiry - Enterprise plan',
      priority: 'normal',
      status: 'scheduled',
      queuePosition: 0,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      scheduledTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      scheduledEndTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
      estimatedWaitTime: 0,
      retryCount: 0,
      maxRetries: 3,
      retryInterval: 15,
      channel: 'voice',
      notes: [
        { id: 'n6', content: 'Scheduled callback created', createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' }
      ],
    },
    {
      id: 'cb-5',
      customerId: 'cust-105',
      customerName: 'David Kim',
      customerPhone: '+1 (555) 567-8901',
      reason: 'Refund request follow-up',
      priority: 'high',
      status: 'failed',
      queuePosition: 0,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      estimatedWaitTime: 0,
      retryCount: 3,
      maxRetries: 3,
      retryInterval: 15,
      lastAttemptAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      channel: 'voice',
      notes: [
        { id: 'n7', content: 'Callback request created', createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), createdBy: 'System', type: 'system' },
        { id: 'n8', content: 'Attempt 1 failed - no answer', createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(), createdBy: 'System', type: 'retry' },
        { id: 'n9', content: 'Attempt 2 failed - no answer', createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), createdBy: 'System', type: 'retry' },
        { id: 'n10', content: 'Attempt 3 failed - max retries reached', createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), createdBy: 'System', type: 'retry' },
      ],
    },
  ];
};

export function useCallbackData() {
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return generateMockCallbacks();
      }
    }
    return generateMockCallbacks();
  });

  const [agentNotifications, setAgentNotifications] = useState<AgentCallbackNotification[]>([]);
  const [retryConfig, setRetryConfig] = useState<CallbackRetryConfig>(DEFAULT_RETRY_CONFIG);
  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(callbacks));
  }, [callbacks]);

  // Generate agent notifications from notified callbacks
  useEffect(() => {
    const notifiedCallbacks = callbacks.filter(cb => cb.status === 'notified');
    const notifications: AgentCallbackNotification[] = notifiedCallbacks.map(cb => ({
      id: `notif-${cb.id}`,
      callbackId: cb.id,
      agentId: 'current-agent',
      customerName: cb.customerName,
      customerPhone: cb.customerPhone,
      reason: cb.reason,
      priority: cb.priority,
      scheduledTime: cb.scheduledTime,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      status: 'pending',
    }));
    setAgentNotifications(notifications);
  }, [callbacks]);

  // Calculate queue stats
  const queueStats: CallbackQueueStats = {
    totalPending: callbacks.filter(cb => cb.status === 'pending').length,
    totalScheduled: callbacks.filter(cb => cb.status === 'scheduled').length,
    totalInProgress: callbacks.filter(cb => cb.status === 'in_progress' || cb.status === 'accepted').length,
    averageWaitTime: Math.round(
      callbacks.filter(cb => cb.status === 'pending').reduce((acc, cb) => acc + cb.estimatedWaitTime, 0) /
      Math.max(callbacks.filter(cb => cb.status === 'pending').length, 1)
    ),
    longestWait: Math.max(...callbacks.filter(cb => cb.status === 'pending').map(cb => {
      return Math.round((Date.now() - new Date(cb.createdAt).getTime()) / 60000);
    }), 0),
    completedToday: callbacks.filter(cb => {
      if (cb.status !== 'completed' || !cb.completedAt) return false;
      const today = new Date().toDateString();
      return new Date(cb.completedAt).toDateString() === today;
    }).length,
    failedToday: callbacks.filter(cb => {
      if (cb.status !== 'failed') return false;
      const today = new Date().toDateString();
      return new Date(cb.createdAt).toDateString() === today;
    }).length,
    availableAgentsForCallback: 2, // Simulated
  };

  // Recalculate queue positions
  const recalculateQueuePositions = useCallback((callbackList: CallbackRequest[]) => {
    const pending = callbackList
      .filter(cb => cb.status === 'pending')
      .sort((a, b) => {
        // Priority order: urgent > high > normal
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        // Then by creation time (FIFO)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    return callbackList.map(cb => {
      if (cb.status === 'pending') {
        const position = pending.findIndex(p => p.id === cb.id) + 1;
        return { ...cb, queuePosition: position };
      }
      return { ...cb, queuePosition: 0 };
    });
  }, []);

  // Create new callback request
  const createCallback = useCallback(async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    reason: string;
    priority?: CallbackPriority;
    scheduledTime?: Date;
  }): Promise<CallbackRequest> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const now = new Date();
    const isScheduled = !!data.scheduledTime && data.scheduledTime > now;

    const newCallback: CallbackRequest = {
      id: `cb-${Date.now()}`,
      customerId: `cust-${Date.now()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      reason: data.reason,
      priority: data.priority || 'normal',
      status: isScheduled ? 'scheduled' : 'pending',
      queuePosition: 0,
      createdAt: now.toISOString(),
      scheduledTime: isScheduled ? data.scheduledTime!.toISOString() : undefined,
      scheduledEndTime: isScheduled ? new Date(data.scheduledTime!.getTime() + 30 * 60 * 1000).toISOString() : undefined,
      estimatedWaitTime: isScheduled ? 0 : 10 + Math.floor(Math.random() * 10),
      retryCount: 0,
      maxRetries: retryConfig.maxRetries,
      retryInterval: retryConfig.retryInterval,
      channel: 'voice',
      notes: [{
        id: `note-${Date.now()}`,
        content: isScheduled ? `Scheduled callback created for ${data.scheduledTime!.toLocaleString()}` : 'Callback request created',
        createdAt: now.toISOString(),
        createdBy: 'System',
        type: 'system',
      }],
    };

    setCallbacks(prev => {
      const updated = [...prev, newCallback];
      return recalculateQueuePositions(updated);
    });

    setIsLoading(false);
    return newCallback;
  }, [retryConfig, recalculateQueuePositions]);

  // Update callback status
  const updateCallbackStatus = useCallback(async (
    callbackId: string,
    newStatus: CallbackStatus,
    note?: string,
    agentId?: string,
    agentName?: string
  ) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setCallbacks(prev => {
      const updated = prev.map(cb => {
        if (cb.id !== callbackId) return cb;

        const newNote: CallbackNote = {
          id: `note-${Date.now()}`,
          content: note || `Status changed to ${newStatus}`,
          createdAt: new Date().toISOString(),
          createdBy: agentName || 'System',
          type: 'system',
        };

        return {
          ...cb,
          status: newStatus,
          assignedAgentId: agentId || cb.assignedAgentId,
          assignedAgentName: agentName || cb.assignedAgentName,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : cb.completedAt,
          notes: [...cb.notes, newNote],
        };
      });

      return recalculateQueuePositions(updated);
    });

    setIsLoading(false);
  }, [recalculateQueuePositions]);

  // Accept callback (agent action)
  const acceptCallback = useCallback(async (callbackId: string, agentId: string, agentName: string) => {
    await updateCallbackStatus(callbackId, 'accepted', `Callback accepted by ${agentName}`, agentId, agentName);
    notify.success('Callback accepted', 'You can now initiate the call.');
  }, [updateCallbackStatus]);

  // Reject callback (agent action)
  const rejectCallback = useCallback(async (callbackId: string, agentName: string, reason?: string) => {
    setCallbacks(prev => {
      const updated = prev.map(cb => {
        if (cb.id !== callbackId) return cb;

        const newNote: CallbackNote = {
          id: `note-${Date.now()}`,
          content: `Callback rejected by ${agentName}${reason ? `: ${reason}` : ''}`,
          createdAt: new Date().toISOString(),
          createdBy: agentName,
          type: 'system',
        };

        // Return to pending status for reassignment
        return {
          ...cb,
          status: 'pending' as CallbackStatus,
          assignedAgentId: undefined,
          assignedAgentName: undefined,
          notes: [...cb.notes, newNote],
        };
      });

      return recalculateQueuePositions(updated);
    });
    notify.info('Callback returned to queue', 'Another agent will be notified.');
  }, [recalculateQueuePositions]);

  // Start callback (initiate call)
  const startCallback = useCallback(async (callbackId: string) => {
    await updateCallbackStatus(callbackId, 'in_progress', 'Call initiated');
    notify.success('Call started', 'Connecting to customer...');
  }, [updateCallbackStatus]);

  // Complete callback
  const completeCallback = useCallback(async (callbackId: string, notes?: string) => {
    await updateCallbackStatus(callbackId, 'completed', notes || 'Callback completed successfully');
    notify.success('Callback completed', 'The callback has been marked as completed.');
  }, [updateCallbackStatus]);

  // Retry failed callback
  const retryCallback = useCallback(async (callbackId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setCallbacks(prev => {
      const updated = prev.map(cb => {
        if (cb.id !== callbackId) return cb;

        if (cb.retryCount >= cb.maxRetries) {
          notify.error('Max retries reached', 'This callback has exceeded the maximum retry attempts.');
          return cb;
        }

        const now = new Date();
        const newNote: CallbackNote = {
          id: `note-${Date.now()}`,
          content: `Manual retry initiated (attempt ${cb.retryCount + 1}/${cb.maxRetries})`,
          createdAt: now.toISOString(),
          createdBy: 'Agent',
          type: 'retry',
        };

        notify.success('Retry initiated', `Callback will be attempted again.`);

        return {
          ...cb,
          status: 'pending' as CallbackStatus,
          retryCount: cb.retryCount + 1,
          lastAttemptAt: now.toISOString(),
          nextRetryAt: new Date(now.getTime() + cb.retryInterval * 60 * 1000).toISOString(),
          notes: [...cb.notes, newNote],
        };
      });

      return recalculateQueuePositions(updated);
    });

    setIsLoading(false);
  }, [recalculateQueuePositions]);

  // Cancel callback
  const cancelCallback = useCallback(async (callbackId: string, reason?: string) => {
    await updateCallbackStatus(callbackId, 'cancelled', reason || 'Callback cancelled');
    notify.info('Callback cancelled', 'The callback request has been cancelled.');
  }, [updateCallbackStatus]);

  // Notify next agent in queue
  const notifyNextAgent = useCallback(async (callbackId: string) => {
    await updateCallbackStatus(callbackId, 'notified', 'Agent notified for callback');
    notify.success('Agent notified', 'An agent has been notified about this callback.');
  }, [updateCallbackStatus]);

  // Simulate real-time queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCallbacks(prev => {
        let hasChanges = false;
        const updated = prev.map(cb => {
          // Update estimated wait times for pending callbacks
          if (cb.status === 'pending') {
            const newWait = Math.max(0, cb.estimatedWaitTime - 1);
            if (newWait !== cb.estimatedWaitTime) {
              hasChanges = true;
              return { ...cb, estimatedWaitTime: newWait };
            }
          }
          return cb;
        });
        return hasChanges ? updated : prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Get callbacks by status
  const getCallbacksByStatus = useCallback((status: CallbackStatus | CallbackStatus[]) => {
    const statuses = Array.isArray(status) ? status : [status];
    return callbacks.filter(cb => statuses.includes(cb.status));
  }, [callbacks]);

  // Get pending queue (sorted by position)
  const getPendingQueue = useCallback(() => {
    return callbacks
      .filter(cb => cb.status === 'pending')
      .sort((a, b) => a.queuePosition - b.queuePosition);
  }, [callbacks]);

  // Get scheduled callbacks
  const getScheduledCallbacks = useCallback(() => {
    return callbacks
      .filter(cb => cb.status === 'scheduled')
      .sort((a, b) => {
        if (!a.scheduledTime || !b.scheduledTime) return 0;
        return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
      });
  }, [callbacks]);

  return {
    callbacks,
    queueStats,
    agentNotifications,
    retryConfig,
    isLoading,
    createCallback,
    updateCallbackStatus,
    acceptCallback,
    rejectCallback,
    startCallback,
    completeCallback,
    retryCallback,
    cancelCallback,
    notifyNextAgent,
    getCallbacksByStatus,
    getPendingQueue,
    getScheduledCallbacks,
    setRetryConfig,
  };
}

import { useState, useCallback } from 'react';
import type {
  SubscriptionPlan,
  UsageMetrics,
  Invoice,
  PaymentMethodData,
  CreditBalance,
  PlanType,
} from '@/types/billing';

const availablePlans: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    type: 'starter',
    price: 49,
    interval: 'monthly',
    features: [
      '1,000 AI calls/month',
      '5,000 chat sessions',
      '2 AI agents',
      'Basic analytics',
      'Email support',
      '5 GB storage',
    ],
    limits: { calls: 1000, chats: 5000, emails: 2000, agents: 2, storage: 5 },
    isCurrentPlan: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    type: 'pro',
    price: 199,
    interval: 'monthly',
    features: [
      '10,000 AI calls/month',
      '50,000 chat sessions',
      '10 AI agents',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access',
      '50 GB storage',
    ],
    limits: { calls: 10000, chats: 50000, emails: 20000, agents: 10, storage: 50 },
    isCurrentPlan: true,
    isPopular: true,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    price: 499,
    interval: 'monthly',
    features: [
      'Unlimited AI calls',
      'Unlimited chat sessions',
      'Unlimited AI agents',
      'Custom analytics & reports',
      'Dedicated account manager',
      'Custom integrations',
      'Full API access',
      'SLA guarantee',
      'On-premise option',
      '500 GB storage',
    ],
    limits: { calls: -1, chats: -1, emails: -1, agents: -1, storage: 500 },
    isCurrentPlan: false,
  },
  {
    id: 'plan-custom',
    name: 'Custom',
    type: 'custom',
    price: 0,
    interval: 'monthly',
    features: [
      'Fully tailored to your needs',
      'Custom call & chat limits',
      'Unlimited AI agents',
      'White-label options',
      'Dedicated infrastructure',
      'Custom SLA & compliance',
      'On-premise deployment',
      '24/7 premium support',
      'Custom training & onboarding',
    ],
    limits: { calls: -1, chats: -1, emails: -1, agents: -1, storage: -1 },
    isCurrentPlan: false,
    isContactSales: true,
  },
];

const mockInvoices: Invoice[] = [
  { id: 'inv-001', date: '2025-02-01', dueDate: '2025-02-15', amount: 199, status: 'paid', description: 'Pro Plan - February 2025' },
  { id: 'inv-002', date: '2025-01-01', dueDate: '2025-01-15', amount: 199, status: 'paid', description: 'Pro Plan - January 2025' },
  { id: 'inv-003', date: '2024-12-01', dueDate: '2024-12-15', amount: 199, status: 'paid', description: 'Pro Plan - December 2024' },
  { id: 'inv-004', date: '2024-11-01', dueDate: '2024-11-15', amount: 199, status: 'paid', description: 'Pro Plan - November 2024' },
  { id: 'inv-005', date: '2024-10-01', dueDate: '2024-10-15', amount: 49, status: 'paid', description: 'Starter Plan - October 2024' },
];

const mockPaymentMethods: PaymentMethodData[] = [
  { id: 'pm-1', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2026, isDefault: true },
  { id: 'pm-2', type: 'card', last4: '5555', brand: 'Mastercard', expiryMonth: 8, expiryYear: 2025, isDefault: false },
];

export function useBillingData() {
  const [plans] = useState<SubscriptionPlan[]>(availablePlans);
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>(mockPaymentMethods);
  const [autoRenew, setAutoRenew] = useState(true);

  const currentPlan = plans.find(p => p.isCurrentPlan) || plans[1];

  const usageMetrics: UsageMetrics = {
    calls: { used: 7234, limit: 10000, percentage: 72.34 },
    chats: { used: 38456, limit: 50000, percentage: 76.91 },
    emails: { used: 12340, limit: 20000, percentage: 61.7 },
    agents: { used: 6, limit: 10, percentage: 60 },
    storage: { used: 32.5, limit: 50, percentage: 65 },
    aiMinutes: { used: 4520, limit: 6000, percentage: 75.33 },
  };

  const credits: CreditBalance = {
    available: 250,
    pending: 50,
    expiring: 100,
    expiryDate: '2025-03-15',
  };

  const nextBillingDate = '2025-03-01';
  const nextAmount = currentPlan.price;

  const toggleAutoRenew = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setAutoRenew(prev => !prev);
    return { success: true };
  }, []);

  const updatePaymentMethod = useCallback(async (data: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    name: string;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() > 0.8) {
      return { success: false, error: 'Card declined. Please try a different payment method.' };
    }

    const newMethod: PaymentMethodData = {
      id: `pm-${Date.now()}`,
      type: 'card',
      last4: data.cardNumber.slice(-4),
      brand: data.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      expiryMonth: parseInt(data.expiryMonth),
      expiryYear: parseInt(data.expiryYear),
      isDefault: true,
    };

    setPaymentMethods(prev => [
      newMethod,
      ...prev.map(pm => ({ ...pm, isDefault: false })),
    ]);

    return { success: true };
  }, []);

  const setDefaultPaymentMethod = useCallback(async (methodId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === methodId,
    })));
    return { success: true };
  }, []);

  const removePaymentMethod = useCallback(async (methodId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
    return { success: true };
  }, []);

  const upgradePlan = useCallback(async (planType: PlanType): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }, []);

  const downloadInvoice = useCallback(async (invoiceId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }, []);

  return {
    plans,
    currentPlan,
    usageMetrics,
    invoices,
    paymentMethods,
    credits,
    nextBillingDate,
    nextAmount,
    autoRenew,
    toggleAutoRenew,
    updatePaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    upgradePlan,
    downloadInvoice,
  };
}

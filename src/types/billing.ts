export type PlanType = 'starter' | 'professional' | 'enterprise';
export type PlanInterval = 'monthly' | 'yearly';
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank' | 'paypal';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  interval: PlanInterval;
  features: string[];
  limits: {
    calls: number;
    chats: number;
    emails: number;
    agents: number;
    storage: number;
  };
  isCurrentPlan: boolean;
  isPopular?: boolean;
}

export interface UsageMetrics {
  calls: { used: number; limit: number; percentage: number };
  chats: { used: number; limit: number; percentage: number };
  emails: { used: number; limit: number; percentage: number };
  agents: { used: number; limit: number; percentage: number };
  storage: { used: number; limit: number; percentage: number };
  aiMinutes: { used: number; limit: number; percentage: number };
}

export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
  downloadUrl?: string;
}

export interface PaymentMethodData {
  id: string;
  type: PaymentMethod;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  email?: string;
  isDefault: boolean;
}

export interface CreditBalance {
  available: number;
  pending: number;
  expiring: number;
  expiryDate?: string;
}

export interface BillingInfo {
  currentPlan: SubscriptionPlan;
  nextBillingDate: string;
  nextAmount: number;
  usageMetrics: UsageMetrics;
  invoices: Invoice[];
  paymentMethods: PaymentMethodData[];
  credits: CreditBalance;
}

export const PLAN_CONFIG: Record<PlanType, {
  color: string;
  bgColor: string;
  icon: string;
}> = {
  starter: { color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '🚀' },
  professional: { color: 'text-primary', bgColor: 'bg-primary/10', icon: '⭐' },
  enterprise: { color: 'text-warning', bgColor: 'bg-warning/10', icon: '👑' },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  paid: { label: 'Paid', color: 'text-success', bgColor: 'bg-success/10' },
  pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10' },
  failed: { label: 'Failed', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  refunded: { label: 'Refunded', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};

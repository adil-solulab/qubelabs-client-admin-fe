export type UserRole = 'client_admin' | 'supervisor' | 'agent';

export type AgentStatus = 'available' | 'busy' | 'offline';

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AgentStatus;
  skills: Skill[];
  avatar?: string;
  phone?: string;
  department?: string;
  createdAt: string;
  lastActive?: string;
}

export const AVAILABLE_SKILLS: Skill[] = [
  { id: '1', name: 'Technical Support', category: 'Support' },
  { id: '2', name: 'Billing Inquiries', category: 'Finance' },
  { id: '3', name: 'Sales', category: 'Sales' },
  { id: '4', name: 'Product Knowledge', category: 'Product' },
  { id: '5', name: 'Account Management', category: 'Support' },
  { id: '6', name: 'Escalations', category: 'Support' },
  { id: '7', name: 'Returns & Refunds', category: 'Finance' },
  { id: '8', name: 'Onboarding', category: 'Product' },
  { id: '9', name: 'Enterprise Sales', category: 'Sales' },
  { id: '10', name: 'VIP Support', category: 'Support' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  client_admin: 'Client Admin',
  supervisor: 'Supervisor',
  agent: 'Agent',
};

export const STATUS_LABELS: Record<AgentStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
};

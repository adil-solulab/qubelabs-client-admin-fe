// Screen/Module identifiers for permission management
export type ScreenId = 
  | 'home'
  | 'dashboard'
  | 'users'
  | 'ai-agents'
  | 'knowledge-base'
  | 'channels'
  | 'flow-builder'
  | 'live-ops'
  | 'outbound-calls'
  | 'analytics'
  | 'integrations'
  | 'billing'
  | 'security'
  | 'sdks'
  | 'theme'
  | 'roles'
  | 'ai-engine'
  | 'transcripts'
  | 'report-tickets'
  | 'inbound-webrtc-sdk';

// Action types for granular permissions
export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'publish';

// Permission for a specific screen
export interface ScreenPermission {
  screenId: ScreenId;
  actions: ActionType[];
}

// Role definition
export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles cannot be edited/deleted
  permissions: ScreenPermission[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

// Screen metadata for UI
export interface ScreenMeta {
  id: ScreenId;
  label: string;
  path: string;
  category: 'core' | 'operations' | 'settings';
}

// All available screens with metadata
export const AVAILABLE_SCREENS: ScreenMeta[] = [
  { id: 'home', label: 'Home', path: '/home', category: 'core' },
  { id: 'dashboard', label: 'Dashboard', path: '/', category: 'core' },
  { id: 'users', label: 'Users', path: '/users', category: 'core' },
  { id: 'ai-agents', label: 'AI Agents', path: '/ai-agents', category: 'core' },
  { id: 'knowledge-base', label: 'Knowledge Base', path: '/knowledge-base', category: 'core' },
  { id: 'channels', label: 'Channels', path: '/channels', category: 'core' },
  { id: 'flow-builder', label: 'Flow Builder', path: '/flow-builder', category: 'core' },
  { id: 'live-ops', label: 'Live Operations', path: '/live-ops', category: 'operations' },
  { id: 'outbound-calls', label: 'Outbound Campaigns', path: '/outbound-calls', category: 'operations' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', category: 'operations' },
  { id: 'integrations', label: 'Integrations', path: '/integrations', category: 'settings' },
  { id: 'billing', label: 'Billing', path: '/billing', category: 'settings' },
  { id: 'security', label: 'Security', path: '/security', category: 'settings' },
  { id: 'sdks', label: 'SDKs', path: '/sdks', category: 'settings' },
  { id: 'inbound-webrtc-sdk', label: 'WebRTC SDK', path: '/inbound-webrtc-sdk', category: 'settings' },
  { id: 'theme', label: 'Theme', path: '/theme', category: 'settings' },
  { id: 'roles', label: 'Roles & Permissions', path: '/roles', category: 'settings' },
  { id: 'transcripts', label: 'Transcripts', path: '/transcripts', category: 'operations' },
  { id: 'report-tickets', label: 'Report Tickets', path: '/report-tickets', category: 'operations' },
];

// All available actions
export const AVAILABLE_ACTIONS: { id: ActionType; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'export', label: 'Export' },
  { id: 'publish', label: 'Publish' },
];

// Default system roles with full permissions
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'client_admin',
    name: 'Client Admin',
    description: 'Full access to all features and settings. Can manage users, roles, and billing.',
    isSystem: true,
    permissions: AVAILABLE_SCREENS.map(screen => ({
      screenId: screen.id,
      actions: ['view', 'create', 'edit', 'delete', 'export', 'publish'] as ActionType[],
    })),
    userCount: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Manage team operations, monitor live conversations, and access analytics.',
    isSystem: true,
    permissions: [
      { screenId: 'home', actions: ['view'] },
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'users', actions: ['view'] },
      { screenId: 'ai-agents', actions: ['view'] },
      { screenId: 'knowledge-base', actions: ['view', 'create', 'edit'] },
      { screenId: 'channels', actions: ['view'] },
      { screenId: 'flow-builder', actions: ['view'] },
      { screenId: 'live-ops', actions: ['view', 'create', 'edit'] },
      { screenId: 'outbound-calls', actions: ['view', 'create', 'edit'] },
      { screenId: 'analytics', actions: ['view', 'export'] },
      { screenId: 'transcripts', actions: ['view', 'export'] },
      { screenId: 'report-tickets', actions: ['view', 'create', 'edit'] },
    ],
    userCount: 3,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Handle customer interactions and access assigned conversations.',
    isSystem: true,
    permissions: [
      { screenId: 'home', actions: ['view'] },
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'knowledge-base', actions: ['view'] },
      { screenId: 'live-ops', actions: ['view'] },
      { screenId: 'transcripts', actions: ['view'] },
      { screenId: 'report-tickets', actions: ['view', 'create'] },
    ],
    userCount: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

import { useState, useCallback } from 'react';
import type { TeamUser, Skill, UserRole, AgentStatus, AgentGroup } from '@/types/users';
import { AVAILABLE_SKILLS } from '@/types/users';

const generateMockUsers = (): TeamUser[] => [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@acmecorp.com',
    role: 'client_admin',
    status: 'available',
    skills: [],
    phone: '+1 (555) 123-4567',
    department: 'Administration',
    maxConcurrentChats: 5,
    createdAt: '2024-01-15',
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@acmecorp.com',
    role: 'supervisor',
    status: 'available',
    skills: [AVAILABLE_SKILLS[0], AVAILABLE_SKILLS[5]],
    phone: '+1 (555) 234-5678',
    department: 'Customer Support',
    maxConcurrentChats: 5,
    createdAt: '2024-02-20',
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@acmecorp.com',
    role: 'agent',
    status: 'busy',
    skills: [AVAILABLE_SKILLS[0], AVAILABLE_SKILLS[1], AVAILABLE_SKILLS[4]],
    phone: '+1 (555) 345-6789',
    department: 'Technical Support',
    maxConcurrentChats: 4,
    createdAt: '2024-03-10',
    lastActive: 'Active now',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@acmecorp.com',
    role: 'agent',
    status: 'available',
    skills: [AVAILABLE_SKILLS[2], AVAILABLE_SKILLS[8]],
    phone: '+1 (555) 456-7890',
    department: 'Sales',
    maxConcurrentChats: 5,
    createdAt: '2024-03-15',
    lastActive: '10 min ago',
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@acmecorp.com',
    role: 'agent',
    status: 'offline',
    skills: [AVAILABLE_SKILLS[1], AVAILABLE_SKILLS[6]],
    phone: '+1 (555) 567-8901',
    department: 'Billing',
    maxConcurrentChats: 5,
    createdAt: '2024-04-01',
    lastActive: '2 hours ago',
  },
  {
    id: '6',
    name: 'Lisa Park',
    email: 'lisa.park@acmecorp.com',
    role: 'supervisor',
    status: 'busy',
    skills: [AVAILABLE_SKILLS[3], AVAILABLE_SKILLS[7]],
    phone: '+1 (555) 678-9012',
    department: 'Product',
    maxConcurrentChats: 5,
    createdAt: '2024-04-10',
    lastActive: 'Active now',
  },
  {
    id: '7',
    name: 'James Wilson',
    email: 'james.wilson@acmecorp.com',
    role: 'agent',
    status: 'available',
    skills: [AVAILABLE_SKILLS[9], AVAILABLE_SKILLS[5]],
    phone: '+1 (555) 789-0123',
    department: 'VIP Support',
    maxConcurrentChats: 3,
    createdAt: '2024-05-01',
    lastActive: '15 min ago',
  },
  {
    id: '8',
    name: 'Amanda Foster',
    email: 'amanda.foster@acmecorp.com',
    role: 'agent',
    status: 'away',
    skills: [AVAILABLE_SKILLS[0], AVAILABLE_SKILLS[3]],
    phone: '+1 (555) 890-1234',
    department: 'Technical Support',
    maxConcurrentChats: 4,
    createdAt: '2024-05-15',
    lastActive: '30 min ago',
  },
];

const generateMockGroups = (): AgentGroup[] => [
  {
    id: 'grp-1',
    name: 'Customer Support',
    description: 'General customer support team handling inquiries and issues',
    supervisorId: '2',
    agentIds: ['3', '5'],
    email: 'support@acmecorp.com',
    workingHours: { start: '09:00', end: '18:00', timezone: 'EST', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    autoAssignment: true,
    maxQueueSize: 20,
    createdAt: '2024-02-20',
  },
  {
    id: 'grp-2',
    name: 'Escalation',
    description: 'Handles escalated conversations requiring senior attention',
    supervisorId: '6',
    agentIds: ['7'],
    email: 'escalation@acmecorp.com',
    workingHours: { start: '08:00', end: '20:00', timezone: 'EST', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
    autoAssignment: true,
    maxQueueSize: 10,
    createdAt: '2024-03-01',
  },
  {
    id: 'grp-3',
    name: 'Sales',
    description: 'Sales team for product inquiries and deal management',
    supervisorId: '2',
    agentIds: ['4'],
    email: 'sales@acmecorp.com',
    workingHours: { start: '09:00', end: '17:00', timezone: 'EST', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    autoAssignment: true,
    maxQueueSize: 15,
    createdAt: '2024-03-15',
  },
  {
    id: 'grp-4',
    name: 'VIP Support',
    description: 'Dedicated support for premium and enterprise customers',
    supervisorId: '6',
    agentIds: ['7', '8'],
    email: 'vip@acmecorp.com',
    workingHours: { start: '00:00', end: '23:59', timezone: 'EST', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    autoAssignment: false,
    maxQueueSize: 5,
    createdAt: '2024-04-01',
  },
];

export function useUsersData() {
  const [users, setUsers] = useState<TeamUser[]>(generateMockUsers());
  const [groups, setGroups] = useState<AgentGroup[]>(generateMockGroups());
  const [isLoading, setIsLoading] = useState(false);

  const addUser = useCallback(async (userData: Omit<TeamUser, 'id' | 'createdAt' | 'lastActive'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: TeamUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsLoading(false);
    return newUser;
  }, []);

  const updateUser = useCallback(async (userId: string, userData: Partial<TeamUser>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      )
    );
    setIsLoading(false);
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    setGroups(prev => prev.map(g => ({ ...g, agentIds: g.agentIds.filter(id => id !== userId) })));
    setIsLoading(false);
  }, []);

  const importUsers = useCallback(async (
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<{ success: number; failed: number }> => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
    }
    
    const importedCount = Math.floor(Math.random() * 5) + 3;
    const failedCount = Math.floor(Math.random() * 2);
    
    const newUsers: TeamUser[] = Array.from({ length: importedCount }, (_, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: `Imported User ${i + 1}`,
      email: `imported.user${i + 1}@acmecorp.com`,
      role: 'agent' as UserRole,
      status: 'offline' as AgentStatus,
      skills: [],
      maxConcurrentChats: 5,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Never',
    }));
    
    setUsers(prev => [...prev, ...newUsers]);
    
    return { success: importedCount, failed: failedCount };
  }, []);

  const updateUserStatus = useCallback((userId: string, status: AgentStatus) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, status } : user
      )
    );
  }, []);

  const updateUserSkills = useCallback((userId: string, skills: Skill[]) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, skills } : user
      )
    );
  }, []);

  const addGroup = useCallback(async (groupData: Omit<AgentGroup, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const newGroup: AgentGroup = {
      ...groupData,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGroups(prev => [...prev, newGroup]);
    setIsLoading(false);
    return newGroup;
  }, []);

  const updateGroup = useCallback(async (groupId: string, data: Partial<AgentGroup>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...data } : g));
    setIsLoading(false);
  }, []);

  const deleteGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setIsLoading(false);
  }, []);

  return {
    users,
    groups,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    importUsers,
    updateUserStatus,
    updateUserSkills,
    addGroup,
    updateGroup,
    deleteGroup,
  };
}

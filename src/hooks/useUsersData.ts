import { useState, useCallback } from 'react';
import type { TeamUser, Skill, UserRole, AgentStatus } from '@/types/users';
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
    createdAt: '2024-05-01',
    lastActive: '15 min ago',
  },
  {
    id: '8',
    name: 'Amanda Foster',
    email: 'amanda.foster@acmecorp.com',
    role: 'agent',
    status: 'offline',
    skills: [AVAILABLE_SKILLS[0], AVAILABLE_SKILLS[3]],
    phone: '+1 (555) 890-1234',
    department: 'Technical Support',
    createdAt: '2024-05-15',
    lastActive: '1 day ago',
  },
];

export function useUsersData() {
  const [users, setUsers] = useState<TeamUser[]>(generateMockUsers());
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
    setIsLoading(false);
  }, []);

  const importUsers = useCallback(async (
    file: File, 
    onProgress: (progress: number) => void
  ): Promise<{ success: number; failed: number }> => {
    // Simulate file processing with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(i);
    }
    
    // Simulate adding some users from import
    const importedCount = Math.floor(Math.random() * 5) + 3;
    const failedCount = Math.floor(Math.random() * 2);
    
    const newUsers: TeamUser[] = Array.from({ length: importedCount }, (_, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: `Imported User ${i + 1}`,
      email: `imported.user${i + 1}@acmecorp.com`,
      role: 'agent' as UserRole,
      status: 'offline' as AgentStatus,
      skills: [],
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

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    importUsers,
    updateUserStatus,
    updateUserSkills,
  };
}

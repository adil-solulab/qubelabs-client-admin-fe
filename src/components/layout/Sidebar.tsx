import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Bot,
  BookOpen,
  MessageSquare,
  GitBranch,
  Headphones,
  PhoneOutgoing,
  BarChart3,
  Puzzle,
  CreditCard,
  Shield,
  ShieldCheck,
  Code2,
  Palette,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import type { ScreenId } from '@/types/roles';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  screenId: ScreenId | 'profile'; // profile is always accessible
  badge?: string | number;
}

const allNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', screenId: 'dashboard' },
  { icon: Users, label: 'Users', path: '/users', screenId: 'users' },
  { icon: Bot, label: 'AI Agents', path: '/ai-agents', screenId: 'ai-agents', badge: '5' },
  { icon: BookOpen, label: 'Knowledge Base', path: '/knowledge-base', screenId: 'knowledge-base' },
  { icon: MessageSquare, label: 'Channels', path: '/channels', screenId: 'channels' },
  { icon: GitBranch, label: 'Flow Builder', path: '/flow-builder', screenId: 'flow-builder' },
  { icon: Headphones, label: 'Live Ops', path: '/live-ops', screenId: 'live-ops', badge: '12' },
  { icon: PhoneOutgoing, label: 'Outbound Calls', path: '/outbound-calls', screenId: 'outbound-calls' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', screenId: 'analytics' },
  { icon: Puzzle, label: 'Integrations', path: '/integrations', screenId: 'integrations' },
  { icon: CreditCard, label: 'Billing', path: '/billing', screenId: 'billing' },
  { icon: Shield, label: 'Security', path: '/security', screenId: 'security' },
  { icon: ShieldCheck, label: 'Roles', path: '/roles', screenId: 'roles' },
  { icon: Code2, label: 'SDKs', path: '/sdks', screenId: 'sdks' },
  { icon: Palette, label: 'Theme', path: '/theme', screenId: 'theme' },
  { icon: User, label: 'Profile', path: '/profile', screenId: 'profile' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { canAccessScreen, isClientAdmin } = useAuth();

  // Filter nav items based on role permissions
  const navItems = allNavItems.filter(item => {
    // Profile is always accessible
    if (item.screenId === 'profile') return true;
    // Client admin sees everything
    if (isClientAdmin) return true;
    // Check permission for other roles
    return canAccessScreen(item.screenId as ScreenId);
  });

  return (
    <aside
      className={cn(
        'h-screen gradient-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sidebar-foreground font-semibold text-sm">QubeLabs</span>
            <span className="text-sidebar-foreground/50 text-xs">Enterprise</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            const linkContent = (
              <NavLink
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  !isActive && 'group-hover:scale-110'
                )} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        isActive
                          ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                          : 'bg-sidebar-primary/20 text-sidebar-primary'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {collapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
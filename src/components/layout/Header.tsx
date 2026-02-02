import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Building2, FlaskConical, Rocket, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Environment, Notification } from '@/types/dashboard';

const mockNotifications: Notification[] = [
  { id: '1', type: 'error', title: 'SLA Breach Alert', message: 'Response time exceeded on 3 tickets', timestamp: '2 min ago', read: false },
  { id: '2', type: 'warning', title: 'AI Agent Offline', message: 'Agent #4 disconnected unexpectedly', timestamp: '15 min ago', read: false },
  { id: '3', type: 'success', title: 'Deployment Complete', message: 'Flow v2.3 deployed successfully', timestamp: '1 hour ago', read: true },
  { id: '4', type: 'info', title: 'New Integration', message: 'Salesforce integration is now available', timestamp: '3 hours ago', read: true },
];

interface HeaderProps {
  environment: Environment;
  onEnvironmentChange: (env: Environment) => void;
}

export function Header({ environment, onEnvironmentChange }: HeaderProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left: Organization */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Acme Corporation</h1>
            <p className="text-xs text-muted-foreground">Enterprise Plan</p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Environment Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-2 font-medium',
                environment === 'production'
                  ? 'border-success/50 text-success hover:bg-success/10'
                  : 'border-warning/50 text-warning hover:bg-warning/10'
              )}
            >
              {environment === 'production' ? (
                <Rocket className="w-4 h-4" />
              ) : (
                <FlaskConical className="w-4 h-4" />
              )}
              {environment === 'production' ? 'Production' : 'Test'}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Environment</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEnvironmentChange('production')}>
              <Rocket className="w-4 h-4 mr-2 text-success" />
              <span>Production</span>
              {environment === 'production' && (
                <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEnvironmentChange('test')}>
              <FlaskConical className="w-4 h-4 mr-2 text-warning" />
              <span>Test</span>
              {environment === 'test' && (
                <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-primary">
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          notification.type === 'error' && 'bg-destructive',
                          notification.type === 'warning' && 'bg-warning',
                          notification.type === 'success' && 'bg-success',
                          notification.type === 'info' && 'bg-primary'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm',
                            !notification.read && 'font-medium'
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">John Admin</p>
                <p className="text-xs text-muted-foreground">Client Admin</p>
              </div>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>John Admin</span>
                <span className="text-xs font-normal text-muted-foreground">john@acmecorp.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

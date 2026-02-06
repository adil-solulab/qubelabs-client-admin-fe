import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { Environment } from '@/types/dashboard';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [environment, setEnvironment] = useState<Environment>('production');

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header environment={environment} onEnvironmentChange={setEnvironment} />
        <main className="flex-1 min-h-0 overflow-y-auto relative p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

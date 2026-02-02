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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header environment={environment} onEnvironmentChange={setEnvironment} />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

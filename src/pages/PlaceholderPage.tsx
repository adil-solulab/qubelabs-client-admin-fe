import { useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.slice(1).split('-').map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Page';

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow">
          <Construction className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{pageName}</h1>
        <p className="text-muted-foreground max-w-md">
          This page is part of the ConvoAI platform. Navigate back to the Dashboard to see the full interactive prototype.
        </p>
      </div>
    </AppLayout>
  );
}

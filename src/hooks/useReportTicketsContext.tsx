import { createContext, useContext, type ReactNode } from 'react';
import { useReportTicketsData } from './useReportTicketsData';

type ReportTicketsContextType = ReturnType<typeof useReportTicketsData>;

const ReportTicketsContext = createContext<ReportTicketsContextType | null>(null);

export function ReportTicketsProvider({ children }: { children: ReactNode }) {
  const data = useReportTicketsData();
  return (
    <ReportTicketsContext.Provider value={data}>
      {children}
    </ReportTicketsContext.Provider>
  );
}

export function useReportTickets() {
  const context = useContext(ReportTicketsContext);
  if (!context) {
    throw new Error('useReportTickets must be used within a ReportTicketsProvider');
  }
  return context;
}

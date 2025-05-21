
"use client";
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { usePathname } from 'next/navigation';

// Helper to get page title based on pathname
const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/events/new')) return 'Cadastrar Novo Evento';
  if (pathname.match(/^\/events\/[^/]+\/edit$/)) return 'Editar Evento';
  if (pathname.startsWith('/events')) return 'Eventos';
  if (pathname.startsWith('/calendar')) return 'Calendário de Eventos';
  if (pathname.startsWith('/prospects/new')) return 'Cadastrar Novo Lead'; // Added
  if (pathname.startsWith('/sales-funnel')) return 'Funil de Leads'; // Renamed
  if (pathname.startsWith('/financials')) return 'Controle Financeiro';
  return 'FestaFlow';
};

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return <AppLayout pageTitle={pageTitle}>{children}</AppLayout>;
}


"use client";
import type { ReactNode } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { verifySession } from '@/lib/session'; // Import verifySession for client-side check (optional, middleware handles primary)

// Helper to get page title based on pathname
const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/events/new')) return 'Cadastrar Novo Evento';
  if (pathname.match(/^\/events\/[^/]+\/edit$/)) return 'Editar Evento';
  // No need to check for /events if edit and new are more specific.
  // if (pathname.startsWith('/events')) return 'Eventos'; 
  if (pathname.startsWith('/calendar')) return 'Calendário de Eventos';
  if (pathname.startsWith('/prospects/new')) return 'Cadastrar Novo Lead';
  if (pathname.startsWith('/sales-funnel')) return 'Funil de Leads';
  if (pathname.startsWith('/payments/new')) return 'Adicionar Pagamento';
  if (pathname.startsWith('/financials')) return 'Controle Financeiro';
  if (pathname.startsWith('/appointments')) return 'Compromissos'; // Novo título
  return 'FestaFlow'; // Default title
};

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  // O middleware já deve proteger as rotas, mas podemos adicionar uma verificação
  // no cliente como uma camada extra ou para cenários específicos.
  // No entanto, para manter simples por agora, confiaremos no middleware.
  // useEffect(() => {
  //   async function checkSession() {
  //     await verifySession(); // Se não houver sessão, redirecionará para /login
  //   }
  //   if (typeof window !== 'undefined') { // Executar apenas no cliente
  //      checkSession();
  //   }
  // }, [pathname]); // Re-verificar se o pathname mudar, embora o middleware deva pegar primeiro

  return <AppLayout pageTitle={pageTitle}>{children}</AppLayout>;
}

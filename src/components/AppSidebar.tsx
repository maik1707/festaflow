
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ClipboardList, CircleDollarSign, LayoutDashboard, CalendarPlus, UserPlus, HandCoins, LogOut, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logoutAction } from '@/app/login/actions'; // Importar a ação de logout

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendário Eventos', icon: CalendarDays },
  { href: '/events/new', label: 'Novo Evento', icon: CalendarPlus },
  { href: '/prospects/new', label: 'Novo Lead', icon: UserPlus },
  { href: '/sales-funnel', label: 'Funil de Leads', icon: ClipboardList },
  { href: '/payments/new', label: 'Adicionar Pagamento', icon: HandCoins },
  { href: '/financials', label: 'Financeiro', icon: CircleDollarSign },
  { href: '/appointments', label: 'Compromissos', icon: StickyNote },
];

export function AppSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside className="sticky top-0 h-screen w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col shadow-lg">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-primary">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7L12 12M12 12L22 7M12 12V22M12 2V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-2xl font-bold text-sidebar-primary">FestaFlow</h1>
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-start text-base",
                        (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                          : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <form action={handleLogout} className="w-full">
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start text-base hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Sair
                        </Button>
                    </form>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Sair do Sistema</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}


"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ClipboardList, CircleDollarSign, LayoutDashboard, CalendarPlus, UserPlus, HandCoins, LogOut, StickyNote, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logoutAction } from '@/app/login/actions'; 
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';


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

const secondaryNavItems = [
    { href: '/settings', label: 'Configurações', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
        <SidebarHeader>
             <Link href="/dashboard" className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sidebar-primary">
                    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 7L12 12M12 12L22 7M12 12V22M12 2V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="text-2xl font-bold text-sidebar-primary">FestaFlow</h1>
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href} legacyBehavior passHref>
                             <SidebarMenuButton
                                asChild
                                isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                                tooltip={{children: item.label}}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 {secondaryNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href} legacyBehavior passHref>
                             <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(item.href)}
                                tooltip={{children: item.label}}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
            <SidebarSeparator />
            <form action={logoutAction} className="w-full">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip={{children: "Sair do Sistema"}}>
                            <LogOut />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </form>
        </SidebarFooter>
    </Sidebar>
  );
}

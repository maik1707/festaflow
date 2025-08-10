
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppHeaderProps {
  pageTitle: string;
}

export function AppHeader({ pageTitle }: AppHeaderProps) {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 shadow-sm flex items-center gap-4">
      {isMobile && <SidebarTrigger />}
      <h2 className="text-2xl font-semibold text-foreground">{pageTitle}</h2>
    </header>
  );
}

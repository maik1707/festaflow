"use client";

interface AppHeaderProps {
  pageTitle: string;
}

export function AppHeader({ pageTitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 shadow-sm">
      <h2 className="text-2xl font-semibold text-foreground">{pageTitle}</h2>
    </header>
  );
}

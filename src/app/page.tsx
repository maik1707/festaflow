'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-foreground">Redirecionando para o dashboard...</p>
      {/* You can add a spinner or loading animation here */}
    </div>
  );
}

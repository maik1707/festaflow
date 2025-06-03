
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Entrando...' : (
        <>
          <LogIn className="mr-2 h-4 w-4" /> Entrar
        </>
      )}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const initialState = { error: undefined, success: undefined };
  const [state, formAction] = useFormState(loginAction, initialState);

  useEffect(() => {
    // O redirecionamento agora é feito pela Server Action ou middleware.
    // Esta página é principalmente para exibir o formulário e erros.
    // Se quiséssemos redirecionar do cliente após 'success', faríamos aqui.
    // No entanto, o middleware/action já cuida disso.
  }, [state, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12M12 12L22 7M12 12V22M12 2V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl">Login - FestaFlow</CardTitle>
          <CardDescription>Acesse o painel administrativo</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" name="username" type="text" placeholder="seu_usuario_admin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             {state?.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de Login</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

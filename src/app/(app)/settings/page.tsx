'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkConnectionStatus() {
      setIsLoading(true);
      try {
        // Chama a nova rota de API em vez de a função diretamente
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsConnected(data.isConnected);
      } catch (error) {
        console.error("Erro ao verificar status de conexão com o Google:", error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkConnectionStatus();
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    // Redireciona para a nossa rota de API que por sua vez redirecionará para o Google
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
          <CardDescription>Conecte o FestaFlow a serviços de terceiros para automatizar tarefas.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Agenda</CardTitle>
          <CardDescription>
            Sincronize automaticamente os eventos e compromissos do FestaFlow com a sua Google Agenda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verificando status da conexão...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Conectado com sucesso ao Google Agenda!</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-muted-foreground">
                É necessário autorizar o acesso à sua agenda.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Conectar com Google Agenda
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

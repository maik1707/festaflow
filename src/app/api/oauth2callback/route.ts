
import { NextResponse, type NextRequest } from 'next/server';
import { getGoogleOAuth2Client, storeTokens } from '@/lib/google';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const settingsUrl = new URL('/settings', process.env.NEXT_PUBLIC_BASE_URL);

  if (error) {
    console.error('Erro de OAuth do Google:', error);
    settingsUrl.searchParams.set('error', 'google_permission_denied');
    return NextResponse.redirect(settingsUrl);
  }

  if (!code) {
    console.error('Código de autorização do Google não encontrado.');
    settingsUrl.searchParams.set('error', 'google_code_missing');
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const oauth2Client = getGoogleOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
        console.error('Tokens de acesso ou de atualização não foram recebidos do Google.', tokens);
        settingsUrl.searchParams.set('error', 'google_token_missing');
        return NextResponse.redirect(settingsUrl);
    }
    
    // Armazena os tokens de forma segura
    await storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    // Redireciona de volta para a página de configurações com uma mensagem de sucesso
    settingsUrl.searchParams.set('success', 'google_connected');
    return NextResponse.redirect(settingsUrl);

  } catch (err) {
    console.error('Erro ao trocar código por tokens:', err);
    settingsUrl.searchParams.set('error', 'google_token_exchange_failed');
    return NextResponse.redirect(settingsUrl);
  }
}

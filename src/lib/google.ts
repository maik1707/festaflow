
'use server';

import { google } from 'googleapis';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getSession } from '@/lib/session';

// Define o escopo necessário para a API do Google Calendar
export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

/**
 * Cria um cliente OAuth2 configurado.
 * As variáveis de ambiente GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e NEXT_PUBLIC_BASE_URL devem estar definidas.
 */
export function getGoogleOAuth2Client() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_BASE_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXT_PUBLIC_BASE_URL) {
    throw new Error('Variáveis de ambiente do Google não configuradas. Verifique GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e NEXT_PUBLIC_BASE_URL.');
  }

  const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/oauth2callback`;

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

/**
 * Gera a URL de autenticação do Google para o usuário dar consentimento.
 */
export function getGoogleAuthUrl() {
  const oauth2Client = getGoogleOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' é necessário para obter um refresh_token
    prompt: 'consent', // Força a exibição da tela de consentimento para garantir que o refresh_token seja sempre enviado
    scope: [GOOGLE_CALENDAR_SCOPE],
  });
  return url;
}

/**
 * Armazena os tokens de autenticação no Firestore para o usuário logado.
 * Assume um único usuário administrador por enquanto.
 */
export async function storeTokens(tokens: { access_token: string | null | undefined, refresh_token: string | null | undefined, expiry_date: number | null | undefined }) {
  const session = await getSession();
  if (!session?.username) {
    throw new Error('Usuário não autenticado. Não é possível salvar os tokens.');
  }

  // Usamos um ID de documento fixo para o usuário admin, mas poderia ser session.username se houvesse múltiplos usuários
  const userTokenDocId = 'admin_google_tokens'; 
  const tokensDocRef = doc(db, 'user_tokens', userTokenDocId);

  const docSnap = await getDoc(tokensDocRef);

  if (docSnap.exists()) {
    // Se já existem tokens, atualizamos. O refresh_token só é atualizado se um novo for fornecido.
    await updateDoc(tokensDocRef, {
      access_token: tokens.access_token,
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }), // Atualiza o refresh_token apenas se ele existir
      expiry_date: tokens.expiry_date,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Se não existem, criamos um novo documento
    await setDoc(tokensDocRef, {
      userId: session.username,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Recupera os tokens do Firestore para o usuário logado.
 */
export async function getStoredTokens() {
  const session = await getSession();
  if (!session?.username) {
    console.warn('Tentativa de obter tokens sem sessão de usuário.');
    return null;
  }
  
  const userTokenDocId = 'admin_google_tokens';
  const tokensDocRef = doc(db, 'user_tokens', userTokenDocId);
  const docSnap = await getDoc(tokensDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  
  return null;
}

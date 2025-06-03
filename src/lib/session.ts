
'use server';
import 'server-only'; // Garante que este módulo só seja executado no servidor

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const cookieName = 'session';

interface SessionPayload {
  username: string;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
  if (!secretKey) {
    throw new Error('SESSION_SECRET is not defined in environment variables.');
  }
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // Define a expiração do token para 1 dia
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) {
    return null;
  }
  if (!secretKey) {
    console.error('SESSION_SECRET is not defined in environment variables. Cannot decrypt session.');
    return null;
  }
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session:', (error as Error).message);
    return null;
  }
}

export async function createSession(username: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 dia a partir de agora
  const sessionToken = await encrypt({ username, expiresAt });

  cookies().set(cookieName, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookie = cookies().get(cookieName)?.value;
  const session = await decrypt(cookie);
  
  if (session && new Date(session.expiresAt) > new Date()) {
    return session;
  }
  
  // Se a sessão expirou ou não existe, limpa o cookie
  if (cookie) {
     await deleteSession();
  }
  return null;
}

export async function deleteSession() {
  cookies().delete(cookieName);
}

export async function verifySession() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

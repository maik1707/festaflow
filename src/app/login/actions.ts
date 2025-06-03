
'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession } from '@/lib/session';
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Usuário é obrigatório.' }),
  password: z.string().min(1, { message: 'Senha é obrigatória.' }),
});

interface LoginFormState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const result = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: result.error.errors.map((e) => e.message).join(', ') };
  }

  const { username, password } = result.data;

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('ADMIN_USERNAME ou ADMIN_PASSWORD não configurados nas variáveis de ambiente.');
    return { error: 'Erro de configuração do servidor.' };
  }

  if (username === adminUsername && password === adminPassword) {
    try {
      await createSession(username);
      // O redirecionamento deve acontecer no lado do cliente após o estado de sucesso
      // ou podemos usar redirect() aqui, mas o useFormState pode não atualizar a UI antes.
      // Para uma UX melhor, o redirecionamento pode ser feito no componente da página de login.
      // Por enquanto, vamos manter o redirecionamento aqui para simplicidade da action.
    } catch (e) {
      console.error('Erro ao criar sessão:', e);
      return { error: 'Não foi possível iniciar a sessão. Tente novamente.' };
    }
    // Se a sessão foi criada com sucesso, o middleware fará o redirecionamento
    // ou a página de login pode redirecionar ao ver success=true.
    // Para este exemplo, vamos fazer o redirect aqui, o que é padrão para Server Actions.
    redirect('/dashboard');
  } else {
    return { error: 'Usuário ou senha inválidos.' };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}

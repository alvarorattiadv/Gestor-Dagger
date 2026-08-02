import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRoleStore } from '../role';

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('User already registered')) return 'Já existe uma conta com esse e-mail.';
  if (message.toLowerCase().includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (message.includes('Email not confirmed')) return 'Confirme seu e-mail (verifique sua caixa de entrada, inclusive spam) antes de entrar.';
  if (message.toLowerCase().includes('unable to validate email')) return 'E-mail inválido.';
  if (message.toLowerCase().includes('email rate limit exceeded'))
    return 'Muitos cadastros em pouco tempo (limite do Supabase). Peça pro Mestre desligar "Confirm email" nas configurações, ou tente de novo em alguns minutos.';
  return message;
}

export function RoleGate({ children }: { children: ReactNode }) {
  const initialized = useRoleStore((s) => s.initialized);
  const init = useRoleStore((s) => s.init);
  const user = useRoleStore((s) => s.user);
  const profile = useRoleStore((s) => s.profile);
  const role = useRoleStore((s) => s.role);
  const signUp = useRoleStore((s) => s.signUp);
  const signIn = useRoleStore((s) => s.signIn);
  const signOut = useRoleStore((s) => s.signOut);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center">
        <p className="text-sm text-stone-500">Carregando...</p>
      </div>
    );
  }

  if (role) return <>{children}</>;

  async function handleSubmit() {
    setError('');
    setInfo('');
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setSubmitting(true);
    if (mode === 'signup') {
      const result = await signUp(email, password, displayName);
      setSubmitting(false);
      if (result.error) {
        setError(translateAuthError(result.error));
        return;
      }
      if (result.needsConfirmation) {
        setInfo('Conta criada! Verifique seu e-mail (inclusive spam) e clique no link de confirmação, depois volte aqui e entre.');
        setMode('login');
      }
    } else {
      const result = await signIn(email, password);
      setSubmitting(false);
      if (result.error) {
        setError(translateAuthError(result.error));
      }
    }
  }

  // Logado, mas ainda sem perfil aprovado.
  if (user && (!profile || profile.status !== 'approved')) {
    const status = profile?.status ?? 'pending';
    return (
      <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-3 text-center">
          {status === 'rejected' ? (
            <>
              <h1 className="text-lg font-bold text-stone-900">Acesso não liberado</h1>
              <p className="text-sm text-stone-500">O Mestre não aprovou este pedido de acesso. Fale com ele se achar que isso é um engano.</p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-stone-900">Aguardando aprovação</h1>
              <p className="text-sm text-stone-500">
                Sua conta foi criada. Avise o Mestre — ele precisa aprovar seu acesso na aba Grupo antes de você entrar na campanha.
              </p>
            </>
          )}
          <button onClick={signOut} className="text-xs text-stone-500 hover:underline pt-2">
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-lg font-bold text-stone-900">{mode === 'signup' ? 'Criar conta' : 'Entrar na campanha'}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {mode === 'signup' ? 'Peça acesso pra jogar — o Mestre precisa aprovar depois.' : 'Entre com sua conta.'}
          </p>
        </div>

        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => {
              setMode('login');
              setError('');
              setInfo('');
            }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
              setInfo('');
            }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
            }`}
          >
            Criar conta
          </button>
        </div>

        <div className="space-y-2">
          {mode === 'signup' && (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome (ou do personagem)"
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Senha"
            className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        {info && <p className="text-xs text-emerald-700">{info}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-violet-700 text-white font-medium hover:bg-violet-800 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Aguarde...' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

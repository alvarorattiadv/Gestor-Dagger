import { useState } from 'react';
import type { ReactNode } from 'react';
import { GM_PASSWORD, useRoleStore } from '../role';

export function RoleGate({ children }: { children: ReactNode }) {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (role) return <>{children}</>;

  function handleGmSubmit() {
    if (password === GM_PASSWORD) {
      setRole('gm');
    } else {
      setError('Senha incorreta.');
    }
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4 text-center">
        <h1 className="text-lg font-bold text-stone-900">Quem é você?</h1>
        <p className="text-sm text-stone-500">Isso define o que você vai ver e poder fazer na campanha.</p>

        {!asking ? (
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setAsking(true)}
              className="w-full py-2.5 rounded-md bg-violet-700 text-white font-medium hover:bg-violet-800 transition-colors"
            >
              🎲 Sou o Mestre
            </button>
            <button
              onClick={() => setRole('player')}
              className="w-full py-2.5 rounded-md bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
            >
              ⚔️ Sou Jogador
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-2 text-left">
            <label className="text-xs font-medium text-stone-600">Senha do Mestre</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleGmSubmit()}
              className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleGmSubmit}
                className="flex-1 py-2 rounded-md bg-violet-700 text-white text-sm font-medium hover:bg-violet-800 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setAsking(false);
                  setPassword('');
                  setError('');
                }}
                className="px-3 py-2 rounded-md border border-stone-300 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

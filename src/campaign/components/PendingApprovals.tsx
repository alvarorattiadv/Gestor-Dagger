import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { SmallButton } from './SmallButton';

interface PendingProfile {
  id: string;
  display_name: string;
  created_at: string;
}

export function PendingApprovals() {
  const [pending, setPending] = useState<PendingProfile[] | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) {
      setError(error.message);
      return;
    }
    setPending(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id: string) {
    setBusyId(id);
    const { error } = await supabase.rpc('approve_player', { p_user_id: id, p_character_id: null });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  async function handleReject(id: string) {
    setBusyId(id);
    const { error } = await supabase.rpc('reject_player', { p_user_id: id });
    setBusyId(null);
    if (error) {
      setError(error.message);
      return;
    }
    load();
  }

  if (pending === null) return null;
  if (pending.length === 0 && !error) return null;

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-bold text-violet-900">Pedidos de acesso pendentes</h3>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        {pending.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
            <span className="text-sm text-stone-800">{p.display_name || '(sem nome)'}</span>
            <div className="flex gap-2 shrink-0">
              <SmallButton onClick={() => handleApprove(p.id)} disabled={busyId === p.id}>
                Aprovar
              </SmallButton>
              <SmallButton variant="danger" onClick={() => handleReject(p.id)} disabled={busyId === p.id}>
                Recusar
              </SmallButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

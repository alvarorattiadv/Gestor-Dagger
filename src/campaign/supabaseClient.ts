import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).',
  );
}

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', anonKey ?? 'placeholder');

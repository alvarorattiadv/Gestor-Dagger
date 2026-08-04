import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { useRoleStore } from '../role';

type DualityTag = 'hope' | 'fear' | 'critico';
type D20Tag = 'falha-critica' | 'sucesso-critico' | 'normal';

interface DualityRoll {
  id: string;
  name: string;
  kind: 'duality';
  blue: number;
  red: number;
  total: number;
  tag: DualityTag;
}

interface D20Roll {
  id: string;
  name: string;
  kind: 'd20';
  value: number;
  tag: D20Tag;
}

type RollPayload = DualityRoll | D20Roll;

const ROLL_CHANNEL = 'dice-rolls';
const TOAST_LIFETIME_MS = 5200;
const SPIN_DURATION_MS = 700;
const SPIN_TICK_MS = 60;

function rollDuality(name: string): DualityRoll {
  const blue = 1 + Math.floor(Math.random() * 12);
  const red = 1 + Math.floor(Math.random() * 12);
  const tag: DualityTag = blue === red ? 'critico' : red > blue ? 'fear' : 'hope';
  return { id: crypto.randomUUID(), name, kind: 'duality', blue, red, total: blue + red, tag };
}

function rollD20(name: string): D20Roll {
  const value = 1 + Math.floor(Math.random() * 20);
  const tag: D20Tag = value === 1 ? 'falha-critica' : value === 20 ? 'sucesso-critico' : 'normal';
  return { id: crypto.randomUUID(), name, kind: 'd20', value, tag };
}

export function DiceRoller() {
  const role = useRoleStore((s) => s.role);
  const displayName = useRoleStore((s) => s.profile?.display_name);
  const [rolls, setRolls] = useState<RollPayload[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(ROLL_CHANNEL, { config: { broadcast: { self: true } } });
    channel
      .on('broadcast', { event: 'roll' }, ({ payload }) => {
        const roll = payload as RollPayload;
        setRolls((prev) => [...prev, roll]);
        setTimeout(() => setRolls((prev) => prev.filter((r) => r.id !== roll.id)), TOAST_LIFETIME_MS);
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  function handleRoll() {
    const name = displayName || (role === 'gm' ? 'Mestre' : 'Jogador');
    const roll = role === 'gm' ? rollD20(name) : rollDuality(name);
    channelRef.current?.send({ type: 'broadcast', event: 'roll', payload: roll });
  }

  return (
    <>
      <button
        onClick={handleRoll}
        title={role === 'gm' ? 'Rolar 1d20' : 'Rolar 2d12 (Esperança/Medo)'}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-violet-700 text-white text-2xl shadow-lg hover:bg-violet-800 hover:scale-105 transition-transform flex items-center justify-center"
      >
        🎲
      </button>
      <div className="fixed bottom-24 right-5 z-40 flex flex-col-reverse gap-3 items-end">
        {rolls.map((roll) => (
          <RollToast key={roll.id} roll={roll} />
        ))}
      </div>
    </>
  );
}

function RollToast({ roll }: { roll: RollPayload }) {
  const [settled, setSettled] = useState(false);
  const [display, setDisplay] = useState({ blue: 1, red: 1, value: 1 });

  useEffect(() => {
    const maxFace = roll.kind === 'duality' ? 12 : 20;
    const tick = setInterval(() => {
      setDisplay({
        blue: 1 + Math.floor(Math.random() * maxFace),
        red: 1 + Math.floor(Math.random() * maxFace),
        value: 1 + Math.floor(Math.random() * maxFace),
      });
    }, SPIN_TICK_MS);
    const stop = setTimeout(() => {
      clearInterval(tick);
      setDisplay(roll.kind === 'duality' ? { blue: roll.blue, red: roll.red, value: 0 } : { blue: 0, red: 0, value: roll.value });
      setSettled(true);
    }, SPIN_DURATION_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(stop);
    };
  }, [roll]);

  const resultLabel =
    roll.kind === 'duality'
      ? roll.tag === 'critico'
        ? 'CRÍTICO!'
        : roll.tag === 'fear'
          ? 'Com Medo'
          : 'Com Esperança'
      : roll.tag === 'falha-critica'
        ? 'FALHA CRÍTICA'
        : roll.tag === 'sucesso-critico'
          ? 'SUCESSO CRÍTICO'
          : null;

  const resultColor =
    roll.kind === 'duality'
      ? roll.tag === 'critico'
        ? 'text-amber-600'
        : roll.tag === 'fear'
          ? 'text-red-600'
          : 'text-sky-600'
      : roll.tag === 'falha-critica'
        ? 'text-red-600'
        : roll.tag === 'sucesso-critico'
          ? 'text-amber-600'
          : 'text-stone-700';

  return (
    <div className="pointer-events-auto bg-white border border-stone-200 rounded-xl shadow-lg px-4 py-3 w-56 animate-[toast-in_.2s_ease-out]">
      <p className="text-xs font-semibold text-stone-500 mb-2 truncate">{roll.name} rolou</p>
      {roll.kind === 'duality' ? (
        <div className="flex items-center justify-center gap-2">
          <DieFace value={display.blue} colorClass="bg-sky-500" settled={settled} />
          <span className="text-stone-300 font-bold">+</span>
          <DieFace value={display.red} colorClass="bg-red-600" settled={settled} />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <DieFace value={display.value} colorClass="bg-violet-700" settled={settled} />
        </div>
      )}
      <div className="text-center mt-2 space-y-0.5">
        {roll.kind === 'duality' && <p className="text-lg font-bold text-stone-900">{settled ? roll.total : ''}</p>}
        {resultLabel && (
          <p className={`text-xs font-bold transition-opacity ${resultColor} ${settled ? 'opacity-100' : 'opacity-0'}`}>{resultLabel}</p>
        )}
      </div>
    </div>
  );
}

function DieFace({ value, colorClass, settled }: { value: number; colorClass: string; settled: boolean }) {
  return (
    <div
      className={`w-12 h-12 rounded-lg ${colorClass} text-white font-bold text-lg flex items-center justify-center shadow transition-transform duration-200 ${
        settled ? 'scale-110' : ''
      }`}
    >
      {value}
    </div>
  );
}

import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import type { TemplarMember, TemplarStatus } from '../types';

const SECTIONS: { status: TemplarStatus; title: string; hint: string }[] = [
  { status: 'grao-mestre', title: 'Grão-Mestre Atual', hint: 'Quem lidera a Ordem hoje.' },
  { status: 'secreto', title: 'Templários Conhecidos — Secreto', hint: 'Você (mestre) sabe que são templários; os jogadores não.' },
  { status: 'discreto', title: 'Templários Conhecidos — Discreto', hint: 'É de conhecimento restrito, mas não escondido dos jogadores.' },
  { status: 'suspeito', title: 'Suspeitos pela Party', hint: 'Os jogadores desconfiam, mas não há confirmação.' },
  { status: 'outro', title: 'Outros', hint: 'Membros públicos, falecidos, ou qualquer outro caso.' },
];

export function Templars() {
  const templars = useCampaignStore((s) => s.campaign.templars);
  const cities = useCampaignStore((s) => s.campaign.cities);
  const addTemplar = useCampaignStore((s) => s.addTemplar);
  const updateTemplar = useCampaignStore((s) => s.updateTemplar);
  const removeTemplar = useCampaignStore((s) => s.removeTemplar);
  const setTemplarNotes = useCampaignStore((s) => s.setTemplarNotes);

  function addTo(status: TemplarStatus) {
    addTemplar('', status);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-stone-900">Ordem dos Templários</h2>
        <p className="text-sm text-stone-500">Acompanhe quem manda na Ordem e o que a party já descobriu — ou pensa que descobriu.</p>
      </div>

      {SECTIONS.map((section) => {
        const members = templars.members.filter((m) => m.status === section.status);
        return (
          <div key={section.status} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-800">{section.title}</h3>
                <p className="text-xs text-stone-400">{section.hint}</p>
              </div>
              <button onClick={() => addTo(section.status)} className="text-xs font-medium text-violet-700 hover:underline shrink-0">
                + Adicionar
              </button>
            </div>
            {members.length === 0 && (
              <div className="text-xs text-stone-400 py-3 px-3 bg-white border border-dashed border-stone-300 rounded-lg">Nenhum registro aqui ainda.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member) => (
                <TemplarCard
                  key={member.id}
                  member={member}
                  cities={cities}
                  onUpdate={(patch) => updateTemplar(member.id, (m) => ({ ...m, ...patch }))}
                  onRemove={() => removeTemplar(member.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-stone-800 mb-2">Notas gerais da Ordem</h3>
        <textarea
          value={templars.notes}
          onChange={(e) => setTemplarNotes(e.target.value)}
          placeholder="Hierarquia, história, rituais, sedes conhecidas..."
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm"
          rows={4}
        />
      </div>
    </div>
  );
}

function TemplarCard({
  member,
  cities,
  onUpdate,
  onRemove,
}: {
  member: TemplarMember;
  cities: { id: string; name: string }[];
  onUpdate: (patch: Partial<TemplarMember>) => void;
  onRemove: () => void;
}) {
  const isGM = useRoleStore((s) => s.role === 'gm');
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
      <div className="flex gap-2">
        <input
          value={member.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm font-semibold"
          placeholder="Nome"
        />
        {isGM && (
          <button onClick={onRemove} className="text-xs text-red-600 hover:underline shrink-0 px-1">
            Excluir
          </button>
        )}
      </div>
      <textarea
        value={member.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Notas, cargo, evidências..."
        className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
        rows={2}
      />
      {isGM && (
        <textarea
          value={member.gmSecret}
          onChange={(e) => onUpdate({ gmSecret: e.target.value })}
          placeholder="Segredos do mestre"
          className="w-full border border-amber-300 bg-amber-50 rounded-md px-2 py-1.5 text-sm"
          rows={2}
        />
      )}
      <select
        value={member.cityId ?? ''}
        onChange={(e) => onUpdate({ cityId: e.target.value || undefined })}
        className="w-full border border-stone-300 rounded-md px-2 py-1 text-xs bg-stone-50"
      >
        <option value="">Sem cidade associada</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

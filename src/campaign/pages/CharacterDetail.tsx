import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { useRulesStore } from '../rulesStore';
import type { FeatureText } from '../rulesTypes';
import { deriveCharacterStats, tierForLevel } from '../deriveStats';
import type { Player } from '../types';

const SELECT_CLASS = 'w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-stone-50 disabled:text-stone-500';

export function CharacterDetail() {
  const { characterId } = useParams<{ characterId: string }>();
  const player = useCampaignStore((s) => s.campaign.party.players.find((p) => p.id === characterId));
  const updatePlayer = useCampaignStore((s) => s.updatePlayer);
  const isGM = useRoleStore((s) => s.role === 'gm');
  const userId = useRoleStore((s) => s.user?.id);

  const rules = useRulesStore((s) => s.rules);
  const rulesLoading = useRulesStore((s) => s.loading);
  const rulesError = useRulesStore((s) => s.error);
  const loadRules = useRulesStore((s) => s.loadRules);
  const claimedCards = useRulesStore((s) => s.claimedCards);
  const claimCard = useRulesStore((s) => s.claimCard);
  const releaseCard = useRulesStore((s) => s.releaseCard);
  const [cardError, setCardError] = useState('');
  const [busyCardId, setBusyCardId] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  if (!player || !characterId) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="mb-3">Personagem não encontrado.</p>
        <Link to="/campanha/grupo" className="text-violet-700 hover:underline text-sm">
          Voltar para Grupo
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(userId) && player.linkedUserId === userId;
  const canEdit = isGM || isOwner;

  if (rulesLoading || !rules) {
    return <div className="text-center py-16 text-stone-500 text-sm">Carregando regras de Daggerheart...</div>;
  }
  if (rulesError) {
    return <div className="text-center py-16 text-red-600 text-sm">Falha ao carregar regras: {rulesError}</div>;
  }

  const selectedClass = rules.classes.find((c) => c.id === player.classId);
  const subclassOptions = rules.subclasses.filter((s) => s.classId === player.classId);
  const selectedSubclass = rules.subclasses.find((s) => s.id === player.subclassId);
  const classDomains = selectedClass ? [selectedClass.domain1, selectedClass.domain2] : [];
  const tier = tierForLevel(player.level);

  const availableCards = rules.domainCards
    .filter((c) => classDomains.includes(c.domain) && c.level <= player.level)
    .sort((a, b) => a.level - b.level || a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));

  const myCardIds = new Set(Object.entries(claimedCards).filter(([, charId]) => charId === player.id).map(([cardId]) => cardId));
  const myCards = rules.domainCards.filter((c) => myCardIds.has(c.id));

  async function handleClaim(cardId: string) {
    if (!player) return;
    setCardError('');
    setBusyCardId(cardId);
    const result = await claimCard(player.id, cardId);
    setBusyCardId(null);
    if (!result.ok && result.error) setCardError(result.error);
  }

  async function handleRelease(cardId: string) {
    if (!player) return;
    setBusyCardId(cardId);
    await releaseCard(player.id, cardId);
    setBusyCardId(null);
  }

  function handleClassChange(classId: string) {
    if (!player) return;
    const stillValidSubclass = rules?.subclasses.some((s) => s.id === player.subclassId && s.classId === classId);
    updatePlayer(player.id, (p) => ({ ...p, classId: classId || undefined, subclassId: stillValidSubclass ? p.subclassId : undefined }));
  }

  const primaryWeapons = rules.weapons.filter((w) => w.tableType === 'primary' && w.tier <= tier);
  const secondaryWeapons = rules.weapons.filter((w) => w.tableType === 'secondary' && w.tier <= tier);
  const armorOptions = rules.armors.filter((a) => a.tier <= tier);
  const selectedPrimary = rules.weapons.find((w) => w.id === player.primaryWeaponId);
  const selectedSecondary = rules.weapons.find((w) => w.id === player.secondaryWeaponId);
  const selectedArmor = rules.armors.find((a) => a.id === player.armorId);
  const selectedAncestry = rules.ancestries.find((a) => a.id === player.ancestryId);
  const selectedCommunity = rules.communities.find((c) => c.id === player.communityId);
  const hasBareBones = myCards.some((c) => c.name === 'BARE BONES');
  const stats = deriveCharacterStats(player, selectedClass, selectedArmor, selectedAncestry, selectedSubclass, hasBareBones);

  function setManual(field: keyof Pick<Player, 'bonusEvasion' | 'bonusHitPoints' | 'bonusStress' | 'bonusMajorThreshold' | 'bonusSevereThreshold'>, value: number) {
    if (!player) return;
    updatePlayer(player.id, (p) => ({ ...p, [field]: value }));
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Link to="/campanha/grupo" className="text-xs text-stone-500 hover:underline">
          ← Grupo
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-stone-900">{player.charName || 'Novo Personagem'}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
            Nível {player.level} · Tier {tier}
          </span>
        </div>
        {selectedClass && (
          <p className="text-sm text-stone-500">
            {selectedClass.name}
            {selectedSubclass ? ` — ${selectedSubclass.name}` : ''}
          </p>
        )}
      </div>

      {canEdit && (
        <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-stone-600 shrink-0">Nível</label>
            <input
              type="number"
              min={1}
              max={10}
              value={player.level}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, level: Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)) }))}
              className="w-20 border border-stone-300 rounded-md px-2 py-1 text-sm"
            />
            <label className="text-xs font-medium text-stone-600 shrink-0 ml-2">Proficiência</label>
            <input
              type="number"
              min={1}
              value={player.proficiency}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, proficiency: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
              className="w-20 border border-stone-300 rounded-md px-2 py-1 text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-600 mb-1">Traços</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <TraitInput label="Agilidade" value={player.traitAgility ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitAgility: v }))} />
              <TraitInput label="Força" value={player.traitStrength ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitStrength: v }))} />
              <TraitInput label="Finesse" value={player.traitFinesse ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitFinesse: v }))} />
              <TraitInput label="Instinto" value={player.traitInstinct ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitInstinct: v }))} />
              <TraitInput label="Presença" value={player.traitPresence ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitPresence: v }))} />
              <TraitInput label="Conhecimento" value={player.traitKnowledge ?? 0} onChange={(v) => updatePlayer(player.id, (p) => ({ ...p, traitKnowledge: v }))} />
            </div>
          </div>
        </div>
      )}

      {/* Resumo calculado */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-violet-900 mb-3">Resumo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <StatTile label="Evasão" value={stats.evasion.total} />
          <StatTile label="Pontos de Vida" value={stats.hitPoints.total} />
          <StatTile label="Stress" value={stats.stressSlots.total} />
          <StatTile label="Armadura" value={stats.armorScore} />
        </div>
        <p className="text-xs text-stone-600 mb-1">
          Limiares de dano — Maior: <strong>{stats.majorThreshold.total}</strong>, Severo: <strong>{stats.severeThreshold.total}</strong>
          {stats.majorThreshold.source === 'unarmored' && <span className="text-stone-400 italic"> (sem armadura equipada)</span>}
          {stats.majorThreshold.source === 'bare-bones' && <span className="text-violet-600 italic"> (carta Bare Bones, sem armadura)</span>}
        </p>
        {stats.armorScoreNote && <p className="text-xs text-amber-700 mb-3">{stats.armorScoreNote}</p>}
        <details className="text-xs text-stone-600">
          <summary className="cursor-pointer font-semibold text-violet-800">Como isso foi calculado / ajustes manuais</summary>
          <div className="mt-2 space-y-3">
            <div>
              <p className="font-semibold text-stone-700">
                Evasão = {stats.evasion.base} (classe) {fmtSigned(stats.evasion.armor)} (armadura) {fmtSigned(stats.evasion.ancestry)} (ancestralidade){' '}
                {fmtSigned(stats.evasion.subclassFoundation)} (fundação da subclasse) {fmtSigned(stats.evasion.manual)} (manual)
              </p>
              <p className="font-semibold text-stone-700 mt-1">
                PV = {stats.hitPoints.base} (classe) {fmtSigned(stats.hitPoints.ancestry)} (ancestralidade) {fmtSigned(stats.hitPoints.manual)} (manual)
              </p>
              <p className="font-semibold text-stone-700 mt-1">
                Limiar Maior = {stats.majorThreshold.base} (base) {fmtSigned(stats.majorThreshold.level)} (nível) {fmtSigned(stats.majorThreshold.autoBonus)} (subclasse /
                ancestralidade) {fmtSigned(stats.majorThreshold.manual)} (manual)
              </p>
              <p className="font-semibold text-stone-700 mt-1">
                Limiar Severo = {stats.severeThreshold.base} (base) {fmtSigned(stats.severeThreshold.level)} (nível) {fmtSigned(stats.severeThreshold.autoBonus)} (subclasse /
                ancestralidade) {fmtSigned(stats.severeThreshold.manual)} (manual)
              </p>
            </div>
            <p className="text-stone-500">
              O cálculo automático cobre classe, armadura, ancestralidade e a fundação da subclasse (sempre ativa assim que você escolhe a subclasse).
              Bônus que exigem uma escolha do jogador (como a carta Vitality do domínio Blade, que deixa escolher 2 de 3 benefícios) ou dependem de um
              traço que a ficha ainda não rastreia (como Proficiência ou Força) entram como ajuste manual abaixo.
            </p>
            {stats.reminders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-1">
                <p className="font-semibold text-amber-800">Lembretes — confira se já foram pegos e ajuste manualmente se sim:</p>
                {stats.reminders.map((r) => (
                  <p key={r} className="text-amber-800">
                    • {r}
                  </p>
                ))}
              </div>
            )}
            {canEdit && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <ManualAdjustInput label="Evasão manual" value={player.bonusEvasion ?? 0} onChange={(v) => setManual('bonusEvasion', v)} />
                <ManualAdjustInput label="PV manual" value={player.bonusHitPoints ?? 0} onChange={(v) => setManual('bonusHitPoints', v)} />
                <ManualAdjustInput label="Stress manual" value={player.bonusStress ?? 0} onChange={(v) => setManual('bonusStress', v)} />
                <ManualAdjustInput label="Limiar Maior manual" value={player.bonusMajorThreshold ?? 0} onChange={(v) => setManual('bonusMajorThreshold', v)} />
                <ManualAdjustInput label="Limiar Severo manual" value={player.bonusSevereThreshold ?? 0} onChange={(v) => setManual('bonusSevereThreshold', v)} />
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Ancestralidade */}
      <Section title="Ancestralidade">
        <select
          value={player.ancestryId ?? ''}
          onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, ancestryId: e.target.value || undefined }))}
          disabled={!canEdit}
          className={SELECT_CLASS}
        >
          <option value="">Escolher...</option>
          {rules.ancestries.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {selectedAncestry && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-stone-500">{selectedAncestry.description}</p>
            {selectedAncestry.features.map((f: FeatureText) => (
              <FeatureRow key={f.name} feature={f} />
            ))}
          </div>
        )}
      </Section>

      {/* Comunidade */}
      <Section title="Comunidade">
        <select
          value={player.communityId ?? ''}
          onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, communityId: e.target.value || undefined }))}
          disabled={!canEdit}
          className={SELECT_CLASS}
        >
          <option value="">Escolher...</option>
          {rules.communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {selectedCommunity && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-stone-500">{selectedCommunity.description}</p>
            <p className="text-xs text-stone-400 italic">{selectedCommunity.adjectives.join(', ')}</p>
            <FeatureRow feature={selectedCommunity.feature} />
          </div>
        )}
      </Section>

      {/* Classe e Subclasse */}
      <Section title="Classe">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select value={player.classId ?? ''} onChange={(e) => handleClassChange(e.target.value)} disabled={!canEdit} className={SELECT_CLASS}>
            <option value="">Escolher classe...</option>
            {rules.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={player.subclassId ?? ''}
            onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, subclassId: e.target.value || undefined }))}
            disabled={!canEdit || !player.classId}
            className={SELECT_CLASS}
          >
            <option value="">Escolher subclasse...</option>
            {subclassOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-xs text-stone-500">{selectedClass.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-stone-600">
              <span>
                <strong>Domínios:</strong> {selectedClass.domain1} / {selectedClass.domain2}
              </span>
              <span>
                <strong>Evasão inicial:</strong> {selectedClass.startingEvasion}
              </span>
              <span>
                <strong>PV inicial:</strong> {selectedClass.startingHitPoints}
              </span>
            </div>
            <p className="text-xs text-stone-600">
              <strong>Itens iniciais:</strong> {selectedClass.classItems}
            </p>
            <FeatureRow feature={{ name: `${selectedClass.hopeFeature.name} (${selectedClass.hopeFeature.cost} Esperança)`, text: selectedClass.hopeFeature.text }} />
            {selectedClass.classFeatures.map((f) => (
              <FeatureRow key={f.name} feature={f} />
            ))}
          </div>
        )}

        {selectedSubclass && (
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-sm">
            <p className="text-xs text-stone-500">{selectedSubclass.blurb}</p>
            {selectedSubclass.spellcastTrait && (
              <p className="text-xs text-stone-600">
                <strong>Traço de conjuração:</strong> {selectedSubclass.spellcastTrait}
              </p>
            )}
            <p className="text-xs font-semibold text-stone-700">Fundação</p>
            {selectedSubclass.foundation.map((f) => (
              <FeatureRow key={f.name} feature={f} />
            ))}
            <details className="text-xs text-stone-500">
              <summary className="cursor-pointer font-semibold text-stone-600">Especialização e Maestria (níveis futuros)</summary>
              <div className="mt-2 space-y-2">
                {selectedSubclass.specialization.map((f) => (
                  <FeatureRow key={f.name} feature={f} />
                ))}
                {selectedSubclass.mastery.map((f) => (
                  <FeatureRow key={f.name} feature={f} />
                ))}
              </div>
            </details>
          </div>
        )}
      </Section>

      {/* Equipamento */}
      <Section title="Equipamento">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-stone-600">Arma primária</label>
            <select
              value={player.primaryWeaponId ?? ''}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, primaryWeaponId: e.target.value || undefined }))}
              disabled={!canEdit}
              className={SELECT_CLASS}
            >
              <option value="">Escolher...</option>
              {primaryWeapons.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Tier {w.tier}, {w.trait}, {w.range}, {w.damage})
                </option>
              ))}
            </select>
            {selectedPrimary?.feature && <p className="text-xs text-stone-500 mt-1">{selectedPrimary.feature}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600">Arma secundária</label>
            <select
              value={player.secondaryWeaponId ?? ''}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, secondaryWeaponId: e.target.value || undefined }))}
              disabled={!canEdit}
              className={SELECT_CLASS}
            >
              <option value="">Escolher...</option>
              {secondaryWeapons.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Tier {w.tier}, {w.trait}, {w.range}, {w.damage})
                </option>
              ))}
            </select>
            {selectedSecondary?.feature && <p className="text-xs text-stone-500 mt-1">{selectedSecondary.feature}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600">Armadura</label>
            <select
              value={player.armorId ?? ''}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, armorId: e.target.value || undefined }))}
              disabled={!canEdit}
              className={SELECT_CLASS}
            >
              <option value="">Escolher...</option>
              {armorOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Tier {a.tier}, limiares {a.majorThreshold}/{a.severeThreshold}, score {a.baseScore})
                </option>
              ))}
            </select>
            {selectedArmor?.feature && <p className="text-xs text-stone-500 mt-1">{selectedArmor.feature}</p>}
          </div>
        </div>
      </Section>

      {/* Cartas de domínio */}
      <Section title={`Cartas de Domínio (${myCards.length})`}>
        {!player.classId && <p className="text-xs text-stone-400">Escolha uma classe para ver as cartas disponíveis.</p>}
        {myCards.length > 0 && (
          <div className="space-y-2 mb-3">
            {myCards.map((c) => (
              <div key={c.id} className="border border-violet-200 bg-violet-50 rounded-lg p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {c.name} <span className="text-xs font-normal text-stone-500">— Nível {c.level} · {c.domain} · {c.type} · Custo {c.recallCost}</span>
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5 whitespace-pre-line">{c.description}</p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleRelease(c.id)}
                      disabled={busyCardId === c.id}
                      className="text-xs text-red-600 hover:underline shrink-0"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {cardError && <p className="text-xs text-red-600 mb-2">{cardError}</p>}
        {canEdit && player.classId && (
          <details className="text-xs">
            <summary className="cursor-pointer font-semibold text-stone-600">
              Escolher carta ({classDomains.join(' / ')}, nível {player.level} ou menor)
            </summary>
            <div className="mt-2 space-y-1.5 max-h-96 overflow-y-auto">
              {availableCards.map((c) => {
                const claimedBy = claimedCards[c.id];
                const isMine = claimedBy === player.id;
                const isTaken = Boolean(claimedBy) && !isMine;
                return (
                  <div key={c.id} className={`border rounded-lg p-2 ${isTaken ? 'border-stone-200 bg-stone-50 opacity-60' : 'border-stone-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {c.name} <span className="text-xs font-normal text-stone-500">— Nível {c.level} · {c.domain} · {c.type} · Custo {c.recallCost}</span>
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5 whitespace-pre-line">{c.description}</p>
                      </div>
                      {!isMine && (
                        <button
                          onClick={() => handleClaim(c.id)}
                          disabled={isTaken || busyCardId === c.id}
                          className="text-xs text-violet-700 hover:underline shrink-0 disabled:text-stone-400 disabled:no-underline"
                        >
                          {isTaken ? 'Já escolhida' : 'Pegar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <h3 className="text-sm font-bold text-stone-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function FeatureRow({ feature }: { feature: FeatureText }) {
  return (
    <p className="text-xs text-stone-600">
      <strong className="text-stone-800">{feature.name}:</strong> {feature.text}
    </p>
  );
}

function fmtSigned(n: number): string {
  if (n === 0) return '+0';
  return n > 0 ? `+${n}` : `${n}`;
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-violet-200 rounded-lg p-2 text-center">
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-[11px] text-stone-500">{label}</div>
    </div>
  );
}

function ManualAdjustInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[11px] text-stone-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="border border-stone-300 rounded-md px-2 py-1 text-sm w-full"
      />
    </label>
  );
}

function TraitInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col items-center gap-0.5 bg-stone-50 border border-stone-200 rounded-md py-1.5">
      <span className="text-[10px] text-stone-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-12 text-center border-0 bg-transparent text-sm font-semibold text-stone-800 focus:outline-none"
      />
    </label>
  );
}

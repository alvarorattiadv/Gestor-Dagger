import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCampaignStore } from '../store';
import { useRoleStore } from '../role';
import { useRulesStore, MAX_LOADOUT_CARDS } from '../rulesStore';
import type { AdvancementOption, CharacterAdvancement, FeatureText } from '../rulesTypes';
import { GENERAL_FIELD_DISABLED_CLASS } from '../components/PlayerNotesField';
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
  const setCardLoadout = useRulesStore((s) => s.setCardLoadout);
  const advancementsByCharacter = useRulesStore((s) => s.advancementsByCharacter);
  const loadAdvancements = useRulesStore((s) => s.loadAdvancements);
  const addAdvancement = useRulesStore((s) => s.addAdvancement);
  const removeAdvancement = useRulesStore((s) => s.removeAdvancement);
  const [cardError, setCardError] = useState('');
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [advError, setAdvError] = useState('');

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  useEffect(() => {
    if (characterId) loadAdvancements(characterId);
  }, [characterId, loadAdvancements]);

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
  const myAdvancements = advancementsByCharacter[player.id] ?? [];
  const hasMulticlassed = myAdvancements.some((a) => a.optionId === 'multiclass');
  const multiclassClassOptions = rules.classes.filter((c) => c.id !== player.classId);
  const selectedMulticlassClass = hasMulticlassed ? rules.classes.find((c) => c.id === player.multiclassClassId) : undefined;
  const multiclassSubclassOptions = selectedMulticlassClass ? rules.subclasses.filter((s) => s.classId === selectedMulticlassClass.id) : [];
  const selectedMulticlassSubclass = hasMulticlassed ? rules.subclasses.find((s) => s.id === player.multiclassSubclassId) : undefined;
  const multiclassDomainOptions = selectedMulticlassClass ? [selectedMulticlassClass.domain1, selectedMulticlassClass.domain2] : [];
  // Multiclass domain cards are capped at half the character's level (rounded up), not the full level.
  const multiclassCardLevelCap = Math.ceil(player.level / 2);

  const availableCards = rules.domainCards
    .filter((c) => {
      if (classDomains.includes(c.domain) && c.level <= player.level) return true;
      if (hasMulticlassed && player.multiclassDomainId && c.domain === player.multiclassDomainId && c.level <= multiclassCardLevelCap) return true;
      return false;
    })
    .sort((a, b) => a.level - b.level || a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));

  const myCardIds = new Set(
    Object.entries(claimedCards)
      .filter(([, info]) => info.characterId === player.id)
      .map(([cardId]) => cardId),
  );
  const myCards = rules.domainCards.filter((c) => myCardIds.has(c.id));
  const activeCardCount = myCards.filter((c) => claimedCards[c.id]?.inLoadout).length;
  // 2 cards at creation + 1 guaranteed per level-up (so level+1 total) + one more per "extra domain card" advancement taken.
  const extraCardAdvancements = myAdvancements.filter((a) => a.optionId === 'extra-domain-card').length;
  const maxDomainCards = player.level + 1 + extraCardAdvancements;

  async function handleClaim(cardId: string) {
    if (!player) return;
    if (myCards.length >= maxDomainCards) {
      setCardError(
        `Esse personagem já tem o máximo de cartas pro nível atual (${maxDomainCards}: 2 da criação + 1 por nível + avanços de "carta adicional"). Suba de nível ou registre esse avanço pra liberar mais uma.`,
      );
      return;
    }
    setCardError('');
    setBusyCardId(cardId);
    const result = await claimCard(player.id, cardId, activeCardCount < MAX_LOADOUT_CARDS);
    setBusyCardId(null);
    if (!result.ok && result.error) setCardError(result.error);
  }

  async function handleRelease(cardId: string) {
    if (!player) return;
    setBusyCardId(cardId);
    await releaseCard(player.id, cardId);
    setBusyCardId(null);
  }

  async function handleToggleLoadout(cardId: string, nextInLoadout: boolean) {
    if (!player) return;
    if (nextInLoadout && activeCardCount >= MAX_LOADOUT_CARDS) {
      setCardError(`Só é possível ter ${MAX_LOADOUT_CARDS} cartas ativas ao mesmo tempo. Mande outra pro cofre primeiro.`);
      return;
    }
    setCardError('');
    setBusyCardId(cardId);
    await setCardLoadout(player.id, cardId, nextInLoadout);
    setBusyCardId(null);
  }

  function handleClassChange(classId: string) {
    if (!player) return;
    const stillValidSubclass = rules?.subclasses.some((s) => s.id === player.subclassId && s.classId === classId);
    updatePlayer(player.id, (p) => ({ ...p, classId: classId || undefined, subclassId: stillValidSubclass ? p.subclassId : undefined }));
  }

  function handleMulticlassChange(classId: string) {
    if (!player) return;
    const stillValidSubclass = rules?.subclasses.some((s) => s.id === player.multiclassSubclassId && s.classId === classId);
    updatePlayer(player.id, (p) => ({
      ...p,
      multiclassClassId: classId || undefined,
      multiclassSubclassId: stillValidSubclass ? p.multiclassSubclassId : undefined,
      multiclassDomainId: undefined,
    }));
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
  const stats = deriveCharacterStats(player, selectedClass, selectedArmor, selectedAncestry, selectedSubclass, hasBareBones, myAdvancements, selectedMulticlassSubclass);

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
                {fmtSigned(stats.evasion.subclass)} (subclasse) {fmtSigned(stats.evasion.advancements)} (avanços) {fmtSigned(stats.evasion.manual)} (manual)
              </p>
              <p className="font-semibold text-stone-700 mt-1">
                PV = {stats.hitPoints.base} (classe) {fmtSigned(stats.hitPoints.ancestry)} (ancestralidade) {fmtSigned(stats.hitPoints.advancements)} (avanços){' '}
                {fmtSigned(stats.hitPoints.manual)} (manual)
              </p>
              <p className="font-semibold text-stone-700 mt-1">
                Stress = {fmtSigned(stats.stressSlots.ancestry)} (ancestralidade) {fmtSigned(stats.stressSlots.advancements)} (avanços) {fmtSigned(stats.stressSlots.manual)}{' '}
                (manual)
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
              O cálculo automático cobre classe, armadura, ancestralidade, subclasse (fundação sempre ativa; especialização e maestria só depois de
              você registrar o avanço correspondente lá embaixo) e os avanços de nível já registrados. Bônus que exigem uma escolha específica do
              jogador (como a carta Vitality do domínio Blade, que deixa escolher 2 de 3 benefícios) entram como ajuste manual abaixo.
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

      {/* Rastreio de sessão */}
      <Section title="Rastreio de Sessão">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PipTracker
            label="Pontos de Vida"
            total={stats.hitPoints.total}
            marked={player.markedHitPoints ?? 0}
            onToggle={(i) => updatePlayer(player.id, (p) => ({ ...p, markedHitPoints: togglePip(i, p.markedHitPoints ?? 0) }))}
            colorClass="bg-red-500 border-red-600"
            disabled={!canEdit}
          />
          <PipTracker
            label="Stress"
            total={stats.stressSlots.total}
            marked={player.markedStress ?? 0}
            onToggle={(i) => updatePlayer(player.id, (p) => ({ ...p, markedStress: togglePip(i, p.markedStress ?? 0) }))}
            colorClass="bg-amber-500 border-amber-600"
            disabled={!canEdit}
          />
          <PipTracker
            label="Espaços de Armadura"
            total={stats.armorScore}
            marked={player.markedArmorSlots ?? 0}
            onToggle={(i) => updatePlayer(player.id, (p) => ({ ...p, markedArmorSlots: togglePip(i, p.markedArmorSlots ?? 0) }))}
            colorClass="bg-stone-500 border-stone-600"
            disabled={!canEdit}
          />
          <div>
            <PipTracker
              label="Esperança"
              total={player.hopeMax ?? 6}
              marked={player.hope ?? 2}
              onToggle={(i) => updatePlayer(player.id, (p) => ({ ...p, hope: togglePip(i, p.hope ?? 2) }))}
              colorClass="bg-sky-500 border-sky-600"
              disabled={!canEdit}
            />
            {canEdit && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-stone-400">Máximo:</span>
                <input
                  type="number"
                  min={1}
                  value={player.hopeMax ?? 6}
                  onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, hopeMax: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                  className="w-14 border border-stone-300 rounded-md px-1.5 py-0.5 text-xs"
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Experiências */}
      <Section title={`Experiências (${(player.experiences ?? []).length})`}>
        <div className="space-y-2">
          {(player.experiences ?? []).map((exp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={exp.name}
                onChange={(e) =>
                  updatePlayer(player.id, (p) => ({
                    ...p,
                    experiences: (p.experiences ?? []).map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)),
                  }))
                }
                disabled={!canEdit}
                placeholder="Ex: Atirador de Elite"
                className={`flex-1 border border-stone-300 rounded-md px-2 py-1.5 text-sm ${GENERAL_FIELD_DISABLED_CLASS}`}
              />
              <input
                type="number"
                value={exp.modifier}
                onChange={(e) =>
                  updatePlayer(player.id, (p) => ({
                    ...p,
                    experiences: (p.experiences ?? []).map((x, i) => (i === idx ? { ...x, modifier: parseInt(e.target.value, 10) || 0 } : x)),
                  }))
                }
                disabled={!canEdit}
                className="w-16 border border-stone-300 rounded-md px-2 py-1.5 text-sm text-center"
              />
              {canEdit && (
                <button
                  onClick={() => updatePlayer(player.id, (p) => ({ ...p, experiences: (p.experiences ?? []).filter((_, i) => i !== idx) }))}
                  className="text-xs text-red-600 hover:underline shrink-0"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          {(player.experiences ?? []).length === 0 && <p className="text-xs text-stone-400">Nenhuma Experiência ainda.</p>}
          {canEdit && (
            <button
              onClick={() => updatePlayer(player.id, (p) => ({ ...p, experiences: [...(p.experiences ?? []), { name: '', modifier: 2 }] }))}
              className="text-xs font-medium text-violet-700 hover:underline"
            >
              + Experiência
            </button>
          )}
        </div>
      </Section>

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

      {/* Multiclasse */}
      {hasMulticlassed && (
        <Section title="Multiclasse">
          <p className="text-xs text-stone-500 mb-2">
            Registrado como avanço de nível. Escolha a classe adicional, o único domínio dela que você passa a ter acesso, e uma subclasse (pra pegar a
            fundação). <strong>Não ganha a habilidade de Esperança dessa classe</strong> — só a original conta.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={player.multiclassClassId ?? ''} onChange={(e) => handleMulticlassChange(e.target.value)} disabled={!canEdit} className={SELECT_CLASS}>
              <option value="">Escolher classe adicional...</option>
              {multiclassClassOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={player.multiclassDomainId ?? ''}
              onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, multiclassDomainId: e.target.value || undefined }))}
              disabled={!canEdit || !selectedMulticlassClass}
              className={SELECT_CLASS}
            >
              <option value="">Escolher domínio...</option>
              {multiclassDomainOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <select
            value={player.multiclassSubclassId ?? ''}
            onChange={(e) => updatePlayer(player.id, (p) => ({ ...p, multiclassSubclassId: e.target.value || undefined }))}
            disabled={!canEdit || !selectedMulticlassClass}
            className={`${SELECT_CLASS} mt-2`}
          >
            <option value="">Escolher subclasse (pra fundação)...</option>
            {multiclassSubclassOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {selectedMulticlassClass && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-xs text-stone-500">{selectedMulticlassClass.description}</p>
              <p className="text-xs font-semibold text-stone-700">Feature de classe</p>
              {selectedMulticlassClass.classFeatures.map((f) => (
                <FeatureRow key={f.name} feature={f} />
              ))}
            </div>
          )}
          {selectedMulticlassSubclass && (
            <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-sm">
              <p className="text-xs text-stone-500">{selectedMulticlassSubclass.blurb}</p>
              <p className="text-xs font-semibold text-stone-700">Fundação</p>
              {selectedMulticlassSubclass.foundation.map((f) => (
                <FeatureRow key={f.name} feature={f} />
              ))}
            </div>
          )}
        </Section>
      )}

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
      <Section title={`Cartas de Domínio (${myCards.length}/${maxDomainCards}) — ${activeCardCount}/${MAX_LOADOUT_CARDS} ativas`}>
        {!player.classId && <p className="text-xs text-stone-400">Escolha uma classe para ver as cartas disponíveis.</p>}
        {myCards.length > 0 && (
          <div className="space-y-2 mb-3">
            {myCards.map((c) => {
              const inLoadout = claimedCards[c.id]?.inLoadout ?? true;
              return (
                <div key={c.id} className={`border rounded-lg p-2 ${inLoadout ? 'border-violet-200 bg-violet-50' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {c.name} <span className="text-xs font-normal text-stone-500">— Nível {c.level} · {c.domain} · {c.type} · Custo {c.recallCost}</span>
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5 whitespace-pre-line">{c.description}</p>
                    </div>
                    {canEdit && (
                      <button onClick={() => handleRelease(c.id)} disabled={busyCardId === c.id} className="text-xs text-red-600 hover:underline shrink-0">
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5">
                    <span className={`text-[11px] font-medium ${inLoadout ? 'text-violet-700' : 'text-stone-500'}`}>{inLoadout ? '⚡ Ativa (loadout)' : '📦 No cofre (vault)'}</span>
                    {canEdit && (
                      <button
                        onClick={() => handleToggleLoadout(c.id, !inLoadout)}
                        disabled={busyCardId === c.id}
                        className="text-[11px] text-violet-700 hover:underline disabled:text-stone-400"
                      >
                        {inLoadout ? 'Mandar pro cofre' : 'Ativar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
                const claimedBy = claimedCards[c.id]?.characterId;
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

      {/* Avanços de nível */}
      <AdvancementsSection
        player={player}
        canEdit={canEdit}
        advancements={myAdvancements}
        advancementOptions={rules.advancementOptions}
        addAdvancement={addAdvancement}
        removeAdvancement={removeAdvancement}
        updatePlayer={updatePlayer}
        hasMulticlassed={hasMulticlassed}
        advError={advError}
        setAdvError={setAdvError}
      />
    </div>
  );
}

const ACHIEVEMENT_LEVELS = [2, 5, 8];

function AdvancementsSection({
  player,
  canEdit,
  advancements,
  advancementOptions,
  addAdvancement,
  removeAdvancement,
  updatePlayer,
  hasMulticlassed,
  advError,
  setAdvError,
}: {
  player: Player;
  canEdit: boolean;
  advancements: CharacterAdvancement[];
  advancementOptions: AdvancementOption[];
  addAdvancement: (characterId: string, level: number, optionId: string, detail: string, appliesTo?: 'primary' | 'multiclass') => Promise<void>;
  removeAdvancement: (characterId: string, advancementId: string) => Promise<void>;
  updatePlayer: (id: string, updater: (p: Player) => Player) => void;
  hasMulticlassed: boolean;
  advError: string;
  setAdvError: (v: string) => void;
}) {
  const [newLevel, setNewLevel] = useState(Math.max(2, player.level));
  const [pick1, setPick1] = useState('');
  const [detail1, setDetail1] = useState('');
  const [target1, setTarget1] = useState<'primary' | 'multiclass'>('primary');
  const [pick2, setPick2] = useState('');
  const [detail2, setDetail2] = useState('');
  const [target2, setTarget2] = useState<'primary' | 'multiclass'>('primary');
  const [saving, setSaving] = useState(false);

  const newTier = tierForLevel(newLevel);
  const optionsForTier = advancementOptions.filter((o) => o.minTier <= newTier);
  const pick1Option = advancementOptions.find((o) => o.id === pick1);
  const pick1UsesBoth = (pick1Option?.slotCost ?? 1) >= 2;
  const isAchievementLevel = ACHIEVEMENT_LEVELS.includes(newLevel);

  const byLevel = new Map<number, typeof advancements>();
  for (const a of advancements) {
    if (!byLevel.has(a.level)) byLevel.set(a.level, []);
    byLevel.get(a.level)!.push(a);
  }
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  function handleApplyAchievement() {
    updatePlayer(player.id, (p) => ({
      ...p,
      proficiency: (p.proficiency ?? 1) + 1,
      experiences: [...(p.experiences ?? []), { name: '', modifier: 2 }],
    }));
  }

  async function handleAdd() {
    if (!pick1 && !pick2) {
      setAdvError('Escolha pelo menos um avanço.');
      return;
    }
    if (!pick1UsesBoth && pick2 && pick1 === pick2) {
      setAdvError('As duas escolhas do nível precisam ser diferentes.');
      return;
    }
    setAdvError('');
    setSaving(true);
    if (pick1) await addAdvancement(player.id, newLevel, pick1, detail1, pick1 === 'upgraded-subclass-card' ? target1 : undefined);
    if (!pick1UsesBoth && pick2) await addAdvancement(player.id, newLevel, pick2, detail2, pick2 === 'upgraded-subclass-card' ? target2 : undefined);
    setSaving(false);
    setPick1('');
    setDetail1('');
    setTarget1('primary');
    setPick2('');
    setDetail2('');
    setTarget2('primary');
  }

  return (
    <Section title={`Avanços de Nível (${advancements.length})`}>
      {levels.length === 0 && <p className="text-xs text-stone-400">Nenhum avanço registrado ainda.</p>}
      <div className="space-y-3 mb-3">
        {levels.map((level) => (
          <div key={level}>
            <p className="text-xs font-bold text-stone-700 mb-1">
              Nível {level}
              {ACHIEVEMENT_LEVELS.includes(level) && <span className="font-normal text-stone-400"> — +1 Proficiência e +1 Experiência automáticos (não contam como escolha)</span>}
            </p>
            <div className="space-y-1">
              {byLevel.get(level)!.map((a) => {
                const option = advancementOptions.find((o) => o.id === a.optionId);
                return (
                  <div key={a.id} className="flex items-start justify-between gap-2 bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5">
                    <div>
                      <p className="text-xs font-semibold text-stone-800">
                        {option?.name ?? a.optionId}
                        {a.optionId === 'upgraded-subclass-card' && (
                          <span className="ml-1.5 font-normal text-[10px] text-violet-600">({a.appliesTo === 'multiclass' ? 'multiclasse' : 'original'})</span>
                        )}
                      </p>
                      {a.detail && <p className="text-xs text-stone-500">{a.detail}</p>}
                    </div>
                    {canEdit && (
                      <button onClick={() => removeAdvancement(player.id, a.id)} className="text-xs text-red-600 hover:underline shrink-0">
                        Remover
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {advError && <p className="text-xs text-red-600 mb-2">{advError}</p>}
      {canEdit && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold text-stone-600">Registrar avanços de um nível</summary>
          <div className="mt-2 space-y-3 bg-stone-50 border border-stone-200 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-stone-500 shrink-0">Nível</label>
              <input
                type="number"
                min={2}
                max={10}
                value={newLevel}
                onChange={(e) => setNewLevel(Math.max(2, Math.min(10, parseInt(e.target.value, 10) || 2)))}
                className="w-16 border border-stone-300 rounded-md px-2 py-1 text-sm"
              />
              <span className="text-[11px] text-stone-400">Tier {newTier}</span>
            </div>

            {isAchievementLevel && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-amber-800">
                  Ganho automático do nível {newLevel}: +1 Proficiência (atual {player.proficiency ?? 1} → {(player.proficiency ?? 1) + 1}) e uma Experiência nova. Não usa
                  nenhuma das 2 escolhas abaixo.
                </p>
                <SmallButtonInline onClick={handleApplyAchievement}>Aplicar</SmallButtonInline>
              </div>
            )}

            <div className="space-y-1.5 border-t border-stone-200 pt-2">
              <p className="text-[11px] font-semibold text-stone-600">Escolha 1 de 2</p>
              <select value={pick1} onChange={(e) => setPick1(e.target.value)} className={SELECT_CLASS}>
                <option value="">Escolher opção...</option>
                {optionsForTier.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} {o.slotCost > 1 ? '(usa as 2 escolhas)' : ''}
                  </option>
                ))}
              </select>
              {pick1 === 'upgraded-subclass-card' && hasMulticlassed && (
                <select value={target1} onChange={(e) => setTarget1(e.target.value as 'primary' | 'multiclass')} className={SELECT_CLASS}>
                  <option value="primary">Na subclasse original</option>
                  <option value="multiclass">Na subclasse de multiclasse (só chega até especialização)</option>
                </select>
              )}
              <textarea
                value={detail1}
                onChange={(e) => setDetail1(e.target.value)}
                placeholder="Detalhe (opcional) — ex: quais traços, qual carta, qual classe do multiclasse..."
                className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
                rows={2}
              />
            </div>

            {pick1UsesBoth ? (
              <p className="text-[11px] text-stone-400 italic">"{pick1Option?.name}" usa as duas escolhas deste nível — nada mais pra escolher aqui.</p>
            ) : (
              <div className="space-y-1.5 border-t border-stone-200 pt-2">
                <p className="text-[11px] font-semibold text-stone-600">Escolha 2 de 2</p>
                <select value={pick2} onChange={(e) => setPick2(e.target.value)} className={SELECT_CLASS}>
                  <option value="">Escolher opção...</option>
                  {optionsForTier
                    .filter((o) => o.id !== pick1)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} {o.slotCost > 1 ? '(usa as 2 escolhas)' : ''}
                      </option>
                    ))}
                </select>
                {pick2 === 'upgraded-subclass-card' && hasMulticlassed && (
                  <select value={target2} onChange={(e) => setTarget2(e.target.value as 'primary' | 'multiclass')} className={SELECT_CLASS}>
                    <option value="primary">Na subclasse original</option>
                    <option value="multiclass">Na subclasse de multiclasse (só chega até especialização)</option>
                  </select>
                )}
                <textarea
                  value={detail2}
                  onChange={(e) => setDetail2(e.target.value)}
                  placeholder="Detalhe (opcional)"
                  className="w-full border border-stone-300 rounded-md px-2 py-1.5 text-sm"
                  rows={2}
                />
              </div>
            )}

            <SmallButtonInline onClick={handleAdd} disabled={saving}>
              {saving ? 'Salvando...' : 'Registrar'}
            </SmallButtonInline>
          </div>
        </details>
      )}
    </Section>
  );
}

function SmallButtonInline({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-md text-xs font-medium bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
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

/** Clicking a pip fills up through it; clicking the topmost already-filled pip unfills just that one. */
function togglePip(index: number, marked: number): number {
  return index < marked && index === marked - 1 ? marked - 1 : index + 1;
}

function PipTracker({
  label,
  total,
  marked,
  onToggle,
  colorClass,
  disabled,
}: {
  label: string;
  total: number;
  marked: number;
  onToggle: (index: number) => void;
  colorClass: string;
  disabled?: boolean;
}) {
  const clampedMarked = Math.min(marked, total);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-stone-600">{label}</span>
        <span className="text-xs text-stone-400">
          {clampedMarked}/{total}
        </span>
      </div>
      {total <= 0 ? (
        <p className="text-xs text-stone-300 italic">—</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(i)}
              className={`w-5 h-5 rounded border transition-colors disabled:cursor-not-allowed ${i < clampedMarked ? colorClass : 'bg-white border-stone-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

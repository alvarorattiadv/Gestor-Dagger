import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Character } from '../types/character';
import { deriveSheet } from '../sheet/deriveSheet';
import { ABILITY_KEYS, ABILITY_LABELS } from '../types/rules';
import { formatModifier } from '../engine/modifiers';
import { getItem } from '../data/items';
import { getSpell } from '../data/spells';
import { featSpellGrantSources } from '../data/spellGrants';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#555', marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 4, borderBottom: '1 solid #999', paddingBottom: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  statBox: { border: '1 solid #999', borderRadius: 4, padding: 5, marginRight: 6, marginBottom: 6, width: 70, alignItems: 'center' },
  statLabel: { fontSize: 7, color: '#666' },
  statValue: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  abilityBox: { border: '1 solid #999', borderRadius: 4, padding: 5, marginRight: 6, marginBottom: 6, width: 62, alignItems: 'center' },
  listItem: { marginBottom: 3 },
  twoCol: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  skillRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1.5, borderBottom: '0.5 solid #ddd' },
});

export function CharacterPdfDocument({ character }: { character: Character }) {
  const sheet = deriveSheet(character);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{character.name}</Text>
        <Text style={styles.subtitle}>
          {sheet.species.name} {sheet.subclass ? `· ${sheet.subclass.name} ` : ''}
          {sheet.classDef.name} · Nível {character.level} · {sheet.background.name}
          {character.playerName ? ` · Jogador(a): ${character.playerName}` : ''}
          {character.alignment ? ` · ${character.alignment}` : ''}
        </Text>

        <View style={styles.row}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CA</Text>
            <Text style={styles.statValue}>{sheet.armorClass}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Iniciativa</Text>
            <Text style={styles.statValue}>{formatModifier(sheet.initiative)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PV Máximo</Text>
            <Text style={styles.statValue}>{sheet.hpMax}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>PV Atual</Text>
            <Text style={styles.statValue}>{character.hpCurrent}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Bônus Prof.</Text>
            <Text style={styles.statValue}>{formatModifier(sheet.profBonus)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Desloc.</Text>
            <Text style={styles.statValue}>{sheet.species.speed}m</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Perc. Passiva</Text>
            <Text style={styles.statValue}>{sheet.passivePerception}</Text>
          </View>
        </View>

        <View style={styles.row}>
          {ABILITY_KEYS.map((key) => (
            <View key={key} style={styles.abilityBox}>
              <Text style={styles.statLabel}>{ABILITY_LABELS[key]}</Text>
              <Text style={styles.statValue}>{sheet.scores[key]}</Text>
              <Text style={styles.statLabel}>{formatModifier(sheet.mods[key])}</Text>
            </View>
          ))}
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Testes de Resistência</Text>
            {sheet.savingThrows.map((st) => (
              <View key={st.key} style={styles.skillRow}>
                <Text>{ABILITY_LABELS[st.key]}{st.proficient ? ' *' : ''}</Text>
                <Text>{formatModifier(st.modifier)}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Perícias (* proficiente, ** especialização)</Text>
            {sheet.skills.map((sk) => (
              <View key={sk.key} style={styles.skillRow}>
                <Text>{sk.label}{sk.expertise ? ' **' : sk.proficient ? ' *' : ''}</Text>
                <Text>{formatModifier(sk.modifier)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Ataques</Text>
            {character.inventory
              .map((entry) => getItem(entry.itemId))
              .filter((item) => item?.weapon)
              .map((item) => (
                <View key={item!.id} style={styles.listItem}>
                  <Text>{item!.name}: {item!.weapon!.damageDice} {item!.weapon!.damageType}</Text>
                </View>
              ))}

            {sheet.spellcasting && (
              <>
                <Text style={styles.sectionTitle}>Magia</Text>
                <Text style={styles.listItem}>CD {sheet.spellcasting.saveDC} · Ataque {formatModifier(sheet.spellcasting.attackBonus)}</Text>
                <Text style={styles.listItem}>
                  Truques: {character.knownSpellIds.filter((id) => getSpell(id)?.level === 0 && getSpell(id)?.classIds.includes(sheet.classDef.id)).map((id) => getSpell(id)?.name).join(', ') || '—'}
                </Text>
                <Text style={styles.listItem}>
                  Preparadas: {character.preparedSpellIds.map((id) => getSpell(id)?.name).join(', ') || '—'}
                </Text>
              </>
            )}

            {featSpellGrantSources(character.featIds).map((source) => (
              <View key={source.key}>
                <Text style={styles.sectionTitle}>{source.label}</Text>
                <Text style={styles.listItem}>
                  {(character.featSpellSelections[source.key] ?? []).map((id) => getSpell(id)?.name).join(', ') || '—'}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Inventário</Text>
            {character.inventory.map((entry) => {
              const item = getItem(entry.itemId);
              if (!item) return null;
              return (
                <Text key={entry.itemId} style={styles.listItem}>
                  {item.name} x{entry.quantity}
                </Text>
              );
            })}
            <Text style={styles.listItem}>
              Moedas: {character.currency.pp}pp {character.currency.gp}po {character.currency.ep}pe {character.currency.sp}pp {character.currency.cp}pc
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Características e Traços</Text>
        {sheet.species.traits.map((t) => (
          <Text key={t.name} style={styles.listItem}>• {t.name}: {t.description}</Text>
        ))}
        {sheet.activeFeatures.map((f) => (
          <Text key={f.id} style={styles.listItem}>• {f.name} (nível {f.level}): {f.description}</Text>
        ))}
        {sheet.activeSubclassFeatures.map((f) => (
          <Text key={f.id} style={styles.listItem}>• {f.name} (nível {f.level}): {f.description}</Text>
        ))}

        {character.notes && (
          <>
            <Text style={styles.sectionTitle}>Anotações</Text>
            <Text>{character.notes}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}

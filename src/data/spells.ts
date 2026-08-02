import type { Spell } from '../types/spell';

export const SPELLS: Spell[] = [
  // Truques - Mago
  { id: 'maos-magicas', name: 'Mage Hand', level: 0, school: 'Conjuração', castingTime: '1 ação', range: '9m', components: 'V, S', duration: '1 minuto', description: 'Você cria uma mão espectral flutuante que pode manipular objetos leves à distância.', classIds: ['mago'] },
  { id: 'raio-de-fogo', name: 'Fire Bolt', level: 0, school: 'Evocação', castingTime: '1 ação', range: '36m', components: 'V, S', duration: 'Instantânea', description: 'Você dispara um raio de fogo contra uma criatura ou objeto, causando dano de fogo.', classIds: ['mago'] },
  { id: 'ilusao-menor', name: 'Minor Illusion', level: 0, school: 'Ilusão', castingTime: '1 ação', range: '9m', components: 'S, M', duration: '1 minuto', description: 'Você cria um som ou uma imagem ilusória de um objeto dentro do alcance.', classIds: ['mago'] },
  { id: 'toque-gelido', name: 'Chill Touch', level: 0, school: 'Necromancia', castingTime: '1 ação', range: '18m', components: 'V, S', duration: '1 rodada', description: 'Um esqueleto de energia gélida ataca uma criatura, causando dano necrótico e impedindo-a de recuperar pontos de vida até o fim do próximo turno dela.', classIds: ['mago'] },
  { id: 'prestidigitacao', name: 'Prestidigitation', level: 0, school: 'Transmutação', castingTime: '1 ação', range: '3m', components: 'V, S', duration: 'Até 1 hora', description: 'Você cria um pequeno efeito mágico sensorial: uma faísca, um cheiro, um som fraco, ou limpa/suja um objeto pequeno.', classIds: ['mago'] },

  // Truques - Clérigo
  { id: 'chama-sagrada', name: 'Sacred Flame', level: 0, school: 'Evocação', castingTime: '1 ação', range: '18m', components: 'V, S', duration: 'Instantânea', description: 'Fogo divino desce sobre uma criatura que você possa ver, causando dano radiante. O alvo não recebe benefício de cobertura contra este ataque.', classIds: ['clerigo'] },
  { id: 'orientacao', name: 'Guidance', level: 0, school: 'Adivinhação', castingTime: '1 ação', range: 'Toque', components: 'V, S', duration: 'Concentração, até 1 minuto', description: 'Você toca uma criatura disposta, que pode rolar um d4 e somar o resultado a um teste de habilidade à sua escolha.', classIds: ['clerigo'], concentration: true },
  { id: 'taumaturgia', name: 'Thaumaturgy', level: 0, school: 'Abjuração', castingTime: '1 ação', range: '9m', components: 'V', duration: 'Até 1 minuto', description: 'Você manifesta um sinal menor de poder divino: sua voz ecoa, chamas tremulam, portas se abrem com força, entre outros efeitos sensoriais.', classIds: ['clerigo'] },
  { id: 'luz', name: 'Light', level: 0, school: 'Evocação', castingTime: '1 ação', range: 'Toque', components: 'V, M', duration: '1 hora', description: 'Um objeto que você tocar emite luz brilhante em um raio de 6m.', classIds: ['clerigo', 'mago'] },
  { id: 'resistencia', name: 'Resistance', level: 0, school: 'Abjuração', castingTime: '1 ação', range: 'Toque', components: 'V, S, M', duration: 'Concentração, até 1 minuto', description: 'Você toca uma criatura disposta, que pode rolar um d4 e somar o resultado a um teste de resistência à sua escolha.', classIds: ['clerigo'], concentration: true },

  // Nível 1 - Mago
  { id: 'detectar-magia', name: 'Detect Magic', level: 1, school: 'Adivinhação', castingTime: '1 ação', range: 'Pessoal', components: 'V, S', duration: 'Concentração, até 10 minutos', description: 'Você sente a presença de magia num raio de 9m e, se a concentrar, pode ver uma aura fraca em torno de qualquer objeto ou criatura enfeitiçada, revelando a escola de magia se conhecida.', classIds: ['mago', 'clerigo'], ritual: true, concentration: true },
  { id: 'escudo-arcano', name: 'Shield', level: 1, school: 'Abjuração', castingTime: '1 reação', range: 'Pessoal', components: 'V, S', duration: '1 rodada', description: 'Uma barreira invisível de força mágica surge, concedendo +5 na CA até o início do seu próximo turno e imunidade a mísseis mágicos.', classIds: ['mago'] },
  { id: 'misseis-magicos', name: 'Magic Missile', level: 1, school: 'Evocação', castingTime: '1 ação', range: '36m', components: 'V, S', duration: 'Instantânea', description: 'Você cria três dardos brilhantes de força mágica. Cada um atinge automaticamente uma criatura à sua escolha, causando 1d4+1 de dano de força.', classIds: ['mago'] },
  { id: 'dormir', name: 'Sleep', level: 1, school: 'Encantamento', castingTime: '1 ação', range: '27m', components: 'V, S, M', duration: '1 minuto', description: 'Este feitiço faz criaturas em uma área adormecerem, começando pelas com menos pontos de vida atuais.', classIds: ['mago'] },
  { id: 'identificar', name: 'Identify', level: 1, school: 'Adivinhação', castingTime: '1 minuto', range: 'Toque', components: 'V, S, M', duration: 'Instantânea', description: 'Você aprende as propriedades mágicas de um objeto tocado, incluindo como usá-lo.', classIds: ['mago'], ritual: true },
  { id: 'armadura-arcana', name: 'Mage Armor', level: 1, school: 'Abjuração', castingTime: '1 ação', range: 'Toque', components: 'V, S, M', duration: '8 horas', description: 'Uma força mágica protetora envolve uma criatura disposta que não esteja usando armadura, concedendo CA 13 + modificador de Destreza.', classIds: ['mago'] },
  { id: 'queda-suave', name: 'Feather Fall', level: 1, school: 'Abjuração', castingTime: '1 reação', range: '18m', components: 'V', duration: '1 minuto', description: 'Você ou outra criatura em queda desce suavemente, sem sofrer dano de queda.', classIds: ['mago'] },

  // Nível 1 - Clérigo
  { id: 'curar-ferimentos', name: 'Cure Wounds', level: 1, school: 'Abjuração', castingTime: '1 ação', range: 'Toque', components: 'V, S', duration: 'Instantânea', description: 'Uma criatura que você tocar recupera pontos de vida iguais a 1d8 + seu modificador de habilidade de conjuração.', classIds: ['clerigo'] },
  { id: 'bencao', name: 'Bless', level: 1, school: 'Encantamento', castingTime: '1 ação', range: '9m', components: 'V, S, M', duration: 'Concentração, até 1 minuto', description: 'Até três criaturas à sua escolha somam 1d4 aos testes de ataque e testes de resistência enquanto o efeito durar.', classIds: ['clerigo'], concentration: true },
  { id: 'comando', name: 'Command', level: 1, school: 'Encantamento', castingTime: '1 ação', range: '18m', components: 'V', duration: '1 rodada', description: 'Você profere uma única palavra de comando a uma criatura que possa ouvi-lo, forçando-a a obedecer no seu próximo turno.', classIds: ['clerigo'] },
  { id: 'escudo-da-fe', name: 'Shield of Faith', level: 1, school: 'Abjuração', castingTime: '1 ação bônus', range: '18m', components: 'V, S, M', duration: 'Concentração, até 10 minutos', description: 'Um campo de força protetor envolve uma criatura, concedendo +2 na CA enquanto durar.', classIds: ['clerigo'], concentration: true },
  { id: 'santuario', name: 'Sanctuary', level: 1, school: 'Abjuração', castingTime: '1 ação bônus', range: '9m', components: 'V, S, M', duration: '1 minuto', description: 'Você protege uma criatura: qualquer inimigo que a alvejar com um ataque ou magia deve primeiro ser bem-sucedido em um teste de resistência de Sabedoria ou escolher outro alvo.', classIds: ['clerigo'] },
];

export function getSpell(id: string): Spell | undefined {
  return SPELLS.find((s) => s.id === id);
}

export function spellsForClass(classId: string, level?: number): Spell[] {
  return SPELLS.filter((s) => s.classIds.includes(classId) && (level === undefined || s.level === level));
}

/** Union of spells across multiple spell lists (e.g. a feat granting access to more than one class list), deduped by id. */
export function spellsForLists(listIds: string[], level?: number): Spell[] {
  const seen = new Set<string>();
  const result: Spell[] = [];
  for (const listId of listIds) {
    for (const spell of spellsForClass(listId, level)) {
      if (!seen.has(spell.id)) {
        seen.add(spell.id);
        result.push(spell);
      }
    }
  }
  return result;
}

import type { Feat } from '../types/feat';

export const FEATS: Feat[] = [
  {
    id: 'alerta',
    name: 'Alert',
    category: 'origem',
    description: 'Você está sempre alerta ao perigo. Soma seu bônus de proficiência aos testes de iniciativa, e pode trocar sua iniciativa com a de um aliado disposto que esteja a até 9m de você no início do combate.',
    initiativeProficiency: true,
  },
  {
    id: 'robusto',
    name: 'Tough',
    category: 'origem',
    description: 'Seu total de pontos de vida máximo aumenta em 2 para cada nível que você tem, e aumenta em mais 2 sempre que você sobe de nível.',
    hpBonusPerLevel: 2,
  },
  {
    id: 'atacante-selvagem',
    name: 'Savage Attacker',
    category: 'origem',
    description: 'Quando você rola dano com uma arma corpo a corpo, pode rolar o dado de dano da arma duas vezes e usar o maior resultado. (Aplique isso manualmente ao rolar dano.)',
  },
  {
    id: 'habilidoso',
    name: 'Skilled',
    category: 'origem',
    description: 'Você ganha proficiência em três perícias à sua escolha.',
    skillGrant: { count: 3 },
  },
  {
    id: 'iniciado-em-magia-clerigo',
    name: 'Magic Initiate (Cleric)',
    category: 'origem',
    description: 'Você aprende dois truques da lista de magias de Clérigo e uma magia de 1º nível dessa lista, que pode conjurar uma vez sem gastar espaço de magia, recuperando esse uso após um descanso longo. Sabedoria é sua habilidade de conjuração para essas magias.',
    spellGrant: { ability: 'wis', spellListIds: ['clerigo'], cantripsCount: 2, spellsCount: 1, maxSpellLevel: 1 },
  },
  {
    id: 'iniciado-em-magia-mago',
    name: 'Magic Initiate (Wizard)',
    category: 'origem',
    description: 'Você aprende dois truques da lista de magias de Mago e uma magia de 1º nível dessa lista, que pode conjurar uma vez sem gastar espaço de magia, recuperando esse uso após um descanso longo. Inteligência é sua habilidade de conjuração para essas magias.',
    spellGrant: { ability: 'int', spellListIds: ['mago'], cantripsCount: 2, spellsCount: 1, maxSpellLevel: 1 },
  },
  {
    id: 'sortudo',
    name: 'Lucky',
    category: 'origem',
    description: 'Você tem pontos de sorte. Pode gastar 1 ponto para dar a si mesmo vantagem em um teste de habilidade, teste de resistência ou ataque, ou para impor desvantagem a um ataque contra você. Recupera os pontos gastos após um descanso longo.',
    resourceGrant: { label: 'Pontos de Sorte', count: 4 },
  },
];

export function getFeat(id: string): Feat | undefined {
  return FEATS.find((f) => f.id === id);
}

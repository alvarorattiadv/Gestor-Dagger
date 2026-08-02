import type { Background } from '../types/background';

export const BACKGROUNDS: Background[] = [
  {
    id: 'acolito',
    name: 'Acólito',
    description: 'Você passou sua juventude a serviço de um templo, aprendendo ritos sagrados e auxiliando os sacerdotes em suas tarefas.',
    abilityBonusChoice: { abilities: ['int', 'wis', 'cha'], distribution: [2, 1] },
    skillProficiencies: ['insight', 'religion'],
    toolProficiency: 'Kit de Caligrafia',
    featId: 'iniciado-em-magia-clerigo',
    equipmentOptions: [
      { id: 'a', label: 'Símbolo sagrado, vestimentas comuns e pacote de diplomata', itemIds: ['simbolo-sagrado', 'vestimentas-comuns', 'pacote-diplomata'], gold: 8 },
      { id: 'b', label: '50 PO', itemIds: [], gold: 50 },
    ],
  },
  {
    id: 'criminoso',
    name: 'Criminoso',
    description: 'Você viveu à margem da lei, sobrevivendo de pequenos golpes, contrabando ou coisa pior — e aprendeu a nunca ser pego.',
    abilityBonusChoice: { abilities: ['dex', 'con', 'int'], distribution: [2, 1] },
    skillProficiencies: ['deception', 'stealth'],
    toolProficiency: 'Ferramentas de Ladrão',
    featId: 'alerta',
    equipmentOptions: [
      { id: 'a', label: 'Ferramentas de ladrão, adaga e traje de viajante', itemIds: ['ferramentas-de-ladrao', 'adaga', 'traje-de-viajante'], gold: 16 },
      { id: 'b', label: '50 PO', itemIds: [], gold: 50 },
    ],
  },
  {
    id: 'sabio',
    name: 'Sábio',
    description: 'Anos dedicados ao estudo em bibliotecas e academias fizeram de você um erudito, sempre em busca de conhecimento novo.',
    abilityBonusChoice: { abilities: ['int', 'wis', 'cha'], distribution: [2, 1] },
    skillProficiencies: ['arcana', 'history'],
    toolProficiency: 'Kit de Cartógrafo',
    featId: 'iniciado-em-magia-mago',
    equipmentOptions: [
      { id: 'a', label: 'Kit de cartógrafo, bordão e traje de viajante', itemIds: ['kit-de-cartografo', 'bordao', 'traje-de-viajante'], gold: 8 },
      { id: 'b', label: '50 PO', itemIds: [], gold: 50 },
    ],
  },
  {
    id: 'soldado',
    name: 'Soldado',
    description: 'Você serviu em um exército ou milícia, treinado em combate organizado e disciplina de batalha.',
    abilityBonusChoice: { abilities: ['str', 'dex', 'con'], distribution: [2, 1] },
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiency: 'Conjunto de Jogos',
    featId: 'robusto',
    equipmentOptions: [
      { id: 'a', label: 'Lança, conjunto de jogos e traje de viajante', itemIds: ['lanca', 'conjunto-de-jogos', 'traje-de-viajante'], gold: 14 },
      { id: 'b', label: '50 PO', itemIds: [], gold: 50 },
    ],
  },
];

export function getBackground(id: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}

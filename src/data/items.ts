import type { Item } from '../types/item';

export const ITEMS: Item[] = [
  // Armas simples corpo a corpo
  { id: 'adaga', name: 'Adaga', category: 'arma-simples', weight: 0.5, costGold: 2, weapon: { damageDice: '1d4', damageType: 'Perfuração', properties: ['leve', 'acuidade', 'arremesso (6/18m)'] } },
  { id: 'clava', name: 'Clava', category: 'arma-simples', weight: 1.5, costGold: 0.1, weapon: { damageDice: '1d4', damageType: 'Concussão', properties: ['leve'] } },
  { id: 'bordao', name: 'Bordão', category: 'arma-simples', weight: 2, costGold: 0.2, weapon: { damageDice: '1d6', damageType: 'Concussão', properties: ['versátil (1d8)'] } },
  { id: 'machadinha', name: 'Machadinha', category: 'arma-simples', weight: 1, costGold: 5, weapon: { damageDice: '1d6', damageType: 'Corte', properties: ['leve', 'arremesso (6/18m)'] } },
  { id: 'lanca', name: 'Lança', category: 'arma-simples', weight: 1, costGold: 1, weapon: { damageDice: '1d6', damageType: 'Perfuração', properties: ['arremesso (6/18m)', 'versátil (1d8)'] } },
  { id: 'martelo-leve', name: 'Martelo Leve', category: 'arma-simples', weight: 1, costGold: 2, weapon: { damageDice: '1d4', damageType: 'Concussão', properties: ['leve', 'arremesso (6/18m)'] } },
  { id: 'maca', name: 'Maça', category: 'arma-simples', weight: 2, costGold: 5, weapon: { damageDice: '1d6', damageType: 'Concussão', properties: [] } },
  { id: 'besta-leve', name: 'Besta Leve', category: 'arma-simples', weight: 2.5, costGold: 25, weapon: { damageDice: '1d8', damageType: 'Perfuração', properties: ['munição (24/96m)', 'recarga', 'duas mãos'] } },
  { id: 'funda', name: 'Funda', category: 'arma-simples', weight: 0, costGold: 0.1, weapon: { damageDice: '1d4', damageType: 'Concussão', properties: ['munição (9/36m)'] } },
  { id: 'dardo', name: 'Dardo', category: 'arma-simples', weight: 0.25, costGold: 0.05, weapon: { damageDice: '1d4', damageType: 'Perfuração', properties: ['acuidade', 'arremesso (6/18m)'] } },

  // Armas marciais
  { id: 'espada-longa', name: 'Espada Longa', category: 'arma-marcial', weight: 1.5, costGold: 15, weapon: { damageDice: '1d8', damageType: 'Corte', properties: ['versátil (1d10)'] } },
  { id: 'espada-curta', name: 'Espada Curta', category: 'arma-marcial', weight: 1, costGold: 10, weapon: { damageDice: '1d6', damageType: 'Perfuração', properties: ['leve', 'acuidade'] } },
  { id: 'machado-de-batalha', name: 'Machado de Batalha', category: 'arma-marcial', weight: 2, costGold: 10, weapon: { damageDice: '1d8', damageType: 'Corte', properties: ['versátil (1d10)'] } },
  { id: 'florete', name: 'Florete', category: 'arma-marcial', weight: 1, costGold: 25, weapon: { damageDice: '1d8', damageType: 'Perfuração', properties: ['acuidade'] } },
  { id: 'espadao', name: 'Espadão', category: 'arma-marcial', weight: 3, costGold: 50, weapon: { damageDice: '2d6', damageType: 'Corte', properties: ['pesada', 'duas mãos'] } },
  { id: 'alabarda', name: 'Alabarda', category: 'arma-marcial', weight: 3, costGold: 20, weapon: { damageDice: '1d10', damageType: 'Corte', properties: ['pesada', 'alcance', 'duas mãos'] } },
  { id: 'arco-longo', name: 'Arco Longo', category: 'arma-marcial', weight: 1, costGold: 50, weapon: { damageDice: '1d8', damageType: 'Perfuração', properties: ['munição (45/180m)', 'pesada', 'duas mãos'] } },
  { id: 'besta-de-mao', name: 'Besta de Mão', category: 'arma-marcial', weight: 1.5, costGold: 75, weapon: { damageDice: '1d6', damageType: 'Perfuração', properties: ['leve', 'munição (9/36m)', 'recarga'] } },

  // Armaduras leves
  { id: 'armadura-acolchoada', name: 'Armadura Acolchoada', category: 'armadura-leve', weight: 4, costGold: 5, armor: { baseAC: 11, addDexMod: true, stealthDisadvantage: true } },
  { id: 'armadura-de-couro', name: 'Armadura de Couro', category: 'armadura-leve', weight: 5, costGold: 10, armor: { baseAC: 11, addDexMod: true } },
  { id: 'couro-batido', name: 'Couro Batido', category: 'armadura-leve', weight: 6.5, costGold: 45, armor: { baseAC: 12, addDexMod: true } },

  // Armaduras médias
  { id: 'cota-de-malha-leve', name: 'Cota de Malha Leve', category: 'armadura-media', weight: 10, costGold: 50, armor: { baseAC: 13, addDexMod: true, maxDexBonus: 2 } },
  { id: 'brunea', name: 'Brunea', category: 'armadura-media', weight: 10, costGold: 400, armor: { baseAC: 14, addDexMod: true, maxDexBonus: 2 } },
  { id: 'meia-armadura', name: 'Meia-Armadura', category: 'armadura-media', weight: 20, costGold: 750, armor: { baseAC: 15, addDexMod: true, maxDexBonus: 2, stealthDisadvantage: true } },

  // Armaduras pesadas
  { id: 'cota-de-malha', name: 'Cota de Malha', category: 'armadura-pesada', weight: 27.5, costGold: 75, armor: { baseAC: 16, addDexMod: false, strRequirement: 13, stealthDisadvantage: true } },
  { id: 'armadura-de-placas', name: 'Armadura de Placas', category: 'armadura-pesada', weight: 32.5, costGold: 1500, armor: { baseAC: 18, addDexMod: false, strRequirement: 15, stealthDisadvantage: true } },

  { id: 'escudo', name: 'Escudo', category: 'escudo', weight: 3, costGold: 10 },

  // Itens de aventura
  { id: 'mochila', name: 'Mochila', category: 'aventura', weight: 2.5, costGold: 2 },
  { id: 'corda-canhamo', name: 'Corda de Cânhamo (15m)', category: 'aventura', weight: 5, costGold: 1 },
  { id: 'tocha', name: 'Tocha', category: 'aventura', weight: 0.5, costGold: 0.01 },
  { id: 'racoes', name: 'Ração de Viagem (1 dia)', category: 'aventura', weight: 1, costGold: 0.5 },
  { id: 'odre-de-agua', name: 'Odre de Água', category: 'aventura', weight: 2.5, costGold: 0.2 },
  { id: 'kit-de-cura', name: "Kit de Cura", category: 'aventura', weight: 1.5, costGold: 5 },
  { id: 'pederneira', name: 'Pederneira e Isqueiro', category: 'aventura', weight: 0.5, costGold: 0.5 },
  { id: 'saco-de-dormir', name: 'Saco de Dormir', category: 'aventura', weight: 3.5, costGold: 1 },
  { id: 'foco-arcano', name: 'Foco Arcano (bastão)', category: 'aventura', weight: 1, costGold: 10 },
  { id: 'simbolo-sagrado', name: 'Símbolo Sagrado', category: 'aventura', weight: 0.5, costGold: 5 },
  { id: 'livro-de-magias', name: 'Livro de Magias', category: 'aventura', weight: 1.5, costGold: 50 },
  { id: 'lanterna-de-capuz', name: 'Lanterna de Capuz', category: 'aventura', weight: 1, costGold: 5 },
  { id: 'vestimentas-comuns', name: 'Vestimentas Comuns', category: 'aventura', weight: 2, costGold: 0.5 },
  { id: 'traje-de-viajante', name: 'Traje de Viajante', category: 'aventura', weight: 2, costGold: 2 },
  { id: 'instrumento-musical', name: 'Instrumento Musical', category: 'aventura', weight: 1.5, costGold: 5 },

  // Ferramentas
  { id: 'ferramentas-de-ladrao', name: 'Ferramentas de Ladrão', category: 'ferramenta', weight: 0.5, costGold: 25 },
  { id: 'kit-de-caligrafia', name: 'Kit de Caligrafia', category: 'ferramenta', weight: 2.5, costGold: 10 },
  { id: 'kit-de-cartografo', name: 'Kit de Cartógrafo', category: 'ferramenta', weight: 3, costGold: 15 },
  { id: 'conjunto-de-jogos', name: 'Conjunto de Jogos (dados)', category: 'ferramenta', weight: 0, costGold: 0.5 },

  // Pacotes
  { id: 'pacote-aventureiro', name: 'Pacote de Aventureiro', category: 'pacote', weight: 20, costGold: 10, description: 'Mochila, saco de dormir, kit de cura, 10 tochas, pederneira e isqueiro, 5 rações de viagem, odre de água, corda de cânhamo.' },
  { id: 'pacote-erudito', name: 'Pacote de Erudito', category: 'pacote', weight: 12, costGold: 40, description: 'Mochila, livro, tinteiro e pena, 10 folhas de pergaminho, pequena faca, vestimentas comuns.' },
  { id: 'pacote-diplomata', name: 'Pacote de Diplomata', category: 'pacote', weight: 15, costGold: 40, description: 'Mala, 2 conjuntos de roupas finas, tinteiro e pena, lanterna, 5 folhas de pergaminho, perfume, selo de cera, sabão.' },
];

export function getItem(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}

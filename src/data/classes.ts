import type { ClassDef } from '../types/classDef';

export const CLASSES: ClassDef[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    description: 'Mestre das armas e da armadura, o guerreiro domina o campo de batalha através de treino incansável e disciplina marcial.',
    hitDie: 10,
    primaryAbilities: ['str', 'dex'],
    savingThrowProficiencies: ['str', 'con'],
    armorProficiencies: ['armadura-leve', 'armadura-media', 'armadura-pesada', 'escudo'],
    weaponProficiencies: ['arma-simples', 'arma-marcial'],
    toolProficiencies: [],
    skillChoiceCount: 2,
    skillChoices: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    subclassLevel: 3,
    abilityScoreImprovementLevels: [4, 6, 8, 12, 14, 16, 19],
    startingEquipmentOptions: [
      {
        id: 'a',
        label: 'Cota de malha, escudo e espada longa',
        grants: [
          { itemId: 'cota-de-malha', quantity: 1, label: 'Cota de Malha' },
          { itemId: 'escudo', quantity: 1, label: 'Escudo' },
          { itemId: 'espada-longa', quantity: 1, label: 'Espada Longa' },
          { itemId: 'pacote-aventureiro', quantity: 1, label: 'Pacote de Aventureiro' },
        ],
      },
      {
        id: 'b',
        label: 'Couro batido, arco longo e machadinhas',
        grants: [
          { itemId: 'couro-batido', quantity: 1, label: 'Couro Batido' },
          { itemId: 'arco-longo', quantity: 1, label: 'Arco Longo' },
          { itemId: 'machadinha', quantity: 2, label: 'Machadinha (x2)' },
          { itemId: 'pacote-aventureiro', quantity: 1, label: 'Pacote de Aventureiro' },
        ],
      },
    ],
    features: [
      {
        id: 'estilo-de-combate',
        level: 1,
        name: 'Estilo de Combate',
        description: 'Você adota um estilo de combate como sua especialidade.',
        choice: {
          id: 'estilo-de-combate',
          label: 'Escolha um estilo de combate',
          count: 1,
          options: [
            { id: 'defesa', label: 'Defesa', description: 'Enquanto estiver usando armadura, você ganha +1 na CA.' },
            { id: 'duelo', label: 'Duelo', description: 'Quando empunha uma arma corpo a corpo em uma mão e nenhuma outra arma, ganha +2 no dano com essa arma.' },
            { id: 'arqueiro', label: 'Arqueiro', description: 'Você ganha +2 nos testes de ataque com armas à distância.' },
            { id: 'combate-com-duas-armas', label: 'Combate com Duas Armas', description: 'Ao lutar com duas armas, você soma o modificador de habilidade ao dano do ataque bônus.' },
          ],
        },
      },
      { id: 'retomar-o-folego', level: 1, name: 'Retomar o Fôlego', description: 'Você recupera 1d10 + seu nível de guerreiro em pontos de vida. Uma vez usado, só pode fazê-lo novamente após um descanso curto ou longo.', actionType: 'acao-bonus' },
      { id: 'surto-de-acao', level: 2, name: 'Surto de Ação', description: 'Em seu turno, você pode gastar uma ação adicional. Uma vez usado, precisa de um descanso curto ou longo para usar novamente.' },
    ],
    subclasses: [
      {
        id: 'campeao',
        name: 'Campeão',
        description: 'Focado em perfeição física e força bruta, o campeão maximiza seu potencial em combate direto.',
        features: [
          { id: 'critico-aprimorado', level: 3, name: 'Crítico Aprimorado', description: 'Seus ataques com armas causam acerto crítico com uma rolagem de 19 ou 20 no d20.' },
        ],
      },
    ],
  },

  {
    id: 'mago',
    name: 'Mago',
    description: 'Estudioso incansável das artes arcanas, o mago molda a realidade através de fórmulas mágicas cuidadosamente memorizadas.',
    hitDie: 6,
    primaryAbilities: ['int'],
    savingThrowProficiencies: ['int', 'wis'],
    armorProficiencies: [],
    weaponProficiencies: ['adaga', 'dardo', 'funda', 'clava', 'bordao', 'besta-leve'],
    toolProficiencies: [],
    skillChoiceCount: 2,
    skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    subclassLevel: 3,
    abilityScoreImprovementLevels: [4, 8, 12, 16, 19],
    startingEquipmentOptions: [
      {
        id: 'a',
        label: 'Bordão, foco arcano e livro de magias',
        grants: [
          { itemId: 'bordao', quantity: 1, label: 'Bordão' },
          { itemId: 'foco-arcano', quantity: 1, label: 'Foco Arcano' },
          { itemId: 'livro-de-magias', quantity: 1, label: 'Livro de Magias' },
          { itemId: 'pacote-erudito', quantity: 1, label: 'Pacote de Erudito' },
        ],
      },
      {
        id: 'b',
        label: 'Adaga, foco arcano e livro de magias',
        grants: [
          { itemId: 'adaga', quantity: 1, label: 'Adaga' },
          { itemId: 'foco-arcano', quantity: 1, label: 'Foco Arcano' },
          { itemId: 'livro-de-magias', quantity: 1, label: 'Livro de Magias' },
          { itemId: 'pacote-erudito', quantity: 1, label: 'Pacote de Erudito' },
        ],
      },
    ],
    features: [
      { id: 'conjuracao', level: 1, name: 'Conjuração', description: 'Você estudou magia arcana e aprendeu a conjurá-la. Consulte a seção de Magia da ficha para truques, magias preparadas e espaços de magia.' },
      { id: 'livro-de-magias-feature', level: 1, name: 'Livro de Magias', description: 'Suas magias conhecidas estão registradas em seu livro de magias. Você pode copiar novas magias encontradas em suas aventuras para o livro.' },
      { id: 'recuperacao-arcana', level: 1, name: 'Recuperação Arcana', description: 'Uma vez por dia, ao terminar um descanso curto, você pode recuperar espaços de magia gastos com nível total igual à metade do seu nível de mago (arredondado para cima).' },
    ],
    subclasses: [
      {
        id: 'escola-de-evocacao',
        name: 'Escola de Evocação',
        description: 'Especialista em magias destrutivas e explosivas, capaz de canalizar imenso poder sem ferir aliados.',
        features: [
          { id: 'escultor-de-magias', level: 3, name: 'Escultor de Magias', description: 'Quando você conjura uma magia de evocação, pode proteger seus aliados dos efeitos: eles são automaticamente bem-sucedidos em testes de resistência contra a magia e não sofrem dano se normalmente sofreriam metade do dano com sucesso.' },
        ],
      },
    ],
    spellcasting: {
      ability: 'int',
      progression: 'full',
      style: 'prepared',
      cantripsKnownByLevel: { 1: 3, 2: 3, 3: 3, 4: 4 },
      spellListIds: ['mago'],
    },
  },

  {
    id: 'clerigo',
    name: 'Clérigo',
    description: 'Intermediário entre o mundano e o divino, o clérigo canaliza o poder de sua fé para curar, proteger e julgar.',
    hitDie: 8,
    primaryAbilities: ['wis'],
    savingThrowProficiencies: ['wis', 'cha'],
    armorProficiencies: ['armadura-leve', 'armadura-media', 'escudo'],
    weaponProficiencies: ['arma-simples'],
    toolProficiencies: [],
    skillChoiceCount: 2,
    skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    subclassLevel: 1,
    abilityScoreImprovementLevels: [4, 8, 12, 16, 19],
    startingEquipmentOptions: [
      {
        id: 'a',
        label: 'Cota de malha leve, maça e símbolo sagrado',
        grants: [
          { itemId: 'cota-de-malha-leve', quantity: 1, label: 'Cota de Malha Leve' },
          { itemId: 'maca', quantity: 1, label: 'Maça' },
          { itemId: 'simbolo-sagrado', quantity: 1, label: 'Símbolo Sagrado' },
          { itemId: 'pacote-diplomata', quantity: 1, label: 'Pacote de Diplomata' },
        ],
      },
      {
        id: 'b',
        label: 'Couro batido, escudo e maça',
        grants: [
          { itemId: 'couro-batido', quantity: 1, label: 'Couro Batido' },
          { itemId: 'escudo', quantity: 1, label: 'Escudo' },
          { itemId: 'maca', quantity: 1, label: 'Maça' },
          { itemId: 'simbolo-sagrado', quantity: 1, label: 'Símbolo Sagrado' },
          { itemId: 'pacote-aventureiro', quantity: 1, label: 'Pacote de Aventureiro' },
        ],
      },
    ],
    features: [
      { id: 'conjuracao-clerigo', level: 1, name: 'Conjuração', description: 'Sua devoção concede acesso a magia divina. Consulte a seção de Magia da ficha para truques, magias preparadas e espaços de magia.' },
      {
        id: 'ordem-divina',
        level: 1,
        name: 'Ordem Divina',
        description: 'Você dedica parte do seu treinamento a uma ordem sagrada.',
        choice: {
          id: 'ordem-divina',
          label: 'Escolha sua Ordem Divina',
          count: 1,
          options: [
            { id: 'protetor', label: 'Ordem do Protetor', description: 'Você ganha proficiência com armas marciais e armadura pesada.' },
            { id: 'taumaturgo', label: 'Ordem do Taumaturgo', description: 'Você aprende um truque adicional da lista de Clérigo e ganha proficiência na perícia Arcanismo ou Religião.' },
          ],
        },
      },
      { id: 'orientacao-divina', level: 2, name: 'Orientação Divina', description: 'Você pode canalizar energia divina para alimentar efeitos mágicos. Uma vez usado, precisa de um descanso curto ou longo para usar novamente.', actionType: 'acao' },
    ],
    subclasses: [
      {
        id: 'dominio-da-vida',
        name: 'Domínio da Vida',
        description: 'Focado em cura e proteção, o clérigo deste domínio é um farol de vitalidade em meio ao perigo.',
        features: [
          { id: 'discipulo-da-vida', level: 1, name: 'Discípulo da Vida', description: 'Suas magias de cura restauram pontos de vida extras: sempre que usar uma magia de nível 1 ou superior para restaurar pontos de vida, o alvo recupera pontos de vida adicionais iguais a 2 + o nível da magia. Você também ganha proficiência em armadura pesada.' },
        ],
      },
    ],
    spellcasting: {
      ability: 'wis',
      progression: 'full',
      style: 'prepared',
      cantripsKnownByLevel: { 1: 3, 2: 3, 3: 3, 4: 4 },
      spellListIds: ['clerigo'],
    },
  },

  {
    id: 'ladino',
    name: 'Ladino',
    description: 'Ágil, versátil e sorrateiro, o ladino resolve problemas com perícia, furtividade e um golpe certeiro no momento certo.',
    hitDie: 8,
    primaryAbilities: ['dex'],
    savingThrowProficiencies: ['dex', 'int'],
    armorProficiencies: ['armadura-leve'],
    weaponProficiencies: ['arma-simples', 'besta-de-mao', 'espada-longa', 'florete', 'espada-curta'],
    toolProficiencies: ['ferramentas-de-ladrao'],
    skillChoiceCount: 4,
    skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'],
    subclassLevel: 3,
    abilityScoreImprovementLevels: [4, 8, 10, 12, 16, 19],
    startingEquipmentOptions: [
      {
        id: 'a',
        label: 'Florete, besta de mão e ferramentas de ladrão',
        grants: [
          { itemId: 'florete', quantity: 1, label: 'Florete' },
          { itemId: 'besta-de-mao', quantity: 1, label: 'Besta de Mão' },
          { itemId: 'ferramentas-de-ladrao', quantity: 1, label: 'Ferramentas de Ladrão' },
          { itemId: 'pacote-aventureiro', quantity: 1, label: 'Pacote de Aventureiro' },
        ],
      },
      {
        id: 'b',
        label: 'Espada curta, arco longo e ferramentas de ladrão',
        grants: [
          { itemId: 'espada-curta', quantity: 1, label: 'Espada Curta' },
          { itemId: 'arco-longo', quantity: 1, label: 'Arco Longo' },
          { itemId: 'ferramentas-de-ladrao', quantity: 1, label: 'Ferramentas de Ladrão' },
          { itemId: 'pacote-aventureiro', quantity: 1, label: 'Pacote de Aventureiro' },
        ],
      },
    ],
    features: [
      {
        id: 'especializacao',
        level: 1,
        name: 'Especialização',
        description: 'Escolha duas perícias em que você é proficiente. Seu bônus de proficiência é dobrado para testes de habilidade feitos com elas.',
        choice: {
          id: 'especializacao',
          label: 'Escolha 2 perícias para Especialização',
          count: 2,
          options: [
            { id: 'acrobatics', label: 'Acrobacia' },
            { id: 'athletics', label: 'Atletismo' },
            { id: 'deception', label: 'Enganação' },
            { id: 'insight', label: 'Intuição' },
            { id: 'intimidation', label: 'Intimidação' },
            { id: 'investigation', label: 'Investigação' },
            { id: 'perception', label: 'Percepção' },
            { id: 'performance', label: 'Atuação' },
            { id: 'persuasion', label: 'Persuasão' },
            { id: 'sleightOfHand', label: 'Prestidigitação' },
            { id: 'stealth', label: 'Furtividade' },
          ],
        },
      },
      { id: 'ataque-furtivo', level: 1, name: 'Ataque Furtivo', description: 'Uma vez por turno, você causa 1d6 de dano extra a uma criatura que acerte com uma arma leve ou à distância, caso tenha vantagem no ataque ou um aliado esteja adjacente ao alvo.' },
      { id: 'giria-de-ladroes', level: 1, name: 'Gíria de Ladrões', description: 'Você conhece a gíria de ladrões, um dialeto secreto de código e sinais usado por criminosos.' },
      { id: 'acao-ardilosa', level: 2, name: 'Ação Ardilosa', description: 'Você pode Disparar, Desengajar ou Esconder-se.', actionType: 'acao-bonus' },
    ],
    subclasses: [
      {
        id: 'ladrao',
        name: 'Ladrão',
        description: 'Mestre em furtos, arrombamentos e no uso rápido de ferramentas e objetos.',
        features: [
          { id: 'maos-rapidas', level: 3, name: 'Mãos Rápidas', description: 'Você pode usar sua Ação Ardilosa para fazer um teste de Prestidigitação, usar ferramentas de ladrão para destravar uma fechadura ou desarmar uma armadilha, ou usar um objeto.', actionType: 'acao-bonus' },
        ],
      },
    ],
  },
];

export function getClass(id: string): ClassDef | undefined {
  return CLASSES.find((c) => c.id === id);
}

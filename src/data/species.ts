import type { Species } from '../types/species';

export const SPECIES: Species[] = [
  {
    id: 'humano',
    name: 'Humano',
    description: 'Versáteis e ambiciosos, os humanos se adaptam a qualquer terra e qualquer modo de vida, buscando deixar sua marca no mundo.',
    size: 'Médio',
    speed: 9,
    traits: [
      { name: 'Versátil', description: 'Você ganha um Feat de Origem à sua escolha.' },
      { name: 'Habilidoso', description: 'Você ganha proficiência em uma perícia à sua escolha.' },
      { name: 'Engenhoso', description: 'Sempre que terminar um descanso longo, você ganha Inspiração Heroica.' },
    ],
  },
  {
    id: 'elfo',
    name: 'Elfo',
    description: 'Ligados à magia e à natureza, os elfos vivem por séculos e enxergam o mundo em escalas de tempo que poucos mortais compreendem.',
    size: 'Médio',
    speed: 9,
    traits: [
      { name: 'Visão no Escuro', description: 'Você enxerga na penumbra a 18m como se fosse luz plena, e no escuro como se fosse penumbra, sem cor nessa visão.' },
      { name: 'Ancestralidade Feérica', description: 'Você tem vantagem em testes de resistência para evitar ou encerrar o efeito enfeitiçado.' },
      { name: 'Sentidos Aguçados', description: 'Você tem proficiência na perícia Percepção.' },
      { name: 'Transe', description: 'Você não precisa dormir. Em vez disso, medita profundamente por 4 horas ao dia, obtendo o mesmo benefício que um humano teria com 8 horas de sono.' },
    ],
    lineages: [
      {
        id: 'alto-elfo',
        name: 'Alto Elfo',
        description: 'Descendentes das cortes arcanas, com afinidade natural pela magia.',
        grantedTraits: [{ name: 'Truque Élfico', description: 'Você conhece o truque Mage Hand. Ao alcançar o nível 3, pode conjurá-lo como um truque de Mago.' }],
      },
      {
        id: 'elfo-da-floresta',
        name: 'Elfo da Floresta',
        description: 'Habitantes de florestas antigas, rápidos e silenciosos.',
        grantedTraits: [{ name: 'Passo Élfico', description: 'Seu deslocamento aumenta em 1,5m e você pode tentar se esconder mesmo estando levemente obscurecido por folhagem, chuva, neve ou névoa.' }],
      },
      {
        id: 'elfo-drow',
        name: 'Elfo Drow',
        description: 'Elfos das profundezas subterrâneas, adaptados à escuridão total.',
        grantedTraits: [{ name: 'Visão no Escuro Superior', description: 'Seu raio de visão no escuro aumenta para 36m. Você tem também o truque Luz e desvantagem em testes de ataque com armas à distância contra alvos em luz solar plena.' }],
      },
    ],
  },
  {
    id: 'anao',
    name: 'Anão',
    description: 'Robustos e tradicionais, os anões constroem seus reinos em profundas montanhas e valorizam a honra acima de tudo.',
    size: 'Médio',
    speed: 7.5,
    hpBonusPerLevel: 1,
    traits: [
      { name: 'Visão no Escuro', description: 'Você enxerga na penumbra a 36m como se fosse luz plena, e no escuro como se fosse penumbra, sem cor nessa visão.' },
      { name: 'Resiliência Anã', description: 'Você tem vantagem em testes de resistência contra envenenado e resistência a dano de veneno.' },
      { name: 'Robustez Anã', description: 'Seu total de pontos de vida máximo aumenta em 1, e aumenta em mais 1 sempre que você sobe de nível.' },
      { name: 'Conhecimento da Pedra', description: 'Você tem proficiência na perícia Investigação quando o teste envolver pedra ou trabalho em pedra, e conta como tendo ferramentas de cavador ou de ferreiro para esses testes.' },
    ],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Pequenos, discretos e surpreendentemente resistentes, os halflings valorizam o conforto do lar e a companhia de amigos.',
    size: 'Pequeno',
    speed: 9,
    traits: [
      { name: 'Corajoso', description: 'Você tem vantagem em testes de resistência contra amedrontado.' },
      { name: 'Agilidade Halfling', description: 'Você pode se mover através do espaço de qualquer criatura de tamanho maior que o seu.' },
      { name: 'Sortudo', description: 'Quando você tira 1 em um teste de ataque, teste de habilidade ou teste de resistência, pode rolar novamente o dado e deve usar o novo resultado.' },
      { name: 'Furtividade Natural', description: 'Você pode tentar se esconder mesmo estando obscurecido apenas por uma criatura de tamanho maior que o seu.' },
    ],
  },
];

export function getSpecies(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}

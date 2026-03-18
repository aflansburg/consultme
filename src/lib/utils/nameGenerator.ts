export type AdjectiveType = 'serious' | 'humorous' | 'celestial';
export type NounType = 'isotope' | 'element' | 'star' | 'planet' | 'moon' | 'comet' | 'asteroid' | 'galaxy' | 'constellation' | 'starSystem';

const adjectives = {
  serious: ['professional', 'essential', 'fundamental', 'critical', 'important'],
  humorous: ['silly', 'funny', 'ridiculous', 'absurd', 'hilarious'],
  celestial: ['astral', 'cosmic', 'stellar', 'galactic', 'lunar']
};

const nouns = {
  isotope: ['helium-3', 'carbon-14', 'oxygen-16', 'sodium-23', 'iron-56'],
  element: ['helium', 'carbon', 'oxygen', 'sodium', 'iron'],
  star: ['sol', 'polaris', 'sirius', 'betelgeuse', 'vega', 'cebalrai', 'alnilam'],
  planet: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
  moon: ['moon', 'phobos', 'deimos', 'io', 'europa', 'ganymede', 'callisto'],
  comet: ['halley', 'comet-halley', 'comet-halley-2', 'comet-halley-3', 'comet-halley-4', 'comet-halley-5', 'comet-halley-6'],
  asteroid: ['asteroid-1', 'asteroid-2', 'asteroid-3', 'asteroid-4', 'asteroid-5', 'asteroid-6', 'asteroid-7'],
  galaxy: ['milky-way', 'andromeda', 'triangulum', 'pinwheel', 'sombrero', 'cartwheel', 'whirlpool'],
  constellation: ['andromeda', 'antlia', 'apus', 'aquarius', 'aquila', 'aries', 'auriga'],
  starSystem: ['sol', 'polaris', 'sirius', 'betelgeuse', 'vega', 'cebalrai', 'alnilam'],
};

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomCombination(
  adjectiveType: AdjectiveType,
  nounType: NounType
): string {
  const adjectiveList = adjectives[adjectiveType];
  const nounList = nouns[nounType];
  
  return `${getRandomElement(adjectiveList)} ${getRandomElement(nounList)}`;
} 
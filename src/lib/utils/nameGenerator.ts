export type AdjectiveType = 'serious' | 'humorous' | 'celestial';
export type NounType = 'animal' | 'cat' | 'star';

const adjectives = {
  serious: ['professional', 'essential', 'fundamental', 'critical', 'important'],
  humorous: ['silly', 'funny', 'ridiculous', 'absurd', 'hilarious'],
  celestial: ['astral', 'cosmic', 'stellar', 'galactic', 'lunar']
};

const nouns = {
  animal: ['elephant', 'giraffe', 'tiger', 'panda', 'penguin'],
  cat: ['tabby', 'siamese', 'calico', 'maine coon', 'persian'],
  star: ['sun', 'polaris', 'sirius', 'betelgeuse', 'vega']
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
const weirdPrefixes = [
    'Zorp',
    'Quib',
    'Flux',
    'Blorp',
    'Snarf',
    'Wibble',
    'Zizz',
    'Plonk',
    'Fizz',
    'Bloop',
    'Zap',
    'Wobble',
    'Splonk',
    'Zizzle',
    'Flibber'
];

const weirdSuffixes = [
    'onium',
    'tron',
    'zoid',
    'blaster',
    'inator',
    'otron',
    'zap',
    'whizz',
    'blorp',
    'snarf',
    'zoid',
    'tastic',
    'zle',
    'onium',
    'otron'
];

export function generateWeirdWord(): string {
    const prefix = weirdPrefixes[Math.floor(Math.random() * weirdPrefixes.length)];
    const suffix = weirdSuffixes[Math.floor(Math.random() * weirdSuffixes.length)];
    return prefix + suffix;
} 
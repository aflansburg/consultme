import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { PageServerLoad } from './$types';

export interface Transmission {
	dimension: string;
	sender: string;
	priority: string;
	text: string;
}

export const load: PageServerLoad = () => {
	try {
		const yamlPath = join(process.cwd(), 'transmissions-content.yaml');
		const fileContents = readFileSync(yamlPath, 'utf8');
		const transmissions = yaml.load(fileContents) as Transmission[];

		return { transmissions };
	} catch (error) {
		console.error('Error loading transmissions:', error);
		return {
			transmissions: [
				{
					dimension: 'ERROR',
					sender: 'SYSTEM',
					priority: 'CRITICAL',
					text: 'Failed to decode interdimensional transmissions. The signal interceptor may be offline. Check transmissions-content.yaml.'
				}
			] as Transmission[]
		};
	}
};

import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { PageServerLoad } from './$types';

export interface AboutContent {
	introduction: string;
	academic: string;
	professional: string;
	musical: string;
	family: string;
	beliefs: {
		intro: string;
		values: string[];
		additional: string[];
	};
	closing: string;
	quick_info: string[];
}

export const load: PageServerLoad = () => {
	try {
		// Read the YAML file from the project root
		const yamlPath = join(process.cwd(), 'about-content.yaml');
		const fileContents = readFileSync(yamlPath, 'utf8');
		const content = yaml.load(fileContents) as AboutContent;

		return {
			content
		};
	} catch (error) {
		console.error('Error loading about content:', error);
		// Return placeholder content if file doesn't exist
		return {
			content: {
				introduction: `**CONTENT FILE MISSING**

The about-content.yaml file was not found. Please create it in the project root with your personal bio content.

See the README for instructions on creating this file.`,
				academic: 'Configure your academic background in about-content.yaml',
				professional: 'Configure your professional journey in about-content.yaml',
				musical: 'Configure your musical interests in about-content.yaml',
				family: 'Configure your family story in about-content.yaml',
				beliefs: {
					intro: 'Configure your beliefs in about-content.yaml',
					values: [
						'Add your values in about-content.yaml'
					],
					additional: [
						'Add additional points in about-content.yaml'
					]
				},
				closing: 'Add your closing message in about-content.yaml',
				quick_info: [
					'Create about-content.yaml',
					'Add your personal content',
					'See README for details'
				]
			} as AboutContent
		};
	}
};

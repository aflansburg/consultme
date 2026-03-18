import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

const mockData = {
	character: {
		id: 1,
		name: 'Rick Sanchez',
		status: 'Alive',
		species: 'Human',
		type: '',
		gender: 'Male',
		origin: { name: 'Earth (C-137)', url: '' },
		location: { name: 'Citadel of Ricks', url: '' },
		image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
		episode: [],
		url: '',
		created: ''
	},
	error: null
};

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page, { props: { data: mockData } });
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});

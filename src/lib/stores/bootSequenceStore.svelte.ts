import { browser } from '$app/environment';

class BootSequenceStore {
	private hasSeenBoot = $state(false);
	private readonly STORAGE_KEY = 'c137-info-boot-seen';

	constructor() {
		if (browser) {
			// Check localStorage on initialization
			this.loadFromStorage();
		}
	}

	private loadFromStorage() {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			this.hasSeenBoot = stored === 'true';
		} catch (error) {
			// Fallback if localStorage is not available
			console.log('LocalStorage not available, boot sequence will show each time');
			this.hasSeenBoot = false;
		}
	}

	private saveToStorage() {
		if (browser) {
			try {
				localStorage.setItem(this.STORAGE_KEY, 'true');
			} catch (error) {
				console.log('Could not save to localStorage');
			}
		}
	}

	get shouldShowBootSequence(): boolean {
		return !this.hasSeenBoot;
	}

	markAsViewed() {
		this.hasSeenBoot = true;
		this.saveToStorage();
	}

	// For debugging/testing - reset the boot sequence
	reset() {
		this.hasSeenBoot = false;
		if (browser) {
			localStorage.removeItem(this.STORAGE_KEY);
		}
	}
}

export const bootSequenceStore = new BootSequenceStore();
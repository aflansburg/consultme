export class KonamiCodeDetector {
	private readonly konamiSequence = [
		'ArrowUp',
		'ArrowUp',
		'ArrowDown',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'ArrowLeft',
		'ArrowRight',
		'KeyB',
		'KeyA'
	];
	private currentSequence: string[] = [];
	private callbacks: (() => void)[] = [];
	private isInitialized = false;

	constructor() {
		// Only initialize if we're in the browser
		if (typeof window !== 'undefined') {
			this.setupListener();
		}
	}

	private setupListener() {
		if (typeof document === 'undefined') return;

		document.addEventListener('keydown', (event) => {
			this.currentSequence.push(event.code);

			// Keep only the last 10 keypresses
			if (this.currentSequence.length > this.konamiSequence.length) {
				this.currentSequence.shift();
			}

			// Check if sequence matches
			if (this.currentSequence.length === this.konamiSequence.length) {
				const matches = this.currentSequence.every(
					(key, index) => key === this.konamiSequence[index]
				);

				if (matches) {
					this.triggerCallbacks();
					this.currentSequence = []; // Reset after successful detection
				}
			}
		});
		this.isInitialized = true;
	}

	public onKonamiCode(callback: () => void) {
		this.callbacks.push(callback);

		// If not initialized yet (SSR), try to initialize now
		if (!this.isInitialized && typeof window !== 'undefined') {
			this.setupListener();
		}
	}

	private triggerCallbacks() {
		this.callbacks.forEach((callback) => callback());
	}
}

// Only create the detector instance in the browser
export const konamiDetector = typeof window !== 'undefined' ? new KonamiCodeDetector() : null;
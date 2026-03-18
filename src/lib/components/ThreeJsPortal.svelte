<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

	let showAnimation = $state(false);
	let isActive = $state(false);
	let containerEl: HTMLDivElement;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let composer: EffectComposer;
	let material: THREE.ShaderMaterial;
	let animationId: number;
	let plane: THREE.Mesh;
	let targetScale = 1.0;
	let currentScale = 1.0;

	// Dialogue transcript from the pixel art GIF
	const dialogueLines: { speaker: 'rick' | 'morty' | 'narration'; text: string }[] = [
		{ speaker: 'narration', text: '*Rick drinks from flask*' },
		{ speaker: 'morty', text: 'Aw jeez Rick!' },
		{ speaker: 'morty', text: 'What\'s this place?' },
		{ speaker: 'morty', text: 'It\'s full of some weird words and styling and I feel panicked.' },
		{ speaker: 'rick', text: 'We\'re on Abe\'s app Morty!' },
		{ speaker: 'rick', text: 'Don\'t step on b-bugs and don\'t accept cookies from strangers.' },
		{ speaker: 'rick', text: 'Come on, let\'s grab some quartz and get out of here.' },
	];
	let currentLine = $state(0);
	let dialogueInterval: ReturnType<typeof setInterval> | null = null;
	let showDialogue = $state(false);

	$effect(() => {
		if (isActive) {
			currentLine = 0;
			showDialogue = true;
			dialogueInterval = setInterval(() => {
				currentLine = (currentLine + 1) % dialogueLines.length;
			}, 1700);
		} else {
			showDialogue = false;
			if (dialogueInterval) {
				clearInterval(dialogueInterval);
				dialogueInterval = null;
			}
		}
		return () => {
			if (dialogueInterval) {
				clearInterval(dialogueInterval);
				dialogueInterval = null;
			}
		};
	});

	const options = {
		exposure: 2.8,
		bloomStrength: 2.6,
		bloomThreshold: 0,
		bloomRadius: 0.38,
		color0: [3, 15, 3],
		color1: [5, 50, 5],
		color2: [50, 115, 20],
		color3: [17, 38, 7],
		color4: [255, 255, 255],
		color5: [85, 170, 10]
	};

	const vertexShader = `
		varying vec3 vNormal;
		varying vec3 camPos;
		varying vec2 vUv;

		void main() {
			vNormal = normal;
			vUv = uv;
			camPos = cameraPosition;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`;

	const fragmentShader = `
		#define NUM_OCTAVES 5
		#define M_PI 3.1415926535897932384626433832795
		uniform vec4 resolution;
		varying vec3 vNormal;
		uniform sampler2D perlinnoise;
		uniform sampler2D sparknoise;
		uniform sampler2D waterturbulence;
		uniform sampler2D noiseTex;
		uniform float time;
		uniform vec3 color0;
		uniform vec3 color1;
		uniform vec3 color2;
		uniform vec3 color3;
		uniform vec3 color4;
		uniform vec3 color5;
		varying vec3 camPos;
		varying vec2 vUv;

		float rand(vec2 n) {
			return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
		}

		float noise(vec2 p){
			vec2 ip = floor(p);
			vec2 u = fract(p);
			u = u*u*(3.0-2.0*u);

			float res = mix(
				mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
				mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
			return res*res;
		}

		float fbm(vec2 x) {
			float v = 0.0;
			float a = 0.5;
			vec2 shift = vec2(100);
			mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
			for (int i = 0; i < NUM_OCTAVES; ++i) {
				v += a * noise(x);
				x = rot * x * 2.0 + shift;
				a *= 0.5;
			}
			return v;
		}

		float setOpacity(float r, float g, float b, float tonethreshold) {
			float tone = (r + g + b) / 3.0;
			float alpha = 1.0;
			if(tone<tonethreshold) {
				alpha = 0.0;
			}
			return alpha;
		}

		vec3 rgbcol(vec3 col) {
			return vec3(col.r/255.0,col.g/255.0,col.b/255.0);
		}

		vec2 rotate(vec2 v, float a) {
			float s = sin(a);
			float c = cos(a);
			mat2 m = mat2(c, -s, s, c);
			return m * v;
		}

		vec2 UnityPolarCoordinates (vec2 UV, vec2 Center, float RadialScale, float LengthScale){
			vec2 delta = UV - Center;
			float radius = length(delta) * 2. * RadialScale;
			float angle = atan(delta.x, delta.y) * 1.0/6.28 * LengthScale;
			return vec2(radius, angle);
		}

		void main() {
			vec2 olduv = gl_FragCoord.xy/resolution.xy ;
			vec2 uv = vUv ;
			vec2 imguv = uv;
			float scale = 1.;
			olduv *= 0.5 + time;
			olduv.y = olduv.y ;
			vec2 p = olduv*scale;
			float noise = fbm( p  )*0.04;
			vec4 txt = texture2D(perlinnoise, olduv);
			float gradient = dot(normalize( -camPos ), normalize( vNormal ));
			float pct = distance(vUv,vec2(0.5));

			vec3 rgbcolor0 = rgbcol(color0);
			vec3 rgbcolor1 = rgbcol(color1);
			vec3 rgbcolor2 = rgbcol(color2);
			vec3 rgbcolor3 = rgbcol(color3);
			vec3 rgbcolor4 = rgbcol(color4);
			vec3 rgbcolor5 = rgbcol(color5);

			float y = smoothstep(0.16,0.525,pct);
			vec3 backcolor = mix(rgbcolor0, rgbcolor5, y);

			gl_FragColor = vec4(backcolor,1.);

			vec2 center = vec2(0.5);
			vec2 cor = UnityPolarCoordinates(vUv, center, 1., 1.);
			vec2 newvUv = vUv - 0.5;
			vec3 noisetexvUv = texture2D(perlinnoise,mod(rotate(newvUv*0.15 + vec2(sin(time*0.005),cos(time*0.005)),time),1.)).rgb;

			vec2 newUv = vec2(cor.x + time,cor.x+cor.y);
			vec3 noisetex = texture2D(perlinnoise,mod(newUv,1.)).rgb;
			vec3 noisetex2 = texture2D(sparknoise,mod(newUv,1.)).rgb;
			vec3 noisetex3 = texture2D(waterturbulence,mod(newUv,1.)).rgb;

			float tone0 =  1. - smoothstep(0.3,0.6,noisetex.r);
			float tone1 =  smoothstep(0.3,0.6,noisetex2.r);
			float tone2 =  smoothstep(0.3,0.6,noisetex3.r);

			float opacity0 = setOpacity(tone0,tone0,tone0,.29);
			float opacity1 = setOpacity(tone1,tone1,tone1,.49);
			float opacity2 = setOpacity(tone2,tone2,tone2,.69);

			float gradienttone = 1. - smoothstep(0.196,0.532,pct);
			vec4 circularnoise = vec4( vec3(gradienttone)*noisetexvUv*1.4, 1.0 );
			float gradopacity = setOpacity(circularnoise.r,circularnoise.g,circularnoise.b,0.19);

			vec2 uv2 = uv;
			float iTime = time*0.004;
			uv.y += iTime / 10.0;
			uv.x -= (sin(iTime/10.0)/2.0);
			uv2.x += iTime / 14.0;
			uv2.x += (sin(iTime/10.0)/9.0);
			float result = 0.0;
			result += texture2D(noiseTex, mod(uv*0.5,1.) * 0.6 + vec2(iTime*-0.003)).r;
			result *= texture2D(noiseTex, mod(uv2*0.5,1.) * 0.9 + vec2(iTime*+0.002)).b;
			result = pow(result, 4.0);

			if(opacity2>0.0){
				gl_FragColor = vec4(rgbcolor4,0.)*vec4(opacity2);
			} else if(opacity1>0.0){
				gl_FragColor = vec4(rgbcolor2,0.)*vec4(opacity1);
			} else if(opacity0>0.0){
				gl_FragColor = vec4(rgbcolor1,0.)*vec4(opacity0);
			}
			gl_FragColor += vec4(108.0)*result*(y*0.02);
			gl_FragColor *= vec4(gradopacity);
		}
	`;

	function initThreeJS() {
		if (!containerEl) return;

		const width = containerEl.clientWidth || 500;
		const height = 280;

		// Check for WebGL support
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		// Scene
		scene = new THREE.Scene();
		scene.background = null; // Ensure transparent background

		// Camera - adjust for proper aspect ratio
		const aspect = width / height;
		camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
		camera.position.set(0, 0, 3.2); // Slightly further back for better framing

		// Renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			premultipliedAlpha: false,
			powerPreference: 'high-performance'
		});
		renderer.setClearColor(0x000000, 0); // Transparent background
		// Limit pixel ratio on mobile for performance
		const pixelRatio = Math.min(window.devicePixelRatio, 2);
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height);
		renderer.autoClear = false;

		try {
			containerEl.appendChild(renderer.domElement);
		} catch (error) {
			console.error('Failed to append renderer:', error);
			return;
		}

		// Load textures with error handling
		const textureLoader = new THREE.TextureLoader();
		const perlinnoise = textureLoader.load(
			'https://raw.githubusercontent.com/pizza3/asset/master/noise9.png',
			() => console.log('perlinnoise loaded'),
			undefined,
			(err) => console.error('Error loading perlinnoise:', err)
		);
		const sparknoise = textureLoader.load(
			'https://raw.githubusercontent.com/pizza3/asset/master/sparklenoise.png',
			() => console.log('sparknoise loaded'),
			undefined,
			(err) => console.error('Error loading sparknoise:', err)
		);
		const waterturbulence = textureLoader.load(
			'https://raw.githubusercontent.com/pizza3/asset/master/waterturbulence.png',
			() => console.log('waterturbulence loaded'),
			undefined,
			(err) => console.error('Error loading waterturbulence:', err)
		);
		const noiseTex = textureLoader.load(
			'https://raw.githubusercontent.com/pizza3/asset/master/rgbnoise2.png',
			() => console.log('noiseTex loaded'),
			undefined,
			(err) => console.error('Error loading noiseTex:', err)
		);

		// Set texture settings for better mobile compatibility
		[perlinnoise, sparknoise, waterturbulence, noiseTex].forEach(texture => {
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.generateMipmaps = false;
		});

		// Material with shaders
		material = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0.0 },
				perlinnoise: { value: perlinnoise },
				sparknoise: { value: sparknoise },
				waterturbulence: { value: waterturbulence },
				noiseTex: { value: noiseTex },
				color5: { value: new THREE.Vector3(...options.color5) },
				color4: { value: new THREE.Vector3(...options.color4) },
				color3: { value: new THREE.Vector3(...options.color3) },
				color2: { value: new THREE.Vector3(...options.color2) },
				color1: { value: new THREE.Vector3(...options.color1) },
				color0: { value: new THREE.Vector3(...options.color0) },
				resolution: { value: new THREE.Vector2(width, height) }
			},
			fragmentShader,
			vertexShader
		});

		// Geometry - maintain square aspect ratio
		// Calculate size to fill viewport properly
		const planeSize = 3.8;
		const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 1, 1);
		plane = new THREE.Mesh(planeGeometry, material);
		plane.position.set(0, 0, 0); // Center the plane
		scene.add(plane);

		// Post-processing
		const renderScene = new RenderPass(scene, camera);
		renderScene.clearAlpha = 0; // Transparent clear
		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(width, height),
			options.bloomStrength,
			options.bloomThreshold,
			options.bloomRadius
		);

		composer = new EffectComposer(renderer);
		composer.addPass(renderScene);
		composer.addPass(bloomPass);
		renderer.setClearColor(0x000000, 0); // Reset clear color after composer init

		// Animation loop
		let startTime = Date.now();
		let frameCount = 0;

		function animate() {
			animationId = requestAnimationFrame(animate);
			const deltaTime = Date.now() - startTime;
			material.uniforms.time.value = deltaTime / 5000;

			// Smooth scale transition
			currentScale += (targetScale - currentScale) * 0.1;
			if (plane) {
				plane.scale.set(currentScale, currentScale, 1);
			}

			try {
				composer.render();
			} catch (error) {
				console.error('Render error:', error);
			}

			// Log first few frames to confirm animation is running
			if (frameCount < 3) {
				console.log('Frame rendered:', frameCount, 'time:', material.uniforms.time.value);
				frameCount++;
			}
		}
		animate();

		console.log('Three.js portal initialized successfully');
	}

	// Watch for isActive changes and update target scale
	$effect(() => {
		targetScale = isActive ? 1.2 : 1.0;
	});

	function cleanup() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (renderer) {
			renderer.dispose();
		}
		if (material) {
			material.dispose();
		}
		if (containerEl && renderer) {
			containerEl.removeChild(renderer.domElement);
		}
	}

	onMount(() => {
		// Small delay to ensure container is properly rendered
		setTimeout(() => {
			initThreeJS();
		}, 100);
	});

	// Re-initialize or resize if shown on mobile
	$effect(() => {
		if (showAnimation && renderer && containerEl && camera) {
			const width = containerEl.clientWidth || 500;
			const height = 280;
			const aspect = width / height;

			// Update camera aspect ratio
			camera.aspect = aspect;
			camera.updateProjectionMatrix();

			// Update renderer and composer sizes
			renderer.setSize(width, height);
			if (composer) {
				composer.setSize(width, height);
			}

			// Update resolution uniform
			if (material && material.uniforms.resolution) {
				material.uniforms.resolution.value.set(width, height);
			}
		}
	});

	onDestroy(() => {
		cleanup();
	});

	function handleTouch() {
		isActive = !isActive;
	}
</script>

<div class="portal-container">
	<!-- Mobile Button -->
	<button
		type="button"
		class="block sm:hidden w-full flex items-center justify-between terminal-button px-4 py-3 rounded-md mb-2 terminal-font text-sm"
		onclick={() => showAnimation = !showAnimation}
	>
		<span class="text-terminal-green font-bold">PORTAL SYSTEM</span>
		<span class="text-terminal-green transform transition-transform {showAnimation ? 'rotate-90' : ''}">▶</span>
	</button>

	<!-- Portal Container -->
	<div class="portal-wrapper" class:mobile-hidden={!showAnimation}>
		<div
			bind:this={containerEl}
			class="threejs-container"
			onclick={() => isActive = !isActive}
			role="button"
			tabindex="0"
		>
			<!-- Pixel Art Overlay -->
			<img
				src="/rick-morty-pixelart.gif"
				alt="Rick and Morty pixel art by babarbie"
				class="pixel-art-overlay"
				class:active={isActive}
			/>
		</div>
	</div>
	<div class="attribution">
		pixel art by <a href="https://www.deviantart.com/babarbie/gallery" target="_blank" rel="noopener noreferrer">babarbie</a> on DeviantArt
	</div>
	{#if showDialogue}
		{@const line = dialogueLines[currentLine]}
		<div class="dialogue-container">
			{#key currentLine}
				<p class="dialogue-line {line.speaker}">
					{#if line.speaker !== 'narration'}
						<span class="dialogue-speaker">{line.speaker === 'rick' ? 'Rick' : 'Morty'}:</span>
					{/if}
					{line.text}
				</p>
			{/key}
		</div>
	{/if}
</div>

<style>
	.portal-container {
		margin-top: 1rem;
	}

	.portal-wrapper {
		padding: 2rem;
		border-radius: 0.375rem;
		border: 1px solid rgba(84, 245, 66, 0.3);
		background: #000000;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 280px;
		position: relative;
		overflow: hidden;
	}

	/* Star field */
	.portal-wrapper::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 2px;
		height: 2px;
		background: white;
		border-radius: 50%;
		box-shadow:
			30px 40px 0px 0px white,
			80px 20px 0px 0px white,
			150px 80px 0px 1px white,
			250px 120px 0px 0px white,
			350px 60px 0px 0px white,
			100px 200px 0px 1px white,
			300px 250px 0px 0px white,
			200px 180px 0px 0px white,
			80px 150px 0px 0px white,
			320px 180px 0px 1px white,
			180px 100px 0px 0px white,
			220px 50px 0px 0px white,
			60px 120px 0px 0px white,
			380px 140px 0px 1px white,
			120px 240px 0px 0px white,
			280px 30px 0px 0px white,
			340px 220px 0px 0px white,
			40px 160px 0px 1px white,
			160px 220px 0px 0px white,
			270px 180px 0px 0px white,
			450px 100px 0px 0px white,
			420px 190px 0px 1px white,
			130px 60px 0px 0px white,
			90px 180px 0px 0px white,
			-50px 80px 0px 0px white,
			-20px 140px 0px 0px white,
			15px 200px 0px 1px white,
			-40px 30px 0px 0px white;
		animation: twinkle 4s infinite;
	}

	.portal-wrapper::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 1px;
		background: white;
		border-radius: 50%;
		box-shadow:
			50px 100px 0px 0px white,
			190px 60px 0px 0px white,
			310px 140px 0px 0px white,
			130px 180px 0px 0px white,
			260px 200px 0px 0px white,
			380px 170px 0px 0px white,
			90px 130px 0px 0px white,
			330px 90px 0px 0px white,
			210px 210px 0px 0px white,
			140px 40px 0px 0px white,
			400px 120px 0px 0px white,
			70px 160px 0px 0px white,
			350px 220px 0px 0px white,
			240px 80px 0px 0px white,
			-30px 100px 0px 0px white,
			10px 70px 0px 0px white,
			-15px 180px 0px 0px white;
		animation: twinkle 3s infinite 1s;
	}

	@keyframes twinkle {
		0%, 100% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
	}

	.threejs-container {
		width: 100%;
		max-width: 500px;
		height: 280px;
		position: relative;
		z-index: 1;
		cursor: pointer;
		transition: transform 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.threejs-container :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
		background: none !important;
		object-fit: contain;
	}

	/* Pixel Art Overlay */
	.pixel-art-overlay {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 100%;
		max-height: 100%;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.3s ease-in;
		pointer-events: none;
		z-index: 10;
		image-rendering: pixelated;
	}

	.pixel-art-overlay.active {
		opacity: 1;
		transition: opacity 0.3s ease-in;
	}

	.pixel-art-overlay:not(.active) {
		transition: opacity 0.5s ease-out;
	}

	.attribution {
		text-align: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		color: rgba(34, 197, 94, 0.3);
		margin-top: 0.5rem;
	}

	.attribution a {
		color: rgba(34, 197, 94, 0.4);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.attribution a:hover {
		color: rgba(34, 197, 94, 0.7);
		text-decoration: underline;
	}

	.dialogue-container {
		text-align: center;
		min-height: 2rem;
		margin-top: 0.25rem;
	}

	.dialogue-line {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		font-style: italic;
		animation: dialogue-fade 1.2s ease-in-out;
	}

	.dialogue-line.rick {
		color: #67e8f9;
	}

	.dialogue-line.morty {
		color: #fbbf24;
	}

	.dialogue-line.narration {
		color: rgba(34, 197, 94, 0.5);
	}

	.dialogue-speaker {
		font-weight: bold;
		font-style: normal;
		margin-right: 0.25rem;
	}

	@keyframes dialogue-fade {
		0% { opacity: 0; transform: translateY(4px); }
		15% { opacity: 1; transform: translateY(0); }
		85% { opacity: 1; }
		100% { opacity: 0.7; }
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.portal-wrapper {
			min-height: 220px;
			padding: 1rem;
		}

		.threejs-container {
			height: 220px;
		}

		.mobile-hidden {
			display: none;
		}
	}

	@media (min-width: 641px) {
		.mobile-hidden {
			display: flex;
		}
	}
</style>

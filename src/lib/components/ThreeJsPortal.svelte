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
			onmouseenter={() => isActive = true}
			onmouseleave={() => isActive = false}
			ontouchstart={handleTouch}
			role="button"
			tabindex="0"
		>
			<!-- Dark Entity Face -->
			<div class="entity-face" class:active={isActive}>
				<!-- Eyes -->
				<div class="entity-eye entity-eye-left"></div>
				<div class="entity-eye entity-eye-right"></div>
				<!-- Smile -->
				<div class="entity-smile"></div>
			</div>
		</div>
	</div>
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

	/* Dark Entity Face */
	.entity-face {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 200px;
		height: 200px;
		opacity: 0;
		transition: opacity 0.8s ease;
		pointer-events: none;
		z-index: 10;
	}

	.entity-face.active {
		opacity: 0.7;
		animation: entity-breathe 3s ease-in-out infinite;
	}

	/* Eyes */
	.entity-eye {
		position: absolute;
		width: 20px;
		height: 20px;
		background: #000000;
		border-radius: 50%;
		top: 40%;
		box-shadow:
			0 0 10px rgba(0, 255, 0, 0.6),
			inset 0 0 5px rgba(0, 255, 0, 0.4);
		animation: entity-blink 4s ease-in-out infinite;
	}

	.entity-eye-left {
		left: 35%;
	}

	.entity-eye-right {
		right: 35%;
	}

	/* Smile */
	.entity-smile {
		position: absolute;
		width: 80px;
		height: 40px;
		bottom: 35%;
		left: 50%;
		transform: translateX(-50%);
		border: 3px solid rgba(0, 0, 0, 0.9);
		border-top: none;
		border-radius: 0 0 80px 80px;
		box-shadow:
			0 0 10px rgba(0, 255, 0, 0.4),
			inset 0 -5px 10px rgba(0, 255, 0, 0.2);
	}

	/* Animations */
	@keyframes entity-breathe {
		0%, 100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	@keyframes entity-blink {
		0%, 45%, 55%, 100% {
			height: 20px;
		}
		50% {
			height: 2px;
		}
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

		.entity-face {
			width: 160px;
			height: 160px;
		}

		.entity-eye {
			width: 16px;
			height: 16px;
		}

		.entity-smile {
			width: 60px;
			height: 30px;
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

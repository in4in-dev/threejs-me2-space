import * as THREE from 'three';

export default class Belt
{

	public radius : number;
	public thickness : number;

	public mesh : THREE.Points;

	constructor(radius : number, thickness : number) {

		this.radius = radius;
		this.thickness = thickness;

		this.mesh = this.createBody();

	}

	public addToScene(scene : THREE.Scene)
	{
		scene.add(this.mesh);
	}

	protected createBody() : THREE.Points
	{

		let particleTexture = new THREE.TextureLoader().load('../../sand.png');

		const particleCount = this.radius * 2000;

		const particles = new Float32Array(particleCount * 3); 

		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const tubeAngle = Math.random() * Math.PI * 2;

			let thickness = this.thickness * Math.random();

			const x = (this.radius + thickness * Math.cos(tubeAngle)) * Math.cos(angle);
			const y = (this.radius + thickness * Math.cos(tubeAngle)) * Math.sin(angle);
			const z = thickness * Math.sin(tubeAngle);

			particles[i * 3] = x;
			particles[i * 3 + 1] = y;
			particles[i * 3 + 2] = z;
		}

		// Создание буферной геометрии и добавление частиц
		const particleGeometry = new THREE.BufferGeometry();
		particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

		// Создание материала для частиц
		const material = new THREE.PointsMaterial({
			map: particleTexture,
			size: 0.1, // Размер частиц
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		// Создание точек (астероидов)
		const particleSystem = new THREE.Points(particleGeometry, material);

		return particleSystem;


	}

	public animateCollision(mesh : THREE.Mesh){

		const positions = this.mesh.geometry.attributes.position.array;

		for (let i = 0; i < positions.length; i += 3) {
			const dx = mesh.position.x - positions[i];
			const dy = mesh.position.y - positions[i + 1];
			const dz = mesh.position.z - positions[i + 2];
			const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

			if (distance < 2) {

				// Вычисление силы отталкивания
				const forceX = (dx / distance) * -2;
				const forceY = (dy / distance) * -2;
				const forceZ = (dz / distance) * -0.5;

				// Обновление позиции астероида
				positions[i] += forceX;
				positions[i + 1] += forceY;
				positions[i + 2] += forceZ;

				// Установка флага обновления позиций
				const particleGeometry = new THREE.BufferGeometry();
				particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

				this.mesh.geometry.copy(particleGeometry);
			}
		}


	}


}